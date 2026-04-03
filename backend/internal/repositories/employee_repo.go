package repositories

import (
	"github.com/exn-hr/backend/internal/dto"
	"github.com/exn-hr/backend/internal/models"
	"gorm.io/gorm"
)

type EmployeeRepository struct {
	db *gorm.DB
}

func NewEmployeeRepository(db *gorm.DB) *EmployeeRepository {
	return &EmployeeRepository{db: db}
}

func (r *EmployeeRepository) CreateUser(user *models.User) error {
	return r.db.Create(user).Error
}

func (r *EmployeeRepository) CreateEmployee(emp *models.Employee) error {
	return r.db.Create(emp).Error
}

func (r *EmployeeRepository) FindByID(id uint) (*models.Employee, error) {
	var emp models.Employee
	err := r.db.Preload("User").Preload("Department").Preload("Manager").Preload("Dependents").First(&emp, id).Error
	return &emp, err
}

func (r *EmployeeRepository) FindByUserID(userID uint) (*models.Employee, error) {
	var emp models.Employee
	err := r.db.Preload("User").Preload("Department").Preload("Manager").Preload("Dependents").Where("user_id = ?", userID).First(&emp).Error
	return &emp, err
}

func (r *EmployeeRepository) UpdateEmployee(emp *models.Employee) error {
	return r.db.Save(emp).Error
}

func (r *EmployeeRepository) UpdateUser(user *models.User) error {
	return r.db.Save(user).Error
}

func (r *EmployeeRepository) List(filter dto.EmployeeFilter) ([]models.Employee, int64, error) {
	var employees []models.Employee
	var total int64

	q := r.db.Model(&models.Employee{}).
		Joins("JOIN users ON users.id = employees.user_id").
		Preload("User").Preload("Department")

	if filter.DepartmentID != nil {
		q = q.Where("employees.department_id = ?", *filter.DepartmentID)
	}
	if filter.Role != "" {
		q = q.Where("users.role = ?", filter.Role)
	}
	if filter.Search != "" {
		q = q.Where("employees.full_name ILIKE ? OR users.email ILIKE ?",
			"%"+filter.Search+"%", "%"+filter.Search+"%")
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

	err := q.Offset((page - 1) * size).Limit(size).Order("employees.id ASC").Find(&employees).Error
	return employees, total, err
}

func (r *EmployeeRepository) GetAllowances(employeeID uint) ([]models.EmployeeAllowance, error) {
	var allowances []models.EmployeeAllowance
	err := r.db.Preload("Allowance").Where("employee_id = ?", employeeID).Find(&allowances).Error
	return allowances, err
}

func (r *EmployeeRepository) SetAllowance(ea *models.EmployeeAllowance) error {
	var existing models.EmployeeAllowance
	err := r.db.Where("employee_id = ? AND allowance_id = ?", ea.EmployeeID, ea.AllowanceID).First(&existing).Error
	if err == gorm.ErrRecordNotFound {
		return r.db.Create(ea).Error
	}
	existing.Amount = ea.Amount
	return r.db.Save(&existing).Error
}

func (r *EmployeeRepository) DeleteAllowance(employeeID, allowanceID uint) error {
	return r.db.Where("employee_id = ? AND allowance_id = ?", employeeID, allowanceID).
		Delete(&models.EmployeeAllowance{}).Error
}

// --- Dependent ---

func (r *EmployeeRepository) CreateDependent(dep *models.Dependent) error {
	return r.db.Create(dep).Error
}

func (r *EmployeeRepository) FindDependentByID(id uint) (*models.Dependent, error) {
	var dep models.Dependent
	err := r.db.First(&dep, id).Error
	return &dep, err
}

func (r *EmployeeRepository) ListDependents(employeeID uint) ([]models.Dependent, error) {
	var deps []models.Dependent
	err := r.db.Where("employee_id = ?", employeeID).Find(&deps).Error
	return deps, err
}

func (r *EmployeeRepository) UpdateDependent(dep *models.Dependent) error {
	return r.db.Save(dep).Error
}

func (r *EmployeeRepository) DeleteDependent(id uint) error {
	return r.db.Delete(&models.Dependent{}, id).Error
}
