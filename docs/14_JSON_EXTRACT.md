# JSON Extract

## Overview
Extract specific fields from JSON data. Select which properties you want to keep and remove the rest.

## Features
- **Field Selection**: Choose which fields to extract
- **Custom Fields**: Add or remove fields easily
- **Multiple Records**: Process arrays of objects
- **File Upload**: Support for `.json` files
- **Preview Results**: See results before applying
- **Download Extracted Data**: Save as file
- **Copy to Clipboard**: Quick copy extracted data
- **Nested Field Support**: Extract from nested objects

## How to Use

### Extracting Fields

1. Navigate to **EXTRACT** → **Extract from JSON**
2. Paste JSON or upload a file
3. Set **Data Array Path** (path to your data array)
4. Click **+ Add Field** to select fields to extract
5. Enter field names you want to keep
6. Click **Apply Extraction**
7. Only selected fields appear in output

### Data Array Path

- Location of the array in your JSON
- Example: `users` for `{ "users": [...] }`
- Nested: `data.records` for `{ "data": { "records": [...] } }`

## Examples

### Example 1: Extract User Names Only

**Input JSON:**
```json
{
  "users": [
    {
      "id": 1,
      "name": "Alice",
      "email": "alice@example.com",
      "password": "secret123",
      "created": "2023-01-15"
    },
    {
      "id": 2,
      "name": "Bob",
      "email": "bob@example.com",
      "password": "pass456",
      "created": "2023-01-20"
    }
  ]
}
```

**Fields to Extract:** `id`, `name`, `email`

**Output:**
```json
[
  {
    "id": 1,
    "name": "Alice",
    "email": "alice@example.com"
  },
  {
    "id": 2,
    "name": "Bob",
    "email": "bob@example.com"
  }
]
```

### Example 2: Extract Nested Fields

**Input:**
```json
{
  "users": [
    {
      "name": "John",
      "address": {
        "city": "NYC",
        "zip": "10001"
      }
    }
  ]
}
```

**Fields:** `name`, `address.city`

**Output:**
```json
[
  {
    "name": "John",
    "address": {
      "city": "NYC"
    }
  }
]
```

## Field Operations

| Operation | Example | Result |
|-----------|---------|--------|
| Add field | `name` | Include field in output |
| Remove field | Click ✕ | Exclude from output |
| Nested field | `address.city` | Extract from nested objects |

## Common Use Cases
- Remove sensitive data (passwords, tokens)
- Extract public API responses
- Prepare data for reporting
- Reduce file size for transfer
- Create CSV from selected fields
- Privacy compliance (GDPR)
- Data sanitization before sharing
- Focusing on relevant fields

## Tips
- Useful for removing sensitive information
- Extract only needed fields for performance
- Use nested notation for deep fields
- Combine with JSON to CSV after extraction
- Download for clean data format
- Test on sample data first
- Document which fields are extracted
