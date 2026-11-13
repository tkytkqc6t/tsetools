"""HTTP-level regression tests for the Flask application."""

import io
import os
import tempfile
import unittest
import uuid

from server import UPLOAD_CHUNK_SIZE, app
from tests.feature_catalog import FEATURES, GLOBAL_ACTIONS, section_markup


class UploadRegressionTests(unittest.TestCase):
    def setUp(self):
        self.upload_dir = tempfile.TemporaryDirectory()
        app.config.update(TESTING=True, UPLOAD_FOLDER=self.upload_dir.name)
        self.client = app.test_client()

    def tearDown(self):
        self.upload_dir.cleanup()

    def post_chunk(self, content, filename="sample.txt", chunk_index=0,
                   total_chunks=1, total_size=None, upload_id=None):
        if total_size is None:
            total_size = len(content)
        return self.client.post(
            "/uploads",
            data={
                "file": (io.BytesIO(content), filename),
                "filename": filename,
                "chunkIndex": str(chunk_index),
                "totalChunks": str(total_chunks),
                "totalSize": str(total_size),
                "uploadId": upload_id or str(uuid.uuid4()),
            },
            content_type="multipart/form-data",
        )

    def test_homepage_is_served(self):
        response = self.client.get("/")

        self.assertEqual(200, response.status_code)
        self.assertIn(b"<!DOCTYPE html", response.data)

    def test_all_tool_sections_and_actions_are_present_in_served_page(self):
        response = self.client.get("/")
        page = response.get_data(as_text=True)
        javascript = self.client.get("/static/main.js").get_data(as_text=True)

        self.assertEqual(200, response.status_code)
        for feature, actions in FEATURES.items():
            with self.subTest(feature=feature):
                section = section_markup(page, feature)
                self.assertIsNotNone(section)
                for action in actions:
                    with self.subTest(action=action):
                        self.assertIn(action + "(", section or "")
        for action in GLOBAL_ACTIONS:
            with self.subTest(global_action=action):
                self.assertTrue(action + "(" in page or action + "(" in javascript)

    def test_frontend_script_is_served(self):
        response = self.client.get("/static/main.js")

        self.assertEqual(200, response.status_code)
        self.assertIn("function beautifyJSON", response.get_data(as_text=True))
        page = self.client.get("/").get_data(as_text=True)
        self.assertIn("function validateRFC", page)

    def test_single_chunk_upload_can_be_downloaded(self):
        content = b"regression upload contents\n"
        response = self.post_chunk(content)

        self.assertEqual(200, response.status_code)
        self.assertEqual({"success": True, "filename": "sample.txt"}, response.get_json())
        downloaded = self.client.get("/uploads/sample.txt")
        self.assertEqual(200, downloaded.status_code)
        self.assertEqual(content, downloaded.data)

    def test_chunked_upload_assembles_in_order(self):
        content = b"a" * UPLOAD_CHUNK_SIZE + b"final chunk"
        upload_id = str(uuid.uuid4())
        first = self.post_chunk(
            content[:UPLOAD_CHUNK_SIZE], chunk_index=0, total_chunks=2,
            total_size=len(content), upload_id=upload_id,
        )
        second = self.post_chunk(
            content[UPLOAD_CHUNK_SIZE:], chunk_index=1, total_chunks=2,
            total_size=len(content), upload_id=upload_id,
        )

        self.assertEqual(200, first.status_code)
        self.assertEqual({"success": True, "chunk": 0}, first.get_json())
        self.assertEqual(200, second.status_code)
        self.assertEqual(content, self.client.get("/uploads/sample.txt").data)
        self.assertFalse(os.path.exists(os.path.join(self.upload_dir.name, upload_id + ".part")))

    def test_rejects_unsupported_extension(self):
        response = self.post_chunk(b"bad", filename="payload.exe")

        self.assertEqual(400, response.status_code)
        self.assertEqual({"error": "Invalid file type"}, response.get_json())

    def test_rejects_missing_upload_metadata(self):
        response = self.client.post(
            "/uploads", data={"file": (io.BytesIO(b"data"), "sample.txt")},
            content_type="multipart/form-data",
        )

        self.assertEqual(400, response.status_code)
        self.assertEqual({"error": "Missing file or chunk metadata"}, response.get_json())

    def test_rejects_out_of_order_chunk(self):
        content = b"a" * (UPLOAD_CHUNK_SIZE + 1)
        response = self.post_chunk(
            content[UPLOAD_CHUNK_SIZE:], chunk_index=1, total_chunks=2,
            total_size=len(content), upload_id=str(uuid.uuid4()),
        )

        self.assertEqual(409, response.status_code)
        self.assertEqual({"error": "Chunks must be uploaded once, in order"}, response.get_json())

    def test_rejects_incorrect_declared_size(self):
        response = self.post_chunk(b"short", total_chunks=2, total_size=12)

        self.assertEqual(400, response.status_code)
        self.assertEqual({"error": "Invalid upload size or chunk count"}, response.get_json())


if __name__ == "__main__":
    unittest.main()
