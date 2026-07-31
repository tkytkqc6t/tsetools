# XML Extract

## Overview
Extract specific XML elements and attributes from documents. Remove unwanted elements and keep only the data you need.

## Features
- **Element Selection**: Choose which elements to extract
- **Attribute Support**: Keep or remove attributes
- **Custom XPath Queries**: Advanced extraction
- **File Upload**: Support for `.xml` files with drag-and-drop
- **Preview Results**: See results before applying
- **Download Extracted XML**: Save as file
- **Copy to Clipboard**: Quick copy extracted data
- **Nested Element Support**: Deep element extraction

## How to Use

### Extracting Elements

1. Navigate to **EXTRACT** → **Extract from XML**
2. Paste XML or upload a file
3. Specify **Element Names** to extract
4. Choose **Attributes** to keep
5. Click **Apply Extraction**
6. Only selected elements appear in output
7. Download or copy results

### Element Selection

- List the XML element names you want
- Example: `product`, `person`, `record`
- Separate multiple elements with comma
- Nested elements supported

## Examples

### Example 1: Extract Specific Attributes

**Input XML:**
```xml
<?xml version="1.0"?>
<catalog>
  <product id="1" sku="PROD001">
    <name>Laptop</name>
    <price currency="USD">999</price>
    <manufacturer>TechCorp</manufacturer>
    <warehouse>Building A</warehouse>
  </product>
  <product id="2" sku="PROD002">
    <name>Mouse</name>
    <price currency="USD">25</price>
    <manufacturer>PeripheralCo</manufacturer>
    <warehouse>Building B</warehouse>
  </product>
</catalog>
```

**Elements to Extract:** `product` (with id, sku attributes)  
**Sub-elements:** `name`, `price`

**Output:**
```xml
<product id="1" sku="PROD001">
  <name>Laptop</name>
  <price>999</price>
</product>
<product id="2" sku="PROD002">
  <name>Mouse</name>
  <price>25</price>
</product>
```

### Example 2: Extract Nested Elements

**Input:**
```xml
<company>
  <departments>
    <department>
      <name>Engineering</name>
      <budget>500000</budget>
      <facilities>List of tools</facilities>
    </department>
  </departments>
</company>
```

**Extract:** `department` elements with `name` and `budget` only

**Output:**
```xml
<department>
  <name>Engineering</name>
  <budget>500000</budget>
</department>
```

## Extraction Options

| Option | Effect | Use Case |
|--------|--------|----------|
| Include attributes | Keep attributes | Track IDs or metadata |
| Exclude attributes | Remove attributes | Simplify output |
| Nested elements | Keep child elements | Preserve structure |
| Flatten | Remove nesting | Simplify for parsing |

## Common Use Cases
- Extract public data from complex XML
- Remove sensitive information
- Reduce XML file size
- Prepare XML for specific systems
- Privacy compliance (remove personal data)
- Convert XML to simpler format
- Merge multiple XML files
- Data validation and cleaning

## Tips
- XPath queries work for complex extraction
- Attributes help preserve metadata
- Test extraction on sample data first
- Flattening simplifies structure
- Download for immediate use
- Combine with XML to CSV after extraction
- Useful for API response filtering
- Document extraction rules for reproducibility
