package services

import (
	"errors"

	"github.com/exn-hr/backend/internal/config"
	"github.com/exn-hr/backend/internal/dto"
	"github.com/exn-hr/backend/internal/repositories"
	"github.com/exn-hr/backend/pkg/utils"
)

type AuthService struct {
	userRepo *repositories.UserRepository
	cfg      *config.Config
}

func NewAuthService(userRepo *repositories.UserRepository, cfg *config.Config) *AuthService {
	return &AuthService{userRepo: userRepo, cfg: cfg}
}

func (s *AuthService) Login(req dto.LoginRequest) (*dto.LoginResponse, error) {
	user, err := s.userRepo.FindByEmail(req.Email)
	if err != nil {
		return nil, errors.New("invalid email or password")
	}

	if !user.IsActive {
		return nil, errors.New("account is deactivated")
	}

	if !utils.CheckPassword(req.Password, user.PasswordHash) {
		return nil, errors.New("invalid email or password")
	}

	token, err := utils.GenerateJWT(user.ID, user.Email, user.Role, s.cfg.JWTSecret, s.cfg.JWTExpiryHours)
	if err != nil {
		return nil, errors.New("failed to generate token")
	}

	return &dto.LoginResponse{
		Token: token,
		User: dto.UserResponse{
			ID:       user.ID,
			Email:    user.Email,
			Role:     user.Role,
			IsActive: user.IsActive,
		},
	}, nil
}

// ForgotPassword currently acknowledges requests without exposing account existence.
// Email delivery/reset token storage can be plugged in later.
func (s *AuthService) ForgotPassword(req dto.ForgotPasswordRequest) error {
	_, _ = s.userRepo.FindByEmail(req.Email)
	return nil
}
