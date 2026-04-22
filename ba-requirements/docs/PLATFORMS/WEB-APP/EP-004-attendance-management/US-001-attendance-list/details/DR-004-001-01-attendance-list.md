---
document_type: DETAIL_REQUIREMENT
platform: WEB-APP
platform_display: "Exnodes HRM"
epic_id: EP-004
story_id: US-001
story_name: "Attendance List"
detail_id: DR-004-001-01
detail_name: "Attendance List"
parent_requirement: FR-US-001-01
status: draft
version: "1.0"
created_date: 2026-04-21
last_updated: 2026-04-21
related_documents:
  - path: "../REQUIREMENTS.md"
    relationship: parent
  - path: "../ANALYSIS.md"
    relationship: sibling
  - path: "../../../../MOBILE-APP/EP-003-attendance-management/US-001-daily-attendance/details/DR-003-001-01-check-in-out.md"
    relationship: data-source
input_sources:
  - type: text
    description: "Brainstorming session — calendar matrix design decisions"
    extraction_date: "2026-04-21"
---

# Detail Requirement: Attendance List

**Detail ID:** DR-004-001-01
**Parent Requirement:** FR-US-001-01
**Story:** US-001-attendance-list
**Epic:** EP-004 (Attendance Management)
**Status:** Draft
**Version:** 1.0

---

## 1. Use Case Description

As an **HR administrator**, I want to **view a monthly attendance matrix showing all employees' attendance status in a calendar-style layout**, so that **I can monitor attendance patterns, identify late arrivals and absences, and export data for reporting**.

As an **employee without management permission**, I want to **view my own attendance in the same matrix format**, so that **I can verify my check-in/out records and track my attendance history**.

**Purpose:** Provide a centralized monthly view of employee attendance data captured via the mobile app (MOBILE-APP EP-003). The calendar matrix format allows HR to quickly scan attendance patterns across the organization, with visual indicators for on-time arrivals, late arrivals, absences, and approved leave. This view integrates attendance data with leave records from EP-002 Leave Management.

**Target Users:**
- **HR Administrators** — Primary users for attendance monitoring, pattern analysis, and report generation
- **Administrators** — Full access for system administration and data export
- **CEO** — Overview access for company-wide attendance patterns
- **Leaders** — Department-level attendance visibility (with appropriate permissions)
- **Employees** — View own attendance only (without "Manage Data" permission)

**Key Functionality:**
- Monthly calendar matrix view (rows = employees, columns = dates 1-31)
- Visual status indicators per cell (✓ On-time, L Late, A Absent, — Weekend, H Holiday, AL/SL/½ Leave)
- Tooltip on hover showing check-in/out times, hours worked, or leave details
- Filters: Month/Year picker, Department, Status, Employee search
- Export to Excel (bulk all employees + individual per-row export)
- Permission-based data visibility: employees see own row only unless they have "Manage Data" permission

---

## 2. User Workflow

**Entry Point:** Sidebar navigation → HRM > Attendance

**Preconditions:**
- User is signed in (EP-001 US-001)
- User's role has attendance view permission (EP-001 US-004)

**Main Flow:**
1. User clicks "Attendance" under HRM section in the sidebar
2. System loads the Attendance List page
3. System applies data visibility scoping based on permissions
4. System displays the monthly attendance matrix for the current month
5. System loads attendance data from check-in/out records (MOBILE-APP EP-003)
6. System loads approved leave data from Leave Management (EP-002)
7. User browses or takes one of the available actions

**Alternative Flows:**

| Action | Flow |
|--------|------|
| **Change Month** | User selects different month/year from date picker → matrix reloads with selected month's data |
| **Search** | User types employee name → list filters with debounce (300ms) → shows matching employees only |
| **Clear Search** | User clears search box → full list restored (respecting active filters and permissions) |
| **Filter: Department** | User clicks Department chip → selects one or more → matrix filters to show only employees in selected department(s) |
| **Filter: Status** | User clicks Status chip → selects On-time/Late/Absent/On Leave → shows employees with at least one day matching selected status(es) |
| **Reset** | User clicks Reset → all filters and search cleared → full matrix (within data visibility scope) |
| **Hover Cell** | User hovers over a cell → tooltip appears showing date, check-in/out times, hours, status |
| **Export All** | User clicks Export → downloads Excel file of all visible rows |
| **Export Individual** | User clicks gear icon → "Export" → downloads Excel file for that employee's month |

