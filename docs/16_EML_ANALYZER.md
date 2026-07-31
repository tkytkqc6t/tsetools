# EML Analyzer

## Overview
Analyze and parse email files (`.eml` format). Extract headers, body, attachments, and metadata from email messages.

## Features
- **Email Header Analysis**: Extract all headers
- **Body Content**: Display email message body
- **Attachment List**: Show attachments with details
- **Metadata Extraction**: From, To, Date, Subject
- **File Upload**: Support for `.eml` files
- **Copy Results**: Copy parsed data to clipboard
- **Download Analysis**: Save results as text file

## How to Use

### Analyzing an Email

1. Navigate to **EXTRACT** → **EML Analyzer**
2. Click **📁 Upload EML File** or drag-and-drop
3. Or paste raw EML content directly
4. Analysis appears automatically with:
   - **Email Headers**: All email metadata
   - **From/To/Subject**: Key information
   - **Body Content**: Email message
   - **Attachments**: List of files
5. Copy or download results

### EML File Format

- Standard email format used by Outlook, Thunderbird
- Plain text with headers and body
- Contains all email metadata
- Preserves MIME structure

## What Gets Extracted

### Headers
- **From**: Sender email address
- **To**: Recipient address
- **Subject**: Email subject line
- **Date**: When email was sent
- **CC/BCC**: Carbon copy recipients
- **Reply-To**: Reply address
- **Message-ID**: Unique identifier
- **Content-Type**: MIME type

### Content
- Email message body (HTML or plain text)
- Formatting and styling
- Embedded images
- Links and references

### Attachments
- File names
- File sizes
- MIME types
- Number of attachments

## Example Analysis

**Input:** Sample EML file

**Output Includes:**
```
From: sender@example.com
To: recipient@example.com
Subject: Meeting Reminder
Date: Mon, 15 Jan 2024 10:30:00 +0000
---
Email body content here...
---
Attachments:
- meeting_notes.pdf (245 KB)
- agenda.docx (156 KB)
```

## Common Use Cases
- Email debugging and troubleshooting
- Forwarding email content extraction
- Backup email analysis
- Email archival and compliance
- Investigating email issues
- Extracting attachments info
- Email header analysis
- Spam detection analysis

## Tips
- EML files are plain text format
- Most email clients can export to EML
- Preserves all email metadata
- Useful for email security analysis
- Helpful for compliance requirements
- Can extract headers for routing info
- Analyze spam for headers
- Share content without forwarding email
