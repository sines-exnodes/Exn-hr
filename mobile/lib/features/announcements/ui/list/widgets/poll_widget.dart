import 'package:exn_hr/core/themes/app_colors.dart';
import 'package:exn_hr/core/themes/app_text_styles.dart';
import 'package:exn_hr/features/announcements/domain/entities/announcement.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class PollWidget extends StatefulWidget {
  const PollWidget({
    super.key,
    required this.poll,
    required this.onVote,
    this.isVoting = false,
  });

  final Poll poll;
  final Future<void> Function(List<int> optionIds) onVote;
  final bool isVoting;

  @override
  State<PollWidget> createState() => _PollWidgetState();
}

class _PollWidgetState extends State<PollWidget> {
  final Set<int> _selected = {};

  @override
  void initState() {
    super.initState();
    _selected.addAll(widget.poll.myVotes);
  }

  bool get _canVote =>
      !widget.poll.hasVoted &&
      !widget.poll.isClosed &&
      !widget.poll.isDeadlinePassed;

  bool get _showResults =>
      widget.poll.hasVoted ||
      widget.poll.isClosed ||
      widget.poll.isDeadlinePassed;

  void _toggleOption(int optionId) {
    if (!_canVote) return;
    setState(() {
      if (widget.poll.isMultipleChoice) {
        if (_selected.contains(optionId)) {
          _selected.remove(optionId);
        } else {
          _selected.add(optionId);
        }
      } else {
        _selected
          ..clear()
          ..add(optionId);
      }
    });
  }

  Future<void> _submit() async {
    if (_selected.isEmpty) return;
    await widget.onVote(_selected.toList());
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(14.w),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(12.r),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildPollHeader(),
          SizedBox(height: 10.w),
          ..._buildOptions(),
          SizedBox(height: 10.w),
          _buildFooter(),
        ],
      ),
    );
  }

  Widget _buildPollHeader() {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(Icons.poll_rounded, size: 16.sp, color: AppColors.primary),
        SizedBox(width: 6.w),
        Expanded(
          child: Text(
            widget.poll.question,
            style: AppTextStyles.labelMedium,
          ),
        ),
      ],
    );
  }

  List<Widget> _buildOptions() {
    final sortedOptions = [...widget.poll.options]
      ..sort((a, b) => a.displayOrder.compareTo(b.displayOrder));

    return sortedOptions.map((option) {
      if (_showResults) {
        return _ResultOptionRow(
          option: option,
          totalVotes: widget.poll.totalVotes,
          isMyVote: widget.poll.myVotes.contains(option.id),
        );
      }
      return _SelectableOptionRow(
        option: option,
        isSelected: _selected.contains(option.id),
        isMultipleChoice: widget.poll.isMultipleChoice,
        onTap: () => _toggleOption(option.id),
      );
    }).toList();
  }

  Widget _buildFooter() {
    return Row(
      children: [
        if (widget.poll.isAnonymous) ...[
          Icon(Icons.visibility_off_outlined,
              size: 12.sp, color: AppColors.textHint),
          SizedBox(width: 4.w),
          Text('Ẩn danh',
              style: AppTextStyles.caption.copyWith(color: AppColors.textHint)),
          SizedBox(width: 12.w),
        ],
        Icon(Icons.how_to_vote_outlined,
            size: 12.sp, color: AppColors.textHint),
        SizedBox(width: 4.w),
        Text('${widget.poll.totalVotes} phiếu',
            style:
                AppTextStyles.caption.copyWith(color: AppColors.textHint)),
        if (widget.poll.deadline != null) ...[
          SizedBox(width: 12.w),
          Icon(Icons.schedule_rounded,
              size: 12.sp, color: AppColors.textHint),
          SizedBox(width: 4.w),
          Text(
            _formatDeadline(widget.poll.deadline!),
            style: AppTextStyles.caption.copyWith(
              color: widget.poll.isDeadlinePassed
                  ? AppColors.error
                  : AppColors.textHint,
            ),
          ),
        ],
        const Spacer(),
        if (_canVote && !_showResults)
          _buildVoteButton(),
        if (widget.poll.isClosed)
          _buildStatusChip('Đã đóng', AppColors.textSecondary),
        if (widget.poll.isDeadlinePassed && !widget.poll.isClosed)
          _buildStatusChip('Hết hạn', AppColors.warning),
        if (widget.poll.hasVoted && !widget.poll.isClosed)
          _buildStatusChip('Đã bầu', AppColors.primary),
      ],
    );
  }

  Widget _buildVoteButton() {
    return SizedBox(
      height: 30.w,
      child: ElevatedButton(
        onPressed: (_selected.isEmpty || widget.isVoting) ? null : _submit,
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          disabledBackgroundColor: AppColors.border,
          padding: EdgeInsets.symmetric(horizontal: 14.w),
          shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8.r)),
          minimumSize: Size.zero,
          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
        ),
        child: widget.isVoting
            ? SizedBox(
                width: 14.w,
                height: 14.w,
                child: const CircularProgressIndicator(
                    strokeWidth: 2, color: Colors.white),
              )
            : Text(
                'Bầu',
                style: AppTextStyles.caption.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                ),
              ),
      ),
    );
  }

  Widget _buildStatusChip(String label, Color color) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 3.w),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(6.r),
      ),
      child: Text(
        label,
        style: AppTextStyles.caption
            .copyWith(color: color, fontWeight: FontWeight.w600),
      ),
    );
  }

  String _formatDeadline(String dateStr) {
    final date = DateTime.tryParse(dateStr);
    if (date == null) return dateStr;
    return '${date.day.toString().padLeft(2, '0')}/'
        '${date.month.toString().padLeft(2, '0')}';
  }
}

