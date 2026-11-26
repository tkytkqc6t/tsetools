"""Large-file enhancement API for TSETools.

The normal TSETools application remains the legacy Flask application served at
``/``.  This module adds the disk-backed large-file API under ``/api/v1`` and
the optional large-file workspace under ``/large``.
"""

from __future__ import annotations

import csv
import json
import os
import re
import threading
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Iterable, Iterator

import ijson
from fastapi import BackgroundTasks, FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field


CHUNK_SIZE = 8 * 1024 * 1024
MAX_FILE_SIZE = 1024 * 1024 * 1024
PREVIEW_BYTES = 256 * 1024
ALLOWED_EXTENSIONS = {"json", "xml"}
DATA_ROOT = Path(os.environ.get("TS_TOOLS_DATA_DIR", "uploads")) / "large"
DATA_ROOT.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="TSETools Large File API", version="1.8a")
_jobs: Dict[str, Dict[str, Any]] = {}
_lock = threading.Lock()


class UploadInit(BaseModel):
    filename: str
    size: int = Field(ge=1, le=MAX_FILE_SIZE)


class JobRequest(BaseModel):
    file_id: str
    operation: str
    params: Dict[str, Any] = Field(default_factory=dict)


def _safe_extension(filename: str) -> str:
    extension = Path(filename).suffix.lower().lstrip(".")
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, "Only .json and .xml files are supported by the large-file API")
    return extension


def _session(upload_id: str) -> Path:
    if not re.fullmatch(r"[0-9a-f-]{36}", upload_id):
        raise HTTPException(400, "Invalid upload id")
    path = DATA_ROOT / upload_id
    if not path.is_dir():
        raise HTTPException(404, "Upload session not found")
    return path


def _read_meta(upload_id: str) -> Dict[str, Any]:
    session = _session(upload_id)
    try:
        return json.loads((session / "meta.json").read_text(encoding="utf-8"))
    except (OSError, ValueError):
        raise HTTPException(404, "Upload metadata not found")


@app.get("/api/v1/health")
def health() -> Dict[str, Any]:
    return {"status": "ok", "max_file_size": MAX_FILE_SIZE, "chunk_size": CHUNK_SIZE}


