import json
import tempfile
import unittest
from pathlib import Path

from fastapi.testclient import TestClient

import fastapi_server


class LargeFileApiTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        fastapi_server.DATA_ROOT = Path(self.temp.name)
        self.client = TestClient(fastapi_server.app)

    def tearDown(self):
        self.temp.cleanup()

    def test_json_upload_preview_and_streaming_job(self):
        source = b'[{"id":1,"name":"Ada"},{"id":2,"name":"Lin"}]'
        init = self.client.post("/api/v1/uploads/init", json={"filename": "data.json", "size": len(source)})
        self.assertEqual(200, init.status_code)
        upload_id = init.json()["upload_id"]
        self.assertEqual(200, self.client.put(f"/api/v1/uploads/{upload_id}/chunks/0", content=source).status_code)
        complete = self.client.post(f"/api/v1/uploads/{upload_id}/complete")
        self.assertEqual(200, complete.status_code)
        self.assertIn('"id":1', self.client.get(f"/api/v1/files/{upload_id}/preview").json()["text"])

        job = self.client.post("/api/v1/jobs", json={
            "file_id": upload_id, "operation": "json_extract",
            "params": {"fields": "id,name"},
        })
        self.assertEqual(202, job.status_code)
        status = self.client.get(f"/api/v1/jobs/{job.json()['id']}").json()
        self.assertEqual("completed", status["status"])
        self.assertEqual(2, status["rows"])

    def test_rejects_non_json_or_xml(self):
        response = self.client.post("/api/v1/uploads/init", json={"filename": "data.csv", "size": 3})
        self.assertEqual(400, response.status_code)

    def test_xml_streaming_job_preserves_attributes(self):
        source = b'<catalog><book id="bk101"><title>Guide</title></book><book id="bk102"><title>Rain</title></book></catalog>'
        init = self.client.post("/api/v1/uploads/init", json={"filename": "data.xml", "size": len(source)})
        upload_id = init.json()["upload_id"]
        self.client.put(f"/api/v1/uploads/{upload_id}/chunks/0", content=source)
        self.client.post(f"/api/v1/uploads/{upload_id}/complete")
        self.assertEqual(2, len(list(fastapi_server._records(Path(self.temp.name) / upload_id / "data.xml", "xml"))))
        job = self.client.post("/api/v1/jobs", json={
            "file_id": upload_id, "operation": "xml_extract",
            "params": {"record_tag": "book", "fields": "@id,title"},
        })
        status = self.client.get(f"/api/v1/jobs/{job.json()['id']}").json()
        self.assertEqual("completed", status["status"])
        self.assertEqual(2, status["rows"])


if __name__ == "__main__":
    unittest.main()
