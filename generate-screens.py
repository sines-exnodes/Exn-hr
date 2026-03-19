# -*- coding: utf-8 -*-
"""Generate all 11 screens for Exn-Hr pencil-new.pen"""
import json
import random
import string

def uid():
    """Generate 5-char alphanumeric ID"""
    return ''.join(random.choices(string.ascii_letters + string.digits, k=5))

def text(name, content, font="Inter", size=14, weight="normal", fill="$text-primary", **kw):
    n = {"type": "text", "id": uid(), "name": name, "fill": fill, "content": content,
         "fontFamily": font, "fontSize": size, "fontWeight": weight}
    n.update(kw)
    return n

def icon(name, icon_name, size=18, fill="$text-muted", **kw):
    n = {"type": "icon_font", "id": uid(), "name": name, "width": size, "height": size,
         "iconFontName": icon_name, "iconFontFamily": "lucide", "fill": fill}
    n.update(kw)
    return n

def frame(name, children=None, **kw):
    n = {"type": "frame", "id": uid(), "name": name}
    n.update(kw)
    if children:
        n["children"] = children
    return n

def ref(name, ref_id, **kw):
    n = {"type": "ref", "id": uid(), "name": name, "ref": ref_id}
    n.update(kw)
    return n

def heading(name, content, size=28, weight="600"):
    return text(name, content, font="Space Grotesk", size=size, weight=weight, fill="$text-primary", letterSpacing=-0.5)

def subtext(name, content, size=14):
    return text(name, content, size=size, fill="$text-secondary")

def section_title(name, content, size=18):
    return text(name, content, font="Space Grotesk", size=size, weight="500", fill="$text-primary")

# ========== SIDEBAR (shared by web screens) ==========
def make_sidebar(active_item="Dashboard"):
    items = [
        ("dashboard", "layout-dashboard", "Dashboard"),
        ("employees", "users", "Nhân viên"),
        ("attendance", "clock", "Chấm công"),
        ("leave", "calendar-off", "Nghỉ phép"),
        ("ot", "timer", "Làm thêm (OT)"),
        ("salary", "wallet", "Tính lương"),
        ("reports", "bar-chart-3", "Báo cáo"),
        ("settings", "settings", "Cài đặt"),
    ]
    nav_items = []
    for key, ic, label in items:
        if label == active_item:
            r = ref("nav-"+key, "SXTnw", width=220)
            r["overrides"] = {"lDo9D": {"iconFontName": ic}, "KkEU6": {"content": label}}
            nav_items.append(r)
        else:
            r = ref("nav-"+key, "VGkJb", width=220)
            r["overrides"] = {"nAZnr": {"iconFontName": ic}, "0uFNw": {"content": label}}
            nav_items.append(r)

    sidebar = frame("sidebar", [
        frame("sidebarLogo", [
            frame("logoIcon", [
                text("logoL", "E", font="Space Grotesk", size=20, weight="600", fill="$text-on-primary",
                     horizontalAlign="center", verticalAlign="center", textAlign="center")
            ], width=40, height=40, fill="$primary", cornerRadius=10,
               justifyContent="center", alignItems="center"),
            text("logoText", "Exn-Hr", font="Space Grotesk", size=20, weight="600", fill="$text-primary")
        ], gap=10, alignItems="center", padding=[0,0,20,0]),
        frame("navGroup", nav_items, layout="vertical", gap=2, width="fill_container")
    ], width=260, height="fill_container", fill="$bg-sidebar", layout="vertical",
       padding=[24, 20], gap=8,
       stroke={"thickness": 1, "fill": "$border", "side": "right"})
    return sidebar

# ========== WEB HEADER ==========
def make_web_header(title, subtitle=None):
    left = [heading("pageTitle", title)]
    if subtitle:
        left.append(subtext("pageSub", subtitle))

    header = frame("header", [
        frame("headerLeft", left, layout="vertical", gap=4),
        frame("headerRight", [
            frame("searchBox", [
                icon("searchIc", "search", 16, fill="$text-muted"),
                text("searchPh", "Tìm kiếm...", size=14, fill="$text-muted")
            ], height=38, fill="$bg-input", cornerRadius=8,
               stroke={"thickness": 1, "fill": "$border"}, padding=[0,12], gap=8, alignItems="center"),
            frame("notifBtn", [
                icon("bellIc", "bell", 20, fill="$text-secondary")
            ], width=38, height=38, fill="$bg-surface", cornerRadius=8,
               stroke={"thickness": 1, "fill": "$border"}, justifyContent="center", alignItems="center"),
            frame("avatarBtn", [
                text("avatarInit", "HR", size=12, weight="500", fill="$text-on-primary",
                     horizontalAlign="center", verticalAlign="center", textAlign="center")
            ], width=38, height=38, fill="$primary", cornerRadius=19,
               justifyContent="center", alignItems="center")
        ], gap=12, alignItems="center")
    ], width="fill_container", justifyContent="space_between", alignItems="center",
       padding=[20, 28], fill="$bg-card",
       stroke={"thickness": 1, "fill": "$border", "side": "bottom"})
    return header

# ========== MOBILE TAB BAR ==========
def make_tab_bar(active="Home"):
    tabs = [
        ("Home", "home"),
        ("Phép", "calendar-off"),
        ("Lương", "wallet"),
        ("Cá nhân", "user"),
    ]
    tab_items = []
    for label, ic in tabs:
        is_active = label == active
        tab_items.append(frame("tab-"+label, [
            icon("tabIc-"+label, ic, 22,
                 fill="$primary" if is_active else "$text-muted"),
            text("tabLbl-"+label, label, size=11, weight="500" if is_active else "normal",
                 fill="$primary" if is_active else "$text-muted",
                 horizontalAlign="center", textAlign="center")
        ], layout="vertical", gap=4, alignItems="center",
           width="fill_container", justifyContent="center"))

    return frame("tabBar", tab_items,
                 width="fill_container", height=70, fill="$bg-card",
                 justifyContent="space_around", alignItems="center",
                 padding=[8, 0, 16, 0],
                 stroke={"thickness": 1, "fill": "$border", "side": "top"})

# ========== MOBILE STATUS BAR ==========
def make_status_bar():
    return frame("statusBar", [
        text("time", "9:41", size=14, weight="600", fill="$text-primary"),
        frame("statusIcons", [
            icon("sig", "signal", 14, fill="$text-primary"),
            icon("wifi", "wifi", 14, fill="$text-primary"),
            icon("bat", "battery-full", 14, fill="$text-primary"),
        ], gap=4, alignItems="center")
    ], width="fill_container", height=44, justifyContent="space_between",
       alignItems="center", padding=[0, 20])

# ========== MOBILE HEADER ==========
def make_mobile_header(title, show_back=False):
    children = []
    if show_back:
        children.append(icon("backIc", "chevron-left", 24, fill="$text-primary"))
    children.append(text("mhTitle", title, font="Space Grotesk", size=18, weight="600",
                         fill="$text-primary"))
    if show_back:
        # spacer for centering
        children.append(frame("spacer", [], width=24, height=24))

    return frame("mobileHeader", children,
                 width="fill_container", height=48,
                 justifyContent="center" if not show_back else "space_between",
                 alignItems="center", padding=[0, 20])


