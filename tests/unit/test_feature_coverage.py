"""Unit-level contracts ensuring every tool has implemented UI actions."""

import re
import unittest
from pathlib import Path

from tests.feature_catalog import FEATURES, GLOBAL_ACTIONS, section_markup


ROOT = Path(__file__).resolve().parents[2]


class FeatureImplementationCoverageTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.template = (ROOT / "templates" / "index.html").read_text(encoding="utf-8")
        cls.javascript = (ROOT / "static" / "main.js").read_text(encoding="utf-8")

    def test_every_catalogued_tool_has_a_page_section(self):
        section_ids = set(re.findall(r'<(?:div|section)[^>]+id="([^"]+)"[^>]*class="[^"]*\bsection\b', self.template))

        for feature in FEATURES:
            with self.subTest(feature=feature):
                self.assertIn(feature, section_ids)

    def test_every_catalogued_action_has_a_javascript_implementation(self):
        source = self.template + "\n" + self.javascript
        implemented = set(re.findall(r"\bfunction\s+([A-Za-z_$][\w$]*)\s*\(", source))
        implemented.update(re.findall(r"\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?function\s*\(", source))

        for feature, actions in FEATURES.items():
            for action in actions:
                with self.subTest(feature=feature, action=action):
                    self.assertIn(action, implemented)

        for action in GLOBAL_ACTIONS:
            with self.subTest(global_action=action):
                self.assertIn(action, implemented)

    def test_global_actions_are_wired_to_the_page(self):
        self.assertRegex(self.template, r'on(?:keyup|input)="searchTools\(\)"')
        self.assertRegex(self.template, r"showSection\(['\"]")
        self.assertRegex(self.javascript, r"addEventListener\(['\"]input['\"],\s*gatherMatches\)")
        self.assertRegex(self.javascript, r"addEventListener\(['\"]click['\"],\s*replaceCurrent\)")
        self.assertRegex(self.javascript, r"addEventListener\(['\"]click['\"],\s*replaceAll\)")
        for setup in GLOBAL_ACTIONS[5:]:
            with self.subTest(upload_setup=setup):
                self.assertRegex(self.javascript, r"\b" + re.escape(setup) + r"\(\)")

    def test_every_catalogued_action_is_wired_from_its_page(self):
        for feature, actions in FEATURES.items():
            section = section_markup(self.template, feature)
            self.assertIsNotNone(section, feature)
            for action in actions:
                with self.subTest(feature=feature, action=action):
                    self.assertRegex(section or "", r"\b" + re.escape(action) + r"\s*\(")


if __name__ == "__main__":
    unittest.main()
