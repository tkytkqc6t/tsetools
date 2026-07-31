# UUID Generator

## Overview
Generate universally unique identifiers (UUIDs) for use in applications, databases, and distributed systems.

## Features
- **Multiple UUID Versions**: Generate v1, v4, and other formats
- **Batch Generation**: Create multiple UUIDs at once
- **Copy to Clipboard**: Quick copy individual or all UUIDs
- **Download**: Save generated UUIDs to file
- **Format Options**: Choose output format (with/without dashes)

## UUID Versions Explained

| Version | Format | Use Case |
|---------|--------|----------|
| v1 | Time-based | Databases, chronological sorting |
| v4 | Random | Most common, security-focused |
| v5 | Name-based | Reproducible from input data |

## How to Use

### Generate Single UUID

1. Navigate to **EXTRACT** → **UUID Generator**
2. Choose UUID version (usually v4 for random)
3. Click **Generate** button
4. UUID appears in the output field
5. Click **Copy** to copy to clipboard

### Generate Batch UUIDs

1. Select the number of UUIDs needed
2. Click **Generate Multiple**
3. All UUIDs appear in the output
4. Click **Copy All** to copy to clipboard
5. Click **Download** to save as file

## Examples

### v4 UUID (Random)
```
550e8400-e29b-41d4-a716-446655440000
f47ac10b-58cc-4372-a567-0e02b2c3d479
```

### v1 UUID (Time-based)
```
123e4567-e89b-12d3-a456-426614174000
```

## Common Use Cases
- Database primary keys
- API request IDs for tracking
- Session tokens and identifiers
- Distributed system coordination
- Unique resource naming
- Audit trail identifiers
- Temporary file naming

## Tips
- v4 is most commonly used for random IDs
- v1 includes timestamp for ordering
- v5 allows reproducible generation
- Always use in URLs safely
- Copy directly for quick paste
- Generate batch for bulk operations
- UUIDs are 128-bit values
