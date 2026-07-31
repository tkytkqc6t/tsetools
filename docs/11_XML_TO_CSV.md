# XML to CSV Converter

## Overview
Convert XML data into CSV (Comma-Separated Values) format for spreadsheet applications and data analysis.

## Features
- **Automatic Parsing**: Detects XML structure
- **Element Mapping**: Maps XML elements to CSV columns
- **Attribute Support**: Includes XML attributes in output
- **Custom Delimiters**: Choose comma, semicolon, or tab
- **File Upload**: Support for `.xml` files with drag-and-drop
- **Download CSV**: Save results as `.csv` file
- **Batch Processing**: Handle multiple records

## How to Use

### Converting XML to CSV

1. Navigate to **CONVERT** → **XML to CSV**
2. Paste XML data or upload a `.xml` file
3. Specify the **Record Element** name
4. CSV preview appears automatically
5. Click **Copy** or **Download** to save

### Record Element

- The XML element that represents each row in the CSV
- Example: If your XML has `<user>` elements, use `user`
- All `<user>` elements become CSV rows

## Examples

### Input XML
```xml
<?xml version="1.0"?>
<employees>
  <employee id="1">
    <name>John Smith</name>
    <department>Engineering</department>
    <salary>95000</salary>
  </employee>
  <employee id="2">
    <name>Jane Doe</name>
    <department>Sales</department>
    <salary>75000</salary>
  </employee>
  <employee id="3">
    <name>Bob Johnson</name>
    <department>Marketing</department>
    <salary>80000</salary>
  </employee>
</employees>
```

### Output CSV
```csv
id,name,department,salary
1,John Smith,Engineering,95000
2,Jane Doe,Sales,75000
3,Bob Johnson,Marketing,80000
```

## Record Element Selection

| XML Structure | Record Element | Result |
|--------------|----------------|--------|
| `<root><item>` | item | Each `<item>` = 1 row |
| `<data><record>` | record | Each `<record>` = 1 row |
| `<airports><airport>` | airport | Each `<airport>` = 1 row |

## Handling Attributes

### XML with Attributes
```xml
<products>
  <product id="101" category="Electronics">
    <name>Laptop</name>
    <price>999</price>
  </product>
</products>
```

### CSV Output
```csv
id,category,name,price
101,Electronics,Laptop,999
```

## Delimiter Options

| Delimiter | Locale | Output |
|-----------|--------|--------|
| Comma (,) | US/UK | Standard CSV |
| Semicolon (;) | Europe | European Excel |
| Tab | Data Science | TSV format |

## Common Use Cases
- Converting XML APIs to spreadsheets
- Exporting configuration files to CSV
- Data migration from XML to databases
- Reporting on XML data
- Integration with BI tools
- Data validation and quality checks
- Sharing XML data with Excel users

## Tips
- Validate XML format first using XML Beautifier
- Choose correct record element for accurate conversion
- Attributes become separate columns
- Download for immediate Excel import
- Use semicolon for European Excel versions
- Nested elements flatten into columns
- Perfect for legacy XML data processing
