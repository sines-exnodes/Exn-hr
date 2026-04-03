import 'package:exn_hr/core/themes/app_colors.dart';
import 'package:exn_hr/core/themes/app_text_styles.dart';
import 'package:exn_hr/features/projects/domain/entities/project.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class ProjectCard extends StatelessWidget {
  const ProjectCard({
    super.key,
    required this.project,
    required this.onTap,
  });

  final Project project;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final upcomingMilestones = project.milestones
        .where((m) => m.status == 'upcoming' || m.status == 'in_progress')
        .toList()
      ..sort((a, b) => (a.deadline ?? '').compareTo(b.deadline ?? ''));

    return Material(
      color: AppColors.surface,
      borderRadius: BorderRadius.circular(14.r),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Container(
          padding: EdgeInsets.all(16.w),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14.r),
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 40.w,
                    height: 40.w,
                    decoration: BoxDecoration(
                      color: _statusColor(project.status).withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(10.r),
                    ),
                    child: Icon(
                      Icons.folder_rounded,
                      color: _statusColor(project.status),
                      size: 20.sp,
                    ),
                  ),
                  SizedBox(width: 12.w),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          project.name,
                          style: AppTextStyles.labelLarge,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        SizedBox(height: 2.w),
                        Text(
                          '${project.startDate ?? ''}${project.endDate != null ? ' — ${project.endDate}' : ''}',
                          style: AppTextStyles.caption
                              .copyWith(color: AppColors.textSecondary),
                        ),
                      ],
                    ),
                  ),
                  _StatusBadge(status: project.status),
                ],
              ),
              if (project.description != null &&
                  project.description!.isNotEmpty) ...[
                SizedBox(height: 10.w),
                Text(
                  project.description!,
                  style: AppTextStyles.bodySmall
                      .copyWith(color: AppColors.textSecondary),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
              if (upcomingMilestones.isNotEmpty) ...[
                SizedBox(height: 12.w),
                const Divider(height: 1),
                SizedBox(height: 10.w),
                Text(
                  'Cột mốc sắp tới',
                  style: AppTextStyles.caption
                      .copyWith(color: AppColors.textSecondary),
                ),
                SizedBox(height: 6.w),
                ...upcomingMilestones.take(2).map(
                      (m) => Padding(
                        padding: EdgeInsets.only(bottom: 4.w),
                        child: MilestoneItemWidget(milestone: m, compact: true),
                      ),
                    ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'active':
        return const Color(0xFF22C55E);
      case 'completed':
        return const Color(0xFF3B82F6);
      case 'on_hold':
        return const Color(0xFFF59E0B);
      default:
        return AppColors.textSecondary;
    }
  }
}

class _StatusBadge extends StatelessWidget {
  const _StatusBadge({required this.status});
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
      padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 3.w),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(6.r),
      ),
      child: Text(
        label,
        style: AppTextStyles.caption
            .copyWith(color: color, fontWeight: FontWeight.w600),
      ),
    );
  }
}

/// Displays a single [Milestone] with its deadline, status, and checklist items.
class MilestoneItemWidget extends StatelessWidget {
  const MilestoneItemWidget({
    super.key,
    required this.milestone,
    this.compact = false,
    this.onItemToggle,
  });

  final Milestone milestone;
  final bool compact;

  /// Called when a checklist item is tapped. Provides [milestoneId] and [itemId].
  final void Function(int milestoneId, int itemId)? onItemToggle;

