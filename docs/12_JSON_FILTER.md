# JSON Filter

## Overview
Filter and search JSON data based on field values and conditions. Extract specific records matching your criteria.

## Features
- **Multiple Filter Conditions**: Add up to 10 filter rules
- **Logic Operators**: AND/OR conditions
- **Comparison Operators**: Equals, Contains, Greater than, etc.
- **File Upload**: Support for `.json` files
- **Download Filtered Data**: Save results as file
- **Copy Results**: Copy to clipboard
- **Clear All**: Reset and start fresh

## How to Use

### Setting Up Filters

1. Navigate to **FILTER** → **Filter from JSON**
2. Paste JSON or upload a file
3. Set **Data Array Path** (usually `data` or resource name)
4. Click **+ Add Filter** to add conditions
5. Configure each filter:
   - **Field Name**: JSON property to filter
   - **Operator**: Comparison type
   - **Value**: What to match against
6. Click **Apply Filter** to execute
7. Results appear on the right

### Data Array Path

The path to the array in your JSON:
- Example data: `{ "users": [...] }` → Path: `users`
- Nested: `{ "data": { "records": [...] } }` → Path: `data.records`
- Root array: `[...]` → Path: (leave empty)

## Operators Explained

| Operator | Meaning | Example |
|----------|---------|---------|
| Equals | Exact match | city = "Tokyo" |
| Not Equals | Anything except | status ≠ "inactive" |
| Contains | Text includes | name contains "John" |
| Not Contains | Text doesn't include | email not contains "spam" |
| Greater Than | Number is larger | age > 30 |
| Less Than | Number is smaller | salary < 50000 |
| Starts With | Text begins with | code starts with "US" |
| Ends With | Text ends with | email ends with ".com" |

## Examples

### Example 1: Filter Airports by City

**Input JSON:**
```json
{
  "airports": [
    {"code": "ATL", "name": "Atlanta", "city": "Atlanta"},
    {"code": "JFK", "name": "Kennedy", "city": "New York"},
    {"code": "HND", "name": "Haneda", "city": "Tokyo"}
  ]
}
```

**Setup:**
- Data Array Path: `airports`
- Filter: city **Equals** Tokyo

**Result:**
```json
[
  {"code": "HND", "name": "Haneda", "city": "Tokyo"}
]
```

### Example 2: Multiple Conditions

**Filters:**
1. country = "US"
2. age >= 18

**Logic:** AND (must match both)

**Result:** US airports with adult passengers only

## Logic Operators

| Operator | Means | Result |
|----------|-------|--------|
| AND | All conditions must match | Narrower results |
| OR | Any condition can match | Broader results |

## Common Use Cases
- Filter database exports by criteria
- Extract specific records from APIs
- Data quality checks and validation
- Reporting on subsets of data
- Finding duplicates or anomalies
- Preparing data for analysis
- Exporting filtered data for sharing

## Tips
- Use "Contains" for partial matches
- "Equals" for exact matches works best
- Use AND for precise filtering
- Use OR for broader searches
- Download results for further processing
- Test filters with small data first
- Check results count after filtering
