# SQL Formatter

## Overview
Format and beautify SQL queries with proper indentation, keyword highlighting, and readable structure.

## Features
- **Auto-Format**: Properly indent and structure SQL queries
- **Syntax Highlighting**: Displays SQL with color-coded keywords
- **File Upload**: Support for `.sql` files with drag-and-drop
- **Copy Results**: Copy formatted SQL to clipboard
- **Download**: Save formatted SQL as file
- **Keyword Highlighting**: Different colors for keywords, values, comments

## How to Use

### Formatting SQL

1. Navigate to **CONVERT** → **SQL Formatter**
2. Paste SQL query in the left textarea or upload a file
3. Formatted result with syntax highlighting appears on the right
4. Copy or download the result

### File Upload

- Click **📁 Upload SQL File** button
- Select a `.sql` file
- Or drag-and-drop onto the drop zone

## Examples

### Unformatted SQL
```sql
SELECT id, name, email, created_at FROM users WHERE status='active' AND age>18 ORDER BY created_at DESC LIMIT 10;
```

### Formatted SQL
```sql
SELECT
  id,
  name,
  email,
  created_at
FROM users
WHERE
  status = 'active'
  AND age > 18
ORDER BY created_at DESC
LIMIT 10
```

## Syntax Highlighting

- **Keywords** (SELECT, WHERE, FROM): Bold/colored
- **Values** (strings, numbers): Quoted or highlighted
- **Comments** (--): Displayed separately
- **Operators** (=, >, AND): Color-coded

## Common Use Cases
- Making complex queries readable
- Preparing SQL for code review
- Debugging query issues through formatting
- Converting minified SQL
- Documentation and sharing queries
- Team collaboration on database work
- Learning SQL structure

## Supported SQL Features
- SELECT statements with JOINs
- WHERE conditions with AND/OR
- Aggregate functions (COUNT, SUM, AVG)
- GROUP BY and ORDER BY clauses
- UNION operations
- Subqueries
- Comments (-- and /* */)
- Multiple statements

## Tips
- Proper formatting makes logic clearer
- Use before performance optimization review
- Download for documentation
- Great for learning SQL structure
- Combine with RFC Validator for standards
- Format complex queries for team reviews
