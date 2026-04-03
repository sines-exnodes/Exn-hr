import 'package:exn_hr/config/di.dart';
import 'package:exn_hr/core/themes/app_colors.dart';
import 'package:exn_hr/core/themes/app_text_styles.dart';
import 'package:exn_hr/features/projects/domain/entities/project.dart';
import 'package:exn_hr/features/projects/ui/detail/view_models/project_detail_cubit.dart';
import 'package:exn_hr/features/projects/ui/detail/view_models/project_detail_state.dart';
import 'package:exn_hr/features/projects/ui/list/widgets/project_card.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class ProjectDetailPage extends StatelessWidget {
  const ProjectDetailPage({super.key, required this.projectId});

  final int projectId;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => getIt<ProjectDetailCubit>()..loadDetail(projectId),
      child: const _ProjectDetailView(),
    );
  }
}

class _ProjectDetailView extends StatelessWidget {
  const _ProjectDetailView();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Chi tiết dự án'),
        automaticallyImplyLeading: true,
      ),
      body: BlocBuilder<ProjectDetailCubit, ProjectDetailState>(
        builder: (context, state) {
          if (state.status == ProjectDetailStatus.loading) {
            return const Center(child: CircularProgressIndicator());
          }
          if (state.status == ProjectDetailStatus.failure) {
            return Center(
              child: Padding(
                padding: EdgeInsets.all(24.w),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.error_outline,
                        size: 48.sp, color: AppColors.error),
                    SizedBox(height: 12.w),
                    Text(
                      state.errorMessage ?? 'Không tải được dự án',
                      style: AppTextStyles.bodyMedium,
                      textAlign: TextAlign.center,
                    ),
                    SizedBox(height: 16.w),
                    TextButton(
                      onPressed: () => context
                          .read<ProjectDetailCubit>()
                          .loadDetail(
                              (context.read<ProjectDetailCubit>().state.project?.id ?? 0)),
                      child: const Text('Thử lại'),
                    ),
                  ],
                ),
              ),
            );
          }
          final project = state.project;
          if (project == null) return const SizedBox.shrink();
          return RefreshIndicator(
            onRefresh: () =>
                context.read<ProjectDetailCubit>().loadDetail(project.id),
            color: AppColors.primary,
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: EdgeInsets.all(16.w),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _ProjectHeader(project: project),
                  SizedBox(height: 24.w),
                  _MembersSection(members: project.members),
                  SizedBox(height: 24.w),
                  _MilestonesSection(milestones: project.milestones),
                  SizedBox(height: 24.w),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

class _ProjectHeader extends StatelessWidget {
  const _ProjectHeader({required this.project});
  final Project project;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(16.w),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(14.r),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(project.name, style: AppTextStyles.h4),
              ),
              _ProjectStatusBadge(status: project.status),
            ],
          ),
          if (project.description != null &&
              project.description!.isNotEmpty) ...[
            SizedBox(height: 8.w),
            Text(
              project.description!,
              style:
                  AppTextStyles.bodySmall.copyWith(color: AppColors.textSecondary),
            ),
          ],
          SizedBox(height: 12.w),
          Row(
            children: [
              Icon(Icons.calendar_today_outlined,
                  size: 14.sp, color: AppColors.textSecondary),
              SizedBox(width: 6.w),
              Text(
                'Bắt đầu: ${project.startDate ?? 'N/A'}',
                style: AppTextStyles.caption
                    .copyWith(color: AppColors.textSecondary),
              ),
            ],
          ),
          if (project.endDate != null) ...[
            SizedBox(height: 4.w),
            Row(
              children: [
                Icon(Icons.event_rounded,
                    size: 14.sp, color: AppColors.textSecondary),
                SizedBox(width: 6.w),
                Text(
                  'Kết thúc: ${project.endDate}',
                  style: AppTextStyles.caption
                      .copyWith(color: AppColors.textSecondary),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}

class _ProjectStatusBadge extends StatelessWidget {
  const _ProjectStatusBadge({required this.status});
  final String status;

  @override
  Widget build(BuildContext context) {
    Color color;
    String label;
    switch (status) {
      case 'active':
        color = const Color(0xFF22C55E);
        label = 'Active';
        break;
      case 'completed':
        color = const Color(0xFF3B82F6);
        label = 'Completed';
        break;
      case 'on_hold':
        color = const Color(0xFFF59E0B);
        label = 'On Hold';
        break;
      default:
        color = AppColors.textSecondary;
        label = status;
    }
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 4.w),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(8.r),
      ),
      child: Text(
        label,
        style: AppTextStyles.caption
            .copyWith(color: color, fontWeight: FontWeight.w600),
      ),
    );
  }
}

class _MembersSection extends StatelessWidget {
  const _MembersSection({required this.members});
  final List<ProjectMember> members;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Thành viên (${members.length})', style: AppTextStyles.h4),
        SizedBox(height: 12.w),
        if (members.isEmpty)
          Text('Chưa có thành viên',
              style: AppTextStyles.bodySmall
                  .copyWith(color: AppColors.textSecondary))
        else
          Wrap(
            spacing: 8.w,
            runSpacing: 8.w,
            children: members.map((m) => _MemberChip(member: m)).toList(),
          ),
      ],
    );
  }
}

class _MemberChip extends StatelessWidget {
  const _MemberChip({required this.member});
  final ProjectMember member;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 6.w),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(20.r),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          CircleAvatar(
            radius: 10.r,
            backgroundColor: const Color(0xFF8B5CF6).withValues(alpha: 0.2),
            child: Text(
              (member.employeeName?.isNotEmpty == true)
                  ? member.employeeName![0].toUpperCase()
                  : '?',
              style: AppTextStyles.caption.copyWith(
                color: const Color(0xFF8B5CF6),
                fontWeight: FontWeight.w700,
                fontSize: 10,
              ),
            ),
          ),
          SizedBox(width: 6.w),
          Text(
            member.employeeName ?? 'Employee #${member.employeeId}',
            style: AppTextStyles.caption,
          ),
          SizedBox(width: 4.w),
          Text(
            '(${_roleLabel(member.projectRole)})',
            style: AppTextStyles.caption
                .copyWith(color: AppColors.textSecondary, fontSize: 10),
          ),
        ],
      ),
    );
  }

  String _roleLabel(String role) {
    switch (role) {
      case 'pm':
        return 'PM';
      case 'ba':
        return 'BA';
      case 'dev':
        return 'Dev';
      case 'tester':
        return 'Tester';
      case 'designer':
        return 'Designer';
      default:
        return 'Other';
    }
  }
}

class _MilestonesSection extends StatelessWidget {
  const _MilestonesSection({required this.milestones});
  final List<Milestone> milestones;

  @override
  Widget build(BuildContext context) {
    final sorted = [...milestones]
      ..sort((a, b) => (a.deadline ?? '').compareTo(b.deadline ?? ''));

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Cột mốc (${milestones.length})', style: AppTextStyles.h4),
        SizedBox(height: 12.w),
        if (sorted.isEmpty)
          Text('Chưa có cột mốc nào',
              style: AppTextStyles.bodySmall
                  .copyWith(color: AppColors.textSecondary))
        else
          ...sorted.map(
            (m) => Padding(
              padding: EdgeInsets.only(bottom: 10.w),
              child: MilestoneItemWidget(
                milestone: m,
                compact: false,
                onItemToggle: (milestoneId, itemId) => context
                    .read<ProjectDetailCubit>()
                    .toggleMilestoneItem(milestoneId, itemId),
              ),
            ),
          ),
      ],
    );
  }
}
