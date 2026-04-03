package models

import "time"

// Announcement target type constants
const (
	AnnouncementTargetAll     = "all"
	AnnouncementTargetTeam    = "team"
	AnnouncementTargetProject = "project"
)

// Poll status constants
const (
	PollStatusActive = "active"
	PollStatusClosed = "closed"
)

type Announcement struct {
	ID         uint       `gorm:"primaryKey" json:"id"`
	Title      string     `gorm:"not null" json:"title"`
	Content    string     `gorm:"not null;type:text" json:"content"`
	TargetType string     `gorm:"not null;default:all" json:"target_type"` // all, team, project
	TargetID   *uint      `json:"target_id,omitempty"`
	IsPinned   bool       `gorm:"default:false" json:"is_pinned"`
	ExpiresAt  *time.Time `json:"expires_at,omitempty"`
	CreatedBy  uint       `gorm:"not null;index" json:"created_by"`
	CreatedAt  time.Time  `json:"created_at"`
	UpdatedAt  time.Time  `json:"updated_at"`

	Creator *User `gorm:"foreignKey:CreatedBy" json:"creator,omitempty"`
	Poll    *Poll     `gorm:"foreignKey:AnnouncementID" json:"poll,omitempty"`
}

type Poll struct {
	ID             uint       `gorm:"primaryKey" json:"id"`
	AnnouncementID uint       `gorm:"not null;uniqueIndex" json:"announcement_id"`
	Question       string     `gorm:"not null" json:"question"`
	IsMultiChoice  bool       `gorm:"default:false" json:"is_multiple_choice"`
	IsAnonymous    bool       `gorm:"default:false" json:"is_anonymous"`
	Deadline       *time.Time `json:"deadline,omitempty"`
	Status         string     `gorm:"not null;default:active" json:"status"` // active, closed
	CreatedAt      time.Time  `json:"created_at"`

	Announcement *Announcement `gorm:"foreignKey:AnnouncementID" json:"announcement,omitempty"`
	Options      []PollOption  `gorm:"foreignKey:PollID" json:"options,omitempty"`
}

type PollOption struct {
	ID           uint   `gorm:"primaryKey" json:"id"`
	PollID       uint   `gorm:"not null;index" json:"poll_id"`
	Text         string `gorm:"not null" json:"text"`
	VoteCount    int    `gorm:"default:0" json:"vote_count"` // denormalized counter
	DisplayOrder int    `gorm:"default:0" json:"display_order"`

	Poll  *Poll      `gorm:"foreignKey:PollID" json:"poll,omitempty"`
	Votes []PollVote `gorm:"foreignKey:PollOptionID" json:"votes,omitempty"`
}

type PollVote struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	PollID    uint      `gorm:"not null;index" json:"poll_id"`
	OptionID  uint      `gorm:"not null;index" json:"option_id"`
	UserID    uint      `gorm:"not null;index" json:"user_id"`
	CreatedAt time.Time `json:"created_at"`

	Poll   *Poll       `gorm:"foreignKey:PollID" json:"poll,omitempty"`
	Option *PollOption `gorm:"foreignKey:OptionID" json:"option,omitempty"`
	User   *User       `gorm:"foreignKey:UserID" json:"user,omitempty"`
}
