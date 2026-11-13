"""Unit tests for the upload helper functions."""

import unittest

from server import ALLOWED_EXTENSIONS, UPLOAD_CHUNK_SIZE, allowed_file


class AllowedFileTests(unittest.TestCase):
    def test_accepts_each_supported_extension(self):
        for extension in ALLOWED_EXTENSIONS:
            with self.subTest(extension=extension):
                self.assertTrue(allowed_file("document." + extension))

    def test_extension_matching_is_case_insensitive(self):
        self.assertTrue(allowed_file("document.JSON"))
        self.assertTrue(allowed_file("document.CsV"))

    def test_rejects_unsupported_or_missing_extensions(self):
        for filename in ("document.exe", "document", "document.json.exe"):
            with self.subTest(filename=filename):
                self.assertFalse(allowed_file(filename))


class UploadChunkSizeTests(unittest.TestCase):
    def test_chunk_size_is_two_mebibytes(self):
        self.assertEqual(2 * 1024 * 1024, UPLOAD_CHUNK_SIZE)


if __name__ == "__main__":
    unittest.main()