**Exit Points:**
- **Export** → File downloads; stays on page
- **Sidebar navigation** → Navigate to other pages

---

## 3. Field Definitions

### Filter Elements

| Filter Name | Type | Options Source | Multi-select | Default | Description |
|-------------|------|----------------|--------------|---------|-------------|
| Month/Year | Date picker | Calendar months | No | Current month | Select which month to view |
| Department | Dropdown chip | Departments from EP-008 US-001 | Yes | None (show all) | With in-dropdown search |
| Status | Dropdown chip | On-time, Late, Absent, On Leave | Yes | None (show all) | Shows employees with at least one day matching |
| Search | Text input | — | — | Empty | Employee name search with 300ms debounce |

### Interaction Elements

| Element | Type | Visible To | State/Condition | Trigger Action | Description |
|---------|------|------------|-----------------|----------------|-------------|
| Reset | Icon button | All with view permission | Visible when any filter/search active | Clears all filters and search | Refresh icon |
| Export | Button (primary) | All with view permission | Always visible | Downloads Excel of all visible rows | Top-right area |
| Gear Icon | Icon button | All with view permission | Per employee row | Opens action menu | Last column |
| Gear → Export | Menu item | All with view permission | Always | Downloads Excel for that employee | Individual export |

---

## 4. Data Display

### Matrix Layout

```
Filters: [April 2026 ▼] [Department ▼] [Status ▼] [Search...]     [Export]

             | Mon | Tue | Wed | Thu | Fri | Sat | Sun | Mon | ... | Wed |
             |  1  |  2  |  3  |  4  |  5  |  6  |  7  |  8  | ... | 30  | ⚙ |
-------------|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|---|
John Doe     |  ✓  |  L  |  ✓  |  ✓  |  ✓  |  —  |  —  | AL  | ... |  ✓  | ⚙ |
Jane Smith   |  ✓  |  ✓  |  A  |  ✓  |  ✓  |  —  |  —  |  ✓  | ... |  ✓  | ⚙ |
Bob Wilson   |  L  |  ✓  |  ✓  | SL  | SL  |  —  |  —  |  ✓  | ... |  ✓  | ⚙ |
```

### Column Definitions