# ========== TABLE HELPERS ==========
def table_header_cell(name, content, width=None):
    props = {"width": width} if width else {"width": "fill_container"}
    return text(name, content, size=12, weight="600", fill="$text-muted", **props)

def table_cell(name, content, width=None, fill="$text-primary", **kw):
    props = {"width": width} if width else {"width": "fill_container"}
    props.update(kw)
    return text(name, content, size=14, fill=fill, **props)

def table_row(name, cells, **kw):
    return frame(name, cells, width="fill_container", padding=[12, 16],
                 alignItems="center", gap=12,
                 stroke={"thickness": 1, "fill": "$border", "side": "bottom"}, **kw)

# ================================================================
# SCREEN 1: Web Dashboard (1440x900)
# ================================================================
def make_web_dashboard():
    stat_cards = []
    stats = [
        ("Tổng nhân viên", "156", "users", "users"),
        ("Đang làm việc", "142", "user-check", "user-check"),
        ("Nghỉ phép hôm nay", "8", "calendar-off", "calendar-off"),
        ("OT tháng này", "324h", "timer", "timer"),
    ]
    for label, value, ic_name, _ in stats:
        card = ref("stat-"+label[:4], "YjDXG", width="fill_container")
        card["overrides"] = {
            "LjaGm": {"content": label},
            "uunM7": {"content": value},
            "SULk9": {"iconFontName": ic_name}
        }
        stat_cards.append(card)

    stat_row = frame("statRow", stat_cards, width="fill_container", gap=20)

    # Recent requests table
    req_header = table_row("reqHead", [
        table_header_cell("rh1", "Nhân viên", width=180),
        table_header_cell("rh2", "Loại", width=100),
        table_header_cell("rh3", "Ngày", width=140),
        table_header_cell("rh4", "Trạng thái", width=100),
    ], fill="$bg-surface")

    req_rows = []
    rows_data = [
        ("Nguyễn Văn A", "Nghỉ phép", "18/03 - 20/03", "badge-warning", "AEtXC", "Chờ duyệt"),
        ("Trần Thị B", "Làm thêm", "17/03 (3h)", "badge-success", "K8BMR", "Đã duyệt"),
        ("Lê Văn C", "Nghỉ phép", "22/03 - 23/03", "badge-warning", "AEtXC", "Chờ duyệt"),
        ("Phạm Thị D", "Làm thêm", "16/03 (2h)", "badge-danger", "JNTzG", "Từ chối"),
    ]
    for name, type_, date, badge_name, badge_ref, badge_text in rows_data:
        badge = ref("badge-"+name[:3], badge_ref)
        if badge_ref == "AEtXC":
            badge["overrides"] = {"JVefh": {"content": badge_text}}
        elif badge_ref == "K8BMR":
            badge["overrides"] = {"JF4VY": {"content": badge_text}}
        elif badge_ref == "JNTzG":
            badge["overrides"] = {"JfgEM": {"content": badge_text}}
        req_rows.append(table_row("row-"+name[:3], [
            table_cell("c1-"+name[:3], name, width=180),
            table_cell("c2-"+name[:3], type_, width=100),
            table_cell("c3-"+name[:3], date, width=140),
            badge,
        ]))

    requests_table = frame("reqTable", [
        frame("reqTableHead", [
            section_title("reqTitle", "Yêu cầu gần đây"),
            subtext("reqSub", "Các yêu cầu nghỉ phép và OT mới nhất", size=13)
        ], layout="vertical", gap=4),
        frame("reqTableBody", [req_header] + req_rows,
              layout="vertical", width="fill_container", fill="$bg-card", cornerRadius=12,
              stroke={"thickness": 1, "fill": "$border"}, clip=True)
    ], layout="vertical", gap=16, width="fill_container")

    # Quick stats panel
    quick_stats = frame("quickStats", [
        section_title("qsTitle", "Thống kê nhanh"),
        frame("qsItems", [
            frame("qsItem1", [
                frame("qsDot1", [], width=8, height=8, fill="$success", cornerRadius=4),
                text("qsL1", "Tỉ lệ chấm công", size=13, fill="$text-secondary"),
                text("qsV1", "91%", size=14, weight="600", fill="$text-primary")
            ], width="fill_container", justifyContent="space_between", alignItems="center", gap=8),
            frame("qsItem2", [
                frame("qsDot2", [], width=8, height=8, fill="$warning", cornerRadius=4),
                text("qsL2", "Đi trễ tháng này", size=13, fill="$text-secondary"),
                text("qsV2", "12", size=14, weight="600", fill="$text-primary")
            ], width="fill_container", justifyContent="space_between", alignItems="center", gap=8),
            frame("qsItem3", [
                frame("qsDot3", [], width=8, height=8, fill="$info", cornerRadius=4),
                text("qsL3", "Yêu cầu chờ duyệt", size=13, fill="$text-secondary"),
                text("qsV3", "5", size=14, weight="600", fill="$text-primary")
            ], width="fill_container", justifyContent="space_between", alignItems="center", gap=8),
            frame("qsItem4", [
                frame("qsDot4", [], width=8, height=8, fill="$danger", cornerRadius=4),
                text("qsL4", "NV mới tháng này", size=13, fill="$text-secondary"),
                text("qsV4", "3", size=14, weight="600", fill="$text-primary")
            ], width="fill_container", justifyContent="space_between", alignItems="center", gap=8),
        ], layout="vertical", gap=16, width="fill_container")
    ], layout="vertical", gap=16, width=280, fill="$bg-card", cornerRadius=12,
       stroke={"thickness": 1, "fill": "$border"}, padding=[20, 20])

    content_area = frame("dashContent", [
        make_web_header("Dashboard", "Tổng quan hệ thống nhân sự"),
        frame("dashBody", [
            frame("dashMain", [
                stat_row,
                requests_table,
            ], layout="vertical", gap=24, width="fill_container"),
            quick_stats,
        ], width="fill_container", gap=24, padding=[24, 28])
    ], layout="vertical", width="fill_container", height="fill_container", fill="$bg-page")

    return frame("Web Dashboard", [
        make_sidebar("Dashboard"),
        content_area,
    ], x=0, y=2400, width=1440, height=900, fill="$bg-page", clip=True)


