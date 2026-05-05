---
document_type: ANALYSIS
platform: WEB-APP
platform_display: "Exnodes HRM"
epic_id: EP-010
story_id: US-001
story_name: "Announcement List"
status: draft
version: "1.0"
last_updated: "2026-04-25"
add_on_sections: []
approved_by: null
related_documents:
  - path: "./FLOWCHART.md"
    relationship: sibling
  - path: "./TODO.yaml"
    relationship: sibling
  - path: "../EPIC.md"
    relationship: parent
revision_history: []
input_sources:
  - type: figma
    file_id: "exn-hr-design"
    node_id: "3333:6039"
    extraction_date: "2026-04-25"
    description: "Announcement List screen design"
---

# Analysis: Announcement List

**Epic:** EP-010 (Announcements)
**Story:** US-001-announcement-list
**Status:** Draft

---

## Business Context

Organizations need a formal channel to communicate important information to employees. Currently, announcements may be scattered across emails, chat tools, or bulletin boards with no centralized tracking. A dedicated announcement system provides:

- Single source of truth for company communications
- Structured publishing workflow (draft → publish)
- Targeted distribution to specific audiences
- Read tracking for compliance-sensitive announcements

---

## Scope

### In Scope

- Announcement list view (table with search, filters, pagination)
- Create announcement form
- Edit announcement (draft only)
- Publish/unpublish actions
- Delete announcement
- Status management (Draft, Published, Archived)

### Out of Scope

- Mobile push notifications
- Email distribution
- Rich media attachments (images, videos)
- Announcement analytics/read tracking dashboard
- Scheduled publishing (future enhancement)
- Department-specific targeting (future enhancement)

---

## Open Questions

- [ ] What fields are required for an announcement? (Title, Content, Priority?) — Owner: Product Owner
- [ ] Can published announcements be edited? — Owner: Product Owner
- [ ] Is there an archive vs delete distinction? — Owner: Product Owner

---

## Notes

This is the first story in the Announcements epic. The dr-agent will derive field definitions and workflows from Figma design if available.

---

## Design Context [ADD-ON]

**Source Information:**
- Figma File: exn-hr-design
- Node ID: 3333:6039
- Extraction Date: 2026-04-25

### Layout Overview

```
+------------------+------------------------------------------------+
|                  |  Breadcrumb / Breadcrumb / Breadcrumb          |
|     Sidebar      +------------------------------------------------+
|     (200px)      |  Announcement                                  |
|                  +------------------------------------------------+
|  - Logo          |  [Search...] [Last Announce Date] [Status (2)] |
|  - User Profile  |  [Reset]                     [Export] [+Add New]|
|  - Navigation    +------------------------------------------------+
|    - Users Mgmt  |  Title | Description | Created | Last Announce |
|    - Menu        |         | Date       | Date    | Recipient     |
|                  |         |            |         | Status|Action |
|                  +------------------------------------------------+
|                  |  Rows per page [10]    Page 1 of 10  [< 1 2 >] |
+------------------+------------------------------------------------+
```

### Component Inventory

| Component | Node ID | Purpose |
|-----------|---------|---------|
| Search Input | 3333:6090 | Search by title, description |
| Last Announce Date Filter | 3333:6091 | Date range filter button |
| Status Filter | 3333:6094 | Multi-select status filter (shows count) |
| Reset Button | 3333:6095 | Clear all filters |
| Export Button | 3333:6097 | Export filtered data |
| Add New Button | 3333:6098 | Create new announcement |
| Table | 3333:6099 | 7-column data table |
| Pagination | 3333:6109 | Page navigation with rows-per-page |

### Table Columns (from design)

| Column | Width | Content Type |
|--------|-------|--------------|
| Title | 263px | Text |
| Description | 263px | Text |
| Created Date | 263px | Date |
| Last Announce Date | 263px | Date |
| Recipient | 263px | Number (count) |
| Status | 263px | Badge (TBD shown) |
| Action | 76px | Gear icon |

### Design Constraints

- Page dimensions: 1920x1080 (desktop)
- Sidebar width: 200px fixed
- Content area: 1694px
- Table column widths: 263px each (Action: 76px)
- Pagination: Shows "Rows per page" dropdown + "Page X of Y" + page numbers

### Key Design Observations

1. **Status Filter** shows "(2)" indicating multi-select with count display
2. **Recipient** column shows numeric values (10, 20) suggesting target audience count
3. **Status badges** show "TBD" placeholder - actual values to be confirmed
4. **Action column** uses gear icon pattern consistent with other list views
5. **Date filters** include "Last Announce Date" as a dedicated filter
