package dto

import "time"

// --- Announcement DTOs ---

type CreatePollOptionReq struct {
	Text         string `json:"text" binding:"required"`
	DisplayOrder int    `json:"display_order"`
}

type CreatePollReq struct {
	Question      string                `json:"question" binding:"required"`
	IsMultiChoice bool                  `json:"is_multiple_choice"`
	IsAnonymous   bool                  `json:"is_anonymous"`
	Deadline      *time.Time            `json:"deadline"`
	Options       []CreatePollOptionReq `json:"options" binding:"required,min=2"`
}

type CreateAnnouncementReq struct {
	Title      string         `json:"title" binding:"required"`
	Content    string         `json:"content" binding:"required"`
	TargetType string         `json:"target_type" binding:"required,oneof=all team project"`
	TargetID   *uint          `json:"target_id"`
	IsPinned   bool           `json:"is_pinned"`
	ExpiresAt  *time.Time     `json:"expires_at"`
	Poll       *CreatePollReq `json:"poll"`
}

type UpdateAnnouncementReq struct {
	Title      string     `json:"title"`
	Content    string     `json:"content"`
	TargetType string     `json:"target_type" binding:"omitempty,oneof=all team project"`
	TargetID   *uint      `json:"target_id"`
	IsPinned   *bool      `json:"is_pinned"`
	ExpiresAt  *time.Time `json:"expires_at"`
}

type AnnouncementFilter struct {
	TargetType string `form:"target_type"`
	Page       int    `form:"page,default=1"`
	Size       int    `form:"size,default=20"`
}

// --- Poll Vote DTOs ---

type SubmitVoteReq struct {
	OptionIDs []uint `json:"option_ids" binding:"required,min=1"`
}

// --- Poll Results Response ---

type PollOptionResult struct {
	ID         uint    `json:"id"`
	Text       string  `json:"text"`
	VoteCount  int     `json:"vote_count"`
	Percentage float64 `json:"percentage"`
}

type VoterInfo struct {
	EmployeeID   uint   `json:"employee_id"`
	EmployeeName string `json:"employee_name"`
	OptionID     uint   `json:"option_id"`
	OptionText   string `json:"option_text"`
}

type PollResultsResponse struct {
	PollID     uint               `json:"poll_id"`
	Question   string             `json:"question"`
	TotalVotes int                `json:"total_votes"`
	IsAnonymous bool              `json:"is_anonymous"`
	IsClosed   bool               `json:"is_closed"`
	MyVotes    []uint             `json:"my_votes"`
	Options    []PollOptionResult `json:"options"`
	Voters     []VoterInfo        `json:"voters,omitempty"`
}