# ================================================================
# SCREEN 2: Mobile Home (393x852)
# ================================================================
def make_mobile_home():
    check_in_card = frame("checkinCard", [
        frame("checkinHeader", [
            frame("checkinLeft", [
                text("greeting", "Xin chào,", size=14, fill="$text-secondary"),
                text("userName", "Nguyễn Văn A", font="Space Grotesk", size=20, weight="600", fill="$text-primary"),
            ], layout="vertical", gap=4),
            frame("checkinAvatar", [
                text("avInit", "NA", size=14, weight="600", fill="$text-on-primary",
                     horizontalAlign="center", verticalAlign="center", textAlign="center")
            ], width=44, height=44, fill="$primary", cornerRadius=22,
               justifyContent="center", alignItems="center")
        ], width="fill_container", justifyContent="space_between", alignItems="center"),
        frame("checkinBtn", [
            icon("checkinIc", "log-in", 20, fill="$text-on-primary"),
            text("checkinTxt", "Check In", font="Space Grotesk", size=16, weight="600",
                 fill="$text-on-primary", horizontalAlign="center", textAlign="center"),
        ], width="fill_container", height=48, fill="$primary", cornerRadius=12,
           justifyContent="center", alignItems="center", gap=8),
        frame("checkinStatus", [
            frame("gpsStatus", [
                icon("gpsIc", "map-pin", 14, fill="$success"),
                text("gpsTxt", "GPS: Trong phạm vi", size=12, fill="$success")
            ], gap=4, alignItems="center"),
            frame("wifiStatus", [
                icon("wifiIc", "wifi", 14, fill="$success"),
                text("wifiTxt", "WiFi: Đã kết nối", size=12, fill="$success")
            ], gap=4, alignItems="center"),
        ], width="fill_container", justifyContent="space_between")
    ], layout="vertical", gap=16, width="fill_container", fill="$bg-card",
       cornerRadius=16, padding=[20, 20],
       stroke={"thickness": 1, "fill": "$border"})

    # Quick actions
    actions = [
        ("Xin phép", "calendar-off", "$primary"),
        ("Xin OT", "timer", "$info"),
        ("Phiếu lương", "wallet", "$warning"),
    ]
    action_items = []
    for label, ic, color in actions:
        action_items.append(frame("qa-"+label[:3], [
            frame("qaIcWrap-"+label[:3], [
                icon("qaIc-"+label[:3], ic, 24, fill=color)
            ], width=52, height=52, fill="$bg-surface", cornerRadius=14,
               justifyContent="center", alignItems="center",
               stroke={"thickness": 1, "fill": "$border"}),
            text("qaLbl-"+label[:3], label, size=12, weight="500", fill="$text-primary",
                 horizontalAlign="center", textAlign="center")
        ], layout="vertical", gap=8, alignItems="center", width="fill_container"))

    quick_actions = frame("quickActions", [
        section_title("qaTitle", "Thao tác nhanh"),
        frame("qaRow", action_items, width="fill_container",
              justifyContent="space_around")
    ], layout="vertical", gap=16, width="fill_container")

    # Recent activity
    activities = [
        ("Nghỉ phép 18-20/03", "Chờ duyệt", "calendar-off", "$warning"),
        ("Check-in 08:02", "Hôm nay", "log-in", "$success"),
        ("OT 3h ngày 15/03", "Đã duyệt", "timer", "$success"),
    ]
    activity_items = []
    for title, status, ic, color in activities:
        activity_items.append(frame("act-"+title[:3], [
            frame("actIcW-"+title[:3], [
                icon("actIc-"+title[:3], ic, 18, fill=color)
            ], width=36, height=36, fill="$bg-surface", cornerRadius=10,
               justifyContent="center", alignItems="center"),
            frame("actInfo-"+title[:3], [
                text("actTitle-"+title[:3], title, size=14, weight="500", fill="$text-primary"),
                text("actSub-"+title[:3], status, size=12, fill="$text-secondary"),
            ], layout="vertical", gap=2, width="fill_container"),
            icon("actChev-"+title[:3], "chevron-right", 16, fill="$text-muted")
        ], width="fill_container", gap=12, alignItems="center",
           padding=[12, 0],
           stroke={"thickness": 1, "fill": "$border", "side": "bottom"}))

    recent = frame("recentActivity", [
        section_title("raTitle", "Hoạt động gần đây"),
        frame("raList", activity_items, layout="vertical", width="fill_container")
    ], layout="vertical", gap=12, width="fill_container")

    return frame("Mobile Home", [
        make_status_bar(),
        frame("mobileHomeBody", [
            check_in_card,
            quick_actions,
            recent,
        ], layout="vertical", gap=24, width="fill_container",
           padding=[0, 20], height="fill_container"),
        make_tab_bar("Home"),
    ], x=1540, y=2400, width=393, height=852, fill="$bg-page",
       layout="vertical", clip=True)


# ================================================================
# SCREEN 3: Web Employee List (1440x900)
# ================================================================
def make_web_employee_list():
    # Search/filter bar
    filter_bar = frame("filterBar", [
        frame("searchInput", [
            icon("sIc", "search", 16, fill="$text-muted"),
            text("sPh", "Tìm kiếm nhân viên...", size=14, fill="$text-muted"),
        ], width=320, height=40, fill="$bg-input", cornerRadius=8,
           stroke={"thickness": 1, "fill": "$border"}, padding=[0,12], gap=8, alignItems="center"),
        frame("filterBtns", [
            ref("filterTeam", "tCvDk", width=180,
                overrides={"zKURo": {"content": ""}, "52uFa": {"content": "Tất cả team"}}),
            ref("addEmpBtn", "St5Ib",
                overrides={"BKk5p": {"iconFontName": "plus"}, "Ejlmp": {"content": "Thêm nhân viên"}}),
        ], gap=12, alignItems="center"),
    ], width="fill_container", justifyContent="space_between", alignItems="center")

    # Table header
    emp_header = table_row("empHead", [
        table_header_cell("eh0", "", width=40),
        table_header_cell("eh1", "Họ tên", width=180),
        table_header_cell("eh2", "Team"),
        table_header_cell("eh3", "Chức vụ"),
        table_header_cell("eh4", "Email", width=200),
        table_header_cell("eh5", "Trạng thái", width=100),
    ], fill="$bg-surface")

    employees = [
        ("NA", "Nguyễn Văn A", "Engineering", "Developer", "a.nguyen@exn.vn", "K8BMR", "Đang làm"),
        ("TB", "Trần Thị B", "Marketing", "Designer", "b.tran@exn.vn", "K8BMR", "Đang làm"),
        ("LC", "Lê Văn C", "Engineering", "Team Lead", "c.le@exn.vn", "AEtXC", "Nghỉ phép"),
        ("PD", "Phạm Thị D", "HR", "HR Manager", "d.pham@exn.vn", "K8BMR", "Đang làm"),
        ("HE", "Hoàng Văn E", "Sales", "Sales Rep", "e.hoang@exn.vn", "K8BMR", "Đang làm"),
        ("NF", "Ngô Thị F", "Engineering", "QA", "f.ngo@exn.vn", "JNTzG", "Nghỉ việc"),
    ]
    emp_rows = []
    for init, name, team, pos, email, badge_ref, badge_text in employees:
        badge = ref("b-"+init, badge_ref)
        if badge_ref == "K8BMR":
            badge["overrides"] = {"JF4VY": {"content": badge_text}}
        elif badge_ref == "AEtXC":
            badge["overrides"] = {"JVefh": {"content": badge_text}}
        elif badge_ref == "JNTzG":
            badge["overrides"] = {"JfgEM": {"content": badge_text}}

        avatar = frame("av-"+init, [
            text("avT-"+init, init, size=11, weight="600", fill="$text-on-primary",
                 horizontalAlign="center", verticalAlign="center", textAlign="center")
        ], width=32, height=32, fill="$primary", cornerRadius=16,
           justifyContent="center", alignItems="center")

        emp_rows.append(table_row("erow-"+init, [
            avatar,
            table_cell("en-"+init, name, width=180, weight="500"),
            table_cell("et-"+init, team),
            table_cell("ep-"+init, pos),
            table_cell("ee-"+init, email, width=200, fill="$text-secondary"),
            badge,
        ]))

    emp_table = frame("empTable", [emp_header] + emp_rows,
                      layout="vertical", width="fill_container", fill="$bg-card", cornerRadius=12,
                      stroke={"thickness": 1, "fill": "$border"}, clip=True)

    content = frame("empContent", [
        make_web_header("Nhân viên", "Quản lý danh sách nhân viên"),
        frame("empBody", [
            filter_bar,
            emp_table,
        ], layout="vertical", gap=20, width="fill_container", padding=[24, 28])
    ], layout="vertical", width="fill_container", height="fill_container", fill="$bg-page")

    return frame("Web Employee List", [
        make_sidebar("Nhân viên"),
        content,
    ], x=0, y=3400, width=1440, height=900, fill="$bg-page", clip=True)