@app.post("/api/v1/uploads/init")
def init_upload(payload: UploadInit) -> Dict[str, Any]:
    extension = _safe_extension(payload.filename)
    upload_id = str(uuid.uuid4())
    session = DATA_ROOT / upload_id
    session.mkdir(mode=0o700)
    (session / "meta.json").write_text(json.dumps({
        "id": upload_id, "filename": Path(payload.filename).name,
        "extension": extension, "size": payload.size, "complete": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }), encoding="utf-8")
    (session / "data.part").touch()
    return {"upload_id": upload_id, "chunk_size": CHUNK_SIZE,
            "total_chunks": (payload.size + CHUNK_SIZE - 1) // CHUNK_SIZE}


@app.put("/api/v1/uploads/{upload_id}/chunks/{chunk_index}")
async def write_chunk(upload_id: str, chunk_index: int, request: Request) -> Dict[str, Any]:
    meta = _read_meta(upload_id)
    if meta["complete"]:
        raise HTTPException(409, "Upload is already complete")
    total_chunks = (meta["size"] + CHUNK_SIZE - 1) // CHUNK_SIZE
    if chunk_index < 0 or chunk_index >= total_chunks:
        raise HTTPException(400, "Invalid chunk index")
    expected = min(CHUNK_SIZE, meta["size"] - chunk_index * CHUNK_SIZE)
    part = _session(upload_id) / "data.part"
    received = 0
    with part.open("r+b") as output:
        output.seek(chunk_index * CHUNK_SIZE)
        async for block in request.stream():
            received += len(block)
            if received > expected:
                raise HTTPException(400, "Chunk is larger than declared range")
            output.write(block)
    if received != expected:
        raise HTTPException(400, f"Expected {expected} bytes, received {received}")
    return {"upload_id": upload_id, "chunk": chunk_index, "received": received}


@app.post("/api/v1/uploads/{upload_id}/complete")
def complete_upload(upload_id: str) -> Dict[str, Any]:
    meta = _read_meta(upload_id)
    session = _session(upload_id)
    part = session / "data.part"
    if part.stat().st_size != meta["size"]:
        raise HTTPException(409, "Upload is incomplete")
    final_path = session / ("data." + meta["extension"])
    os.replace(part, final_path)
    meta["complete"] = True
    meta["path"] = str(final_path)
    (session / "meta.json").write_text(json.dumps(meta), encoding="utf-8")
    return {"file_id": upload_id, "filename": meta["filename"], "size": meta["size"]}


def _file_path(file_id: str) -> tuple[Dict[str, Any], Path]:
    meta = _read_meta(file_id)
    if not meta.get("complete"):
        raise HTTPException(409, "Upload is not complete")
    path = Path(meta["path"]).resolve()
    if path.parent != _session(file_id).resolve() or not path.is_file():
        raise HTTPException(404, "File data not found")
    return meta, path


@app.get("/api/v1/files/{file_id}/preview")
def preview(file_id: str, offset: int = 0, limit: int = PREVIEW_BYTES) -> Dict[str, Any]:
    meta, path = _file_path(file_id)
    if offset < 0 or limit < 1 or limit > PREVIEW_BYTES:
        raise HTTPException(400, "Preview range is invalid")
    with path.open("rb") as source:
        source.seek(offset)
        content = source.read(limit)
    return {"file_id": file_id, "offset": offset, "next_offset": offset + len(content),
            "eof": offset + len(content) >= meta["size"],
            "text": content.decode("utf-8", errors="replace")}


def _records(path: Path, extension: str, record_tag: str = "") -> Iterator[Any]:
    if extension == "json":
        with path.open("rb") as source:
            # Supports a top-level array without materializing it. For a single
            # object, ijson yields it once through the empty prefix.
            yielded = False
            for item in ijson.items(source, "item"):
                yielded = True
                yield item
            if not yielded:
                source.seek(0)
                for item in ijson.items(source, ""):
                    yield item
    else:
        import xml.etree.ElementTree as ET
        stack = []
        for event, element in ET.iterparse(path, events=("start", "end")):
            if event == "start":
                stack.append(element)
                continue
            is_record = len(stack) == 2 and (not record_tag or element.tag == record_tag)
            if is_record:
                record = {f"@{key}": value for key, value in element.attrib.items()}
                record.update({child.tag: child.text or "" for child in element})
                yield record
                element.clear()
            stack.pop()


def _value(item: Any, field: str) -> Any:
    value = item
    for part in field.split("."):
        if isinstance(value, dict):
            value = value.get(part, "")
        else:
            return ""
    return value if value is not None else ""


def _filtered(records: Iterable[Any], params: Dict[str, Any]) -> Iterator[Any]:
    condition = str(params.get("parent", "")).strip()
    if not condition or "=" not in condition:
        yield from records
        return
    field, expected = (part.strip() for part in condition.split("=", 1))
    for item in records:
        if str(_value(item, field)) == expected:
            yield item


def _run_job(job_id: str, request: JobRequest) -> None:
    try:
        meta, source = _file_path(request.file_id)
        fields = [x.strip() for x in str(request.params.get("fields", "")).split(",") if x.strip()]
        if not fields:
            fields = []
        operation = request.operation
        if operation not in {"json_extract", "xml_extract", "json_filter", "xml_filter", "json_to_csv", "xml_to_csv"}:
            raise ValueError("Unsupported large-file operation")
        if meta["extension"] != operation.split("_", 1)[0]:
            raise ValueError("Operation does not match the uploaded file type")
        output = _session(request.file_id) / f"result-{job_id}.csv"
        count = 0
        with output.open("w", encoding="utf-8", newline="") as destination:
            writer = csv.writer(destination)
            for item in _filtered(_records(source, meta["extension"], str(request.params.get("record_tag", ""))), request.params):
                if not fields:
                    fields = list(item.keys()) if isinstance(item, dict) else ["value"]
                    writer.writerow(fields)
                row = [_value(item, field) for field in fields]
                writer.writerow(row)
                count += 1
                if count % 10000 == 0:
                    with _lock:
                        _jobs[job_id]["rows"] = count
        with _lock:
            _jobs[job_id].update(status="completed", rows=count, output=str(output))
    except Exception as exc:
        with _lock:
            _jobs[job_id].update(status="failed", error=str(exc))


@app.post("/api/v1/jobs", status_code=202)
def create_job(payload: JobRequest, background: BackgroundTasks) -> Dict[str, Any]:
    _file_path(payload.file_id)
    job_id = str(uuid.uuid4())
    with _lock:
        _jobs[job_id] = {"id": job_id, "status": "queued", "rows": 0}
    background.add_task(_run_job, job_id, payload)
    return _jobs[job_id]


@app.get("/api/v1/jobs/{job_id}")
def job_status(job_id: str) -> Dict[str, Any]:
    with _lock:
        job = _jobs.get(job_id)
    if not job:
        raise HTTPException(404, "Job not found")
    return {key: value for key, value in job.items() if key != "output"}


@app.get("/api/v1/jobs/{job_id}/download")
def download_job(job_id: str) -> FileResponse:
    with _lock:
        job = _jobs.get(job_id)
    if not job or job.get("status") != "completed":
        raise HTTPException(409, "Job is not complete")
    return FileResponse(job["output"], media_type="text/csv", filename="tsetools-result.csv")


# Keep all existing TSETools routes available at the normal application root.
# The large-file UI is explicitly opt-in at /large; it must not replace the
# existing TSETools workspace.
from fastapi.middleware.wsgi import WSGIMiddleware
from server import app as legacy_flask_app
_react_dist = Path(__file__).parent / "frontend" / "dist"
if _react_dist.is_dir():
    app.mount("/large", StaticFiles(directory=_react_dist, html=True), name="large-react")
app.mount("/", WSGIMiddleware(legacy_flask_app), name="legacy-flask")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("fastapi_server:app", host=os.environ.get("TS_TOOLS_HOST", "127.0.0.1"),
                port=int(os.environ.get("TS_TOOLS_API_PORT", "8000")))
