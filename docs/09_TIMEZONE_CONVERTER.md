# Timezone Converter

## Overview
Convert times between different timezones instantly. Perfect for coordinating globally distributed teams and systems.

## Features
- **Multi-Timezone Support**: Convert to/from any major timezone
- **Real-time Conversion**: Instant results as you input
- **DST Handling**: Automatically accounts for daylight saving time
- **UTC Display**: Always shows UTC equivalent
- **Time Picker**: Select time from calendar or type manually
- **Copy Results**: Copy converted times to clipboard

## How to Use

### Converting Time Between Timezones

1. Navigate to **EXTRACT** → **Timezone Converter**
2. Enter the **Source Time** (or use the time picker)
3. Select **Source Timezone** (where the time is from)
4. Select **Target Timezone** (where you want to convert to)
5. Result appears automatically
6. Copy or note the converted time

### Time Format

- Enter times in **HH:MM** format (24-hour)
- Example: `14:30` for 2:30 PM
- Or use the calendar date picker

## Timezone List Examples

| Timezone Code | Region | UTC Offset |
|---------------|--------|-----------|
| PST | Pacific Standard Time | UTC-8 |
| MST | Mountain Standard Time | UTC-7 |
| CST | Central Standard Time | UTC-6 |
| EST | Eastern Standard Time | UTC-5 |
| UTC | Coordinated Universal Time | UTC+0 |
| CET | Central European Time | UTC+1 |
| IST | India Standard Time | UTC+5:30 |
| JST | Japan Standard Time | UTC+9 |
| AEST | Australian Eastern | UTC+10 |

## Examples

### Example 1: Team Meeting Time

**Source:** 3:00 PM EST (New York)  
**Target:** JST (Tokyo)  
**Result:** 5:00 AM next day

### Example 2: Server Logs

**Source:** 22:30 UTC (Server time)  
**Targets:**
- 5:30 PM EST (East Coast)
- 2:30 PM PST (West Coast)
- 7:30 AM JST (Tokyo)

## Common Use Cases
- Scheduling global team meetings
- Coordinating international deployments
- Converting server log timestamps
- Scheduling cron jobs across timezones
- Converting API event times
- Managing backup schedules globally
- Time zone validation in applications

## Tips
- DST is handled automatically
- Always keep backups in UTC
- Use 24-hour format for clarity
- Note that DST changes affect conversions
- UTC is reference for all conversions
- Bookmark for frequent conversions
- Share readable format with team