# ================================================================
# SCREEN 4: Web Employee Create/Edit Form (1440x900)
# ================================================================
def make_web_employee_form():
    # Personal info section
    personal = frame("personalSection", [
        frame("secHead1", [
            icon("secIc1", "user", 18, fill="$primary"),
            section_title("secT1", "Thông tin cá nhân"),
        ], gap=8, alignItems="center"),
        frame("formRow1", [
            ref("fName", "i4ZYQ", width="fill_container",
                overrides={"de3X1": {"content": "Họ tên"}, "j4lzf": {"content": "Nguyễn Văn A"}}),
            ref("fEmail", "i4ZYQ", width="fill_container",
                overrides={"de3X1": {"content": "Email"}, "j4lzf": {"content": "a.nguyen@exn.vn"}}),
        ], width="fill_container", gap=16),
        frame("formRow2", [
            ref("fPhone", "i4ZYQ", width="fill_container",
                overrides={"de3X1": {"content": "Số điện thoại"}, "j4lzf": {"content": "0912 345 678"}}),
            ref("fDOB", "i4ZYQ", width="fill_container",
                overrides={"de3X1": {"content": "Ngày sinh"}, "j4lzf": {"content": "15/05/1990"}}),
        ], width="fill_container", gap=16),
        frame("formRow3", [
            ref("fGender", "tCvDk", width="fill_container",
                overrides={"zKURo": {"content": "Giới tính"}, "52uFa": {"content": "Nam"}}),
            ref("fAddress", "i4ZYQ", width="fill_container",
                overrides={"de3X1": {"content": "Địa chỉ"}, "j4lzf": {"content": "123 Nguyễn Huệ, Q.1, TP.HCM"}}),
        ], width="fill_container", gap=16),
    ], layout="vertical", gap=16, width="fill_container", fill="$bg-card",
       cornerRadius=12, padding=[24, 24], stroke={"thickness": 1, "fill": "$border"})

    # Work info section
    work = frame("workSection", [
        frame("secHead2", [
            icon("secIc2", "briefcase", 18, fill="$primary"),
            section_title("secT2", "Thông tin công việc"),
        ], gap=8, alignItems="center"),
        frame("formRow4", [
            ref("fTeam", "tCvDk", width="fill_container",
                overrides={"zKURo": {"content": "Team"}, "52uFa": {"content": "Engineering"}}),
            ref("fPosition", "tCvDk", width="fill_container",
                overrides={"zKURo": {"content": "Chức vụ"}, "52uFa": {"content": "Developer"}}),
        ], width="fill_container", gap=16),
        frame("formRow5", [
            ref("fRole", "tCvDk", width="fill_container",
                overrides={"zKURo": {"content": "Vai trò hệ thống"}, "52uFa": {"content": "Employee"}}),
            ref("fJoinDate", "i4ZYQ", width="fill_container",
                overrides={"de3X1": {"content": "Ngày vào làm"}, "j4lzf": {"content": "01/03/2026"}}),
        ], width="fill_container", gap=16),
    ], layout="vertical", gap=16, width="fill_container", fill="$bg-card",
       cornerRadius=12, padding=[24, 24], stroke={"thickness": 1, "fill": "$border"})

    # Salary config section
    salary = frame("salarySection", [
        frame("secHead3", [
            icon("secIc3", "wallet", 18, fill="$primary"),
            section_title("secT3", "Cấu hình lương"),
        ], gap=8, alignItems="center"),
        frame("formRow6", [
            ref("fBasicSalary", "i4ZYQ", width="fill_container",
                overrides={"de3X1": {"content": "Lương cơ bản"}, "j4lzf": {"content": "15,000,000 VND"}}),
            ref("fInsSalary", "i4ZYQ", width="fill_container",
                overrides={"de3X1": {"content": "Lương đóng bảo hiểm"}, "j4lzf": {"content": "12,000,000 VND"}}),
        ], width="fill_container", gap=16),
    ], layout="vertical", gap=16, width="fill_container", fill="$bg-card",
       cornerRadius=12, padding=[24, 24], stroke={"thickness": 1, "fill": "$border"})

    # Action buttons
    actions = frame("formActions", [
        ref("cancelBtn", "J94ak", overrides={"m1Hqv": {"content": "Hủy"}}),
        ref("saveBtn", "St5Ib",
            overrides={"BKk5p": {"iconFontName": "save"}, "Ejlmp": {"content": "Lưu nhân viên"}}),
    ], gap=12, justifyContent="flex_end", width="fill_container")

    content = frame("formContent", [
        make_web_header("Thêm nhân viên", "Điền thông tin để tạo nhân viên mới"),
        frame("formBody", [
            personal,
            work,
            salary,
            actions,
        ], layout="vertical", gap=20, width="fill_container", padding=[24, 28],
           height="fill_container")
    ], layout="vertical", width="fill_container", height="fill_container", fill="$bg-page")

    return frame("Web Employee Form", [
        make_sidebar("Nhân viên"),
        content,
    ], x=0, y=4400, width=1440, height=900, fill="$bg-page", clip=True)


