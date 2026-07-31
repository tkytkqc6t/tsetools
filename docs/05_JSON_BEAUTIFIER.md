# JSON Beautifier

## Overview
Format and prettify JSON code with proper indentation and structure. Makes complex JSON readable and validates syntax.

## Features
- **Auto-Format**: Prettify minified JSON
- **Validation**: Checks for valid JSON syntax
- **Error Display**: Shows parsing errors clearly
- **File Upload**: Support for `.json` files with drag-and-drop
- **Copy Results**: Copy formatted JSON to clipboard
- **Download**: Save formatted JSON as file
- **Customizable Indentation**: Default 2-space indent

## How to Use

### Formatting JSON

1. Navigate to **BEAUTIFY** → **JSON Beautifier**
2. Paste JSON code in the left textarea or upload a file
3. Formatted result appears on the right automatically
4. Copy or download as needed

### File Upload

- Click **📁 Upload JSON File** button
- Select a `.json` file
- Or drag-and-drop onto the drop zone

## Examples

### Minified JSON
```json
{"name":"John","age":30,"city":"New York","hobbies":["reading","gaming"],"address":{"street":"123 Main St","zip":"10001"}}
```

### Formatted JSON
```json
{
  "name": "John",
  "age": 30,
  "city": "New York",
  "hobbies": [
    "reading",
    "gaming"
  ],
  "address": {
    "street": "123 Main St",
    "zip": "10001"
  }
}
```

## Error Handling

Common JSON errors and fixes:

| Error | Cause | Fix |
|-------|-------|-----|
| Unexpected token | Missing comma after property | Add `,` between properties |
| Unexpected character | Single quotes instead of double | Use `"` instead of `'` |
| Unexpected end of input | Missing closing brace | Add `}` or `]` |
| Duplicate key | Same key used twice | Remove or rename duplicate |

## Common Use Cases
- Making API responses readable
- Debugging JSON data structures
- Preparing JSON for documentation
- Converting minified JSON for review
- Validating JSON from API calls
- Formatting configuration files
- Code review and analysis

## Tips
- Always validate JSON before using in production
- Formatted JSON is easier to review in version control
- Use with JSON Filter for data analysis
- Download formatted results for sharing
- Combine with JSON to CSV for data export
- Check for duplicate keys that might cause issues
