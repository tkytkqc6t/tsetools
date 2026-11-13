## Requirements:
- Python 3.7+
- Git
- VSCode or any IDE

## Tests

The unit suite checks upload helpers and verifies that every tool section has implemented JavaScript actions. The automation regression suite exercises all 17 tools in a headless Chrome browser and covers the upload endpoint and chunked upload flows. Install `requirements-test.txt` into the same Python environment the runner will use before running either suite. Automation tests also require Google Chrome. The scripts use the project virtual environment when available, or fall back to the system Python installation.

Each run writes a workbook with a summary and per-test details under `test_run/`. Unit reports use `unit_test_yyyymmdd_hhmmss.xlsx`; automation regression reports use `regression_test_yyyymmdd_hhmmss.xlsx`.

```sh
python -m pip install -r requirements-test.txt
```

| Suite | macOS | Windows |
| --- | --- | --- |
| Unit tests | `bash run_unit_tests.sh` | `run_unit_tests.bat` |
| Automation regression tests | `bash run_automation_regression.sh` | `run_automation_regression.bat` |

## FIRST STEP
Go to your project folder

## Installation: download and run below files

### macOS
- Download 2 files:
  + install_macos.sh: run it using below commands:<br>
    chmod +x install_macos.sh <br>
    ./install_macos.sh <br>
  + run_macos.sh: run it next time of usage using below commands:<br>
    chmod +x run_macos.sh <br>
    ./run_macos.sh <br>

### Windows
- Download 2 files:
  + install_windows.bat  --> just double click to run it
  + run_macos.bat        --> just double click to run it

#### The install_* files will automatically:
- Clone the repository
- Create a Python virtual environment
- Install dependencies
- Start the server and open it in your browser at http://127.0.0.1:5000

#### The run_* files will automatically:
- Pull the latest code from the main branch
- Activate the virtual environment
- Start the server and open it in your browser at http://127.0.0.1:5000
