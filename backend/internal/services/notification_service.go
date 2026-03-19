package services

import (
	"github.com/exn-hr/backend/internal/dto"
	"github.com/exn-hr/backend/internal/models"
	"github.com/exn-hr/backend/internal/repositories"
)

type NotificationService struct {
	notifRepo *repositories.NotificationRepository
}

func NewNotificationService(notifRepo *repositories.NotificationRepository) *NotificationService {
	return &NotificationService{notifRepo: notifRepo}
}

func (s *NotificationService) Send(userID uint, title, body, notifType string, referenceID *uint, referenceType string) error {
	n := &models.Notification{
		UserID:        userID,
		Title:         title,
		Body:          body,
		Type:          notifType,
		IsRead:        false,
		ReferenceID:   referenceID,
		ReferenceType: referenceType,
	}
	return s.notifRepo.Create(n)
}

func (s *NotificationService) List(userID uint, filter dto.NotificationFilter) ([]models.Notification, int64, error) {
	return s.notifRepo.List(userID, filter)
}

func (s *NotificationService) MarkRead(id, userID uint) error {
	return s.notifRepo.MarkRead(id, userID)
}

func (s *NotificationService) MarkAllRead(userID uint) error {
	return s.notifRepo.MarkAllRead(userID)
}

func (s *NotificationService) UnreadCount(userID uint) (int64, error) {
	return s.notifRepo.UnreadCount(userID)
}

func (s *NotificationService) toResponse(n models.Notification) dto.NotificationResponse {
	return dto.NotificationResponse{
		ID:            n.ID,
		UserID:        n.UserID,
		Title:         n.Title,
		Body:          n.Body,
		Type:          n.Type,
		IsRead:        n.IsRead,
		ReferenceID:   n.ReferenceID,
		ReferenceType: n.ReferenceType,
		CreatedAt:     n.CreatedAt,
	}
}

func (s *NotificationService) ToResponseList(notifications []models.Notification) []dto.NotificationResponse {
	result := make([]dto.NotificationResponse, len(notifications))
	for i, n := range notifications {
		result[i] = s.toResponse(n)
	}
	return result
}
