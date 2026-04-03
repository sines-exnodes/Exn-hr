package services

import (
	"errors"

	"github.com/exn-hr/backend/internal/dto"
	"github.com/exn-hr/backend/internal/models"
	"github.com/exn-hr/backend/internal/repositories"
)

type ProjectService struct {
	projectRepo *repositories.ProjectRepository
	empRepo     *repositories.EmployeeRepository
}

func NewProjectService(projectRepo *repositories.ProjectRepository, empRepo *repositories.EmployeeRepository) *ProjectService {
	return &ProjectService{projectRepo: projectRepo, empRepo: empRepo}
}

func (s *ProjectService) CreateProject(req dto.CreateProjectReq) (*models.Project, error) {
	status := req.Status
	if status == "" {
		status = "active"
	}
	project := &models.Project{
		Name:        req.Name,
		Description: req.Description,
		Status:      status,
		StartDate:   req.StartDate,
		EndDate:     req.EndDate,
	}
	if err := s.projectRepo.CreateProject(project); err != nil {
		return nil, errors.New("failed to create project")
	}
	return project, nil
}

func (s *ProjectService) ListProjects(filter dto.ProjectFilter) ([]models.Project, int64, error) {
	return s.projectRepo.ListProjects(filter)
}

func (s *ProjectService) GetMyProjects(userID uint, filter dto.ProjectFilter) ([]models.Project, int64, error) {
	emp, err := s.empRepo.FindByUserID(userID)
	if err != nil {
		return nil, 0, errors.New("employee profile not found")
	}
	projectIDs, err := s.projectRepo.GetProjectIDsForEmployee(emp.ID)
	if err != nil {
		return nil, 0, errors.New("failed to fetch employee projects")
	}
	return s.projectRepo.ListProjectsByIDs(projectIDs, filter)
}

func (s *ProjectService) GetUpcomingMilestones(userID uint, days int) ([]models.Milestone, error) {
	if days <= 0 {
		days = 7
	}
	emp, err := s.empRepo.FindByUserID(userID)
	if err != nil {
		return nil, errors.New("employee profile not found")
	}
	projectIDs, err := s.projectRepo.GetProjectIDsForEmployee(emp.ID)
	if err != nil {
		return nil, errors.New("failed to fetch employee projects")
	}
	return s.projectRepo.GetUpcomingMilestones(projectIDs, days)
}

func (s *ProjectService) ToggleMilestoneItem(milestoneID, itemID uint) (*models.MilestoneItem, error) {
	item, err := s.projectRepo.GetMilestoneItem(itemID)
	if err != nil {
		return nil, errors.New("milestone item not found")
	}
	if item.MilestoneID != milestoneID {
		return nil, errors.New("item does not belong to the given milestone")
	}
	item.IsCompleted = !item.IsCompleted
	if err := s.projectRepo.UpdateMilestoneItem(item); err != nil {
		return nil, errors.New("failed to update milestone item")
	}
	return item, nil
}

func (s *ProjectService) GetProject(id uint) (*models.Project, error) {
	project, err := s.projectRepo.GetProjectByID(id)
	if err != nil {
		return nil, errors.New("project not found")
	}
	return project, nil
}

func (s *ProjectService) UpdateProject(id uint, req dto.UpdateProjectReq) (*models.Project, error) {
	project, err := s.projectRepo.GetProjectByID(id)
	if err != nil {
		return nil, errors.New("project not found")
	}

	if req.Name != nil {
		project.Name = *req.Name
	}
	if req.Description != nil {
		project.Description = *req.Description
	}
	if req.Status != nil {
		project.Status = *req.Status
	}
	if req.StartDate != nil {
		project.StartDate = *req.StartDate
	}
	if req.EndDate != nil {
		project.EndDate = *req.EndDate
	}

	if err := s.projectRepo.UpdateProject(project); err != nil {
		return nil, errors.New("failed to update project")
	}
	return project, nil
}

func (s *ProjectService) DeleteProject(id uint) error {
	if _, err := s.projectRepo.GetProjectByID(id); err != nil {
		return errors.New("project not found")
	}
	return s.projectRepo.DeleteProject(id)
}

func (s *ProjectService) AddMember(projectID uint, req dto.AssignMemberReq) (*models.ProjectAssignment, error) {
	if _, err := s.projectRepo.GetProjectByID(projectID); err != nil {
		return nil, errors.New("project not found")
	}

	alloc := req.AllocationPercentage
	if alloc == 0 {
		alloc = 100
	}

	assignment := &models.ProjectAssignment{
		ProjectID:            projectID,
		EmployeeID:           req.EmployeeID,
		Role:                 req.Role,
		AllocationPercentage: alloc,
		StartDate:            req.StartDate,
		EndDate:              req.EndDate,
	}
	if err := s.projectRepo.AddAssignment(assignment); err != nil {
		return nil, errors.New("failed to add member (may already be assigned)")
	}
	return assignment, nil
}

func (s *ProjectService) UpdateMember(projectID, employeeID uint, req dto.UpdateAssignmentReq) error {
	assignment, err := s.projectRepo.FindAssignment(projectID, employeeID)
	if err != nil {
		return errors.New("assignment not found")
	}

	if req.Role != nil {
		assignment.Role = *req.Role
	}
	if req.AllocationPercentage != nil {
		assignment.AllocationPercentage = *req.AllocationPercentage
	}
	if req.StartDate != nil {
		assignment.StartDate = *req.StartDate
	}
	if req.EndDate != nil {
		assignment.EndDate = *req.EndDate
	}

	return s.projectRepo.UpdateAssignment(assignment)
}

