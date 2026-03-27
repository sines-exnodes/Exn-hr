package repositories

import (
	"github.com/exn-hr/backend/internal/models"
	"gorm.io/gorm"
)

type ProjectRepository struct {
	db *gorm.DB
}

func NewProjectRepository(db *gorm.DB) *ProjectRepository {
	return &ProjectRepository{db: db}
}

func (r *ProjectRepository) CreateProject(project *models.Project) error {
	return r.db.Create(project).Error
}

func (r *ProjectRepository) ListProjects() ([]models.Project, error) {
	var projects []models.Project
	err := r.db.
		Preload("Assignments.Employee.User").
		Preload("Assignments.Employee.Team.Department").
		Find(&projects).Error
	return projects, err
}

func (r *ProjectRepository) GetProjectByID(id uint) (*models.Project, error) {
	var project models.Project
	err := r.db.
		Preload("Assignments.Employee.User").
		Preload("Assignments.Employee.Team.Department").
		First(&project, id).Error
	return &project, err
}

func (r *ProjectRepository) UpdateProject(project *models.Project) error {
	return r.db.Save(project).Error
}

func (r *ProjectRepository) DeleteProject(id uint) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("project_id = ?", id).Delete(&models.ProjectAssignment{}).Error; err != nil {
			return err
		}
		return tx.Delete(&models.Project{}, id).Error
	})
}

func (r *ProjectRepository) AddAssignment(assignment *models.ProjectAssignment) error {
	return r.db.Create(assignment).Error
}

func (r *ProjectRepository) UpdateAssignment(assignment *models.ProjectAssignment) error {
	return r.db.Save(assignment).Error
}

func (r *ProjectRepository) RemoveAssignment(projectID, employeeID uint) error {
	return r.db.Where("project_id = ? AND employee_id = ?", projectID, employeeID).
		Delete(&models.ProjectAssignment{}).Error
}

func (r *ProjectRepository) GetAssignmentsByProject(projectID uint) ([]models.ProjectAssignment, error) {
	var assignments []models.ProjectAssignment
	err := r.db.
		Preload("Employee.User").
		Preload("Employee.Team.Department").
		Where("project_id = ?", projectID).
		Find(&assignments).Error
	return assignments, err
}

func (r *ProjectRepository) GetAssignmentsByEmployee(employeeID uint) ([]models.ProjectAssignment, error) {
	var assignments []models.ProjectAssignment
	err := r.db.
		Preload("Project").
		Where("employee_id = ?", employeeID).
		Find(&assignments).Error
	return assignments, err
}

func (r *ProjectRepository) GetWorkloadMatrix() ([]models.ProjectAssignment, error) {
	var assignments []models.ProjectAssignment
	err := r.db.
		Preload("Project").
		Preload("Employee.User").
		Preload("Employee.Team.Department").
		Find(&assignments).Error
	return assignments, err
}

func (r *ProjectRepository) CountEmployeesByDepartment() (map[string]int, error) {
	type result struct {
		DepartmentName string
		Count          int
	}
	var results []result
	err := r.db.Model(&models.Employee{}).
		Joins("JOIN teams ON teams.id = employees.team_id").
		Joins("JOIN departments ON departments.id = teams.department_id").
		Select("departments.name as department_name, COUNT(employees.id) as count").
		Group("departments.name").
		Scan(&results).Error
	if err != nil {
		return nil, err
	}
	m := make(map[string]int)
	for _, r := range results {
		m[r.DepartmentName] = r.Count
	}
	return m, nil
}

func (r *ProjectRepository) FindAssignment(projectID, employeeID uint) (*models.ProjectAssignment, error) {
	var assignment models.ProjectAssignment
	err := r.db.Where("project_id = ? AND employee_id = ?", projectID, employeeID).First(&assignment).Error
	return &assignment, err
}

func (r *ProjectRepository) CountProjects() (int64, error) {
	var count int64
	err := r.db.Model(&models.Project{}).Count(&count).Error
	return count, err
}

func (r *ProjectRepository) CountEmployees() (int64, error) {
	var count int64
	err := r.db.Model(&models.Employee{}).Count(&count).Error
	return count, err
}
