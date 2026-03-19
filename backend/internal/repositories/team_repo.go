package repositories

import (
	"github.com/exn-hr/backend/internal/models"
	"gorm.io/gorm"
)

type TeamRepository struct {
	db *gorm.DB
}

func NewTeamRepository(db *gorm.DB) *TeamRepository {
	return &TeamRepository{db: db}
}

func (r *TeamRepository) Create(team *models.Team) error {
	return r.db.Create(team).Error
}

func (r *TeamRepository) FindByID(id uint) (*models.Team, error) {
	var team models.Team
	err := r.db.Preload("Department").Preload("Leader").Preload("Members").First(&team, id).Error
	return &team, err
}

func (r *TeamRepository) Update(team *models.Team) error {
	return r.db.Save(team).Error
}

func (r *TeamRepository) Delete(id uint) error {
	return r.db.Delete(&models.Team{}, id).Error
}

func (r *TeamRepository) ListByDepartment(departmentID uint) ([]models.Team, error) {
	var teams []models.Team
	err := r.db.Preload("Leader").Preload("Members").
		Where("department_id = ?", departmentID).
		Order("id ASC").
		Find(&teams).Error
	return teams, err
}

func (r *TeamRepository) List() ([]models.Team, error) {
	var teams []models.Team
	err := r.db.Preload("Department").Preload("Leader").Order("id ASC").Find(&teams).Error
	return teams, err
}