func (s *ProjectService) RemoveMember(projectID, employeeID uint) error {
	return s.projectRepo.RemoveAssignment(projectID, employeeID)
}

func (s *ProjectService) GetProjectMembers(projectID uint) ([]models.ProjectAssignment, error) {
	return s.projectRepo.GetAssignmentsByProject(projectID)
}

func (s *ProjectService) GetEmployeeWorkload(employeeID uint) ([]models.ProjectAssignment, error) {
	return s.projectRepo.GetAssignmentsByEmployee(employeeID)
}

func (s *ProjectService) GetWorkloadOverview() (map[string]interface{}, error) {
	totalEmployees, err := s.projectRepo.CountEmployees()
	if err != nil {
		return nil, errors.New("failed to count employees")
	}

	totalProjects, err := s.projectRepo.CountProjects()
	if err != nil {
		return nil, errors.New("failed to count projects")
	}

	employeesByDept, err := s.projectRepo.CountEmployeesByDepartment()
	if err != nil {
		return nil, errors.New("failed to count employees by department")
	}

	// Find overloaded employees (total allocation > 100%)
	allAssignments, err := s.projectRepo.GetWorkloadMatrix()
	if err != nil {
		return nil, errors.New("failed to get workload data")
	}

	type employeeLoad struct {
		EmployeeID   uint   `json:"employee_id"`
		EmployeeName string `json:"employee_name"`
		TotalAlloc   int    `json:"total_allocation"`
	}

	allocMap := make(map[uint]*employeeLoad)
	for _, a := range allAssignments {
		if _, ok := allocMap[a.EmployeeID]; !ok {
			name := ""
			if a.Employee != nil {
				name = a.Employee.FullName
			}
			allocMap[a.EmployeeID] = &employeeLoad{
				EmployeeID:   a.EmployeeID,
				EmployeeName: name,
			}
		}
		allocMap[a.EmployeeID].TotalAlloc += a.AllocationPercentage
	}

	var overloaded []employeeLoad
	for _, el := range allocMap {
		if el.TotalAlloc > 100 {
			overloaded = append(overloaded, *el)
		}
	}

	return map[string]interface{}{
		"total_employees":        totalEmployees,
		"total_projects":         totalProjects,
		"employees_by_department": employeesByDept,
		"overloaded_employees":   overloaded,
	}, nil
}

func (s *ProjectService) GetWorkloadMatrix() ([]models.ProjectAssignment, error) {
	return s.projectRepo.GetWorkloadMatrix()
}

// ---- Milestone methods ----

func (s *ProjectService) ListMilestones(projectID uint) ([]models.Milestone, error) {
	return s.projectRepo.ListMilestones(projectID)
}

func (s *ProjectService) CreateMilestone(projectID uint, req dto.CreateMilestoneReq) (*models.Milestone, error) {
	if _, err := s.projectRepo.GetProjectByID(projectID); err != nil {
		return nil, errors.New("project not found")
	}

	milestone := &models.Milestone{
		ProjectID:   projectID,
		Title:       req.Title,
		Description: req.Description,
		Deadline:    req.Deadline,
		Status:      "upcoming",
	}

	// Convert items
	for _, item := range req.Items {
		milestone.Items = append(milestone.Items, models.MilestoneItem{
			Content:      item.Content,
			DisplayOrder: item.DisplayOrder,
		})
	}

	if err := s.projectRepo.CreateMilestone(milestone); err != nil {
		return nil, errors.New("failed to create milestone")
	}

	// Re-fetch with preloaded items
	return s.projectRepo.GetMilestone(milestone.ID)
}

func (s *ProjectService) UpdateMilestone(id uint, req dto.UpdateMilestoneReq) (*models.Milestone, error) {
	milestone, err := s.projectRepo.GetMilestone(id)
	if err != nil {
		return nil, errors.New("milestone not found")
	}

	if req.Title != nil {
		milestone.Title = *req.Title
	}
	if req.Description != nil {
		milestone.Description = *req.Description
	}
	if req.Deadline != nil {
		milestone.Deadline = *req.Deadline
	}
	if req.Status != nil {
		milestone.Status = *req.Status
	}

	if err := s.projectRepo.UpdateMilestone(milestone); err != nil {
		return nil, errors.New("failed to update milestone")
	}

	// Replace items if provided
	if req.Items != nil {
		if err := s.projectRepo.DeleteMilestoneItems(id); err != nil {
			return nil, errors.New("failed to update milestone items")
		}
		var newItems []models.MilestoneItem
		for _, item := range req.Items {
			newItems = append(newItems, models.MilestoneItem{
				MilestoneID:  id,
				Content:      item.Content,
				IsCompleted:  item.IsCompleted,
				DisplayOrder: item.DisplayOrder,
			})
		}
		if err := s.projectRepo.CreateMilestoneItems(newItems); err != nil {
			return nil, errors.New("failed to create milestone items")
		}
	}

	return s.projectRepo.GetMilestone(id)
}

func (s *ProjectService) DeleteMilestone(id uint) error {
	if _, err := s.projectRepo.GetMilestone(id); err != nil {
		return errors.New("milestone not found")
	}
	return s.projectRepo.DeleteMilestone(id)
}
