package repositories

import (
	"github.com/exn-hr/backend/internal/dto"
	"github.com/exn-hr/backend/internal/models"
	"gorm.io/gorm"
)

type OvertimeRepository struct {
	db *gorm.DB
}

func NewOvertimeRepository(db *gorm.DB) *OvertimeRepository {
	return &OvertimeRepository{db: db}
}

func (r *OvertimeRepository) Create(req *models.OvertimeRequest) error {
	return r.db.Create(req).Error
}

func (r *OvertimeRepository) FindByID(id uint) (*models.OvertimeRequest, error) {
	var req models.OvertimeRequest
	err := r.db.Preload("Employee.User").Preload("Employee.Team").First(&req, id).Error
	return &req, err
}

func (r *OvertimeRepository) Update(req *models.OvertimeRequest) error {
	return r.db.Save(req).Error
}

func (r *OvertimeRepository) Delete(id uint) error {
	return r.db.Delete(&models.OvertimeRequest{}, id).Error
}

func (r *OvertimeRepository) List(filter dto.OTFilter) ([]models.OvertimeRequest, int64, error) {
	var requests []models.OvertimeRequest
	var total int64

	q := r.db.Model(&models.OvertimeRequest{}).Preload("Employee.User")

	if filter.EmployeeID != nil {
		q = q.Where("employee_id = ?", *filter.EmployeeID)
	}
	if filter.OverallStatus != "" {
		q = q.Where("overall_status = ?", filter.OverallStatus)
	}
	if filter.Month > 0 {
		q = q.Where("EXTRACT(MONTH FROM created_at) = ?", filter.Month)
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

// SumApprovedHours returns the total approved OT hours for an employee in a given month/year
func (r *OvertimeRepository) SumApprovedHours(employeeID uint, month, year int) (float64, error) {
	var total float64
	err := r.db.Model(&models.OvertimeRequest{}).
		Where("employee_id = ? AND overall_status = ? AND EXTRACT(MONTH FROM created_at) = ? AND EXTRACT(YEAR FROM created_at) = ?",
			employeeID, "approved", month, year).
		Select("COALESCE(SUM(hours), 0)").Scan(&total).Error
	return total, err
}
