package repositories

import (
	"github.com/exn-hr/backend/internal/dto"
	"github.com/exn-hr/backend/internal/models"
	"gorm.io/gorm"
)

type NotificationRepository struct {
	db *gorm.DB
}

func NewNotificationRepository(db *gorm.DB) *NotificationRepository {
	return &NotificationRepository{db: db}
}

func (r *NotificationRepository) Create(n *models.Notification) error {
	return r.db.Create(n).Error
}

func (r *NotificationRepository) FindByID(id uint) (*models.Notification, error) {
	var n models.Notification
	err := r.db.First(&n, id).Error
	return &n, err
}

func (r *NotificationRepository) MarkRead(id, userID uint) error {
	return r.db.Model(&models.Notification{}).
		Where("id = ? AND user_id = ?", id, userID).
		Update("is_read", true).Error
}

func (r *NotificationRepository) MarkAllRead(userID uint) error {
	return r.db.Model(&models.Notification{}).
		Where("user_id = ? AND is_read = false", userID).
		Update("is_read", true).Error
}

func (r *NotificationRepository) List(userID uint, filter dto.NotificationFilter) ([]models.Notification, int64, error) {
	var notifications []models.Notification
	var total int64

	q := r.db.Model(&models.Notification{}).Where("user_id = ?", userID)

	if filter.IsRead != nil {
		q = q.Where("is_read = ?", *filter.IsRead)
	}
	if filter.Type != "" {
		q = q.Where("type = ?", filter.Type)
	}

	q.Count(&total)

	page := filter.Page
	size := filter.Size
	if page < 1 {
		page = 1
	}
	if size < 1 {
		size = 20
	}

	err := q.Offset((page - 1) * size).Limit(size).Order("created_at DESC").Find(&notifications).Error
	return notifications, total, err
}

func (r *NotificationRepository) UnreadCount(userID uint) (int64, error) {
	var count int64
	err := r.db.Model(&models.Notification{}).
		Where("user_id = ? AND is_read = false", userID).Count(&count).Error
	return count, err
}