# ================================================================
# SCREEN 5: Mobile Check-in (393x852)
# ================================================================
def make_mobile_checkin():
    checkin_button = frame("bigCheckinBtn", [
        frame("checkinCircle", [
            icon("checkinBigIc", "fingerprint", 48, fill="$text-on-primary"),
            text("checkinBigTxt", "CHECK IN", font="Space Grotesk", size=18, weight="600",
                 fill="$text-on-primary", horizontalAlign="center", textAlign="center"),
        ], layout="vertical", gap=12, width=160, height=160, fill="$primary",
           cornerRadius=80, justifyContent="center", alignItems="center"),
    ], width="fill_container", justifyContent="center", padding=[16, 0])

    # GPS & WiFi status
    status_indicators = frame("statusIndicators", [
        frame("gpsRow", [
            icon("gpsIcC", "map-pin", 18, fill="$success"),
            text("gpsLabel", "GPS", size=13, weight="500", fill="$text-primary"),
            text("gpsVal", "Trong phạm vi", size=13, fill="$success"),
        ], width="fill_container", gap=8, alignItems="center",
           padding=[12, 16], fill="$success-bg", cornerRadius=10),
        frame("wifiRow", [
            icon("wifiIcC", "wifi", 18, fill="$success"),
            text("wifiLabel", "WiFi", size=13, weight="500", fill="$text-primary"),
            text("wifiVal", "ExnHR-Office", size=13, fill="$success"),
        ], width="fill_container", gap=8, alignItems="center",
           padding=[12, 16], fill="$success-bg", cornerRadius=10),
    ], layout="vertical", gap=8, width="fill_container")

    # Today's times
    today_times = frame("todayTimes", [
        text("todayLabel", "Hôm nay", size=14, weight="500", fill="$text-primary"),
        frame("timesRow", [
            frame("inTime", [
                icon("inIc", "log-in", 16, fill="$primary"),
                text("inLabel", "Vào", size=12, fill="$text-secondary"),
                text("inVal", "--:--", size=16, weight="600", fill="$text-primary", font="Space Grotesk"),
            ], layout="vertical", gap=4, alignItems="center",
               width="fill_container", fill="$bg-card", cornerRadius=12, padding=[16, 12],
               stroke={"thickness": 1, "fill": "$border"}),
            frame("outTime", [
                icon("outIc", "log-out", 16, fill="$danger"),
                text("outLabel", "Ra", size=12, fill="$text-secondary"),
                text("outVal", "--:--", size=16, weight="600", fill="$text-primary", font="Space Grotesk"),
            ], layout="vertical", gap=4, alignItems="center",
               width="fill_container", fill="$bg-card", cornerRadius=12, padding=[16, 12],
               stroke={"thickness": 1, "fill": "$border"}),
            frame("totalTime", [
                icon("totalIc", "clock", 16, fill="$info"),
                text("totalLabel", "Tổng", size=12, fill="$text-secondary"),
                text("totalVal", "0h 0m", size=16, weight="600", fill="$text-primary", font="Space Grotesk"),
            ], layout="vertical", gap=4, alignItems="center",
               width="fill_container", fill="$bg-card", cornerRadius=12, padding=[16, 12],
               stroke={"thickness": 1, "fill": "$border"}),
        ], width="fill_container", gap=10),
    ], layout="vertical", gap=12, width="fill_container")

    # Weekly summary
    days = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]
    day_items = []
    for i, d in enumerate(days):
        is_today = i == 2  # Wednesday
        day_items.append(frame("day-"+d, [
            text("dayLbl-"+d, d, size=11, weight="500",
                 fill="$text-on-primary" if is_today else "$text-secondary",
                 horizontalAlign="center", textAlign="center"),
            frame("dayDot-"+d, [],
                  width=8, height=8, fill="$success" if i < 2 else ("$primary" if is_today else "$border"),
                  cornerRadius=4),
        ], layout="vertical", gap=6, alignItems="center",
           width="fill_container", height=48,
           fill="$primary" if is_today else "$bg-surface",
           cornerRadius=8, justifyContent="center"))

    weekly = frame("weeklySummary", [
        text("weekLabel", "Tuần này", size=14, weight="500", fill="$text-primary"),
        frame("weekDays", day_items, width="fill_container", gap=6),
    ], layout="vertical", gap=12, width="fill_container")

    return frame("Mobile Check-in", [
        make_status_bar(),
        make_mobile_header("Chấm công"),
        frame("checkinBody", [
            checkin_button,
            status_indicators,
            today_times,
            weekly,
        ], layout="vertical", gap=20, width="fill_container",
           padding=[0, 20], height="fill_container"),
        make_tab_bar("Home"),
    ], x=2040, y=2400, width=393, height=852, fill="$bg-page",
       layout="vertical", clip=True)


# ================================================================
# SCREEN 6: Mobile Leave Request Form (393x852)
# ================================================================
def make_mobile_leave_request():
    # Leave balance card
    balance_card = frame("balanceCard", [
        text("balTitle", "Số ngày phép", size=13, fill="$text-secondary"),
        frame("balNumbers", [
            frame("balTotal", [
                text("balTotalVal", "12", font="Space Grotesk", size=28, weight="600", fill="$primary"),
                text("balTotalLbl", "Tổng cộng", size=11, fill="$text-muted",
                     horizontalAlign="center", textAlign="center"),
            ], layout="vertical", gap=2, alignItems="center", width="fill_container"),
            frame("balDivider", [], width=1, height=36, fill="$border"),
            frame("balUsed", [
                text("balUsedVal", "5", font="Space Grotesk", size=28, weight="600", fill="$warning"),
                text("balUsedLbl", "Đã dùng", size=11, fill="$text-muted",
                     horizontalAlign="center", textAlign="center"),
            ], layout="vertical", gap=2, alignItems="center", width="fill_container"),
            frame("balDivider2", [], width=1, height=36, fill="$border"),
            frame("balRemain", [
                text("balRemVal", "7", font="Space Grotesk", size=28, weight="600", fill="$success"),
                text("balRemLbl", "Còn lại", size=11, fill="$text-muted",
                     horizontalAlign="center", textAlign="center"),
            ], layout="vertical", gap=2, alignItems="center", width="fill_container"),
        ], width="fill_container", justifyContent="space_around", alignItems="center"),
    ], layout="vertical", gap=12, width="fill_container", fill="$primary-light",
       cornerRadius=16, padding=[16, 20])

    # Form fields
    form = frame("leaveForm", [
        ref("leaveType", "tCvDk", width="fill_container",
            overrides={"zKURo": {"content": "Loại nghỉ phép"}, "52uFa": {"content": "Nghỉ phép năm"}}),
        frame("dateRow", [
            ref("startDate", "i4ZYQ", width="fill_container",
                overrides={"de3X1": {"content": "Từ ngày"}, "j4lzf": {"content": "18/03/2026"}}),
            ref("endDate", "i4ZYQ", width="fill_container",
                overrides={"de3X1": {"content": "Đến ngày"}, "j4lzf": {"content": "20/03/2026"}}),
        ], width="fill_container", gap=12),
        frame("daysCalc", [
            text("daysLabel", "Số ngày nghỉ:", size=14, fill="$text-secondary"),
            text("daysVal", "3 ngày", size=14, weight="600", fill="$primary"),
        ], width="fill_container", justifyContent="space_between", alignItems="center",
           padding=[12, 16], fill="$bg-surface", cornerRadius=8),
        frame("reasonField", [
            text("reasonLabel", "Lý do", size=13, weight="500", fill="$text-primary"),
            frame("reasonBox", [
                text("reasonPh", "Nhập lý do nghỉ phép...", size=14, fill="$text-muted"),
            ], width="fill_container", height=80, fill="$bg-input", cornerRadius=8,
               stroke={"thickness": 1, "fill": "$border"}, padding=[12, 14]),
        ], layout="vertical", gap=6, width="fill_container"),
    ], layout="vertical", gap=16, width="fill_container")

    submit = ref("submitLeave", "St5Ib", width="fill_container", height=48,
                  overrides={"BKk5p": {"iconFontName": "send"}, "Ejlmp": {"content": "Gửi yêu cầu"}})

    return frame("Mobile Leave Request", [
        make_status_bar(),
        make_mobile_header("Xin nghỉ phép", show_back=True),
        frame("leaveBody", [
            balance_card,
            form,
            submit,
        ], layout="vertical", gap=20, width="fill_container",
           padding=[0, 20], height="fill_container"),
        make_tab_bar("Phép"),
    ], x=2540, y=2400, width=393, height=852, fill="$bg-page",
       layout="vertical", clip=True)


