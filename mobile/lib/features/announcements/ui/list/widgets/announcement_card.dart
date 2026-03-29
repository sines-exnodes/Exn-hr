import 'package:exn_hr/core/themes/app_colors.dart';
import 'package:exn_hr/core/themes/app_text_styles.dart';
import 'package:exn_hr/features/announcements/domain/entities/announcement.dart';
import 'package:exn_hr/features/announcements/ui/list/widgets/poll_widget.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class AnnouncementCard extends StatelessWidget {
  const AnnouncementCard({
    super.key,
    required this.announcement,
    required this.onVote,
    this.votingPollId,
  });

  final Announcement announcement;
  final Future<void> Function(int pollId, List<int> optionIds) onVote;
  final int? votingPollId;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(14.r),
        border: Border.all(
          color: announcement.isPinned
              ? AppColors.primary.withValues(alpha: 0.4)
              : AppColors.border,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHeader(),
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 16.w),
            child: Text(
              announcement.content,
              style: AppTextStyles.bodySmall
                  .copyWith(color: AppColors.textSecondary),
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          if (announcement.poll != null) ...[
            SizedBox(height: 12.w),
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 16.w),
              child: PollWidget(
                poll: announcement.poll!,
                isVoting:
                    votingPollId != null && votingPollId == announcement.poll!.id,
                onVote: (optionIds) =>
                    onVote(announcement.poll!.id, optionIds),
              ),
            ),
          ],
          SizedBox(height: 14.w),
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 16.w),
            child: Row(
              children: [
                _TargetBadge(targetType: announcement.targetType),
                const Spacer(),
                Text(
                  _formatDate(announcement.createdAt),
                  style: AppTextStyles.caption
                      .copyWith(color: AppColors.textHint),
                ),
              ],
            ),
          ),
          SizedBox(height: 14.w),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Padding(
      padding: EdgeInsets.fromLTRB(16.w, 14.w, 16.w, 8.w),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (announcement.isPinned) ...[
            Icon(Icons.push_pin_rounded,
                size: 16.sp, color: AppColors.primary),
            SizedBox(width: 6.w),
          ],
          Expanded(
            child: Text(
              announcement.title,
              style: AppTextStyles.labelLarge
                  .copyWith(fontWeight: FontWeight.w600),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }

  String _formatDate(String dateStr) {
    final date = DateTime.tryParse(dateStr);
    if (date == null) return dateStr;
    return '${date.day.toString().padLeft(2, '0')}/'
        '${date.month.toString().padLeft(2, '0')}/'
        '${date.year}';
  }
}

class _TargetBadge extends StatelessWidget {
  const _TargetBadge({required this.targetType});
  final String targetType;

  @override
  Widget build(BuildContext context) {
    Color color;
    String label;
    IconData icon;

    switch (targetType) {
      case 'company':
        color = AppColors.info;
        label = 'Toan cong ty';
        icon = Icons.business_rounded;
        break;
      case 'team':
        color = AppColors.warning;
        label = 'Team';
        icon = Icons.group_rounded;
        break;
      case 'project':
        color = AppColors.primary;
        label = 'Du an';
        icon = Icons.folder_rounded;
        break;
      default:
        color = AppColors.textSecondary;
        label = targetType;
        icon = Icons.campaign_rounded;
    }

    return Container(
      padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 3.w),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(6.r),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12.sp, color: color),
          SizedBox(width: 4.w),
          Text(
            label,
            style: AppTextStyles.caption
                .copyWith(color: color, fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }
}
