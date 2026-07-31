# RFC Validator

## Overview
Validate data and formats against RFC (Request for Comments) standards. Ensure compliance with internet standards and specifications.

## Features
- **Multiple RFC Standards**: Email, URLs, IPv4/IPv6, etc.
- **Real-time Validation**: Instant feedback
- **Error Details**: Shows exactly what's wrong
- **Batch Validation**: Check multiple entries
- **Copy Results**: Copy validation results
- **Download Report**: Save validation report
- **Helpful Messages**: Explains violations

## Supported RFC Formats

### Network & Internet
| RFC | Standard | Purpose |
|-----|----------|---------|
| RFC 5321 | SMTP Protocol | Email sending format |
| RFC 5322 | Email Format | Email message structure |
| RFC 3986 | URI Format | URL and URI syntax |
| RFC 791 | IPv4 Addresses | IP version 4 format |
| RFC 2460 | IPv6 Addresses | IP version 6 format |
| RFC 3492 | Internationalized Domain Names | Unicode domains |

### Data & Encoding
| RFC | Standard | Purpose |
|-----|----------|---------|
| RFC 4648 | Base64 Encoding | Base64 format validation |
| RFC 3394 | AES Key Wrap | Cryptographic format |
| RFC 5285 | RTP Header Extensions | Media format |

## How to Use

### Validating Email Addresses

1. Navigate to **EXTRACT** → **RFC Validator**
2. Select **Format Type**: Email (RFC 5322)
3. Enter email address to validate
4. Click **Validate**
5. Result shows: ✓ Valid or ✗ Invalid
6. If invalid, shows why

### Validating URLs

1. Select **Format Type**: URI (RFC 3986)
2. Enter URL to validate
3. Click **Validate**
4. Checks URL structure and format
5. Reports any structural issues

### Validating IP Addresses

1. Select **Format Type**: IPv4 or IPv6
2. Enter IP address
3. Click **Validate**
4. Confirms if valid IP format

## Validation Examples

### Valid Email (RFC 5322)
```
john.doe@example.com ✓
alice+tag@mail.example.co.uk ✓
user_123@domain.org ✓
```

### Invalid Email
```
john@example ✗ (Missing domain extension)
@example.com ✗ (Missing local part)
john doe@example.com ✗ (Space in email)
```

### Valid URLs (RFC 3986)
```
https://example.com ✓
ftp://files.example.org/path ✓
http://sub.domain.example.com:8080/path?query=value ✓
```

### Valid IP Addresses
```
192.168.1.1 ✓ (IPv4)
2001:0db8:85a3::8a2e:0370:7334 ✓ (IPv6)
```

## Common Use Cases
- Email validation before sending
- URL validation in applications
- IP address verification
- Configuration file validation
- API request validation
- DNS record checking
- Security compliance checks
- Data import validation

## Error Messages

| Error | Meaning | Fix |
|-------|---------|-----|
| Invalid character | Disallowed character in format | Remove special chars |
| Missing component | Required part missing | Add missing element |
| Wrong format | Doesn't match RFC | Follow standard format |
| Out of range | Value exceeds limits | Use valid range |

## Tips
- RFC standards ensure compatibility
- Validation catches errors early
- Use before processing data
- Email validation is most common
- IP validation for network config
- URL validation for web applications
- Batch validate multiple entries
- Helpful for API integration
