# REQ-002: Project Milestones, Announcement & Poll

**Status**: Draft
**Created**: 2026-03-29
**Author**: project-owner
**Depends on**: REQ-001 (core HR system)

---

## 1. Context & Background

He thong Exn-Hr MVP (REQ-001) da hoan thanh cac chuc nang HR co ban. Nhu cau thuc te phat sinh:

1. **Quan ly cot moc du an**: Cong ty can theo doi tien do cac du an noi bo. PM/BA can tao cot moc (milestone) cho tung du an, va cac thanh vien du an can biet cac deadline sap toi khi mo app.

2. **Thong bao noi bo (Announcement)**: Hien tai he thong chi co notification ca nhan (leave approved, OT rejected...). Can co kenh broadcast thong bao chung cho toan cong ty hoac theo nhom (team, du an) — vd: nghi le, chinh sach moi, su kien cong ty.

3. **Binh chon (Poll/Vote)**: Kem theo announcement, can tao cac cuoc binh chon noi bo — vd: chon dia diem team building, chon ngay hop, chon mau dong phuc.

4. **Forgot Password (Mobile)**: API da co san (`POST /api/v1/auth/forgot-password`), web da co, nhung mobile chua co man hinh nay. Employee quên mat khau tren dien thoai la use case pho bien.

---

## 2. User Stories

### US-10: Project Management (Lightweight)

- As a **PM/Admin**, I want to create projects with name, description, and date range, so that I can track company initiatives.
- As a **PM/Admin**, I want to assign employees as project members with a role (PM, BA, Dev, Tester, Designer, Other), so that everyone knows who is on which project.
- As a **PM/Admin**, I want to create milestones with title, description, and deadline for each project, so that the team knows key delivery dates.
- As a **PM/Admin**, I want to add detail items (checklist) to each milestone, so that team members know the specific tasks involved (e.g. "develop tính năng A", "deploy tính năng B", "test tính năng C").
- As a **PM/Admin**, I want to update milestone status (upcoming, in_progress, completed, overdue), so that project progress is visible.
- As an **employee**, I want to see milestone detail items when viewing a milestone, so that I know what specific work is expected.
- As an **employee**, I want to see the list of projects I'm assigned to on mobile, so that I know my project involvement.
- As an **employee**, I want to see upcoming milestones/deadlines for my projects on the home screen, so that I'm aware of what's coming.
- As a **leader**, I want to see all milestones for projects my team is involved in, so that I can plan team workload.

### US-11: Announcement

- As an **Admin/HR/PM**, I want to create announcements with title, content, and target audience (all company, specific team, or specific project), so that I can broadcast information to the right people.
- As an **Admin/HR/PM**, I want to pin important announcements, so that they stay at the top.
- As an **Admin/HR/PM**, I want to set an expiry date on announcements, so that outdated info auto-hides.
- As an **employee**, I want to see announcements on my mobile home screen, so that I stay informed.
- As an **employee**, I want to see announcements relevant to me (company-wide + my team + my projects), so that I only get relevant info.

### US-12: Poll / Vote

- As an **Admin/HR/PM**, I want to attach a poll to an announcement, so that I can collect opinions alongside the info.
- As an **Admin/HR/PM**, I want to configure polls as single-choice or multiple-choice, so that different voting scenarios are supported.
- As an **Admin/HR/PM**, I want to set polls as anonymous or named, so that employees feel comfortable voting.
- As an **Admin/HR/PM**, I want to set a voting deadline, so that results are collected in a timely manner.
- As an **employee**, I want to vote on polls from my mobile app, so that my opinion is counted.
- As an **employee**, I want to see poll results (percentage, count) after voting, so that I know the current standing.
- As an **Admin/HR/PM**, I want to see detailed poll results on web (who voted what — for named polls), so that I can make informed decisions.

### US-13: Forgot Password (Mobile)

- As an **employee**, I want to request a password reset from the mobile login screen, so that I can recover my account without needing web access.

---

