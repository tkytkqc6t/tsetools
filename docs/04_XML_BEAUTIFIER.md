# XML Beautifier

## Overview
Format and prettify XML code with proper indentation, line breaks, and readable structure.

## Features
- **Auto-Format**: Automatically indent and format XML
- **Error Highlighting**: Shows parsing errors with line numbers
- **File Upload**: Support for file uploads with drag-and-drop
- **Copy Results**: Copy formatted XML to clipboard
- **Download**: Save formatted XML as file
- **Clear**: Reset and start fresh

## How to Use

### Formatting XML

1. Navigate to **BEAUTIFY** → **XML Beautifier**
2. Paste your XML code in the left textarea or upload a file
3. Formatted result appears on the right side automatically
4. Copy or download the result

### File Upload

- Click the **📁 Upload XML File** button
- Select a `.xml` file from your computer
- Or drag-and-drop a file onto the drop zone

## Examples

### Unformatted XML
```xml
<?xml version="1.0"?><root><person><name>John</name><age>30</age><city>New York</city></person><person><name>Jane</name><age>28</age><city>Boston</city></person></root>
```

### Formatted Output
```xml
<?xml version="1.0"?>
<root>
  <person>
    <name>John</name>
    <age>30</age>
    <city>New York</city>
  </person>
  <person>
    <name>Jane</name>
    <age>28</age>
    <city>Boston</city>
  </person>
</root>
```

## Error Handling

If your XML has errors:
- **Error message** appears at the bottom
- Indicates the **line number** of the problem
- Common issues:
  - Missing closing tags: `</tag>`
  - Mismatched tags: `<open>` with `</different>`
  - Invalid characters in text
  - Unclosed attributes

## Common Use Cases
- Making XML readable and maintainable
- Preparing XML for sharing or documentation
- Debugging XML parsing issues
- Converting minified XML to readable format
- Validating XML structure
- Code review preparation

## Tips
- Indentation improves readability significantly
- Check for errors before processing further
- Use for large XML files that are hard to read
- Formatted XML is better for version control
- Download for backup or integration with other tools
