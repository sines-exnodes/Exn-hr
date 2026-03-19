package repositories

import (
	"github.com/exn-hr/backend/internal/dto"
	"github.com/exn-hr/backend/internal/models"
	"gorm.io/gorm"
)

type AttendanceRepository struct {
	db *gorm.DB
}

func NewAttendanceRepository(db *gorm.DB) *AttendanceRepository {
	return &AttendanceRepository{db: db}
}

func (r *AttendanceRepository) Create(record *models.AttendanceRecord) error {
	return r.db.Create(record).Error
}

func (r *AttendanceRepository) FindByID(id uint) (*models.AttendanceRecord, error) {
	var record models.AttendanceRecord
	err := r.db.Preload("Employee.User").First(&record, id).Error
	return &record, err
}

func (r *AttendanceRepository) FindActiveCheckIn(employeeID uint) (*models.AttendanceRecord, error) {
	var record models.AttendanceRecord
	err := r.db.Where("employee_id = ? AND status = ?", employeeID, "checked_in").
		Order("check_in_time DESC").First(&record).Error
	return &record, err
}

func (r *AttendanceRepository) Update(record *models.AttendanceRecord) error {
	return r.db.Save(record).Error
}

func (r *AttendanceRepository) List(filter dto.AttendanceFilter) ([]models.AttendanceRecord, int64, error) {
	var records []models.AttendanceRecord
	var total int64

	q := r.db.Model(&models.AttendanceRecord{}).Preload("Employee.User")

	if filter.EmployeeID != nil {
		q = q.Where("employee_id = ?", *filter.EmployeeID)
	}
	if filter.StartDate != "" {
		q = q.Where("DATE(check_in_time) >= ?", filter.StartDate)
	}
	if filter.EndDate != "" {
		q = q.Where("DATE(check_in_time) <= ?", filter.EndDate)
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

	err := q.Offset((page - 1) * size).Limit(size).Order("check_in_time DESC").Find(&records).Error
	return records, total, err
}

func (r *AttendanceRepository) GetOfficeLocations() ([]models.OfficeLocation, error) {
	var locations []models.OfficeLocation
	err := r.db.Preload("ApprovedWiFis").Find(&locations).Error
	return locations, err
}

func (r *AttendanceRepository) CreateOfficeLocation(loc *models.OfficeLocation) error {
	return r.db.Create(loc).Error
}

func (r *AttendanceRepository) AddApprovedWiFi(wifi *models.ApprovedWiFi) error {
	return r.db.Create(wifi).Error
}

func (r *AttendanceRepository) DeleteApprovedWiFi(id uint) error {
	return r.db.Delete(&models.ApprovedWiFi{}, id).Error
}

func (r *AttendanceRepository) GetApprovedSSIDs() ([]string, error) {
	var wifis []models.ApprovedWiFi
	err := r.db.Select("ssid").Find(&wifis).Error
	if err != nil {
		return nil, err
	}
	ssids := make([]string, len(wifis))
	for i, w := range wifis {
		ssids[i] = w.SSID
	}
	return ssids, nil
}
