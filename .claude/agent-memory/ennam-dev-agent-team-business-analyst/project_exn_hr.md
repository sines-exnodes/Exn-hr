---
name: Exn-Hr Project Context
description: Greenfield HR management system for Vietnamese startup/SME — key domain details and decisions for requirement analysis
type: project
---

Exn-Hr is an internal HR management system for a Vietnamese startup/SME (<50 employees, 1 branch).

**Tech Stack:** NextJS (web admin) + GoLang/Gin (backend API) + Flutter (mobile app) + PostgreSQL

**Key Domain Details:**
- Vietnamese labor law compliance required (BHXH, BHYT, BHTN, TNCN)
- Insurance salary is separate from total income (common Vietnamese practice)
- OT multiplier is fixed at 1.5x (client decision, not per Vietnamese law which varies by day type)
- 2-level approval workflows: Leave (Leader→HR), OT (Leader→CEO)
- Attendance via GPS + WiFi dual verification on mobile

**Why:** This is a new project with no prior system. The client needs to digitize all HR operations.

**How to apply:** When analyzing future feature requests or changes, ensure compatibility with these core domain rules and the Vietnamese labor law context.
