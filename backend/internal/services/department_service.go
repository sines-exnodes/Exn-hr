package services

import (
	"errors"

	"github.com/exn-hr/backend/internal/dto"
	"github.com/exn-hr/backend/internal/models"
	"github.com/exn-hr/backend/internal/repositories"
)

type DepartmentService struct {
	deptRepo *repositories.DepartmentRepository
}

func NewDepartmentService(deptRepo *repositories.DepartmentRepository) *DepartmentService {
	return &DepartmentService{deptRepo: deptRepo}
}

func (s *DepartmentService) Create(req dto.CreateDepartmentReq) (*models.Department, error) {
	dept := &models.Department{
		Name:        req.Name,
		Description: req.Description,
	}
	if err := s.deptRepo.Create(dept); err != nil {
		return nil, errors.New("failed to create department")
	}
	return dept, nil
}

func (s *DepartmentService) GetByID(id uint) (*models.Department, error) {
	dept, err := s.deptRepo.FindByID(id)
	if err != nil {
		return nil, errors.New("department not found")
	}
	return dept, nil
}

func (s *DepartmentService) Update(id uint, req dto.UpdateDepartmentReq) (*models.Department, error) {
	dept, err := s.deptRepo.FindByID(id)
	if err != nil {
		return nil, errors.New("department not found")
	}
	if req.Name != "" {
		dept.Name = req.Name
	}
	if req.Description != "" {
		dept.Description = req.Description
	}
	if err := s.deptRepo.Update(dept); err != nil {
		return nil, errors.New("failed to update department")
	}
	return dept, nil
}

func (s *DepartmentService) Delete(id uint) error {
	if _, err := s.deptRepo.FindByID(id); err != nil {
		return errors.New("department not found")
	}
	return s.deptRepo.Delete(id)
}

func (s *DepartmentService) List() ([]models.Department, error) {
	return s.deptRepo.List()
}
