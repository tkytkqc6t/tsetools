# TSE Tools Suite - User Guide Index

Welcome to the complete user guide for TSE Tools Suite. This directory contains detailed documentation for every feature.

## Quick Navigation

### 🎯 Getting Started
- [01_WELCOME.md](01_WELCOME.md) - Overview and feature categories

### 🔤 Text Processing & Formatting
- [02_URL_ENCODE.md](02_URL_ENCODE.md) - URL encoding/decoding
- [04_XML_BEAUTIFIER.md](04_XML_BEAUTIFIER.md) - Format XML code
- [05_JSON_BEAUTIFIER.md](05_JSON_BEAUTIFIER.md) - Format JSON code
- [06_HTML_BEAUTIFIER.md](06_HTML_BEAUTIFIER.md) - Format HTML code
- [07_SQL_FORMATTER.md](07_SQL_FORMATTER.md) - Format SQL queries

### 🔍 Data Analysis & Comparison
- [03_DIFF_CHECKER.md](03_DIFF_CHECKER.md) - Compare text differences
- [12_JSON_FILTER.md](12_JSON_FILTER.md) - Filter JSON data
- [13_XML_FILTER.md](13_XML_FILTER.md) - Filter XML data

### 📊 Data Conversion
- [10_JSON_TO_CSV.md](10_JSON_TO_CSV.md) - Convert JSON to CSV
- [11_XML_TO_CSV.md](11_XML_TO_CSV.md) - Convert XML to CSV

### 📤 Data Extraction
- [14_JSON_EXTRACT.md](14_JSON_EXTRACT.md) - Extract JSON fields
- [15_XML_EXTRACT.md](15_XML_EXTRACT.md) - Extract XML elements

### 🛠️ Utility Tools
- [08_UUID_GENERATOR.md](08_UUID_GENERATOR.md) - Generate unique IDs
- [09_TIMEZONE_CONVERTER.md](09_TIMEZONE_CONVERTER.md) - Convert timezones
- [16_EML_ANALYZER.md](16_EML_ANALYZER.md) - Analyze email files
- [17_RFC_VALIDATOR.md](17_RFC_VALIDATOR.md) - Validate RFC standards

## Features by Category

### Text Processing (5 tools)
Transform and format code in multiple languages and formats.

| Tool | Purpose | Input | Output |
|------|---------|-------|--------|
| URL Encode | Encode/decode URLs | Text/URL | Encoded text |
| XML Beautifier | Format XML | Minified XML | Formatted XML |
| JSON Beautifier | Format JSON | Minified JSON | Formatted JSON |
| HTML Beautifier | Format HTML | Minified HTML | Formatted HTML |
| SQL Formatter | Format SQL queries | Raw SQL | Formatted SQL |

### Data Analysis (3 tools)
Analyze, filter, and compare data structures.

| Tool | Purpose | Use Case |
|------|---------|----------|
| Diff Checker | Compare texts | Version control, code review |
| JSON Filter | Filter by conditions | Extract specific records |
| XML Filter | Filter elements | Narrow down XML documents |

### Data Conversion (2 tools)
Transform data between formats for compatibility.

| Tool | Input | Output |
|------|-------|--------|
| JSON to CSV | JSON arrays | CSV spreadsheet |
| XML to CSV | XML elements | CSV spreadsheet |

### Data Extraction (2 tools)
Extract specific fields or elements from complex data.

| Tool | Purpose | Result |
|------|---------|--------|
| JSON Extract | Select JSON fields | Smaller, focused JSON |
| XML Extract | Select XML elements | Simplified XML |

### Utilities (4 tools)
General-purpose tools for common tasks.

| Tool | Purpose | Output |
|------|---------|--------|
| UUID Generator | Generate unique IDs | UUID strings |
| Timezone Converter | Convert time zones | Time in different zones |
| EML Analyzer | Parse email files | Email components |
| RFC Validator | Validate formats | Valid/Invalid status |

## Common Workflows

### Workflow 1: Data Cleaning & Export
1. **Upload** data (JSON/XML file)
2. **Filter** using JSON/XML Filter tool
3. **Extract** relevant fields using Extract tool
4. **Convert** to CSV using JSON/XML to CSV
5. **Download** for use in Excel

### Workflow 2: Code Review Preparation
1. Format code using appropriate **Beautifier**
2. Use **Diff Checker** to review changes
3. Validate using **RFC Validator** if needed

### Workflow 3: Data Migration
1. **Upload** source data
2. **Extract** needed fields
3. **Convert** to target format
4. **Validate** using RFC standards
5. **Download** for import

### Workflow 4: Email Debugging
1. Upload `.eml` file to **EML Analyzer**
2. Extract headers and content
3. Identify issues in email structure

## Tips & Tricks

### Performance
- Large files process locally - no server uploads
- Batch operations supported for most tools
- Download results for bulk processing

### Data Protection
- All processing happens in your browser
- No data sent to servers
- Safe for sensitive information
- Can work completely offline

### Integration
- Copy results directly to clipboard
- Download as files for immediate use
- Format conversions enable tool chaining
- Combine multiple tools for complex workflows

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Open Tool | Alt + Click on tool name |
| Copy Result | Ctrl/Cmd + C (with result selected) |
| Clear All | Ctrl/Cmd + A then Delete |
| Download | Ctrl/Cmd + S |

## Troubleshooting

### My data doesn't appear
- Check that format is valid (valid JSON, XML, etc.)
- Verify file encoding is UTF-8
- Try using Beautifier first to validate format

### Filter returned no results
- Verify field names are correct (case-sensitive)
- Check operator selection (Equals vs Contains)
- Try using Contains instead of Equals for text

### Download failed
- Check file size (max varies by browser)
- Try copying to clipboard instead
- Disable pop-up blockers
- Use a different browser

### Validation errors
- Review error message for specific issue
- Check RFC standard documentation
- Verify all required fields are present
- Look for disallowed characters

## Getting Help

### For Each Tool
- Each guide has examples and common use cases
- Error messages provide specific guidance
- Tips section offers best practices

### Data Format Help
- Use Beautifier to format and validate data
- Check RFC Validator for format compliance
- Reference examples in each guide

## Updates & Feedback

TSE Tools Suite is regularly updated with:
- New tools and features
- Performance improvements
- Bug fixes and enhancements
- User experience improvements

## Version Information

- **Current Version:** 1.7c
- **Last Updated:** 2024
- **All Tools:** v1.7c

---

**Start with:** [01_WELCOME.md](01_WELCOME.md)  
**Quick Find:** Use Ctrl+F to search this document  
**Questions:** Check the specific tool guide for your task
