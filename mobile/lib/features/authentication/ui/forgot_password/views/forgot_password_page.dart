import 'package:exn_hr/config/di.dart';
import 'package:exn_hr/core/network/api/api_client.dart';
import 'package:exn_hr/core/network/api/api_endpoints.dart';
import 'package:exn_hr/core/routing/app_router.dart';
import 'package:exn_hr/core/themes/app_colors.dart';
import 'package:exn_hr/core/themes/app_text_styles.dart';
import 'package:exn_hr/core/widgets/animations/animations.dart';
import 'package:exn_hr/shared/ui/widgets/app_button.dart';
import 'package:exn_hr/shared/ui/widgets/app_input.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';

class ForgotPasswordPage extends StatelessWidget {
  const ForgotPasswordPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const _ForgotPasswordView();
  }
}

class _ForgotPasswordView extends StatefulWidget {
  const _ForgotPasswordView();

  @override
  State<_ForgotPasswordView> createState() => _ForgotPasswordViewState();
}

class _ForgotPasswordViewState extends State<_ForgotPasswordView> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  bool _isLoading = false;
  bool _isSuccess = false;

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    setState(() => _isLoading = true);
    try {
      final apiClient = getIt<ApiClient>();
      await apiClient.post(
        ApiEndpoints.forgotPassword,
        data: {'email': _emailController.text.trim()},
      );
      if (mounted) setState(() => _isSuccess = true);
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Khong gui duoc yeu cau. Vui long thu lai.'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: EdgeInsets.symmetric(horizontal: 24.w),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SizedBox(height: 60.w),
                ScaleFadeAnimation(
                  duration: const Duration(milliseconds: 500),
                  curve: Curves.easeOutBack,
                  child: _buildLogoRow(),
                ),
                SizedBox(height: 28.w),
                FadeSlideAnimation(
                  delay: const Duration(milliseconds: 150),
                  child: _buildTitleSection(),
                ),
                SizedBox(height: 40.w),
                if (_isSuccess)
                  FadeSlideAnimation(
                    delay: const Duration(milliseconds: 100),
                    child: _buildSuccessMessage(),
                  )
                else ...[
                  FadeSlideAnimation(
                    delay: const Duration(milliseconds: 300),
                    offset: const Offset(-20, 0),
                    child: _buildEmailField(),
                  ),
                  SizedBox(height: 32.w),
                  ScaleFadeAnimation(
                    delay: const Duration(milliseconds: 450),
                    duration: const Duration(milliseconds: 350),
                    curve: Curves.easeOutCubic,
                    beginScale: 0.92,
                    child: _buildSubmitButton(),
                  ),
                ],
                SizedBox(height: 24.w),
                FadeSlideAnimation(
                  delay: const Duration(milliseconds: 550),
                  child: _buildBackToSignIn(context),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLogoRow() {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Image.asset(
          'assets/images/exn.png',
          height: 56.w,
          fit: BoxFit.contain,
        ),
        SizedBox(width: 14.w),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'EXN HRM',
                style: AppTextStyles.h3.copyWith(fontWeight: FontWeight.w700),
              ),
              Text(
                'Quan ly nhan su',
                style: AppTextStyles.caption
                    .copyWith(color: AppColors.textSecondary),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildTitleSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Quen mat khau', style: AppTextStyles.h2),
        SizedBox(height: 8.w),
        Text(
          'Nhap email cong ty cua ban de nhan huong dan dat lai mat khau.',
          style: AppTextStyles.bodyMedium
              .copyWith(color: AppColors.textSecondary),
        ),
      ],
    );
  }

  Widget _buildEmailField() {
    return AppInput(
      label: 'Email',
      hint: 'Nhap email cong ty',
      controller: _emailController,
      keyboardType: TextInputType.emailAddress,
      prefixIcon: Icon(Icons.email_outlined,
          color: AppColors.textSecondary, size: 20.sp),
      validator: (value) {
        if (value == null || value.isEmpty) return 'Email la bat buoc';
        if (!value.contains('@')) return 'Nhap email hop le';
        return null;
      },
    );
  }

  Widget _buildSubmitButton() {
    return AppButton(
      label: 'Gui yeu cau',
      isLoading: _isLoading,
      onPressed: _submit,
    );
  }

  Widget _buildSuccessMessage() {
    return Container(
      padding: EdgeInsets.all(16.w),
      decoration: BoxDecoration(
        color: AppColors.successBg,
        borderRadius: BorderRadius.circular(12.r),
        border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.check_circle_rounded,
              color: AppColors.primary, size: 20.sp),
          SizedBox(width: 10.w),
          Expanded(
            child: Text(
              'Yeu cau da duoc gui! Kiem tra hop thu den cua ban va lam theo huong dan.',
              style: AppTextStyles.bodySmall
                  .copyWith(color: AppColors.primaryDark),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBackToSignIn(BuildContext context) {
    return Center(
      child: GestureDetector(
        onTap: () => context.go(AppRoutes.signIn),
        child: Text.rich(
          TextSpan(
            children: [
              TextSpan(
                text: 'Quay lai ',
                style: AppTextStyles.bodySmall
                    .copyWith(color: AppColors.textSecondary),
              ),
              TextSpan(
                text: 'Dang nhap',
                style: AppTextStyles.bodySmall.copyWith(
                  color: AppColors.primary,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
