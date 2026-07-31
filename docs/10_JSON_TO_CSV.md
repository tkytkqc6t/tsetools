# JSON to CSV Converter

## Overview
Convert JSON data into CSV (Comma-Separated Values) format for use in spreadsheets and data analysis tools.

## Features
- **Auto-Detection**: Automatically detects JSON structure
- **Nested Fields Support**: Flattens nested objects
- **Custom Delimiters**: Choose comma, semicolon, or tab
- **Header Row**: Automatically creates column headers
- **File Upload**: Support for `.json` files
- **Download CSV**: Save results as `.csv` file
- **Copy to Clipboard**: Copy CSV data directly

## How to Use

### Converting JSON to CSV

1. Navigate to **CONVERT** → **JSON to CSV**
2. Paste JSON data or upload a `.json` file
3. The CSV preview appears automatically
4. Click **Copy** or **Download** to save
5. Open in Excel, Google Sheets, or any spreadsheet

### JSON Format Requirements

- Must be a **JSON array** of objects
- Example:
  ```json
  [
    {"name": "John", "age": 30, "city": "New York"},
    {"name": "Jane", "age": 28, "city": "Boston"}
  ]
  ```

## Examples

### Input JSON
```json
[
  {"id": 1, "name": "Alice", "department": "Engineering", "salary": 95000},
  {"id": 2, "name": "Bob", "department": "Sales", "salary": 75000},
  {"id": 3, "name": "Carol", "department": "Engineering", "salary": 92000}
]
```

### Output CSV
```csv
id,name,department,salary
1,Alice,Engineering,95000
2,Bob,Sales,75000
3,Carol,Engineering,92000
```

## Delimiter Options

| Delimiter | Use Case | Result |
|-----------|----------|--------|
| Comma (,) | Standard CSV | col1,col2,col3 |
| Semicolon (;) | European Excel | col1;col2;col3 |
| Tab | Tab-separated | col1\tcol2\tcol3 |

## Handling Nested Data

### Nested JSON
```json
[
  {
    "name": "John",
    "address": {
      "city": "New York",
      "zip": "10001"
    }
  }
]
```

### Converted CSV
```csv
name,address.city,address.zip
John,New York,10001
```

## Common Use Cases
- Exporting API data to Excel
- Creating spreadsheets from databases
- Data analysis and reporting
- Importing data into BI tools
- Sharing data with non-technical users
- Bulk data processing
- Migration between systems

## Tips
- Ensure JSON is valid before converting
- All objects should have consistent fields
- Nested fields use dot notation
- Missing fields show as empty cells
- Download for easier import into Excel
- Use semicolon delimiter for European locales
- Perfect for data migration workflows
