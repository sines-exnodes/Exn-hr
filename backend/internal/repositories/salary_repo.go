package repositories

import (
	"github.com/exn-hr/backend/internal/models"
	"gorm.io/gorm"
)

type SalaryRepository struct {
	db *gorm.DB
}

func NewSalaryRepository(db *gorm.DB) *SalaryRepository {
	return &SalaryRepository{db: db}
}

// --- Allowance Types ---

func (r *SalaryRepository) CreateAllowanceType(a *models.Allowance) error {
	return r.db.Create(a).Error
}

func (r *SalaryRepository) ListAllowanceTypes() ([]models.Allowance, error) {
	var allowances []models.Allowance
	err := r.db.Order("id ASC").Find(&allowances).Error
	return allowances, err
}

func (r *SalaryRepository) DeleteAllowanceType(id uint) error {
	return r.db.Delete(&models.Allowance{}, id).Error
}

// --- Bonuses ---

func (r *SalaryRepository) CreateBonus(b *models.Bonus) error {
	return r.db.Create(b).Error
}

func (r *SalaryRepository) SumBonuses(employeeID uint, month, year int) (float64, error) {
	var total float64
	err := r.db.Model(&models.Bonus{}).
		Where("employee_id = ? AND month = ? AND year = ?", employeeID, month, year).
		Select("COALESCE(SUM(amount), 0)").Scan(&total).Error
	return total, err
}

func (r *SalaryRepository) ListBonuses(employeeID uint, month, year int) ([]models.Bonus, error) {
	var bonuses []models.Bonus
	err := r.db.Where("employee_id = ? AND month = ? AND year = ?", employeeID, month, year).Find(&bonuses).Error
	return bonuses, err
}

// --- Salary Advances ---

func (r *SalaryRepository) CreateSalaryAdvance(sa *models.SalaryAdvance) error {
	return r.db.Create(sa).Error
}

func (r *SalaryRepository) SumSalaryAdvances(employeeID uint, month, year int) (float64, error) {
	var total float64
	err := r.db.Model(&models.SalaryAdvance{}).
		Where("employee_id = ? AND month = ? AND year = ? AND status = ?", employeeID, month, year, "approved").
		Select("COALESCE(SUM(amount), 0)").Scan(&total).Error
	return total, err
}

// --- Salary Records ---

func (r *SalaryRepository) UpsertSalaryRecord(record *models.SalaryRecord) error {
	var existing models.SalaryRecord
	err := r.db.Where("employee_id = ? AND month = ? AND year = ?",
		record.EmployeeID, record.Month, record.Year).First(&existing).Error
	if err == gorm.ErrRecordNotFound {
		return r.db.Create(record).Error
	}
	record.ID = existing.ID
	return r.db.Save(record).Error
}

func (r *SalaryRepository) FindSalaryRecord(employeeID uint, month, year int) (*models.SalaryRecord, error) {
	var record models.SalaryRecord
	err := r.db.Preload("Employee.User").
		Where("employee_id = ? AND month = ? AND year = ?", employeeID, month, year).
		First(&record).Error
	return &record, err
}

func (r *SalaryRepository) ListSalaryRecords(month, year int, page, size int) ([]models.SalaryRecord, int64, error) {
	var records []models.SalaryRecord
	var total int64

	q := r.db.Model(&models.SalaryRecord{}).Preload("Employee.User")
	if month > 0 {
		q = q.Where("month = ?", month)
	}
	if year > 0 {
		q = q.Where("year = ?", year)
	}

	q.Count(&total)

	if page < 1 {
		page = 1
	}
	if size < 1 {
		size = 20
	}

	err := q.Offset((page - 1) * size).Limit(size).Order("employee_id ASC").Find(&records).Error
	return records, total, err
}

func (r *SalaryRepository) ConfirmSalaryRecord(id uint) error {
	return r.db.Model(&models.SalaryRecord{}).Where("id = ?", id).Update("status", "confirmed").Error
}

// GetEmployeeAllowancesTotal returns the sum of all allowances for an employee
func (r *SalaryRepository) GetEmployeeAllowancesTotal(employeeID uint) (float64, error) {
	var total float64
	err := r.db.Model(&models.EmployeeAllowance{}).
		Where("employee_id = ?", employeeID).
		Select("COALESCE(SUM(amount), 0)").Scan(&total).Error
	return total, err
}
