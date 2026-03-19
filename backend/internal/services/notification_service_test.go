package services_test

import (
	"testing"

	"github.com/exn-hr/backend/internal/dto"
	"github.com/exn-hr/backend/internal/models"
)

func TestSendNotification(t *testing.T) {
	cleanTables(t)
	userID, _ := seedEmployee(t, "notif@test.com", models.RoleEmployee, nil)

	refID := uint(1)
	err := notifSvc.Send(userID, "Test Title", "Test Body", "leave", &refID, "leave_request")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	// Verify
	notifs, total, err := notifSvc.List(userID, dto.NotificationFilter{Page: 1, Size: 10})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if total != 1 {
		t.Errorf("expected 1 notification, got %d", total)
	}
	if len(notifs) != 1 {
		t.Fatalf("expected 1 in list, got %d", len(notifs))
	}
	if notifs[0].Title != "Test Title" {
		t.Errorf("expected title 'Test Title', got '%s'", notifs[0].Title)
	}
	if notifs[0].IsRead {
		t.Error("expected notification to be unread")
	}
}

func TestUnreadCount(t *testing.T) {
	cleanTables(t)
	userID, _ := seedEmployee(t, "count@test.com", models.RoleEmployee, nil)

	notifSvc.Send(userID, "N1", "Body1", "leave", nil, "")
	notifSvc.Send(userID, "N2", "Body2", "ot", nil, "")
	notifSvc.Send(userID, "N3", "Body3", "salary", nil, "")

	count, err := notifSvc.UnreadCount(userID)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if count != 3 {
		t.Errorf("expected 3 unread, got %d", count)
	}
}

func TestMarkRead(t *testing.T) {
	cleanTables(t)
	userID, _ := seedEmployee(t, "read@test.com", models.RoleEmployee, nil)

	notifSvc.Send(userID, "ToRead", "Body", "leave", nil, "")

	notifs, _, _ := notifSvc.List(userID, dto.NotificationFilter{Page: 1, Size: 10})
	notifID := notifs[0].ID

	err := notifSvc.MarkRead(notifID, userID)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	count, _ := notifSvc.UnreadCount(userID)
	if count != 0 {
		t.Errorf("expected 0 unread after marking read, got %d", count)
	}
}

func TestMarkAllRead(t *testing.T) {
	cleanTables(t)
	userID, _ := seedEmployee(t, "readall@test.com", models.RoleEmployee, nil)

	notifSvc.Send(userID, "N1", "B1", "leave", nil, "")
	notifSvc.Send(userID, "N2", "B2", "ot", nil, "")
	notifSvc.Send(userID, "N3", "B3", "salary", nil, "")

	err := notifSvc.MarkAllRead(userID)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	count, _ := notifSvc.UnreadCount(userID)
	if count != 0 {
		t.Errorf("expected 0 unread after mark all read, got %d", count)
	}
}

func TestNotificationFilter_ByType(t *testing.T) {
	cleanTables(t)
	userID, _ := seedEmployee(t, "filter@test.com", models.RoleEmployee, nil)

	notifSvc.Send(userID, "Leave N", "B", "leave", nil, "")
	notifSvc.Send(userID, "OT N", "B", "ot", nil, "")
	notifSvc.Send(userID, "Salary N", "B", "salary", nil, "")

	notifs, total, err := notifSvc.List(userID, dto.NotificationFilter{
		Type: "leave",
		Page: 1,
		Size: 10,
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if total != 1 {
		t.Errorf("expected 1 leave notification, got %d", total)
	}
	if len(notifs) != 1 {
		t.Errorf("expected 1 in list, got %d", len(notifs))
	}
}

func TestNotificationIsolation_BetweenUsers(t *testing.T) {
	cleanTables(t)
	userID1, _ := seedEmployee(t, "user1@test.com", models.RoleEmployee, nil)
	userID2, _ := seedEmployee(t, "user2@test.com", models.RoleEmployee, nil)

	notifSvc.Send(userID1, "For User 1", "B", "leave", nil, "")
	notifSvc.Send(userID2, "For User 2", "B", "ot", nil, "")

	notifs1, total1, _ := notifSvc.List(userID1, dto.NotificationFilter{Page: 1, Size: 10})
	notifs2, total2, _ := notifSvc.List(userID2, dto.NotificationFilter{Page: 1, Size: 10})

	if total1 != 1 {
		t.Errorf("expected 1 notification for user1, got %d", total1)
	}
	if total2 != 1 {
		t.Errorf("expected 1 notification for user2, got %d", total2)
	}
	if len(notifs1) > 0 && notifs1[0].Title != "For User 1" {
		t.Errorf("user1 got wrong notification: %s", notifs1[0].Title)
	}
	if len(notifs2) > 0 && notifs2[0].Title != "For User 2" {
		t.Errorf("user2 got wrong notification: %s", notifs2[0].Title)
	}
}