## 3. Acceptance Criteria

### US-10: Project Management

- **Given** an Admin/PM, **when** they create a project with name and date range, **then** the project is created with status "active".
- **Given** an Admin/PM, **when** they add an employee as a project member, **then** that employee can see the project in their mobile app.
- **Given** a project with members, **when** a milestone is created with a deadline, **then** all project members receive a notification.
- **Given** a milestone deadline is within 3 days, **when** an employee opens the app, **then** the milestone appears in "Upcoming Deadlines" widget on home screen.
- **Given** a milestone deadline has passed and status is not "completed", **when** the system checks, **then** the status is automatically set to "overdue".
- **Given** a PM/Admin creates a milestone, **when** they add detail items, **then** each item is stored as a text entry with optional completion status.
- **Given** an employee views a milestone, **when** it has detail items, **then** they see a list of items (e.g. "develop tính năng A", "deploy tính năng B").
- **Given** an employee, **when** they view their projects, **then** they only see projects they are assigned to (not all company projects).
- **Given** a PM/Admin, **when** they remove a member from a project, **then** that employee no longer sees the project in their app.

### US-11: Announcement

- **Given** an Admin/HR/PM creates an announcement with target "all", **when** any employee opens the app, **then** they see the announcement.
- **Given** an announcement with target "team" and target_id = Team A, **when** an employee NOT in Team A opens the app, **then** they do NOT see the announcement.
- **Given** an announcement with target "project" and target_id = Project X, **when** a member of Project X opens the app, **then** they see the announcement.
- **Given** a pinned announcement, **when** announcements are listed, **then** pinned items always appear at the top.
- **Given** an announcement with expiry date in the past, **when** announcements are listed, **then** the expired announcement is NOT shown.
- **Given** an Admin/HR/PM, **when** they create an announcement, **then** all target employees receive a push notification.

### US-12: Poll / Vote

- **Given** an announcement with a poll, **when** an employee views it, **then** they see the poll options and can vote.
- **Given** a single-choice poll, **when** an employee selects an option and submits, **then** exactly one vote is recorded and they cannot vote again.
- **Given** a multiple-choice poll, **when** an employee selects multiple options, **then** all selected options are recorded.
- **Given** an employee has already voted, **when** they view the poll, **then** they see results (percentage and count per option) and their selected option is highlighted.
- **Given** an employee has NOT voted yet, **when** they view the poll, **then** they see options without results (to avoid bias). After voting, results are revealed.
- **Given** an anonymous poll, **when** Admin views results on web, **then** they see counts/percentages but NOT individual voter identities.
- **Given** a named poll, **when** Admin views results on web, **then** they see who voted for which option.
- **Given** a poll past its deadline, **when** an employee tries to vote, **then** voting is rejected and only results are shown.
- **Given** a poll, **when** results are viewed, **then** total vote count and percentage per option are displayed.

### US-13: Forgot Password (Mobile)

- **Given** the mobile login screen, **when** an employee taps "Forgot Password", **then** they are navigated to a forgot password form.
- **Given** a valid email, **when** submitted, **then** a password reset link/OTP is sent (uses existing backend API).
- **Given** an invalid email, **when** submitted, **then** a user-friendly error is shown.

---

## 4. Domain Model

| Entity | New/Modified | Key Fields | Relationships |
|--------|-------------|------------|---------------|
| Project | New | id, name, description, status (active/completed/on_hold), start_date, end_date, created_by, created_at, updated_at | has many ProjectMembers, has many Milestones, has many Announcements (target_type=project) |
| ProjectMember | New | id, project_id, employee_id, project_role (pm/ba/dev/tester/designer/other), joined_at | belongs to Project, belongs to Employee |
| Milestone | New | id, project_id, title, description, deadline, status (upcoming/in_progress/completed/overdue), created_by, completed_at, created_at, updated_at | belongs to Project, has many MilestoneItems |
| MilestoneItem | New | id, milestone_id, content (text), is_completed, display_order, created_at, updated_at | belongs to Milestone |
| Announcement | New | id, title, content, target_type (all/team/project), target_id (nullable), is_pinned, expires_at, created_by, created_at, updated_at | belongs to User (creator), has one Poll (optional) |
| Poll | New | id, announcement_id, question, is_multiple_choice, is_anonymous, deadline, status (active/closed), created_at | belongs to Announcement, has many PollOptions |
| PollOption | New | id, poll_id, text, vote_count (denormalized), display_order | belongs to Poll, has many PollVotes |
| PollVote | New | id, poll_option_id, employee_id, voted_at | belongs to PollOption, belongs to Employee |

