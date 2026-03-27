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
      backgroundColor: AppColors.bgPage,
      body: BlocBuilder<ProfileCubit, ProfileState>(
        builder: (context, state) {
          if (state.status == ProfileStatus.loading) {
            return Center(
              child: CircularProgressIndicator(color: AppColors.primary),
            );
          }
          if (state.status == ProfileStatus.failure) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 64.w,
                    height: 64.w,
                    decoration: BoxDecoration(
                      color: AppColors.errorBg,
                      borderRadius: BorderRadius.circular(20.r),
                    ),
                    child: Icon(Icons.error_outline,
                        size: 32.sp, color: AppColors.error),
                  ),
                  SizedBox(height: 16.w),
                  Text(state.errorMessage ?? 'Failed to load',
                      style: AppTextStyles.bodyMedium),
                  SizedBox(height: 16.w),
                  TextButton.icon(
                    onPressed: () => context.read<ProfileCubit>().loadProfile(),
                    icon: const Icon(Icons.refresh_rounded),
                    label: const Text('Thử lại'),
                  ),
                ],
              ),
            );
          }
          final profile = state.profile;
          if (profile == null) {
            return Center(
              child: CircularProgressIndicator(color: AppColors.primary),
            );
          }
          return RefreshIndicator(
            onRefresh: () => context.read<ProfileCubit>().loadProfile(),
            color: AppColors.primary,
            child: CustomScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              slivers: [
                SliverToBoxAdapter(
                  child: ScaleFadeAnimation(
                    child: _buildGradientHeader(
                        context, profile.fullName, profile.email, profile.role),
                  ),
                ),
                SliverPadding(
                  padding: EdgeInsets.symmetric(horizontal: 20.w),
                  sliver: SliverList(
                    delegate: SliverChildListDelegate([
                      SizedBox(height: 20.w),
                      FadeSlideAnimation(
                        delay: const Duration(milliseconds: 150),
                        child: _buildInfoSection(context, profile),
                      ),
                      SizedBox(height: 16.w),
                      FadeSlideAnimation(
                        delay: const Duration(milliseconds: 300),
                        child: _buildSettingsSection(context, profile),
                      ),
                      SizedBox(height: 24.w),
                    ]),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildGradientHeader(
      BuildContext context, String name, String email, String role) {
    return Container(
      padding: EdgeInsets.only(
        top: MediaQuery.of(context).padding.top + 16.w,
        left: 20.w,
        right: 20.w,
        bottom: 28.w,
      ),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [AppColors.gradientStart, AppColors.gradientEnd],
        ),
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(28.r),
          bottomRight: Radius.circular(28.r),
        ),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withOpacity(0.25),
            blurRadius: 20,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                'Cá nhân',
                style: AppTextStyles.h4.copyWith(color: Colors.white),
              ),
            ],
          ),
          SizedBox(height: 24.w),
          Container(
            width: 80.w,
            height: 80.w,
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              shape: BoxShape.circle,
              border: Border.all(
                color: Colors.white.withOpacity(0.3),
                width: 3,
              ),
            ),
            child: Icon(Icons.person_rounded, size: 44.sp, color: Colors.white),
          ),
          SizedBox(height: 14.w),
          Text(name,
              style: AppTextStyles.h3
                  .copyWith(color: Colors.white, fontWeight: FontWeight.w700)),
          SizedBox(height: 4.w),
          Text(email,
              style: AppTextStyles.bodySmall
                  .copyWith(color: Colors.white.withOpacity(0.8))),
          SizedBox(height: 10.w),
          Container(
            padding: EdgeInsets.symmetric(horizontal: 14.w, vertical: 5.w),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              borderRadius: BorderRadius.circular(20.r),
              border: Border.all(color: Colors.white.withOpacity(0.15)),
            ),
            child: Text(
              role.toUpperCase(),
              style: AppTextStyles.labelSmall.copyWith(
                color: Colors.white,
                fontWeight: FontWeight.w600,
                letterSpacing: 0.5,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoSection(BuildContext context, Profile profile) {
    return Container(
      padding: EdgeInsets.all(20.w),
      decoration: BoxDecoration(
        color: AppColors.bgCard,
        borderRadius: BorderRadius.circular(18.r),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 12,
            offset: const Offset(0, 2),
          ),
        ],
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
                  padding:
                      EdgeInsets.symmetric(horizontal: 12.w, vertical: 6.w),
                  decoration: BoxDecoration(
                    color: AppColors.primaryLight,
                    borderRadius: BorderRadius.circular(10.r),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.edit_outlined,
                          size: 14.sp, color: AppColors.primary),
                      SizedBox(width: 4.w),
                      Text(
                        'Sửa',
                        style: AppTextStyles.labelSmall
                            .copyWith(color: AppColors.primary),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          SizedBox(height: 18.w),
          _buildInfoRow(
              Icons.phone_outlined, 'Điện thoại', profile.phone ?? 'N/A'),
          _buildInfoRow(
              Icons.person_outline, 'Giới tính', _genderLabel(profile.gender)),
          _buildInfoRow(
              Icons.groups_outlined, 'Team', profile.teamName ?? 'N/A'),
          _buildInfoRow(
              Icons.business_outlined, 'Phòng ban', profile.department ?? 'N/A'),
          _buildInfoRow(Icons.cake_outlined, 'Ngày sinh', profile.dob ?? 'N/A'),
          _buildInfoRow(Icons.calendar_month_outlined, 'Ngày vào',
              profile.joinDate ?? 'N/A'),
          _buildInfoRow(Icons.work_outline, 'Loại HĐ',
              _contractLabel(profile.contractType)),
          _buildInfoRow(Icons.location_on_outlined, 'Địa chỉ',
              profile.address ?? 'N/A'),
          if (profile.bankAccount != null &&
              profile.bankAccount!.isNotEmpty) ...[
            SizedBox(height: 4.w),
            Divider(color: AppColors.divider),
            SizedBox(height: 4.w),
            _buildInfoRow(Icons.account_balance_outlined, 'Ngân hàng',
                profile.bankName ?? 'N/A'),
            _buildInfoRow(
                Icons.credit_card_outlined, 'Số TK', profile.bankAccount!),
            _buildInfoRow(Icons.badge_outlined, 'Chủ TK',
                profile.bankHolderName ?? 'N/A'),
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
          Container(
            width: 34.w,
            height: 34.w,
            decoration: BoxDecoration(
              color: AppColors.bgSurface,
              borderRadius: BorderRadius.circular(8.r),
            ),
            child: Icon(icon, size: 18.sp, color: AppColors.textSecondary),
          ),
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

    final tiles = <_SettingsTileData>[];

    if (showLeaveLeader) {
      tiles.add(_SettingsTileData(
        icon: Icons.approval_outlined,
        label: 'Duyệt nghỉ phép',
        color: AppColors.accentPurple,
        bgColor: AppColors.accentPurpleBg,
        onTap: () => context.push(AppRoutes.leaveApproval),
      ));
    }
    if (showOtApproval) {
      tiles.add(_SettingsTileData(
        icon: Icons.more_time_outlined,
        label: 'Duyệt làm thêm (OT)',
        color: AppColors.accentAmber,
        bgColor: AppColors.accentAmberBg,
        onTap: () => context.push(AppRoutes.otApproval),
      ));
    }

    tiles.addAll([
      _SettingsTileData(
        icon: Icons.lock_outline_rounded,
        label: 'Đổi mật khẩu',
        color: AppColors.accentBlue,
        bgColor: AppColors.accentBlueBg,
        onTap: () => context.push(AppRoutes.changePassword),
      ),
      _SettingsTileData(
        icon: Icons.notifications_outlined,
        label: 'Thông báo',
        color: AppColors.accentTeal,
        bgColor: AppColors.accentTealBg,
        onTap: () => context.push(AppRoutes.notifications),
      ),
      _SettingsTileData(
        icon: Icons.logout_rounded,
        label: 'Đăng xuất',
        color: AppColors.error,
        bgColor: AppColors.errorBg,
        isDestructive: true,
        onTap: () async {
          final confirmed = await showDialog<bool>(
            context: context,
            builder: (ctx) => AlertDialog(
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16.r)),
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
        color: AppColors.bgCard,
        borderRadius: BorderRadius.circular(18.r),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 12,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: tiles.asMap().entries.map((e) {
          final tile = e.value;
          final isLast = e.key == tiles.length - 1;
          return Column(
            children: [
              ListTile(
                contentPadding:
                    EdgeInsets.symmetric(horizontal: 16.w, vertical: 2.w),
                leading: Container(
                  width: 36.w,
                  height: 36.w,
                  decoration: BoxDecoration(
                    color: tile.bgColor,
                    borderRadius: BorderRadius.circular(10.r),
                  ),
                  child: Icon(tile.icon, color: tile.color, size: 20.sp),
                ),
                title: Text(tile.label,
                    style: AppTextStyles.bodyMedium.copyWith(
                      color: tile.isDestructive
                          ? AppColors.error
                          : AppColors.textPrimary,
                    )),
                trailing: Icon(Icons.chevron_right_rounded,
                    color: AppColors.textMuted, size: 22.sp),
                onTap: tile.onTap,
              ),
              if (!isLast)
                Divider(
                    height: 1,
                    color: AppColors.divider,
                    indent: 68.w,
                    endIndent: 16.w),
            ],
          );
        }).toList(),
      ),
    );
  }
}

class _SettingsTileData {
  const _SettingsTileData({
    required this.icon,
    required this.label,
    required this.color,
    required this.bgColor,
    required this.onTap,
    this.isDestructive = false,
  });

  final IconData icon;
  final String label;
  final Color color;
  final Color bgColor;
  final VoidCallback onTap;
  final bool isDestructive;
}
