package services

import (
	"errors"
	"fmt"
	"time"

	"github.com/exn-hr/backend/internal/dto"
	"github.com/exn-hr/backend/internal/models"
	"github.com/exn-hr/backend/internal/repositories"
)

type AnnouncementService struct {
	announcementRepo *repositories.AnnouncementRepository
	projectRepo      *repositories.ProjectRepository
	empRepo          *repositories.EmployeeRepository
	userRepo         *repositories.UserRepository
	notifSvc         *NotificationService
}

func NewAnnouncementService(
	announcementRepo *repositories.AnnouncementRepository,
	projectRepo *repositories.ProjectRepository,
	empRepo *repositories.EmployeeRepository,
	userRepo *repositories.UserRepository,
	notifSvc *NotificationService,
) *AnnouncementService {
	return &AnnouncementService{
		announcementRepo: announcementRepo,
		projectRepo:      projectRepo,
		empRepo:          empRepo,
		userRepo:         userRepo,
		notifSvc:         notifSvc,
	}
}

// --- Announcement CRUD ---

func (s *AnnouncementService) Create(userID uint, req dto.CreateAnnouncementReq) (*models.Announcement, error) {
	emp, err := s.empRepo.FindByUserID(userID)
	if err != nil {
		return nil, errors.New("employee profile not found")
	}

	// Validate target_id required for team/project target types
	if req.TargetType != models.AnnouncementTargetAll && req.TargetID == nil {
		return nil, fmt.Errorf("target_id is required when target_type is '%s'", req.TargetType)
	}

	announcement := &models.Announcement{
		Title:      req.Title,
		Content:    req.Content,
		TargetType: req.TargetType,
		TargetID:   req.TargetID,
		IsPinned:   req.IsPinned,
		ExpiresAt:  req.ExpiresAt,
		CreatedBy:  emp.ID,
	}

	if err := s.announcementRepo.Create(announcement); err != nil {
		return nil, errors.New("failed to create announcement")
	}

	// Create poll if provided
	if req.Poll != nil {
		if err := s.createPoll(announcement.ID, req.Poll); err != nil {
			return nil, err
		}
	}

	// Send notifications to target audience (BR-029)
	go s.sendAnnouncementNotifications(announcement)

	// Reload with poll
	return s.announcementRepo.FindByID(announcement.ID)
}

func (s *AnnouncementService) createPoll(announcementID uint, req *dto.CreatePollReq) error {
	if len(req.Options) < 2 {
		return errors.New("poll must have at least 2 options")
	}

	poll := &models.Poll{
		AnnouncementID: announcementID,
		Question:       req.Question,
		IsMultiChoice:  req.IsMultiChoice,
		IsAnonymous:    req.IsAnonymous,
		Deadline:       req.Deadline,
		Status:         models.PollStatusActive,
	}

	if err := s.announcementRepo.CreatePoll(poll); err != nil {
		return errors.New("failed to create poll")
	}

	for _, optReq := range req.Options {
		opt := &models.PollOption{
			PollID:       poll.ID,
			Text:         optReq.Text,
			DisplayOrder: optReq.DisplayOrder,
		}
		if err := s.announcementRepo.CreatePollOption(opt); err != nil {
			return errors.New("failed to create poll option")
		}
	}

	return nil
}

// sendAnnouncementNotifications sends push notifications to all users in the target audience
func (s *AnnouncementService) sendAnnouncementNotifications(a *models.Announcement) {
	// Get all users
	users, _, err := s.userRepo.List(1, 1000)
	if err != nil {
		return
	}

	refID := a.ID

	for _, user := range users {
		shouldNotify := false

		switch a.TargetType {
		case models.AnnouncementTargetAll:
			shouldNotify = true
		case models.AnnouncementTargetTeam:
			if a.TargetID != nil {
				emp, err := s.empRepo.FindByUserID(user.ID)
				if err == nil && emp.DepartmentID != nil && *emp.DepartmentID == *a.TargetID {
					shouldNotify = true
				}
			}
		case models.AnnouncementTargetProject:
			if a.TargetID != nil {
				emp, err := s.empRepo.FindByUserID(user.ID)
				if err == nil {
					_, memberErr := s.projectRepo.FindMember(*a.TargetID, emp.ID)
					shouldNotify = memberErr == nil
				}
			}
		}

		if shouldNotify {
			s.notifSvc.Send(
				user.ID,
				"New Announcement: "+a.Title,
				a.Content,
				"announcement",
				&refID,
				"announcement",
			)
		}
	}
}

func (s *AnnouncementService) GetByID(id uint) (*models.Announcement, error) {
	a, err := s.announcementRepo.FindByID(id)
	if err != nil {
		return nil, errors.New("announcement not found")
	}
	return a, nil
}

func (s *AnnouncementService) List(filter dto.AnnouncementFilter) ([]models.Announcement, int64, error) {
	return s.announcementRepo.List(filter)
}

func (s *AnnouncementService) ListForMe(userID uint, page, size int) ([]models.Announcement, int64, error) {
	emp, err := s.empRepo.FindByUserID(userID)
	if err != nil {
		return nil, 0, errors.New("employee profile not found")
	}

	// Get department ID
	var departmentID *uint
	if emp.DepartmentID != nil {
		departmentID = emp.DepartmentID
	}

	// Get project IDs
	projectIDs, _ := s.projectRepo.GetProjectIDsForEmployee(emp.ID)

	return s.announcementRepo.ListForEmployee(departmentID, projectIDs, page, size)
}

