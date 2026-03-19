# DES-001: Exn-Hr Core Screens

**Status**: Draft
**Created**: 2026-03-18
**Design Tool**: Pencil (.pen)
**Design File**: `pencil-new.pen` (project root)

## Brief

Design of 11 core screens for the Exn-Hr HR Management System, covering:
- Dashboard & Home (Web + Mobile)
- Employee Management (Web List + Create/Edit Form)
- Attendance (Mobile Check-in)
- Leave Management (Mobile Request + Web Approval)
- OT (Mobile Request)
- Salary (Mobile Payslip + Web Payroll)
- Profile (Mobile)

All screens use the established design system variables ($primary, $bg-page, etc.)
and reusable components (btn-primary, input-field, stat-card, sidebar-nav, badges).

## Design Decisions

- **Color palette**: Green-based theme using $primary (#16A34A) with semantic colors for success/warning/danger/info. All colors via design system variables for dark mode support.
- **Typography**: Space Grotesk for headings/metrics (600 weight), Inter for body/labels. Size hierarchy: 28px page titles, 18px section titles, 14px body, 12-13px labels, 36px metrics.
- **Layout**: Web screens use 260px dark sidebar + fluid content area. Mobile screens use status bar + header + scrollable body + 70px tab bar.
- **Components**: Consistent use of reusable components (buttons, inputs, selects, stat cards, badges, nav items) for design system coherence.
- **Vietnamese labels**: All UI text in Vietnamese per requirements.

## Component Breakdown

| Component | Description | Web (Tailwind) | Mobile (Flutter) |
| --------- | ----------- | -------------- | ---------------- |
| Sidebar | Dark nav with logo + menu items | `w-[260px] bg-green-50 border-r` | N/A |
| Header | Page title + search + notifications + avatar | `flex justify-between items-center py-5 px-7` | N/A |
| Tab Bar | Bottom nav with 4 tabs | N/A | `BottomNavigationBar` |
| Stat Card | Metric card with label, icon, value | `bg-white rounded-xl border p-5` | N/A |
| Data Table | Sortable table with header + rows | `table-auto w-full` | N/A |
| Filter Tabs | Horizontal tab pills for filtering | `flex gap-2` with active: `bg-primary text-white` | N/A |
| Balance Card | Leave balance with 3 columns | `bg-green-50 rounded-2xl p-5` | `Container` with `Row` |
| Check-in Button | Large circular CTA | N/A | `GestureDetector` + `Container(borderRadius: 80)` |
| Salary Line | Label + amount row | N/A | `Row(mainAxisAlignment: spaceBetween)` |
| Profile Menu | Icon + label + chevron row | N/A | `ListTile` |

## Design Tokens

From design system variables (pencil-new.pen):

- Primary: #16A34A (green theme) / #1E3A5F (dark-blue theme)
- Primary Light: #DCFCE7 / #1A2F4A
- Background Page: #FFFFFF / #0A0A0A
- Background Card: #FFFFFF / #1A1A1A
- Background Sidebar: #F0FDF4 / #0D1B2A
- Text Primary: #111827 / #F1F5F9
- Text Secondary: #6B7280 / #94A3B8
- Border: #E5E7EB / #2A2A2A
- Success: #22C55E
- Warning: #F59E0B
- Danger: #EF4444
- Info: #3B82F6
- Font Heading: Space Grotesk
- Font Body: Inter

## Screen -> Node ID Mapping

| Screen | Pencil Node ID | .pen File |
| ------ | -------------- | --------- |
| Design System Colors & Typography | `n77jE` | `pencil-new.pen` |
| Design System Components | `ReUxJ` | `pencil-new.pen` |
| Auth Web Login | `IdFIX` | `pencil-new.pen` |
| Auth Mobile Login | `dzfdI` | `pencil-new.pen` |
| Web Dashboard | `EB4jm` | `pencil-new.pen` |
| Mobile Home | `NcTQl` | `pencil-new.pen` |
| Web Employee List | `kEZTa` | `pencil-new.pen` |
| Web Employee Create/Edit Form | `oN3wV` | `pencil-new.pen` |
| Mobile Check-in | `FzB1F` | `pencil-new.pen` |
| Mobile Leave Request | `RbYJl` | `pencil-new.pen` |
| Web Leave Approval | `A4qLE` | `pencil-new.pen` |
| Mobile OT Request | `SQ0EX` | `pencil-new.pen` |
| Mobile Payslip | `SWt1i` | `pencil-new.pen` |
| Web Payroll | `GmCak` | `pencil-new.pen` |
| Mobile Profile | `ZW4Cb` | `pencil-new.pen` |

## Canvas Layout

```
Row 1 (y=0):     [DS Colors 1200x900] [Web Login 1440x900] [Mobile Login 393x852]
Row 2 (y=1000):  [DS Components 1600x1200]
Row 3 (y=2400):  [Web Dashboard 1440x900] [Mobile Home] [Check-in] [Leave Req] [OT Req] [Payslip] [Profile]
Row 4 (y=3400):  [Web Employee List 1440x900]
Row 5 (y=4400):  [Web Employee Form 1440x900]
Row 6 (y=5400):  [Web Leave Approval 1440x900]
Row 7 (y=6400):  [Web Payroll 1440x900]
```
