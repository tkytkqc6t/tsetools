# XML Filter

## Overview
Filter and extract XML elements based on element names and attribute values. Narrow down large XML documents to specific records.

## Features
- **Element Filtering**: Filter by element name or attributes
- **Multiple Conditions**: Add up to 10 filter rules
- **Logic Operators**: AND/OR filtering
- **Attribute Support**: Filter by element attributes
- **File Upload**: Support for `.xml` files with drag-and-drop
- **Download Results**: Save filtered XML as file
- **Copy to Clipboard**: Quick copy filtered data
- **Clear All**: Reset and start fresh

## How to Use

### Setting Up XML Filters

1. Navigate to **FILTER** → **Filter from XML**
2. Paste XML or upload a `.xml` file
3. Set **Element Name** (e.g., `product`, `person`, `record`)
4. Click **+ Add Filter** to add conditions
5. Configure filters:
   - **Attribute**: XML attribute name
   - **Operator**: Comparison type
   - **Value**: What to filter by
6. Click **Apply Filter**
7. Filtered results appear on the right

### Element Name

The XML element name representing records to filter:
- Example: `<person>` elements → "person"
- Example: `<product>` elements → "product"
- Example: `<airport>` elements → "airport"

## Filter Operators

| Operator | Meaning | Example |
|----------|---------|---------|
| Equals | Exact match | type = "A" |
| Not Equals | Anything except | status ≠ "archived" |
| Contains | Text includes | name contains "Smith" |
| Not Contains | Doesn't include | category not contains "beta" |
| Greater Than | Number larger | price > 100 |
| Less Than | Number smaller | quantity < 50 |
| Starts With | Begins with | code starts with "US" |
| Ends With | Ends with | ext ends with ".pdf" |

## Examples

### Example 1: Filter Employees by Department

**Input XML:**
```xml
<?xml version="1.0"?>
<company>
  <employee id="1">
    <name>John</name>
    <department>Engineering</department>
    <salary>95000</salary>
  </employee>
  <employee id="2">
    <name>Jane</name>
    <department>Sales</department>
    <salary>75000</salary>
  </employee>
  <employee id="3">
    <name>Bob</name>
    <department>Engineering</department>
    <salary>92000</salary>
  </employee>
</company>
```

**Setup:**
- Element Name: `employee`
- Filter: department **Equals** Engineering

**Result:**
```xml
<employee id="1">
  <name>John</name>
  <department>Engineering</department>
  <salary>95000</salary>
</employee>
<employee id="3">
  <name>Bob</name>
  <department>Engineering</department>
  <salary>92000</salary>
</employee>
```

### Example 2: Multiple Attribute Filters

**Filters:**
1. status = "active"
2. priority > 5

**Logic:** AND (both must match)

## Using Attributes

Attributes in XML tags:
```xml
<product id="123" category="Electronics" inStock="true">
```

Can filter by:
- `id`, `category`, `inStock`, etc.

## Common Use Cases
- Extract records from XML feeds
- Filter configuration files
- Finding specific elements in large XML
- Data quality and validation
- Preparing XML data for export
- Extracting subset of records
- Merging filtered XML from multiple sources

## Tips
- Make sure element name is correct
- Attributes must match exactly (case-sensitive)
- Use AND for precise filtering
- Use OR for multiple criteria matches
- Download for next stage processing
- Test filters on small data first
- Combine with XML Beautifier for readability