func (s *AnnouncementService) Update(id uint, req dto.UpdateAnnouncementReq) (*models.Announcement, error) {
	a, err := s.announcementRepo.FindByID(id)
	if err != nil {
		return nil, errors.New("announcement not found")
	}

	if req.Title != "" {
		a.Title = req.Title
	}
	if req.Content != "" {
		a.Content = req.Content
	}
	if req.TargetType != "" {
		a.TargetType = req.TargetType
	}
	if req.TargetID != nil {
		a.TargetID = req.TargetID
	}
	if req.IsPinned != nil {
		a.IsPinned = *req.IsPinned
	}
	if req.ExpiresAt != nil {
		a.ExpiresAt = req.ExpiresAt
	}

	if err := s.announcementRepo.Update(a); err != nil {
		return nil, errors.New("failed to update announcement")
	}

	return a, nil
}

func (s *AnnouncementService) Delete(id uint) error {
	if _, err := s.announcementRepo.FindByID(id); err != nil {
		return errors.New("announcement not found")
	}
	return s.announcementRepo.Delete(id)
}

// --- Poll Vote ---

func (s *AnnouncementService) Vote(pollID uint, userID uint, req dto.SubmitVoteReq) error {
	poll, err := s.announcementRepo.FindPollByID(pollID)
	if err != nil {
		return errors.New("poll not found")
	}

	// BR-026: Reject votes past deadline
	if poll.Deadline != nil && time.Now().After(*poll.Deadline) {
		return errors.New("voting deadline has passed")
	}

	if poll.Status == models.PollStatusClosed {
		return errors.New("poll is closed")
	}

	emp, err := s.empRepo.FindByUserID(userID)
	if err != nil {
		return errors.New("employee profile not found")
	}

	// Check if already voted
	existingVotes, err := s.announcementRepo.FindVotesByEmployee(pollID, emp.ID)
	if err == nil && len(existingVotes) > 0 {
		return errors.New("you have already voted in this poll")
	}

	// BR-023: Single choice: only 1 option allowed
	if !poll.IsMultiChoice && len(req.OptionIDs) != 1 {
		return errors.New("this is a single-choice poll: exactly one option must be selected")
	}

	// Validate all option IDs belong to this poll
	validOptionIDs := make(map[uint]bool)
	for _, opt := range poll.Options {
		validOptionIDs[opt.ID] = true
	}

	for _, optID := range req.OptionIDs {
		if !validOptionIDs[optID] {
			return fmt.Errorf("option %d does not belong to this poll", optID)
		}
	}

	// Record votes
	now := time.Now()
	for _, optID := range req.OptionIDs {
		vote := &models.PollVote{
			PollOptionID: optID,
			EmployeeID:   emp.ID,
			VotedAt:      now,
		}
		if err := s.announcementRepo.CreateVote(vote); err != nil {
			return errors.New("failed to record vote")
		}
		// Increment denormalized counter
		_ = s.announcementRepo.IncrementOptionVoteCount(optID)
	}

	return nil
}

// GetPollResults returns poll results for the given poll ID
// BR-027: if employee hasn't voted, results (percentages) are not shown
// BR-025: anonymous polls don't expose voter identities
func (s *AnnouncementService) GetPollResults(pollID uint, userID uint, isAdminOrHR bool) (*dto.PollResultsResponse, error) {
	poll, err := s.announcementRepo.FindPollByID(pollID)
	if err != nil {
		return nil, errors.New("poll not found")
	}

	emp, err := s.empRepo.FindByUserID(userID)
	if err != nil {
		return nil, errors.New("employee profile not found")
	}

	// Check if user has voted
	myVotes, _ := s.announcementRepo.FindVotesByEmployee(pollID, emp.ID)
	hasVoted := len(myVotes) > 0

	myVoteOptionIDs := make([]uint, 0, len(myVotes))
	for _, v := range myVotes {
		myVoteOptionIDs = append(myVoteOptionIDs, v.PollOptionID)
	}

	isClosed := poll.Status == models.PollStatusClosed ||
		(poll.Deadline != nil && time.Now().After(*poll.Deadline))

	// Calculate total votes
	totalVotes := 0
	for _, opt := range poll.Options {
		totalVotes += opt.VoteCount
	}

	// BR-027: Non-voted users see options without results
	// Admins/HR can always see results
	showResults := hasVoted || isClosed || isAdminOrHR

	options := make([]dto.PollOptionResult, 0, len(poll.Options))
	for _, opt := range poll.Options {
		r := dto.PollOptionResult{
			ID:   opt.ID,
			Text: opt.Text,
		}
		if showResults {
			r.VoteCount = opt.VoteCount
			if totalVotes > 0 {
				r.Percentage = float64(opt.VoteCount) / float64(totalVotes) * 100
			}
		}
		options = append(options, r)
	}

	result := &dto.PollResultsResponse{
		PollID:      poll.ID,
		Question:    poll.Question,
		TotalVotes:  0,
		IsAnonymous: poll.IsAnonymous,
		IsClosed:    isClosed,
		MyVotes:     myVoteOptionIDs,
		Options:     options,
	}

	if showResults {
		result.TotalVotes = totalVotes
	}

	// BR-025: only populate voters for named polls and only for Admin/HR
	if isAdminOrHR && !poll.IsAnonymous {
		voters, err := s.announcementRepo.GetPollVoters(pollID)
		if err == nil {
			voterInfos := make([]dto.VoterInfo, 0, len(voters))
			for _, v := range voters {
				info := dto.VoterInfo{
					EmployeeID: v.EmployeeID,
					OptionID:   v.PollOptionID,
				}
				if v.Employee != nil {
					info.EmployeeName = v.Employee.FullName
				}
				if v.PollOption != nil {
					info.OptionText = v.PollOption.Text
				}
				voterInfos = append(voterInfos, info)
			}
			result.Voters = voterInfos
		}
	}

	return result, nil
}