# ================================================================
# SCREEN 7: Web Leave Approval (1440x900)
# ================================================================
def make_web_leave_approval():
    # Filter tabs
    tabs = frame("filterTabs", [
        frame("tabAll", [
            text("tabAllT", "Tất cả", size=14, weight="500", fill="$text-on-primary",
                 horizontalAlign="center", textAlign="center")
        ], padding=[8, 20], fill="$primary", cornerRadius=8),
        frame("tabPending", [
            text("tabPendT", "Chờ duyệt", size=14, fill="$text-secondary",
                 horizontalAlign="center", textAlign="center")
        ], padding=[8, 20], fill="$bg-surface", cornerRadius=8),
        frame("tabApproved", [
            text("tabApprT", "Đã duyệt", size=14, fill="$text-secondary",
                 horizontalAlign="center", textAlign="center")
        ], padding=[8, 20], fill="$bg-surface", cornerRadius=8),
        frame("tabRejected", [
            text("tabRejT", "Từ chối", size=14, fill="$text-secondary",
                 horizontalAlign="center", textAlign="center")
        ], padding=[8, 20], fill="$bg-surface", cornerRadius=8),
    ], gap=8, alignItems="center")

    # Table
    leave_header = table_row("lHead", [
        table_header_cell("lh1", "Nhân viên", width=160),
        table_header_cell("lh2", "Loại", width=120),
        table_header_cell("lh3", "Từ ngày", width=100),
        table_header_cell("lh4", "Đến ngày", width=100),
        table_header_cell("lh5", "Số ngày", width=70),
        table_header_cell("lh6", "Trạng thái", width=100),
        table_header_cell("lh7", "Hành động", width=140),
    ], fill="$bg-surface")

    leave_data = [
        ("Nguyễn Văn A", "Nghỉ phép", "18/03", "20/03", "3", "AEtXC", "Chờ duyệt"),
        ("Trần Thị B", "Nghỉ ốm", "17/03", "17/03", "1", "AEtXC", "Chờ duyệt"),
        ("Lê Văn C", "Nghỉ phép", "22/03", "24/03", "3", "K8BMR", "Đã duyệt"),
        ("Phạm Thị D", "Nghỉ phép", "10/03", "11/03", "2", "JNTzG", "Từ chối"),
        ("Hoàng Văn E", "Nghỉ phép", "25/03", "26/03", "2", "AEtXC", "Chờ duyệt"),
    ]
    leave_rows = []
    for name, type_, start, end, days, badge_ref, badge_text in leave_data:
        badge = ref("lb-"+name[:3], badge_ref)
        if badge_ref == "AEtXC":
            badge["overrides"] = {"JVefh": {"content": badge_text}}
        elif badge_ref == "K8BMR":
            badge["overrides"] = {"JF4VY": {"content": badge_text}}
        elif badge_ref == "JNTzG":
            badge["overrides"] = {"JfgEM": {"content": badge_text}}

        action_btns = frame("actions-"+name[:3], [], gap=8)
        if badge_ref == "AEtXC":  # pending
            action_btns["children"] = [
                frame("approveBtn-"+name[:3], [
                    icon("appIc-"+name[:3], "check", 14, fill="$success"),
                    text("appTxt-"+name[:3], "Duyệt", size=12, weight="500", fill="$success"),
                ], gap=4, padding=[6, 12], fill="$success-bg", cornerRadius=6, alignItems="center"),
                frame("rejectBtn-"+name[:3], [
                    icon("rejIc-"+name[:3], "x", 14, fill="$danger"),
                    text("rejTxt-"+name[:3], "Từ chối", size=12, weight="500", fill="$danger"),
                ], gap=4, padding=[6, 12], fill="$danger-bg", cornerRadius=6, alignItems="center"),
            ]

        leave_rows.append(table_row("lrow-"+name[:3], [
            table_cell("lc1-"+name[:3], name, width=160, weight="500"),
            table_cell("lc2-"+name[:3], type_, width=120),
            table_cell("lc3-"+name[:3], start, width=100),
            table_cell("lc4-"+name[:3], end, width=100),
            table_cell("lc5-"+name[:3], days, width=70, horizontalAlign="center", textAlign="center"),
            badge,
            action_btns,
        ]))

    leave_table = frame("leaveTable", [leave_header] + leave_rows,
                        layout="vertical", width="fill_container", fill="$bg-card",
                        cornerRadius=12, stroke={"thickness": 1, "fill": "$border"}, clip=True)

    content = frame("leaveContent", [
        make_web_header("Quản lý nghỉ phép", "Duyệt và quản lý yêu cầu nghỉ phép"),
        frame("leaveBody", [
            tabs,
            leave_table,
        ], layout="vertical", gap=20, width="fill_container", padding=[24, 28])
    ], layout="vertical", width="fill_container", height="fill_container", fill="$bg-page")

    return frame("Web Leave Approval", [
        make_sidebar("Nghỉ phép"),
        content,
    ], x=0, y=5400, width=1440, height=900, fill="$bg-page", clip=True)


# ================================================================
# SCREEN 8: Mobile OT Request (393x852)
# ================================================================
def make_mobile_ot_request():
    form = frame("otForm", [
        ref("otDate", "i4ZYQ", width="fill_container",
            overrides={"de3X1": {"content": "Ngày làm thêm"}, "j4lzf": {"content": "18/03/2026"}}),
        frame("timeRow", [
            ref("otStart", "i4ZYQ", width="fill_container",
                overrides={"de3X1": {"content": "Giờ bắt đầu"}, "j4lzf": {"content": "18:00"}}),
            ref("otEnd", "i4ZYQ", width="fill_container",
                overrides={"de3X1": {"content": "Giờ kết thúc"}, "j4lzf": {"content": "21:00"}}),
        ], width="fill_container", gap=12),
        frame("hoursCalc", [
            icon("clockIcOt", "clock", 18, fill="$primary"),
            text("hoursLabel", "Số giờ OT:", size=14, fill="$text-secondary"),
            text("hoursVal", "3 giờ", font="Space Grotesk", size=18, weight="600", fill="$primary"),
        ], width="fill_container", justifyContent="center", alignItems="center",
           gap=8, padding=[16, 20], fill="$primary-light", cornerRadius=12),
        frame("otReasonField", [
            text("otReasonLabel", "Lý do", size=13, weight="500", fill="$text-primary"),
            frame("otReasonBox", [
                text("otReasonPh", "Nhập lý do làm thêm...", size=14, fill="$text-muted"),
            ], width="fill_container", height=100, fill="$bg-input", cornerRadius=8,
               stroke={"thickness": 1, "fill": "$border"}, padding=[12, 14]),
        ], layout="vertical", gap=6, width="fill_container"),
    ], layout="vertical", gap=16, width="fill_container")

    submit = ref("submitOT", "St5Ib", width="fill_container", height=48,
                  overrides={"BKk5p": {"iconFontName": "send"}, "Ejlmp": {"content": "Gửi yêu cầu OT"}})

    return frame("Mobile OT Request", [
        make_status_bar(),
        make_mobile_header("Xin làm thêm", show_back=True),
        frame("otBody", [
            form,
            submit,
        ], layout="vertical", gap=24, width="fill_container",
           padding=[8, 20], height="fill_container"),
        make_tab_bar("Home"),
    ], x=3040, y=2400, width=393, height=852, fill="$bg-page",
       layout="vertical", clip=True)