---

## 5. API Contracts

| Group | Methods | Base Path | Notes |
|-------|---------|-----------|-------|
| Projects | CRUD | /api/v1/projects | Admin/PM manages projects |
| Project Members | POST, DELETE, GET | /api/v1/projects/:id/members | Assign/remove members |
| Milestones | CRUD | /api/v1/projects/:id/milestones | Create/update milestones (with items) |
| Milestone Items | inline | (nested in milestone CRUD) | Detail checklist items per milestone |
| My Projects | GET | /api/v1/projects/me | Employee sees own projects + milestones |
| Upcoming Deadlines | GET | /api/v1/milestones/upcoming | For home screen widget |
| Announcements | CRUD | /api/v1/announcements | Admin/HR/PM manages |
| My Announcements | GET | /api/v1/announcements/me | Employee sees relevant announcements |
| Polls | POST | /api/v1/announcements/:id/poll | Attach poll to announcement |
| Poll Vote | POST | /api/v1/polls/:id/vote | Submit vote |
| Poll Results | GET | /api/v1/polls/:id/results | View results |

### Detailed API Specifications

#### 5.1 Projects

**`POST /api/v1/projects`** — Admin/HR only
```json
{
  "name": "Exn-Hr Mobile App",
  "description": "Xay dung ung dung mobile cho he thong HR",
  "start_date": "2026-03-01",
  "end_date": "2026-06-30"
}
```
Response: Project object with id

**`GET /api/v1/projects`** — Admin/HR/CEO/Leader
Query params: `?status=active&page=1&size=10`

**`GET /api/v1/projects/:id`** — Admin/HR/CEO/Leader or project member

**`PUT /api/v1/projects/:id`** — Admin/HR only

**`DELETE /api/v1/projects/:id`** — Admin only

#### 5.2 Project Members

**`POST /api/v1/projects/:id/members`** — Admin/HR only
```json
{
  "employee_id": 5,
  "project_role": "dev"
}
```

**`GET /api/v1/projects/:id/members`** — Admin/HR/CEO/Leader or project member

**`DELETE /api/v1/projects/:id/members/:employee_id`** — Admin/HR only

#### 5.3 Milestones

**`POST /api/v1/projects/:id/milestones`** — Admin/HR only
```json
{
  "title": "Release tinh nang Login",
  "description": "Hoan thanh man hinh dang nhap cho mobile va web",
  "deadline": "2026-04-15",
  "items": [
    {"content": "Develop man hinh login mobile", "display_order": 1},
    {"content": "Develop man hinh login web", "display_order": 2},
    {"content": "Test login flow", "display_order": 3}
  ]
}
```

**`GET /api/v1/projects/:id/milestones`** — Project member or Admin/HR/CEO
Returns milestones with their items included.

**`PUT /api/v1/milestones/:id`** — Admin/HR only
```json
{
  "title": "Release tinh nang Login",
  "status": "completed",
  "items": [
    {"id": 1, "content": "Develop man hinh login mobile", "is_completed": true, "display_order": 1},
    {"id": 2, "content": "Develop man hinh login web", "is_completed": true, "display_order": 2},
    {"content": "Deploy to staging", "display_order": 4}
  ]
}
```
Note: Items with `id` are updated, items without `id` are created, items missing from the list are deleted.

