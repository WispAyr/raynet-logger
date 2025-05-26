# RAYNET Event Logging System

## Overview

This application is designed for **RAYNET** operators to log and monitor **radio communications** efficiently during emergency events and public service deployments.

## Goals

- Log all voice messages transmitted over **radio channels** and **talkgroups**
- Ensure fast, intuitive entry for time-sensitive situations
- Store all logs with **timestamp**, **callsign**, **channel/group**, and **message**
- Provide clear, readable UI with visual cues for urgent vs routine messages

---

## Key Features

### 1. Message Logging Interface

- **Quick log entry form**
  - Dropdown/select for: `Talkgroup`, `Channel`, `Message Type`
  - Input fields: `Callsign`, `Message`
  - Auto-filled: `Date/Time`
- Submit button: log and clear for next entry

### 2. Log Timeline View

- Chronological list of all entries
  - Fields: `Timestamp`, `Callsign`, `Talkgroup`, `Message`
  - Color-coded by message type or urgency
- Filters by date, channel, talkgroup

### 3. Talkgroup/Channel Management

- Ability to define and edit `Talkgroups`, `Channels`
- Active status indicator for each (green = active, red = quiet)

---

## Visual/UX Notes

- Use **large, readable fonts** — suitable for field use
- Contrast: dark mode for low-light environments
- Use **icons or tags** to denote message types (e.g., `INFO`, `URGENT`, `CHECK-IN`)
- Responsive design (tablet/laptop friendly)

---

## Technical Notes

- Should support offline logging with sync when connected
- Export logs to CSV, JSON, or PDF
- User accounts or operator callsigns saved in local storage

---

## Example Log Entry

| Timestamp           | Callsign | Talkgroup | Message Type | Message                               |
|---------------------|----------|-----------|--------------|----------------------------------------|
| 2025-05-25 13:46:00 | M0ABC    | Event Ops | INFO         | Requesting supply run to checkpoint 3. |

---

## Future Enhancements

- Voice input for rapid logging
- Integration with mapping for asset tracking
- Incident tagging and categorization