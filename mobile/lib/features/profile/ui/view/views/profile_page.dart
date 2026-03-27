import 'package:exn_hr/config/di.dart';
import 'package:exn_hr/core/routing/app_router.dart';
import 'package:exn_hr/core/storage/secure_storage.dart';
import 'package:exn_hr/core/themes/app_colors.dart';
import 'package:exn_hr/core/themes/app_text_styles.dart';
import 'package:exn_hr/features/profile/domain/entities/profile.dart';
import 'package:exn_hr/features/profile/ui/view/view_models/profile_cubit.dart';
import 'package:exn_hr/features/profile/ui/view/view_models/profile_state.dart';
import 'package:exn_hr/core/widgets/animations/animations.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';

class ProfilePage extends StatelessWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => getIt<ProfileCubit>(),
      child: const _ProfileView(),
    );
  }
}

class _ProfileView extends StatelessWidget {
  const _ProfileView();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Cá nhân'),
        automaticallyImplyLeading: false,
      ),
      body: BlocBuilder<ProfileCubit, ProfileState>(
        builder: (context, state) {
          if (state.status == ProfileStatus.loading) {
            return const Center(child: CircularProgressIndicator());
          }
          if (state.status == ProfileStatus.failure) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.error_outline, size: 48.sp, color: AppColors.error),
                  SizedBox(height: 12.w),
                  Text(state.errorMessage ?? 'Failed to load',
                      style: AppTextStyles.bodyMedium),
                  SizedBox(height: 16.w),
                  TextButton(
                    onPressed: () => context.read<ProfileCubit>().loadProfile(),
                    child: const Text('Retry'),
                  ),
                ],
              ),
            );
          }
          final profile = state.profile;
          if (profile == null) {
            return const Center(child: CircularProgressIndicator());
          }
          return RefreshIndicator(
            onRefresh: () => context.read<ProfileCubit>().loadProfile(),
            color: AppColors.primary,
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: EdgeInsets.all(20.w),
              child: Column(
                children: [
                  ScaleFadeAnimation(
                    child: _buildAvatarSection(profile.fullName, profile.email, profile.role),
                  ),
                  SizedBox(height: 24.w),
                  FadeSlideAnimation(
                    delay: const Duration(milliseconds: 150),
                    child: _buildInfoSection(context, profile),
                  ),
                  SizedBox(height: 24.w),
                  FadeSlideAnimation(
                    delay: const Duration(milliseconds: 300),
                    child: _buildSettingsSection(context, profile),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildAvatarSection(String name, String email, String role) {
    return Column(
      children: [
        CircleAvatar(
          radius: 48.w,
          backgroundColor: AppColors.primary.withValues(alpha: 0.12),
          child: Icon(Icons.person_rounded, size: 48.sp, color: AppColors.primary),
        ),
        SizedBox(height: 16.w),
        Text(name, style: AppTextStyles.h3),
        SizedBox(height: 4.w),
        Text(email, style: AppTextStyles.bodySmall),
        SizedBox(height: 8.w),
        Container(
          padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 4.w),
          decoration: BoxDecoration(
            color: AppColors.primary.withOpacity(0.12),
            borderRadius: BorderRadius.circular(20.r),
          ),
          child: Text(
            role.toUpperCase(),
            style: AppTextStyles.labelSmall.copyWith(color: AppColors.primary),
          ),
        ),
      ],
    );
  }

  Widget _buildInfoSection(BuildContext context, Profile profile) {
    return Container(
      padding: EdgeInsets.all(20.w),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16.r),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Thông tin cá nhân', style: AppTextStyles.h4),
              GestureDetector(
                onTap: () async {
                  final result = await context.push<bool>(
                    AppRoutes.editProfile,
                    extra: profile,
                  );
                  if (result == true && context.mounted) {
                    context.read<ProfileCubit>().loadProfile();
                  }
                },
                child: Container(
                  padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 6.w),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8.r),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.edit_outlined, size: 14.sp, color: AppColors.primary),
                      SizedBox(width: 4.w),
                      Text(
                        'Sửa',
                        style: AppTextStyles.labelSmall.copyWith(color: AppColors.primary),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          SizedBox(height: 16.w),
          _buildInfoRow(Icons.phone_outlined, 'Điện thoại', profile.phone ?? 'N/A'),
          _buildInfoRow(Icons.person_outline, 'Giới tính', _genderLabel(profile.gender)),
          _buildInfoRow(Icons.groups_outlined, 'Team', profile.teamName ?? 'N/A'),
          _buildInfoRow(Icons.business_outlined, 'Phòng ban', profile.department ?? 'N/A'),
          _buildInfoRow(Icons.cake_outlined, 'Ngày sinh', profile.dob ?? 'N/A'),
          _buildInfoRow(Icons.calendar_month_outlined, 'Ngày vào', profile.joinDate ?? 'N/A'),
          _buildInfoRow(Icons.work_outline, 'Loại HĐ', _contractLabel(profile.contractType)),
          _buildInfoRow(Icons.location_on_outlined, 'Địa chỉ', profile.address ?? 'N/A'),
          if (profile.bankAccount != null && profile.bankAccount!.isNotEmpty) ...[
            SizedBox(height: 4.w),
            Divider(color: AppColors.divider),
            SizedBox(height: 4.w),
            _buildInfoRow(Icons.account_balance_outlined, 'Ngân hàng', profile.bankName ?? 'N/A'),
            _buildInfoRow(Icons.credit_card_outlined, 'Số TK', profile.bankAccount!),
            _buildInfoRow(Icons.badge_outlined, 'Chủ TK', profile.bankHolderName ?? 'N/A'),
          ],
        ],
      ),
    );
  }

  String _contractLabel(String? type) {
    switch (type) {
      case 'full_time':
        return 'Toàn thời gian';
      case 'expat':
        return 'Chuyên gia nước ngoài';
      case 'probation':
        return 'Thử việc';
      case 'intern':
        return 'Thực tập';
      case 'collaborator':
        return 'Cộng tác viên';
      case 'service_contract':
        return 'Hợp đồng dịch vụ';
      default:
        return 'N/A';
    }
  }

  String _genderLabel(String? gender) {
    switch (gender?.toLowerCase()) {
      case 'male':
        return 'Nam';
      case 'female':
        return 'Nữ';
      default:
        return 'N/A';
    }
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Padding(
      padding: EdgeInsets.only(bottom: 14.w),
      child: Row(
        children: [
          Icon(icon, size: 20.sp, color: AppColors.textSecondary),
          SizedBox(width: 12.w),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: AppTextStyles.caption),
                SizedBox(height: 2.w),
                Text(value, style: AppTextStyles.bodyMedium),
              ],
            ),
          ),
        ],
      ),
    );
  }

  bool _canApproveLeaveLeader(String role) {
    final r = role.toLowerCase();
    return r == 'leader' || r == 'admin';
  }

  bool _canApproveOt(String role) {
    final r = role.toLowerCase();
    return r == 'leader' || r == 'ceo' || r == 'admin';
  }

  Widget _buildSettingsSection(BuildContext context, Profile profile) {
    final role = profile.role;
    final showLeaveLeader = _canApproveLeaveLeader(role);
    final showOtApproval = _canApproveOt(role);

    final children = <Widget>[];

    if (showLeaveLeader) {
      children.addAll([
        _buildSettingsTile(
          icon: Icons.approval_outlined,
          label: 'Duyệt nghỉ phép',
          onTap: () => context.push(AppRoutes.leaveApproval),
        ),
        Divider(height: 1, color: AppColors.divider),
      ]);
    }
    if (showOtApproval) {
      children.addAll([
        _buildSettingsTile(
          icon: Icons.more_time_outlined,
          label: 'Duyệt làm thêm (OT)',
          onTap: () => context.push(AppRoutes.otApproval),
        ),
        Divider(height: 1, color: AppColors.divider),
      ]);
    }

    children.addAll([
          _buildSettingsTile(
            icon: Icons.lock_outline_rounded,
            label: 'Đổi mật khẩu',
            onTap: () => context.push(AppRoutes.changePassword),
          ),
          Divider(height: 1, color: AppColors.divider),
          _buildSettingsTile(
            icon: Icons.notifications_outlined,
            label: 'Thông báo',
            onTap: () => context.push(AppRoutes.notifications),
          ),
          Divider(height: 1, color: AppColors.divider),
          _buildSettingsTile(
            icon: Icons.logout_rounded,
            label: 'Đăng xuất',
            isDestructive: true,
            onTap: () async {
              final confirmed = await showDialog<bool>(
                context: context,
                builder: (ctx) => AlertDialog(
                  title: const Text('Đăng xuất'),
                  content: const Text('Bạn có chắc chắn muốn đăng xuất?'),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.of(ctx).pop(false),
                      child: const Text('Hủy'),
                    ),
                    TextButton(
                      onPressed: () => Navigator.of(ctx).pop(true),
                      child: Text('Đăng xuất',
                          style: TextStyle(color: AppColors.error)),
                    ),
                  ],
                ),
              );
              if (confirmed == true && context.mounted) {
                await getIt<SecureStorage>().clearAll();
                if (context.mounted) {
                  context.go(AppRoutes.signIn);
                }
              }
            },
          ),
    ]);

    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16.r),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(children: children),
    );
  }

  Widget _buildSettingsTile({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
    bool isDestructive = false,
  }) {
    final color = isDestructive ? AppColors.error : AppColors.textPrimary;
    return ListTile(
      leading: Icon(icon, color: color, size: 22.sp),
      title: Text(label, style: AppTextStyles.bodyMedium.copyWith(color: color)),
      trailing: Icon(Icons.chevron_right_rounded,
          color: AppColors.textHint, size: 22.sp),
      onTap: onTap,
    );
  }
}
