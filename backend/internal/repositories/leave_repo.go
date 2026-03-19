package repositories

import (
	"github.com/exn-hr/backend/internal/dto"
	"github.com/exn-hr/backend/internal/models"
	"gorm.io/gorm"
)

type LeaveRepository struct {
	db *gorm.DB
}

func NewLeaveRepository(db *gorm.DB) *LeaveRepository {
	return &LeaveRepository{db: db}
}

func (r *LeaveRepository) Create(req *models.LeaveRequest) error {
	return r.db.Create(req).Error
}

func (r *LeaveRepository) FindByID(id uint) (*models.LeaveRequest, error) {
	var req models.LeaveRequest
	err := r.db.Preload("Employee.User").Preload("Employee.Team").First(&req, id).Error
	return &req, err
}

func (r *LeaveRepository) Update(req *models.LeaveRequest) error {
	return r.db.Save(req).Error
}

func (r *LeaveRepository) Delete(id uint) error {
	return r.db.Delete(&models.LeaveRequest{}, id).Error
}

func (r *LeaveRepository) List(filter dto.LeaveFilter) ([]models.LeaveRequest, int64, error) {
	var requests []models.LeaveRequest
	var total int64

	q := r.db.Model(&models.LeaveRequest{}).Preload("Employee.User")

	if filter.EmployeeID != nil {
		q = q.Where("employee_id = ?", *filter.EmployeeID)
	}
	if filter.OverallStatus != "" {
		q = q.Where("overall_status = ?", filter.OverallStatus)
	}
	if filter.Type != "" {
		q = q.Where("type = ?", filter.Type)
	}
	if filter.Year > 0 {
		q = q.Where("EXTRACT(YEAR FROM created_at) = ?", filter.Year)
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

	err := q.Offset((page - 1) * size).Limit(size).Order("created_at DESC").Find(&requests).Error
	return requests, total, err
}

func (r *LeaveRepository) GetBalance(employeeID uint, year int) (*models.LeaveBalance, error) {
	var balance models.LeaveBalance
	err := r.db.Where("employee_id = ? AND year = ?", employeeID, year).First(&balance).Error
	return &balance, err
}

func (r *LeaveRepository) CreateBalance(balance *models.LeaveBalance) error {
	return r.db.Create(balance).Error
}

func (r *LeaveRepository) UpdateBalance(balance *models.LeaveBalance) error {
	return r.db.Save(balance).Error
}

// SumApprovedDays returns the total approved paid leave days for an employee in a year
func (r *LeaveRepository) SumApprovedDays(employeeID uint, year int) (float64, error) {
	var total float64
	err := r.db.Model(&models.LeaveRequest{}).
		Where("employee_id = ? AND type = ? AND overall_status = ? AND EXTRACT(YEAR FROM created_at) = ?",
			employeeID, "paid", "approved", year).
		Select("COALESCE(SUM(days), 0)").Scan(&total).Error
	return total, err
}