**`DELETE /api/v1/milestones/:id`** — Admin/HR only (cascade deletes items)

#### 5.4 My Projects & Upcoming Deadlines

**`GET /api/v1/projects/me`** — All authenticated
Returns projects where current user's employee is a member, including milestones.

**`GET /api/v1/milestones/upcoming`** — All authenticated
Query params: `?days=7` (default 7, max 30)
Returns milestones for user's projects with deadline within N days.

#### 5.5 Announcements

**`POST /api/v1/announcements`** — Admin/HR only
```json
{
  "title": "Nghi le 30/4 - 1/5",
  "content": "Cong ty nghi tu 30/04 den 01/05. Chuc moi nguoi nghi le vui ve!",
  "target_type": "all",
  "target_id": null,
  "is_pinned": false,
  "expires_at": "2026-05-02T00:00:00Z",
  "poll": {
    "question": "Ban se lam gi dip le?",
    "is_multiple_choice": false,
    "is_anonymous": true,
    "deadline": "2026-04-28T23:59:59Z",
    "options": [
      {"text": "Di du lich", "display_order": 1},
      {"text": "O nha nghi ngoi", "display_order": 2},
      {"text": "Ve que", "display_order": 3}
    ]
  }
}
```

**`GET /api/v1/announcements`** — Admin/HR/CEO (all announcements)
Query params: `?page=1&size=10&target_type=all`

**`GET /api/v1/announcements/me`** — All authenticated
Returns announcements visible to current user (company-wide + their team + their projects). Excludes expired.

**`GET /api/v1/announcements/:id`** — Visible to target audience

**`PUT /api/v1/announcements/:id`** — Admin/HR only

**`DELETE /api/v1/announcements/:id`** — Admin/HR only

#### 5.6 Poll Vote & Results

**`POST /api/v1/polls/:id/vote`** — All authenticated (target audience only)
```json
{
  "option_ids": [3]
}
```
For single-choice: exactly 1 option_id. For multiple-choice: 1 or more.

**`GET /api/v1/polls/:id/results`** — All authenticated
```json
{
  "success": true,
  "data": {
    "poll_id": 1,
    "question": "Ban se lam gi dip le?",
    "total_votes": 25,
    "is_anonymous": true,
    "is_closed": false,
    "my_votes": [3],
    "options": [
      {"id": 1, "text": "Di du lich", "vote_count": 10, "percentage": 40.0},
      {"id": 2, "text": "O nha nghi ngoi", "vote_count": 8, "percentage": 32.0},
      {"id": 3, "text": "Ve que", "vote_count": 7, "percentage": 28.0}
    ],
    "voters": null
  }
}
```
Note: `voters` field only populated for named polls when requested by Admin/HR.

---

## 6. UI/UX Requirements

### Web Admin (NextJS)

- **Project List Page** (`/projects`): Table view of all projects, filter by status. Create/Edit project modal.
- **Project Detail Page** (`/projects/:id`):
  - Tab 1: Overview (name, dates, status, description)
  - Tab 2: Members (add/remove employees, set project role)
  - Tab 3: Milestones (timeline view with status badges, create/edit/delete)
- **Announcement List Page** (`/announcements`): Table view, filter by target_type. Create announcement with optional poll.
- **Announcement Detail Page** (`/announcements/:id`): View content, poll results (detailed for named polls — show voter names).
- **Poll Results**: Bar chart or visual representation of vote distribution.

### Mobile App (Flutter)

- **Home Screen Updates**:
  - New widget: "Upcoming Deadlines" — shows milestones with deadline within 7 days, sorted by date.
  - New widget: "Announcements" — shows latest 3 announcements (pinned first), tap to expand.
- **My Projects Page** (`/projects`): List of projects user is member of, tap to see milestones.
- **Project Detail Page** (`/projects/:id`): Project info + milestone list with status badges and deadline.
- **Announcement List Page** (`/announcements`): Full list with poll inline. Vote directly from the list.
- **Poll Widget**: Inline within announcement — show options, vote button, results after voting.
- **Forgot Password Page**: Simple email input form accessible from login screen "Quen mat khau?" link.