# ================================================================
# SCREEN 9: Mobile Payslip (393x852)
# ================================================================
def make_mobile_payslip():
    # Month selector
    month_sel = frame("monthSel", [
        icon("prevMonth", "chevron-left", 20, fill="$text-primary"),
        text("monthLabel", "Tháng 03/2026", font="Space Grotesk", size=16, weight="600",
             fill="$text-primary", horizontalAlign="center", textAlign="center"),
        icon("nextMonth", "chevron-right", 20, fill="$text-primary"),
    ], width="fill_container", justifyContent="space_between", alignItems="center",
       padding=[12, 20], fill="$bg-card", cornerRadius=12,
       stroke={"thickness": 1, "fill": "$border"})

    # Net salary card
    net_card = frame("netCard", [
        text("netLabel", "Lương thực nhận", size=13, fill="$text-on-primary"),
        text("netAmount", "13,450,000", font="Space Grotesk", size=32, weight="600",
             fill="$text-on-primary", letterSpacing=-1),
        text("netCurrency", "VND", size=14, weight="500", fill="$text-on-primary"),
    ], layout="vertical", gap=8, width="fill_container", fill="$primary",
       cornerRadius=16, padding=[24, 24], alignItems="center")

    # Income breakdown
    def salary_line(name, label, amount, bold=False):
        return frame(name, [
            text(name+"L", label, size=14, fill="$text-primary",
                 weight="500" if bold else "normal"),
            text(name+"V", amount, size=14, fill="$text-primary",
                 weight="600" if bold else "normal"),
        ], width="fill_container", justifyContent="space_between", alignItems="center",
           padding=[8, 0])

    income = frame("incomeSection", [
        frame("incHead", [
            icon("incIc", "trending-up", 16, fill="$success"),
            text("incTitle", "Thu nhập", size=15, weight="600", fill="$text-primary"),
        ], gap=8, alignItems="center"),
        salary_line("salBasic", "Lương cơ bản", "15,000,000", bold=True),
        salary_line("salAllow", "Phụ cấp", "2,000,000"),
        salary_line("salOT", "Làm thêm (OT)", "1,350,000"),
        salary_line("salBonus", "Thưởng", "500,000"),
        frame("incTotal", [
            text("incTotalL", "Tổng thu nhập", size=14, weight="600", fill="$success"),
            text("incTotalV", "18,850,000", size=14, weight="600", fill="$success"),
        ], width="fill_container", justifyContent="space_between",
           padding=[12, 12], fill="$success-bg", cornerRadius=8),
    ], layout="vertical", gap=8, width="fill_container", fill="$bg-card",
       cornerRadius=12, padding=[16, 16], stroke={"thickness": 1, "fill": "$border"})

    # Deduction breakdown
    deduction = frame("deductSection", [
        frame("dedHead", [
            icon("dedIc", "trending-down", 16, fill="$danger"),
            text("dedTitle", "Khấu trừ", size=15, weight="600", fill="$text-primary"),
        ], gap=8, alignItems="center"),
        salary_line("dedBHXH", "BHXH (8%)", "1,200,000"),
        salary_line("dedBHYT", "BHYT (1.5%)", "225,000"),
        salary_line("dedBHTN", "BHTN (1%)", "150,000"),
        salary_line("dedPIT", "Thuế TNCN", "825,000"),
        salary_line("dedAdv", "Tạm ứng", "3,000,000"),
        frame("dedTotal", [
            text("dedTotalL", "Tổng khấu trừ", size=14, weight="600", fill="$danger"),
            text("dedTotalV", "5,400,000", size=14, weight="600", fill="$danger"),
        ], width="fill_container", justifyContent="space_between",
           padding=[12, 12], fill="$danger-bg", cornerRadius=8),
    ], layout="vertical", gap=8, width="fill_container", fill="$bg-card",
       cornerRadius=12, padding=[16, 16], stroke={"thickness": 1, "fill": "$border"})

    return frame("Mobile Payslip", [
        make_status_bar(),
        make_mobile_header("Phiếu lương", show_back=True),
        frame("payslipBody", [
            month_sel,
            net_card,
            income,
            deduction,
        ], layout="vertical", gap=16, width="fill_container",
           padding=[0, 20], height="fill_container"),
        make_tab_bar("Lương"),
    ], x=3540, y=2400, width=393, height=852, fill="$bg-page",
       layout="vertical", clip=True)


