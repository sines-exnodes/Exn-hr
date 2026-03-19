package services

import (
	"errors"

	"github.com/exn-hr/backend/internal/dto"
	"github.com/exn-hr/backend/internal/models"
	"github.com/exn-hr/backend/internal/repositories"
)

type TeamService struct {
	teamRepo *repositories.TeamRepository
	deptRepo *repositories.DepartmentRepository
}

func NewTeamService(teamRepo *repositories.TeamRepository, deptRepo *repositories.DepartmentRepository) *TeamService {
	return &TeamService{teamRepo: teamRepo, deptRepo: deptRepo}
}

func (s *TeamService) Create(req dto.CreateTeamReq) (*models.Team, error) {
	// Verify department exists
	if _, err := s.deptRepo.FindByID(req.DepartmentID); err != nil {
		return nil, errors.New("department not found")
	}

	team := &models.Team{
		Name:         req.Name,
		DepartmentID: req.DepartmentID,
		LeaderID:     req.LeaderID,
	}
	if err := s.teamRepo.Create(team); err != nil {
		return nil, errors.New("failed to create team")
	}
	return team, nil
}

func (s *TeamService) GetByID(id uint) (*models.Team, error) {
	team, err := s.teamRepo.FindByID(id)
	if err != nil {
		return nil, errors.New("team not found")
	}
	return team, nil
}

func (s *TeamService) Update(id uint, req dto.UpdateTeamReq) (*models.Team, error) {
	team, err := s.teamRepo.FindByID(id)
	if err != nil {
		return nil, errors.New("team not found")
	}
	if req.Name != "" {
		team.Name = req.Name
	}
	if req.DepartmentID != nil {
		if _, err := s.deptRepo.FindByID(*req.DepartmentID); err != nil {
			return nil, errors.New("department not found")
		}
		team.DepartmentID = *req.DepartmentID
	}
	if req.LeaderID != nil {
		team.LeaderID = req.LeaderID
	}
	if err := s.teamRepo.Update(team); err != nil {
		return nil, errors.New("failed to update team")
	}
	return team, nil
}

func (s *TeamService) Delete(id uint) error {
	if _, err := s.teamRepo.FindByID(id); err != nil {
		return errors.New("team not found")
	}
	return s.teamRepo.Delete(id)
}

func (s *TeamService) List() ([]models.Team, error) {
	return s.teamRepo.List()
}

func (s *TeamService) ListByDepartment(departmentID uint) ([]models.Team, error) {
	return s.teamRepo.ListByDepartment(departmentID)
}
