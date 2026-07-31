# Diff Checker

## Overview
Compare two texts side-by-side to identify differences. Shows added, removed, and modified lines with color highlighting.

## Features
- **Side-by-Side Comparison**: View differences visually
- **Real-time Updates**: See changes as you type
- **Color Highlighting**: 
  - Green = Added lines
  - Red = Removed lines
  - Yellow = Modified lines
- **Copy Results**: Copy comparison to clipboard
- **Clear All**: Reset both textareas and start over

## How to Use

### Basic Comparison

1. Navigate to **CONVERT** → **Diff Checker**
2. Paste or type text in the **Left** textarea
3. Paste or type text in the **Right** textarea
4. Changes appear automatically as you type
5. Click **Compare** button to refresh the comparison

### Interpreting Results

- **Green backgrounds**: Lines present in right but not left (added)
- **Red backgrounds**: Lines present in left but not right (removed)
- **Yellow backgrounds**: Lines that exist in both but differ (modified)
- **No highlight**: Lines that are identical

## Examples

### Example 1: Simple Text Comparison

**Left:**
```
Hello World
How are you?
```

**Right:**
```
Hello World
How are you doing?
```

**Result:**
- Left side shows "How are you?" in yellow (removed)
- Right side shows "How are you doing?" in yellow (added)

### Example 2: Code Comparison

**Left (v1):**
```javascript
function add(a, b) {
  return a + b;
}
```

**Right (v2):**
```javascript
function add(a, b) {
  console.log('Adding:', a, b);
  return a + b;
}
```

**Result:**
- The new console.log line shows in green (added)

## Common Use Cases
- Comparing file versions or drafts
- Reviewing code changes before commit
- Identifying differences in configurations
- Validating data changes
- Version control previews

## Tips
- Changes update in real-time as you type
- Use for quick before/after comparisons
- Helpful for debugging data transformations
- Great for code review workflows
- Copy button saves full comparison to clipboard
