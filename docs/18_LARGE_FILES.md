# Large JSON/XML files (v1.8a)

The large-file workspace uses React and FastAPI. The browser sends 8 MiB binary
chunks to `POST /api/v1/uploads/init`, `PUT /api/v1/uploads/{id}/chunks/{n}`,
and `POST /api/v1/uploads/{id}/complete`. FastAPI writes directly to
`uploads/large/<id>/data.json|xml`; it never creates a 1 GB request object.

Operations run as disk-backed jobs: `POST /api/v1/jobs`, poll
`GET /api/v1/jobs/{id}`, and download `GET /api/v1/jobs/{id}/download`.
`ijson` streams top-level JSON array items and `ElementTree.iterparse` releases
XML elements as they are consumed. The React preview is capped at 256 KiB and
CSV output is written incrementally to the NVMe drive.

## Local development

```text
python -m pip install -r requirements.txt
python -m uvicorn fastapi_server:app --host 127.0.0.1 --port 8000
cd frontend
npm install
npm run dev
```

For a local production-style workspace, run `npm run build` in `frontend`,
start FastAPI with `run_large_file_windows.bat`, and open `/`. If the
React build is absent, the same server still serves the legacy Flask UI at `/`.

For a 16 GB machine, keep one worker, reserve at least 4 GB for the OS/browser,
and allow roughly 2–4 GB for the upload, parser buffers, and CSV output. Do not
run multiple parser workers for one file. The NVMe-backed `uploads/large`
directory should have at least 3 GB free for a 1 GB source plus output and
temporary space. A cleanup task should delete completed sessions after a
configurable retention period.