| Column | Width | Content | Sort | Description |
|--------|-------|---------|------|-------------|
| Employee Name | 180px | Full name | Alphabetical (default) | Fixed column (doesn't scroll horizontally) |
| Date 1-31 | 44px each | Status icon | — | One column per day of the month |
| Actions (⚙) | 48px | Gear icon | — | Last column, fixed |

### Cell Status Icons

| Icon | Meaning | Cell Background | Text Color |
|------|---------|-----------------|------------|
| ✓ | Present (on-time) | Green (#dcfce7) | Green (#166534) |
| L | Late (check-in > 9:00 AM) | Amber (#fef3c7) | Amber (#92400e) |
| A | Absent (no check-in on workday) | Red (#fee2e2) | Red (#991b1b) |
| — | Weekend (Sat/Sun) | Gray (#f3f4f6) | Gray (#6b7280) |
| H | Holiday (company-defined) | Blue (#dbeafe) | Blue (#1e40af) |
| AL | Annual Leave | Purple (#f3e8ff) | Purple (#7c3aed) |
| SL | Sick Leave | Orange (#ffedd5) | Orange (#c2410c) |
| ½ | Half-day Leave | Light blue (#e0f2fe) | Blue (#0369a1) |

### Tooltip Content

**For attendance days (✓, L, A):**

```
┌─────────────────────────────┐
│ Monday, April 7, 2026       │
│ ─────────────────────────── │
│ Check-in:   08:47 AM        │
│ Check-out:  06:15 PM        │
│ Hours:      9h 28m          │
│ Status:     On-time ✓       │
└─────────────────────────────┘
```

**For absent days:**

```
┌─────────────────────────────┐
│ Wednesday, April 3, 2026    │
│ ─────────────────────────── │
│ No check-in recorded        │
│ Status:     Absent          │
└─────────────────────────────┘
```

**For leave days (AL, SL, ½):**

```
┌─────────────────────────────┐
│ Tuesday, April 8, 2026      │
│ ─────────────────────────── │
│ Annual Leave (Full Day)     │
│ Approved by: John Manager   │
└─────────────────────────────┘
```

**For weekends/holidays:**

```
┌─────────────────────────────┐
│ Saturday, April 6, 2026     │
│ ─────────────────────────── │
│ Weekend                     │
└─────────────────────────────┘
```

### Display States

| State | Condition | Display |
|-------|-----------|---------|
| Loading | Data fetching | Skeleton rows for employee names, skeleton cells for dates |
| Empty - No Employees | No employees match filters | "No employees found" message |
| Empty - No Data | Employees exist but no attendance data for month | Matrix shows with all cells as "—" or "A" depending on workday |
| Data Loaded | Normal state | Full matrix with status indicators |

---

## 5. Acceptance Criteria

### AC-001: View Monthly Attendance Matrix

**Given** I am logged in with "View Attendance" + "Manage Data" permissions
**When** I navigate to the Attendance List page
**Then** I see a monthly matrix with all employees and their attendance status for the current month

### AC-002: View Own Attendance Only

**Given** I am logged in with "View Attendance" permission only (no "Manage Data")
**When** I navigate to the Attendance List page
**Then** I see only my own attendance row in the matrix

### AC-003: Change Month

**Given** I am on the Attendance List page showing April 2026
**When** I select "March 2026" from the month picker
**Then** the matrix reloads showing March 2026 attendance data

### AC-004: Filter by Department

**Given** I am on the Attendance List page
**When** I select "Engineering" from the Department filter
**Then** only employees in the Engineering department are displayed

### AC-005: Filter by Status

**Given** I am on the Attendance List page
**When** I select "Late" from the Status filter
**Then** only employees with at least one late day in the month are displayed

### AC-006: Combine Filters

**Given** I have "Engineering" department and "Late" status filters active
**When** I view the matrix
**Then** I see only Engineering employees who have at least one late day

### AC-007: Search by Employee Name

**Given** I am on the Attendance List page
**When** I type "John" in the search box
**Then** only employees whose name contains "John" are displayed

### AC-008: View Tooltip - Attendance Day

**Given** I am viewing the attendance matrix
**When** I hover over a cell showing "✓" for John Doe on April 7
**Then** I see a tooltip with: "Monday, April 7, 2026", check-in time, check-out time, hours worked, "On-time ✓"

### AC-009: View Tooltip - Leave Day

**Given** John Doe has approved Annual Leave on April 8
**When** I hover over April 8 cell for John Doe
**Then** I see a tooltip with: "Tuesday, April 8, 2026", "Annual Leave (Full Day)", "Approved by: [manager name]"

### AC-010: View Tooltip - Weekend

**Given** April 6 is a Saturday
**When** I hover over April 6 cell for any employee
**Then** I see a tooltip with: "Saturday, April 6, 2026", "Weekend"

### AC-011: Export All Employees

**Given** I have filtered the list to show Engineering department (5 employees)
**When** I click the "Export" button
**Then** an Excel file downloads containing only the 5 Engineering employees' attendance for the month

### AC-012: Export Individual Employee

**Given** I am viewing the attendance matrix
**When** I click the gear icon on John Doe's row and select "Export"
**Then** an Excel file downloads containing only John Doe's attendance for the selected month

### AC-013: Late Status Display

**Given** an employee checked in at 9:15 AM on April 2
**When** I view the attendance matrix for April
**Then** April 2 cell shows "L" with amber background

### AC-014: Absent Status Display

**Given** an employee has no check-in record on April 3 (a workday)
**When** I view the attendance matrix for April
**Then** April 3 cell shows "A" with red background

### AC-015: Weekend Display

**Given** April 6 is a Saturday
**When** I view the attendance matrix for April
**Then** April 6 column shows "—" with gray muted background for all employees

### AC-016: Leave Integration

**Given** an employee has approved Sick Leave on April 4-5
**When** I view the April attendance matrix
**Then** April 4 and April 5 cells show "SL" with orange background for that employee

### AC-017: Reset Filters

**Given** I have Department and Status filters active
**When** I click the Reset button
**Then** all filters are cleared and the full list is displayed

### AC-018: Cell Click No Action

**Given** I am viewing the attendance matrix
**When** I click on a cell (not hover)
**Then** nothing happens (no navigation, no modal)

---

## 6. System Rules

### SR-001: Data Source

Attendance data is retrieved from MOBILE-APP EP-003 check-in/out records. This view is read-only — no attendance data can be modified from this page.

### SR-002: Late Threshold

An employee is marked as "Late" if their first check-in of the day is after 9:00 AM. This threshold is configured in the system (MOBILE-APP EP-003).

### SR-003: Absent Logic

An employee is marked as "Absent" for a workday (Monday-Friday, excluding holidays) if they have no check-in record for that day AND no approved leave.

### SR-004: Leave Integration

Leave data is retrieved from EP-002 Leave Management. Only approved leave requests are displayed in the attendance matrix. Leave types displayed: Annual Leave (AL), Sick Leave (SL), Half-day (½).

### SR-005: Weekend Identification

Saturdays and Sundays are marked as weekends ("—") regardless of check-in data. Weekend cells use gray muted styling.

### SR-006: Holiday Identification

Company-defined holidays are marked as "H" with blue muted styling. Holiday calendar is maintained in system configuration.

### SR-007: Permission-Based Visibility

| Permission | Data Visibility |
|------------|-----------------|
| View Attendance only | Own row only |
| View Attendance + Manage Data | All employees |

### SR-008: Filter Logic

- **Status filter:** Shows employees with at least one day matching selected status(es) in the month
- **Department filter:** OR logic within (shows employees in any selected department)
- **Combined filters:** AND logic across different filter types
- **Search:** AND with all active filters

### SR-009: Export Format

All exports are in Excel (.xlsx) format. Export includes:
- Employee name
- All dates in the selected month
- Status per date
- Check-in/out times (if applicable)
- Hours worked (if applicable)

### SR-010: Multiple Sessions Per Day

If an employee has multiple check-in/out sessions in a day (allowed by MOBILE-APP EP-003), the cell status is based on the **first check-in** of the day. The tooltip shows all sessions.

---

## 7. UX Optimizations

### Layout

| Item | Specification |
|------|--------------|
| Employee column | Fixed position (doesn't scroll with dates) |
| Date columns | Horizontally scrollable |
| Column header | Shows day of week (Mon, Tue...) + date number |
| Row height | 44px for comfortable touch targets |
| Cell width | 44px minimum for date columns |

### Loading States

| Element | Loading State |
|---------|--------------|
| Employee names | Skeleton text (180px width) |
| Date cells | Skeleton rectangles |
| Filters | Disabled during load |

### Responsiveness

- On smaller screens, the employee name column remains fixed while date columns scroll horizontally
- Month picker and filters stack vertically on mobile widths
- Minimum supported width: 768px

### Accessibility

| Feature | Implementation |
|---------|---------------|
| Status icons | aria-label with full status text (e.g., "On-time", "Late", "Absent") |
| Tooltip | Accessible via keyboard focus (Tab to cell, Enter to show tooltip) |
| Color contrast | All status colors meet WCAG AA contrast requirements |
| Screen reader | Row headers announce employee name; column headers announce date |

---

## 8. Additional Information

### Out of Scope

- Manual attendance entry or modification
- Attendance policy configuration (late threshold, etc.)
- Real-time/live attendance updates
- Weekly or daily drill-down views
- Attendance analytics or trend charts
- Notifications or alerts
- Payroll integration

### Dependencies

| Dependency | Source | Data |
|------------|--------|------|
| Check-in/out records | MOBILE-APP EP-003 | Timestamps, late flags |
| Leave records | WEB-APP EP-002 | Approved leave dates, types, approvers |
| Department list | WEB-APP EP-008 | Filter options |
| User accounts | WEB-APP EP-001 | Employee list, permissions |
| Holiday calendar | System configuration | Holiday dates |

### Open Questions

| Question | Owner | Status |
|----------|-------|--------|
| Export format (confirmed Excel) | Product Owner | Resolved |
| Status badge exact color tokens | Design Team | Pending |
| Holiday calendar source/configuration | Product Owner | Pending |

### Related Features

- **MOBILE-APP EP-003 US-001:** Check-In/Out — data source for attendance records
- **WEB-APP EP-002 US-001:** Leave Requests — leave data integration
- **WEB-APP EP-008 US-001:** Department Management — department filter options