# ================================================================
# SCREEN 10: Web Payroll (1440x900)
# ================================================================
def make_web_payroll():
    # Month selector + Run button
    toolbar = frame("payrollToolbar", [
        frame("monthPicker", [
            icon("calIcPR", "calendar", 16, fill="$text-secondary"),
            text("monthValPR", "Tháng 03/2026", size=14, weight="500", fill="$text-primary"),
            icon("chevPR", "chevron-down", 16, fill="$text-muted"),
        ], gap=8, padding=[8, 16], fill="$bg-input", cornerRadius=8,
           stroke={"thickness": 1, "fill": "$border"}, alignItems="center"),
        frame("payrollBtns", [
            ref("exportBtn", "J94ak", overrides={"m1Hqv": {"content": "Xuất Excel"}}),
            ref("runPayroll", "St5Ib",
                overrides={"BKk5p": {"iconFontName": "calculator"}, "Ejlmp": {"content": "Chạy bảng lương"}}),
        ], gap=12),
    ], width="fill_container", justifyContent="space_between", alignItems="center")

    # Payroll table
    pr_header = table_row("prHead", [
        table_header_cell("prh1", "Nhân viên", width=140),
        table_header_cell("prh2", "Lương CB", width=110),
        table_header_cell("prh3", "Phụ cấp", width=90),
        table_header_cell("prh4", "OT", width=90),
        table_header_cell("prh5", "Thưởng", width=90),
        table_header_cell("prh6", "Khấu trừ", width=100),
        table_header_cell("prh7", "Thực nhận", width=120),
    ], fill="$bg-surface")

    payroll_data = [
        ("Nguyễn Văn A", "15,000,000", "2,000,000", "1,350,000", "500,000", "5,400,000", "13,450,000"),
        ("Trần Thị B", "12,000,000", "1,500,000", "0", "0", "3,825,000", "9,675,000"),
        ("Lê Văn C", "20,000,000", "3,000,000", "2,250,000", "1,000,000", "7,875,000", "18,375,000"),
        ("Phạm Thị D", "18,000,000", "2,500,000", "0", "500,000", "6,300,000", "14,700,000"),
        ("Hoàng Văn E", "10,000,000", "1,000,000", "900,000", "0", "3,570,000", "8,330,000"),
    ]
    pr_rows = []
    for name, basic, allow, ot, bonus, ded, net in payroll_data:
        pr_rows.append(table_row("pr-"+name[:3], [
            table_cell("prc1-"+name[:3], name, width=140, weight="500"),
            table_cell("prc2-"+name[:3], basic, width=110),
            table_cell("prc3-"+name[:3], allow, width=90),
            table_cell("prc4-"+name[:3], ot, width=90),
            table_cell("prc5-"+name[:3], bonus, width=90),
            table_cell("prc6-"+name[:3], ded, width=100, fill="$danger"),
            table_cell("prc7-"+name[:3], net, width=120, weight="600", fill="$primary"),
        ]))

    # Totals row
    totals = frame("prTotals", [
        text("prTotalLbl", "Tổng cộng", size=14, weight="600", fill="$text-primary", width=140),
        text("prTotalBasic", "75,000,000", size=14, weight="600", fill="$text-primary", width=110),
        text("prTotalAllow", "10,000,000", size=14, weight="600", fill="$text-primary", width=90),
        text("prTotalOT", "4,500,000", size=14, weight="600", fill="$text-primary", width=90),
        text("prTotalBonus", "2,000,000", size=14, weight="600", fill="$text-primary", width=90),
        text("prTotalDed", "26,970,000", size=14, weight="600", fill="$danger", width=100),
        text("prTotalNet", "64,530,000", size=14, weight="600", fill="$primary", width=120),
    ], width="fill_container", padding=[12, 16], gap=12, alignItems="center",
       fill="$bg-surface")

    pr_table = frame("prTable", [pr_header] + pr_rows + [totals],
                     layout="vertical", width="fill_container", fill="$bg-card",
                     cornerRadius=12, stroke={"thickness": 1, "fill": "$border"}, clip=True)

    content = frame("payrollContent", [
        make_web_header("Bảng lương", "Tính và quản lý lương tháng"),
        frame("payrollBody", [
            toolbar,
            pr_table,
        ], layout="vertical", gap=20, width="fill_container", padding=[24, 28])
    ], layout="vertical", width="fill_container", height="fill_container", fill="$bg-page")

    return frame("Web Payroll", [
        make_sidebar("Tính lương"),
        content,
    ], x=0, y=6400, width=1440, height=900, fill="$bg-page", clip=True)


# ================================================================
# SCREEN 11: Mobile Profile (393x852)
# ================================================================
def make_mobile_profile():
    # Profile header
    profile_header = frame("profileHeader", [
        frame("profileAvatar", [
            text("profInit", "NA", font="Space Grotesk", size=24, weight="600",
                 fill="$text-on-primary", horizontalAlign="center", verticalAlign="center",
                 textAlign="center")
        ], width=80, height=80, fill="$primary", cornerRadius=40,
           justifyContent="center", alignItems="center"),
        text("profName", "Nguyễn Văn A", font="Space Grotesk", size=22, weight="600",
             fill="$text-primary", horizontalAlign="center", textAlign="center"),
        text("profRole", "Developer", size=14, fill="$text-secondary",
             horizontalAlign="center", textAlign="center"),
        text("profTeam", "Engineering", size=13, fill="$text-muted",
             horizontalAlign="center", textAlign="center"),
    ], layout="vertical", gap=8, width="fill_container", alignItems="center",
       padding=[16, 20])

    # Menu items
    menu_items_data = [
        ("Thông tin cá nhân", "user", "$primary"),
        ("Đổi mật khẩu", "lock", "$info"),
        ("Lịch sử chấm công", "clock", "$warning"),
        ("Lịch sử nghỉ phép", "calendar-off", "$success"),
    ]
    menu_items = []
    for label, ic, color in menu_items_data:
        menu_items.append(frame("menu-"+label[:4], [
            frame("menuIcW-"+label[:4], [
                icon("menuIc-"+label[:4], ic, 20, fill=color)
            ], width=40, height=40, fill="$bg-surface", cornerRadius=10,
               justifyContent="center", alignItems="center"),
            text("menuLbl-"+label[:4], label, size=15, weight="500", fill="$text-primary",
                 width="fill_container"),
            icon("menuChev-"+label[:4], "chevron-right", 18, fill="$text-muted"),
        ], width="fill_container", gap=12, alignItems="center", padding=[14, 20],
           stroke={"thickness": 1, "fill": "$border", "side": "bottom"}))

    # Logout
    logout = frame("logoutItem", [
        frame("logoutIcW", [
            icon("logoutIc", "log-out", 20, fill="$danger")
        ], width=40, height=40, fill="$danger-bg", cornerRadius=10,
           justifyContent="center", alignItems="center"),
        text("logoutLbl", "Đăng xuất", size=15, weight="500", fill="$danger",
             width="fill_container"),
    ], width="fill_container", gap=12, alignItems="center", padding=[14, 20])

    menu = frame("menuList", menu_items + [logout],
                 layout="vertical", width="fill_container", fill="$bg-card",
                 cornerRadius=16, stroke={"thickness": 1, "fill": "$border"},
                 clip=True)

    return frame("Mobile Profile", [
        make_status_bar(),
        make_mobile_header("Cá nhân"),
        frame("profileBody", [
            profile_header,
            menu,
        ], layout="vertical", gap=16, width="fill_container",
           padding=[0, 20], height="fill_container"),
        make_tab_bar("Cá nhân"),
    ], x=4040, y=2400, width=393, height=852, fill="$bg-page",
       layout="vertical", clip=True)


# ================================================================
# MAIN: Generate all screens and write to pen file
# ================================================================
def main():
    with open('pencil-new.pen', encoding='utf-8') as f:
        d = json.load(f)

    # Generate all 11 screens
    screens = [
        make_web_dashboard(),       # 1
        make_mobile_home(),         # 2
        make_web_employee_list(),   # 3
        make_web_employee_form(),   # 4
        make_mobile_checkin(),      # 5
        make_mobile_leave_request(),# 6
        make_web_leave_approval(),  # 7
        make_mobile_ot_request(),   # 8
        make_mobile_payslip(),      # 9
        make_web_payroll(),         # 10
        make_mobile_profile(),      # 11
    ]

    # Remove any previously generated screens (keep only original 4)
    original_ids = {'n77jE', 'ReUxJ', 'IdFIX', 'dzfdI'}
    d['children'] = [c for c in d['children'] if c['id'] in original_ids]

    # Add new screens
    d['children'].extend(screens)

    with open('pencil-new.pen', 'w', encoding='utf-8') as f:
        json.dump(d, f, ensure_ascii=False, indent=2)

    # Print screen IDs for reference
    for s in screens:
        print('Generated: id=%s name=%s x=%s y=%s' % (s['id'], s['name'], s['x'], s['y']))

if __name__ == '__main__':
    main()