  @override
  Widget build(BuildContext context) {
    final statusColor = _milestoneStatusColor(milestone.status);
    final sortedItems = [...milestone.items]
      ..sort((a, b) => a.displayOrder.compareTo(b.displayOrder));

    return Container(
      padding: EdgeInsets.all(compact ? 10.w : 14.w),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(10.r),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 8.w,
                height: 8.w,
                decoration: BoxDecoration(
                  color: statusColor,
                  shape: BoxShape.circle,
                ),
              ),
              SizedBox(width: 10.w),
              Expanded(
                child: Text(
                  milestone.title,
                  style: compact
                      ? AppTextStyles.caption
                      : AppTextStyles.labelMedium,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              SizedBox(width: 8.w),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    _formatDate(milestone.deadline ?? ''),
                    style: AppTextStyles.caption.copyWith(
                      color: milestone.isOverdue
                          ? AppColors.error
                          : AppColors.textSecondary,
                      fontWeight: milestone.isUpcoming
                          ? FontWeight.w600
                          : FontWeight.w400,
                    ),
                  ),
                  Text(
                    _milestoneStatusLabel(milestone.status),
                    style: AppTextStyles.caption.copyWith(
                      color: statusColor,
                      fontSize: 10,
                    ),
                  ),
                ],
              ),
            ],
          ),
          if (!compact && milestone.description != null &&
              milestone.description!.isNotEmpty) ...[
            SizedBox(height: 6.w),
            Text(
              milestone.description!,
              style: AppTextStyles.caption
                  .copyWith(color: AppColors.textSecondary),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ],
          if (!compact && sortedItems.isNotEmpty) ...[
            SizedBox(height: 8.w),
            ...sortedItems.map(
              (item) => _ChecklistItem(
                item: item,
                onTap: onItemToggle != null
                    ? () => onItemToggle!(milestone.id, item.id)
                    : null,
              ),
            ),
          ],
          if (sortedItems.isNotEmpty) ...[
            SizedBox(height: compact ? 6.w : 10.w),
            _MilestoneProgressBar(
              items: sortedItems,
              statusColor: statusColor,
              compact: compact,
            ),
          ],
        ],
      ),
    );
  }

  Color _milestoneStatusColor(String status) {
    switch (status) {
      case 'upcoming':
        return const Color(0xFF3B82F6);
      case 'in_progress':
        return const Color(0xFFF59E0B);
      case 'completed':
        return const Color(0xFF22C55E);
      case 'overdue':
        return AppColors.error;
      default:
        return AppColors.textSecondary;
    }
  }

  String _milestoneStatusLabel(String status) {
    switch (status) {
      case 'upcoming':
        return 'Sắp tới';
      case 'in_progress':
        return 'Đang làm';
      case 'completed':
        return 'Hoàn thành';
      case 'overdue':
        return 'Quá hạn';
      default:
        return status;
    }
  }

  String _formatDate(String dateStr) {
    final date = DateTime.tryParse(dateStr);
    if (date == null) return dateStr;
    return '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}';
  }
}

class _ChecklistItem extends StatelessWidget {
  const _ChecklistItem({required this.item, this.onTap});
  final MilestoneItem item;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(6.r),
      child: Padding(
        padding: EdgeInsets.only(bottom: 4.w, left: 18.w),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: EdgeInsets.only(top: 2.w),
              child: Icon(
                item.isCompleted
                    ? Icons.check_circle_rounded
                    : Icons.radio_button_unchecked_rounded,
                size: 14.sp,
                color: item.isCompleted
                    ? const Color(0xFF22C55E)
                    : AppColors.textHint,
              ),
            ),
            SizedBox(width: 6.w),
            Expanded(
              child: Text(
                item.content,
                style: AppTextStyles.caption.copyWith(
                  color: item.isCompleted
                      ? AppColors.textSecondary
                      : AppColors.textPrimary,
                  decoration:
                      item.isCompleted ? TextDecoration.lineThrough : null,
                  decorationColor: AppColors.textSecondary,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _MilestoneProgressBar extends StatelessWidget {
  const _MilestoneProgressBar({
    required this.items,
    required this.statusColor,
    required this.compact,
  });

  final List<MilestoneItem> items;
  final Color statusColor;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final completed = items.where((i) => i.isCompleted).length;
    final total = items.length;
    final progress = total > 0 ? completed / total : 0.0;
    final percentage = (progress * 100).round();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: ClipRRect(
                borderRadius: BorderRadius.circular(4.r),
                child: LinearProgressIndicator(
                  value: progress,
                  minHeight: compact ? 4.w : 6.w,
                  backgroundColor: AppColors.border,
                  valueColor: AlwaysStoppedAnimation<Color>(statusColor),
                ),
              ),
            ),
            SizedBox(width: 8.w),
            Text(
              '$completed/$total ($percentage%)',
              style: AppTextStyles.caption.copyWith(
                color: AppColors.textSecondary,
                fontSize: compact ? 10 : 11,
              ),
            ),
          ],
        ),
      ],
    );
  }
}
