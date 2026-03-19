package dto

import "time"

// --- Notification ---

type NotificationResponse struct {
	ID            uint      `json:"id"`
	UserID        uint      `json:"user_id"`
	Title         string    `json:"title"`
	Body          string    `json:"body"`
	Type          string    `json:"type"`
	IsRead        bool      `json:"is_read"`
	ReferenceID   *uint     `json:"reference_id"`
	ReferenceType string    `json:"reference_type"`
	CreatedAt     time.Time `json:"created_at"`
}

type NotificationFilter struct {
	IsRead *bool `form:"is_read"`
	Type   string `form:"type"`
	Page   int    `form:"page,default=1"`
	Size   int    `form:"size,default=20"`
}
