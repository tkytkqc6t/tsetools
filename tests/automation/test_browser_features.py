"""Browser-level regressions that exercise every user-facing tool."""

import tempfile
import threading
import unittest
from pathlib import Path

from werkzeug.serving import make_server

try:
    from selenium import webdriver
    from selenium.webdriver.support.ui import WebDriverWait
except ImportError as error:  # Keep test discovery failure actionable.
    raise ImportError(
        "Browser regression tests require Selenium. Install it with "
        "'python -m pip install -r requirements-test.txt'."
    ) from error

from server import app


class BrowserFeatureRegressionTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.upload_dir = tempfile.TemporaryDirectory()
        app.config.update(TESTING=True, UPLOAD_FOLDER=cls.upload_dir.name)
        cls.http_server = make_server("127.0.0.1", 0, app, threaded=True)
        cls.server_thread = threading.Thread(target=cls.http_server.serve_forever, daemon=True)
        cls.server_thread.start()
        cls.base_url = "http://127.0.0.1:{}".format(cls.http_server.server_port)

        options = webdriver.ChromeOptions()
        options.add_argument("--headless")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--disable-gpu")
        try:
            cls.driver = webdriver.Chrome(options=options)
        except Exception:
            cls.http_server.shutdown()
            cls.upload_dir.cleanup()
            raise

    @classmethod
    def tearDownClass(cls):
        if hasattr(cls, "driver"):
            cls.driver.quit()
        if hasattr(cls, "http_server"):
            cls.http_server.shutdown()
        if hasattr(cls, "upload_dir"):
            cls.upload_dir.cleanup()

    def setUp(self):
        self.driver.get(self.base_url)
        WebDriverWait(self.driver, 10).until(
            lambda browser: browser.execute_script("return document.readyState") == "complete"
        )

    def action_value(self, input_values, action, output_id):
        return self.driver.execute_script(
            """
            for (const [id, value] of Object.entries(arguments[0])) {
                document.getElementById(id).value = value;
            }
            window[arguments[1]]();
            return document.getElementById(arguments[2]).value;
            """,
            input_values,
            action,
            output_id,
        )

    def test_url_encoder_and_decoder(self):
        encoded = self.action_value({"urlInput": "hello world&x=1"}, "encodeURL", "urlOutput")
        self.assertEqual("hello%20world%26x%3D1", encoded)
        decoded = self.action_value({"urlInput": encoded}, "decodeURL", "urlOutput")
        self.assertEqual("hello world&x=1", decoded)

    def test_base64_encoder_and_decoder(self):
        encoded = self.action_value({"base64Input": "Café"}, "encodeBase64", "base64Output")
        self.assertEqual("Q2Fmw6k=", encoded)
        decoded = self.action_value({"base64Input": encoded}, "decodeBase64", "base64Output")
        self.assertEqual("Café", decoded)

    def test_diff_checker_reports_changed_lines(self):
        diff_text = self.driver.execute_script(
            """
            document.getElementById('diffLeft').value = 'before';
            document.getElementById('diffRight').value = 'after';
            performDiffComparison();
            return document.getElementById('diffRightView').textContent;
            """
        )
        self.assertIn("after", diff_text)

    def test_xml_beautifier_formats_valid_xml(self):
        output = self.action_value({"xmlInput": "<root><item>one</item></root>"}, "beautifyXML", "xmlOutput")
        self.assertIn("<root>", output)
        self.assertIn("<item>one</item>", output)
        self.assertIn("\n", output)

    def test_json_beautifier_formats_valid_json(self):
        output = self.action_value({"jsonInput": '{"name":"Ada","age":36}'}, "beautifyJSON", "jsonOutput")
        self.assertEqual({"name": "Ada", "age": 36}, __import__("json").loads(output))
        self.assertIn("\n", output)

    def test_html_beautifier_formats_valid_html(self):
        output = self.action_value({"htmlInput": "<div><p>Hello</p></div>"}, "beautifyHTML", "htmlOutput")
        self.assertIn("<div>", output)
        self.assertIn("<p>Hello</p>", output)
        self.assertIn("\n", output)

    def test_sql_formatter_returns_formatted_query(self):
        output = self.driver.execute_script(
            """
            document.getElementById('sqlInput').value = 'select id from users where id = 1;';
            beautifySQL();
            return sqlEditor ? sqlEditor.getValue() : document.getElementById('sqlOutput').value;
            """
        )
        self.assertIn("SELECT", output)
        self.assertIn("FROM", output)
        self.assertNotIn("SQL Validation Errors", output)

    def test_uuid_converter_normalizes_hex(self):
        output = self.action_value({"uuidInput": "550e8400e29b41d4a716446655440000"}, "convertUUID", "uuidOutput")
        self.assertEqual("550e8400-e29b-41d4-a716-446655440000", output)

    def test_timezone_converter_produces_source_and_target_times(self):
        result = self.driver.execute_script(
            """
            document.getElementById('sourceTimezone').value = 'UTC';
            document.getElementById('inputDateTime').value = '2024-01-01T12:00';
            const target = document.getElementById('targetTimezone-1');
            target.value = 'America/New_York';
            convertAllTimezones();
            return {
                source: document.getElementById('conversionResults').textContent,
                target: document.getElementById('result-1').textContent
            };
            """
        )
        self.assertIn("2024", result["source"])
        self.assertNotIn("Click \"Convert All\"", result["target"])
        self.assertTrue(result["target"])

    def test_json_to_csv_converter(self):
        output = self.action_value(
            {"jsonCsvInput": '[{"name":"Ada","age":36}]'}, "convertJsonToCsv", "csvOutput"
        )
        self.assertIn("name,age", output)
        self.assertIn("Ada,36", output)

    def test_xml_to_csv_converter(self):
        output = self.driver.execute_script(
            """
            document.getElementById('xmlCsvInput').value = '<users><user id="7"><name>Ada</name></user></users>';
            document.getElementById('xmlRootElement').value = 'user';
            document.getElementById('includeAttributes').checked = true;
            convertXmlToCsv();
            return document.getElementById('xmlCsvOutput').value;
            """
        )
        self.assertIn("@id,name", output)
        self.assertIn("7,Ada", output)

    def test_json_filter_selects_matching_records(self):
        output = self.driver.execute_script(
            """
            document.getElementById('jsonFilterInput').value = '[{"name":"Ada","age":36},{"name":"Bob","age":25}]';
            document.getElementById('jsonArrayPath').value = '';
            document.getElementById('jsonFieldName-1').value = 'age';
            document.getElementById('jsonOperator-1').value = 'greater_than';
            document.getElementById('jsonFieldValue-1').value = '30';
            applyJsonFilter();
            return document.getElementById('jsonFilterOutput').value;
            """
        )
        self.assertIn("Ada", output)
        self.assertNotIn("Bob", output)

    def test_xml_filter_selects_matching_elements(self):
        output = self.driver.execute_script(
            """
            document.getElementById('xmlFilterInput').value = '<users><user><name>Ada</name><age>36</age></user><user><name>Bob</name><age>25</age></user></users>';
            document.getElementById('xmlElementName').value = 'user';
            document.getElementById('xmlFieldType-1').value = 'element';
            document.getElementById('xmlFieldName-1').value = 'age';
            document.getElementById('xmlOperator-1').value = 'greater_than';
            document.getElementById('xmlFieldValue-1').value = '30';
            applyXmlFilter();
            return document.getElementById('xmlFilterOutput').value;
            """
        )
        self.assertIn("Ada", output)
        self.assertNotIn("Bob", output)

    def test_json_extractor_generates_selected_fields(self):
        output = self.driver.execute_script(
            """
            document.getElementById('extractJsonInput').value = '[{"name":"Ada","age":36}]';
            document.getElementById('extractJsonParent').value = '';
            document.getElementById('extractJsonFields').value = 'name,age';
            extractJsonPreview();
            return document.getElementById('extractJsonOutput').value;
            """
        )
        self.assertIn("name,age", output)
        self.assertIn('"Ada","36"', output)

    def test_xml_extractor_generates_selected_fields(self):
        output = self.driver.execute_script(
            """
            document.getElementById('extractXmlInput').value = '<items><item><name>Ada</name><age>36</age></item></items>';
            document.getElementById('extractXmlParent').value = '';
            document.getElementById('extractXmlFields').value = 'name,age';
            extractXmlPreview();
            return document.getElementById('extractXmlOutput').value;
            """
        )
        self.assertIn("name,age", output)
        self.assertIn('"Ada","36"', output)

    def test_eml_analyzer_extracts_headers_and_urls(self):
        eml_content = (
            "From: sender@example.com\n"
            "To: recipient@example.com\n"
            "Subject: Regression sample\n"
            "Authentication-Results: example; spf=pass; dkim=pass; dmarc=pass\n\n"
            "Visit https://example.com"
        )
        with tempfile.TemporaryDirectory() as temp_dir:
            eml_path = Path(temp_dir) / "sample.eml"
            eml_path.write_text(eml_content, encoding="utf-8")
            self.driver.execute_script("showSection('eml-analyzer');")
            self.driver.execute_script(
                "arguments[0].style.display = 'block';",
                self.driver.find_element("id", "emlFileInput"),
            )
            self.driver.find_element("id", "emlFileInput").send_keys(str(eml_path))
            WebDriverWait(self.driver, 10).until(
                lambda browser: "Subject: Regression sample" in browser.find_element("id", "emlRawContent").get_attribute("value")
            )
            self.driver.execute_script(
                "currentEmlData = document.getElementById('emlRawContent').value; analyzeEml();"
            )
        headers, urls, parsed_headers, loaded_data = self.driver.execute_script(
            "return [document.getElementById('emlBasicHeaders').textContent, document.getElementById('emlUrlsList').textContent, parseEmlHeaders(document.getElementById('emlRawContent').value).headers, typeof currentEmlData === 'undefined' ? null : currentEmlData];"
        )
        self.assertEqual(eml_content, loaded_data.replace("\r\n", "\n"))
        self.assertEqual("sender@example.com", parsed_headers.get("from"))
        self.assertIn("Regression sample", parsed_headers.get("subject", ""))
        self.assertIn("sender@example.com", headers)
        self.assertIn("Regression sample", headers)
        self.assertIn("https://example.com", urls)

    def test_rfc_validator_reports_selected_compliance_checks(self):
        report = self.driver.execute_script(
            """
            document.getElementById('rfcInput').value = 'From: sender@example.com\\nDate: Tue, 01 Jan 2024 12:00:00 +0000\\nAuthentication-Results: mx; spf=pass; dkim=pass; dmarc=pass\\nMIME-Version: 1.0\\nContent-Type: text/plain';
            validateRFC();
            return document.getElementById('rfcOutput').value;
            """
        )
        self.assertIn("RFC COMPLIANCE VALIDATION REPORT", report)
        self.assertIn("SPF", report)
        self.assertIn("DKIM", report)
        self.assertIn("DMARC", report)
        self.assertIn("MIME", report)


if __name__ == "__main__":
    unittest.main()