class _SelectableOptionRow extends StatelessWidget {
  const _SelectableOptionRow({
    required this.option,
    required this.isSelected,
    required this.isMultipleChoice,
    required this.onTap,
  });

  final PollOption option;
  final bool isSelected;
  final bool isMultipleChoice;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: EdgeInsets.only(bottom: 6.w),
        padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 10.w),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.primary.withValues(alpha: 0.08)
              : AppColors.surface,
          borderRadius: BorderRadius.circular(8.r),
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.border,
          ),
        ),
        child: Row(
          children: [
            isMultipleChoice
                ? Icon(
                    isSelected
                        ? Icons.check_box_rounded
                        : Icons.check_box_outline_blank_rounded,
                    size: 18.sp,
                    color: isSelected
                        ? AppColors.primary
                        : AppColors.textSecondary,
                  )
                : Icon(
                    isSelected
                        ? Icons.radio_button_checked_rounded
                        : Icons.radio_button_unchecked_rounded,
                    size: 18.sp,
                    color: isSelected
                        ? AppColors.primary
                        : AppColors.textSecondary,
                  ),
            SizedBox(width: 10.w),
            Expanded(
              child: Text(option.text, style: AppTextStyles.bodySmall),
            ),
          ],
        ),
      ),
    );
  }
}

class _ResultOptionRow extends StatelessWidget {
  const _ResultOptionRow({
    required this.option,
    required this.totalVotes,
    required this.isMyVote,
  });

  final PollOption option;
  final int totalVotes;
  final bool isMyVote;

  double get _percentage {
    if (totalVotes == 0) return 0;
    return (option.voteCount / totalVotes).clamp(0.0, 1.0);
  }

  @override
  Widget build(BuildContext context) {
    final pct = (_percentage * 100).round();
    return Container(
      margin: EdgeInsets.only(bottom: 8.w),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              if (isMyVote)
                Padding(
                  padding: EdgeInsets.only(right: 4.w),
                  child: Icon(Icons.check_circle_rounded,
                      size: 14.sp, color: AppColors.primary),
                ),
              Expanded(
                child: Text(
                  option.text,
                  style: AppTextStyles.bodySmall.copyWith(
                    fontWeight:
                        isMyVote ? FontWeight.w600 : FontWeight.w400,
                    color: isMyVote
                        ? AppColors.textPrimary
                        : AppColors.textSecondary,
                  ),
                ),
              ),
              SizedBox(width: 8.w),
              Text(
                '$pct%',
                style: AppTextStyles.caption.copyWith(
                  fontWeight: FontWeight.w600,
                  color: isMyVote
                      ? AppColors.primary
                      : AppColors.textSecondary,
                ),
              ),
            ],
          ),
          SizedBox(height: 4.w),
          ClipRRect(
            borderRadius: BorderRadius.circular(4.r),
            child: LinearProgressIndicator(
              value: _percentage,
              minHeight: 6.w,
              backgroundColor: AppColors.border,
              color:
                  isMyVote ? AppColors.primary : AppColors.textSecondary,
            ),
          ),
          SizedBox(height: 2.w),
          Text(
            '${option.voteCount} phiếu',
            style: AppTextStyles.caption
                .copyWith(color: AppColors.textHint, fontSize: 10),
          ),
        ],
      ),
    );
  }
}
