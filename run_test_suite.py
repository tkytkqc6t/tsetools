"""Run a unittest suite and export its results as an Excel workbook."""

import argparse
from datetime import datetime
import sys
import time
import unittest
from pathlib import Path

from openpyxl import Workbook
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.utils import get_column_letter


ROOT = Path(__file__).resolve().parent
SUITES = {
    "unit": ("tests/unit", "unit_test"),
    "regression": ("tests/automation", "regression_test"),
}


class WorkbookTestResult(unittest.TextTestResult):
    """Text result that also records per-test outcomes for the workbook."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.records = []

    @staticmethod
    def _test_name(test):
        return "{}.{}".format(test.__class__.__name__, getattr(test, "_testMethodName", str(test)))

    def addSuccess(self, test):
        super().addSuccess(test)
        self.records.append((self._test_name(test), "PASS", ""))

    def addFailure(self, test, err):
        super().addFailure(test, err)
        self.records.append((self._test_name(test), "FAIL", self._exc_info_to_string(err, test)))

    def addError(self, test, err):
        super().addError(test, err)
        self.records.append((self._test_name(test), "ERROR", self._exc_info_to_string(err, test)))

    def addSkip(self, test, reason):
        super().addSkip(test, reason)
        self.records.append((self._test_name(test), "SKIP", str(reason)))

    def addExpectedFailure(self, test, err):
        super().addExpectedFailure(test, err)
        self.records.append((self._test_name(test), "EXPECTED FAILURE", self._exc_info_to_string(err, test)))

    def addUnexpectedSuccess(self, test):
        super().addUnexpectedSuccess(test)
        self.records.append((self._test_name(test), "UNEXPECTED SUCCESS", "Test was expected to fail."))

    def addSubTest(self, test, subtest, err):
        super().addSubTest(test, subtest, err)
        if err is not None:
            self.records.append((str(subtest), "FAIL", self._exc_info_to_string(err, test)))


def export_workbook(suite_name, prefix, started_at, elapsed, result):
    output_dir = ROOT / "test_run"
    output_dir.mkdir(exist_ok=True)
    finished_at = datetime.now()
    filename = "{}_{}.xlsx".format(prefix, started_at.strftime("%Y%m%d_%H%M%S"))
    output_path = output_dir / filename

    failure_count = len(result.failures)
    error_count = len(result.errors)
    expected_count = len(result.expectedFailures)
    unexpected_count = len(result.unexpectedSuccesses)
    passed_count = sum(1 for _, outcome, _ in result.records if outcome == "PASS")
    status = "PASSED" if result.wasSuccessful() else "FAILED"

    workbook = Workbook()
    summary = workbook.active
    summary.title = "Summary"
    summary.append(["Test Suite", suite_name])
    summary.append(["Result", status])
    summary.append(["Started", started_at.strftime("%Y-%m-%d %H:%M:%S")])
    summary.append(["Finished", finished_at.strftime("%Y-%m-%d %H:%M:%S")])
    summary.append(["Duration (seconds)", round(elapsed, 3)])
    summary.append(["Tests Run", result.testsRun])
    summary.append(["Passed", passed_count])
    summary.append(["Failures", failure_count])
    summary.append(["Errors", error_count])
    summary.append(["Skipped", len(result.skipped)])
    summary.append(["Expected Failures", expected_count])
    summary.append(["Unexpected Successes", unexpected_count])
    summary.append(["Report File", filename])
    summary.column_dimensions["A"].width = 25
    summary.column_dimensions["B"].width = 48
    for row in summary.iter_rows(min_row=1, max_col=2):
        row[0].font = Font(bold=True, color="FFFFFF")
        row[0].fill = PatternFill("solid", fgColor="1F4E78")
        row[1].alignment = Alignment(vertical="top", wrap_text=True)

    details = workbook.create_sheet("Test Details")
    details.append(["Test", "Result", "Details"])
    for cell in details[1]:
        cell.font = Font(bold=True, color="FFFFFF")
        cell.fill = PatternFill("solid", fgColor="1F4E78")
    for record in result.records:
        details.append(list(record))
    details.freeze_panes = "A2"
    details.auto_filter.ref = details.dimensions
    for column, width in enumerate((58, 20, 100), start=1):
        details.column_dimensions[get_column_letter(column)].width = width
    for row in details.iter_rows(min_row=2):
        row[2].alignment = Alignment(vertical="top", wrap_text=True)

    workbook.save(str(output_path))
    print("Excel report saved to: {}".format(output_path))
    return output_path


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("suite", choices=sorted(SUITES), help="Test suite to run")
    args = parser.parse_args(argv)

    suite_path, prefix = SUITES[args.suite]
    started_at = datetime.now()
    started_clock = time.time()
    loader = unittest.defaultTestLoader
    suite = loader.discover(str(ROOT / suite_path), top_level_dir=str(ROOT))
    runner = unittest.TextTestRunner(verbosity=2, resultclass=WorkbookTestResult)
    result = runner.run(suite)
    elapsed = time.time() - started_clock
    export_workbook(args.suite, prefix, started_at, elapsed, result)
    return 0 if result.wasSuccessful() else 1


if __name__ == "__main__":
    sys.exit(main())
