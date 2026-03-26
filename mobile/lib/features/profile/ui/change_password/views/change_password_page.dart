import 'package:exn_hr/config/di.dart';
import 'package:exn_hr/core/themes/app_colors.dart';
import 'package:exn_hr/features/profile/ui/change_password/view_models/change_password_cubit.dart';
import 'package:exn_hr/features/profile/ui/change_password/view_models/change_password_state.dart';
import 'package:exn_hr/shared/ui/widgets/app_button.dart';
import 'package:exn_hr/shared/ui/widgets/app_input.dart';
import 'package:exn_hr/core/widgets/animations/animations.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';

class ChangePasswordPage extends StatelessWidget {
  const ChangePasswordPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => getIt<ChangePasswordCubit>(),
      child: const _ChangePasswordView(),
    );
  }
}

class _ChangePasswordView extends StatefulWidget {
  const _ChangePasswordView();

  @override
  State<_ChangePasswordView> createState() => _ChangePasswordViewState();
}

class _ChangePasswordViewState extends State<_ChangePasswordView> {
  final _formKey = GlobalKey<FormState>();
  final _currentPasswordController = TextEditingController();
  final _newPasswordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  @override
  void dispose() {
    _currentPasswordController.dispose();
    _newPasswordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Change Password'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.pop(),
        ),
      ),
      body: BlocConsumer<ChangePasswordCubit, ChangePasswordState>(
        listener: (context, state) {
          if (state.status == ChangePasswordStatus.success) {
            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
              content: Text('Password changed successfully!'),
              backgroundColor: AppColors.success,
            ));
            context.pop();
          } else if (state.status == ChangePasswordStatus.failure) {
            ScaffoldMessenger.of(context).showSnackBar(SnackBar(
              content: Text(state.errorMessage ?? 'Failed to change password'),
              backgroundColor: AppColors.error,
            ));
          }
        },
        builder: (context, state) {
          return SingleChildScrollView(
            padding: EdgeInsets.all(20.w),
            child: Form(
              key: _formKey,
              child: Column(
                children: [
                  FadeSlideAnimation(
                    child: AppInput(
                      label: 'Current Password',
                      hint: 'Enter your current password',
                      controller: _currentPasswordController,
                      obscureText: true,
                      prefixIcon: Icon(Icons.lock_outline_rounded,
                          color: AppColors.textSecondary, size: 20.sp),
                      validator: (v) =>
                          v == null || v.isEmpty ? 'Current password is required' : null,
                    ),
                  ),
                  SizedBox(height: 16.w),
                  FadeSlideAnimation(
                    delay: const Duration(milliseconds: 100),
                    child: AppInput(
                      label: 'New Password',
                      hint: 'Enter your new password',
                      controller: _newPasswordController,
                      obscureText: true,
                      prefixIcon: Icon(Icons.lock_rounded,
                          color: AppColors.textSecondary, size: 20.sp),
                      validator: (v) {
                        if (v == null || v.isEmpty) return 'New password is required';
                        if (v.length < 6) return 'Password must be at least 6 characters';
                        return null;
                      },
                    ),
                  ),
                  SizedBox(height: 16.w),
                  FadeSlideAnimation(
                    delay: const Duration(milliseconds: 200),
                    child: AppInput(
                      label: 'Confirm New Password',
                      hint: 'Confirm your new password',
                      controller: _confirmPasswordController,
                      obscureText: true,
                      prefixIcon: Icon(Icons.lock_rounded,
                          color: AppColors.textSecondary, size: 20.sp),
                      validator: (v) {
                        if (v == null || v.isEmpty) return 'Please confirm your password';
                        if (v != _newPasswordController.text) {
                          return 'Passwords do not match';
                        }
                        return null;
                      },
                    ),
                  ),
                  SizedBox(height: 32.w),
                  ScaleFadeAnimation(
                    delay: const Duration(milliseconds: 300),
                    child: AppButton(
                      label: 'Change Password',
                      isLoading: state.status == ChangePasswordStatus.loading,
                      onPressed: () {
                        if (_formKey.currentState?.validate() ?? false) {
                          context.read<ChangePasswordCubit>().changePassword(
                                currentPassword: _currentPasswordController.text,
                                newPassword: _newPasswordController.text,
                              );
                        }
                      },
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
