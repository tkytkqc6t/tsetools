# URL Encode / URL Decode

## Overview
Encode and decode URLs to make them safe for transmission over the internet. Handles special characters, spaces, and reserved characters.

## Features
- **URL Encode**: Convert special characters to `%XX` format
- **URL Decode**: Convert `%XX` back to readable characters
- File upload support with drag-and-drop
- Copy to clipboard functionality
- Download results as file

## How to Use

### Encoding a URL

1. Navigate to **BEAUTIFY** → **URL Encode**
2. Paste your URL in the input textarea
3. The encoded version appears in the output automatically
4. Click **Copy** to copy to clipboard or **Download** to save

### Decoding a URL

1. Navigate to **BEAUTIFY** → **URL Decode**
2. Paste your encoded URL (with %XX characters)
3. The decoded version appears in the output automatically
4. Click **Copy** or **Download** as needed

## Examples

### Encoding
**Input:**
```
https://example.com/search?q=hello world&lang=en
```

**Output:**
```
https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dhello+world%26lang%3Den
```

### Decoding
**Input:**
```
hello%20world%21
```

**Output:**
```
hello world!
```

## Common Use Cases
- Encoding URLs for use in HTML href attributes
- Encoding data for URL parameters
- Debugging URL issues with special characters
- Preparing URLs for email or messaging platforms
- Converting encoded URLs back to readable format

## Tips
- Upload files using the file button or drag-and-drop
- Special characters like spaces become `+` or `%20`
- Reserved characters like `?` and `&` are always encoded
- Use this before including URLs in code or queries