### Bottom Navigation Update (Mobile)

Current: Home | Leave | Overtime | Profile

Proposed: Keep current tabs. Add access to Projects and Announcements via:
- Home screen widgets (primary entry point)
- Quick actions on Home screen

---

## 7. Business Rules

| Rule ID | Description | Example |
|---------|-------------|---------|
| BR-018 | Chi Admin/HR co quyen tao/sua/xoa Project | Leader va Employee chi xem |
| BR-019 | Employee chi thay project minh tham gia | NV A chi thay Project X neu duoc add vao |
| BR-020 | Milestone qua deadline tu dong chuyen status "overdue" | Milestone deadline 15/04, hom nay 16/04 → status = overdue |
| BR-021 | Announcement target_type quyet dinh ai thay | target_type=all: tat ca. team: chi team do. project: chi member du an do |
| BR-022 | Announcement het han (expires_at) khong hien thi cho employee | Van luu trong DB, Admin van thay tren web |
| BR-023 | Poll single-choice: moi nguoi chi vote 1 option | Chon "Da Lat" roi khong the chon them "Vung Tau" |
| BR-024 | Poll multiple-choice: moi nguoi vote nhieu option | Chon ca "Da Lat" va "Phu Quoc" |
| BR-025 | Poll anonymous: Admin khong thay ai vote gi | Chi thay so luong va % |
| BR-026 | Poll het deadline: khong cho vote them | Chi hien thi ket qua |
| BR-027 | Employee chua vote thi khong thay ket qua (tranh bias) | Sau khi vote moi hien thi % va so luong |
| BR-028 | Tao milestone gui notification cho tat ca member cua project | Khi PM tao milestone moi, moi member nhan push notification |
| BR-029 | Tao announcement gui notification cho target audience | Khi Admin tao announcement target=all, tat ca NV nhan notification |

---

## 8. Technical Considerations

- **Dependencies**:
  - Cac entity moi (Project, Milestone, Announcement, Poll) doc lap voi cac module HR hien tai
  - Chi phu thuoc vao User/Employee models da co san
  - Push notification dung he thong Notification da co (them type moi: "project", "announcement")

- **Migrations**:
  - Them 7 tables moi: projects, project_members, milestones, announcements, polls, poll_options, poll_votes
  - Khong thay doi bat ky table cu nao

- **Performance**:
  - Milestones upcoming: query theo deadline range, index tren deadline column
  - Announcements/me: query theo target_type + employee's team_id va project memberships
  - Poll vote_count: denormalized counter tren PollOption, update khi vote (tranh count query)

- **Security**:
  - Project data chi hien thi cho members (trur Admin/HR/CEO)
  - Poll votes: anonymous polls KHONG luu employee_id (hoac luu nhung KHONG expose qua API)
  - Announcement content khong chua sensitive data (plain text, khong cho upload file trong MVP)

---

## 9. Out of Scope (for this iteration)

- **Task management within projects** — chi co milestones, khong co task breakdown
- **File attachments on announcements** — chi text content
- **Gantt chart / Timeline visualization** — milestone list don gian
- **Project budget / cost tracking** — chi quan ly members va milestones
- **Nested polls (poll in poll)** — 1 announcement co toi da 1 poll
- **Poll editing after creation** — poll da tao khong sua duoc options (tranh invalidate votes)
- **Image options in polls** — chi text options

---

## Quality Checklist

- [x] Every User Story has at least 1 Acceptance Criteria
- [x] Every entity in Domain Model is referenced in User Stories
- [x] Business Rules cover edge cases (permissions, visibility, deadlines)
- [x] Out of Scope is explicit
- [x] No implementation details in requirements (what, not how)
- [x] API contracts are detailed with request/response examples
- [x] Both Web and Mobile UI requirements are specified
- [x] Status is set to "Draft" until user approves
