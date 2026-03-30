package repositories

import (
	"time"

	"github.com/exn-hr/backend/internal/dto"
	"github.com/exn-hr/backend/internal/models"
	"gorm.io/gorm"
)

type AnnouncementRepository struct {
	db *gorm.DB
}

func NewAnnouncementRepository(db *gorm.DB) *AnnouncementRepository {
	return &AnnouncementRepository{db: db}
}

// --- Announcement CRUD ---

func (r *AnnouncementRepository) Create(a *models.Announcement) error {
	return r.db.Create(a).Error
}

func (r *AnnouncementRepository) FindByID(id uint) (*models.Announcement, error) {
	var a models.Announcement
	err := r.db.
		Preload("Creator").
		Preload("Poll.Options").
		First(&a, id).Error
	return &a, err
}

func (r *AnnouncementRepository) Update(a *models.Announcement) error {
	return r.db.Save(a).Error
}

func (r *AnnouncementRepository) Delete(id uint) error {
	return r.db.Delete(&models.Announcement{}, id).Error
}

func (r *AnnouncementRepository) List(filter dto.AnnouncementFilter) ([]models.Announcement, int64, error) {
	var announcements []models.Announcement
	var total int64

	q := r.db.Model(&models.Announcement{}).
		Preload("Creator").
		Preload("Poll.Options")

	if filter.TargetType != "" {
		q = q.Where("target_type = ?", filter.TargetType)
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

	// Pinned first, then by created_at DESC
	err := q.Offset((page-1)*size).Limit(size).
		Order("is_pinned DESC, created_at DESC").
		Find(&announcements).Error
	return announcements, total, err
}

// ListForEmployee returns non-expired announcements visible to an employee
// (target_type=all OR (target_type=team AND target_id=teamID) OR (target_type=project AND target_id IN projectIDs))
func (r *AnnouncementRepository) ListForEmployee(teamID *uint, projectIDs []uint, page, size int) ([]models.Announcement, int64, error) {
	var announcements []models.Announcement
	var total int64

	now := time.Now()

	q := r.db.Model(&models.Announcement{}).
		Preload("Creator").
		Preload("Poll.Options").
		Where("(expires_at IS NULL OR expires_at > ?)", now)

	// Build visibility condition
	if teamID != nil && len(projectIDs) > 0 {
		q = q.Where(
			"target_type = ? OR (target_type = ? AND target_id = ?) OR (target_type = ? AND target_id IN ?)",
			models.AnnouncementTargetAll,
			models.AnnouncementTargetTeam, *teamID,
			models.AnnouncementTargetProject, projectIDs,
		)
	} else if teamID != nil {
		q = q.Where(
			"target_type = ? OR (target_type = ? AND target_id = ?)",
			models.AnnouncementTargetAll,
			models.AnnouncementTargetTeam, *teamID,
		)
	} else if len(projectIDs) > 0 {
		q = q.Where(
			"target_type = ? OR (target_type = ? AND target_id IN ?)",
			models.AnnouncementTargetAll,
			models.AnnouncementTargetProject, projectIDs,
		)
	} else {
		q = q.Where("target_type = ?", models.AnnouncementTargetAll)
	}

	q.Count(&total)

	if page < 1 {
		page = 1
	}
	if size < 1 {
		size = 20
	}

	err := q.Offset((page-1)*size).Limit(size).
		Order("is_pinned DESC, created_at DESC").
		Find(&announcements).Error
	return announcements, total, err
}

// --- Poll ---

func (r *AnnouncementRepository) CreatePoll(poll *models.Poll) error {
	return r.db.Create(poll).Error
}

func (r *AnnouncementRepository) CreatePollOption(opt *models.PollOption) error {
	return r.db.Create(opt).Error
}

func (r *AnnouncementRepository) FindPollByID(id uint) (*models.Poll, error) {
	var poll models.Poll
	err := r.db.Preload("Options").First(&poll, id).Error
	return &poll, err
}

func (r *AnnouncementRepository) FindPollByAnnouncementID(announcementID uint) (*models.Poll, error) {
	var poll models.Poll
	err := r.db.Preload("Options").Where("announcement_id = ?", announcementID).First(&poll).Error
	return &poll, err
}

// --- Poll Vote ---

func (r *AnnouncementRepository) FindVotesByEmployee(pollID, employeeID uint) ([]models.PollVote, error) {
	var votes []models.PollVote
	err := r.db.
		Joins("JOIN poll_options ON poll_options.id = poll_votes.poll_option_id").
		Where("poll_options.poll_id = ? AND poll_votes.employee_id = ?", pollID, employeeID).
		Find(&votes).Error
	return votes, err
}

func (r *AnnouncementRepository) CreateVote(vote *models.PollVote) error {
	return r.db.Create(vote).Error
}

// IncrementOptionVoteCount atomically increments the vote_count for a poll option
func (r *AnnouncementRepository) IncrementOptionVoteCount(optionID uint) error {
	return r.db.Model(&models.PollOption{}).
		Where("id = ?", optionID).
		UpdateColumn("vote_count", gorm.Expr("vote_count + 1")).Error
}

// GetPollVoters returns all votes for a poll with voter info (for named polls)
func (r *AnnouncementRepository) GetPollVoters(pollID uint) ([]models.PollVote, error) {
	var votes []models.PollVote
	err := r.db.
		Preload("Employee").
		Preload("PollOption").
		Joins("JOIN poll_options ON poll_options.id = poll_votes.poll_option_id").
		Where("poll_options.poll_id = ?", pollID).
		Find(&votes).Error
	return votes, err
}

// FindPollOption finds a single poll option by ID
func (r *AnnouncementRepository) FindPollOption(optionID uint) (*models.PollOption, error) {
	var opt models.PollOption
	err := r.db.First(&opt, optionID).Error
	return &opt, err
}
