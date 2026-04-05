import 'package:exn_hr/config/di.dart';
import 'package:exn_hr/core/themes/app_colors.dart';
import 'package:exn_hr/core/themes/app_text_styles.dart';
import 'package:exn_hr/core/widgets/animations/animations.dart';
import 'package:exn_hr/features/announcements/ui/list/view_models/announcements_cubit.dart';
import 'package:exn_hr/features/announcements/ui/list/view_models/announcements_state.dart';
import 'package:exn_hr/features/announcements/ui/list/widgets/announcement_card.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class AnnouncementsPage extends StatelessWidget {
  const AnnouncementsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => getIt<AnnouncementsCubit>(),
      child: const _AnnouncementsView(),
    );
  }
}

class _AnnouncementsView extends StatefulWidget {
  const _AnnouncementsView();

  @override
  State<_AnnouncementsView> createState() => _AnnouncementsViewState();
}

class _AnnouncementsViewState extends State<_AnnouncementsView> {
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      context.read<AnnouncementsCubit>().loadNextPage();
    }
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgPage,
      appBar: AppBar(
        title: const Text('Thông báo'),
        automaticallyImplyLeading: true,
      ),
      body: BlocBuilder<AnnouncementsCubit, AnnouncementsState>(
        builder: (context, state) {
          if (state.status == AnnouncementsStatus.loading) {
            return const Center(child: CircularProgressIndicator());
          }
          if (state.status == AnnouncementsStatus.failure) {
            return Center(
              child: Padding(
                padding: EdgeInsets.all(24.w),
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
                      child: Icon(Icons.error_outline, size: 32.sp, color: AppColors.error),
                    ),
                    SizedBox(height: 16.w),
                    Text(
                      state.errorMessage ??
                          'Không tải được danh sách thông báo',
                      style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w600),
                      textAlign: TextAlign.center,
                    ),
                    SizedBox(height: 16.w),
                    TextButton.icon(
                      onPressed: () =>
                          context.read<AnnouncementsCubit>().loadAnnouncements(),
                      icon: const Icon(Icons.refresh_rounded),
                      label: const Text('Thử lại'),
                    ),
                  ],
                ),
              ),
            );
          }
          if (state.announcements.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 64.w,
                    height: 64.w,
                    decoration: BoxDecoration(
                      color: AppColors.infoBg,
                      borderRadius: BorderRadius.circular(20.r),
                    ),
                    child: Icon(Icons.campaign_outlined, size: 32.sp, color: AppColors.info),
                  ),
                  SizedBox(height: 16.w),
                  Text('Chưa có thông báo nào',
                      style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w600)),
                  SizedBox(height: 4.w),
                  Text('Thông báo mới sẽ hiển thị tại đây', style: AppTextStyles.caption),
                ],
              ),
            );
          }
          return RefreshIndicator(
            onRefresh: () =>
                context.read<AnnouncementsCubit>().loadAnnouncements(),
            color: AppColors.primary,
            child: ListView.builder(
              controller: _scrollController,
              padding: EdgeInsets.all(16.w),
              itemCount: state.announcements.length +
                  (state.isPaginating ? 1 : 0),
              itemBuilder: (context, index) {
                if (index == state.announcements.length) {
                  return Padding(
                    padding: EdgeInsets.symmetric(vertical: 16.w),
                    child: const Center(
                      child: CircularProgressIndicator(),
                    ),
                  );
                }
                final announcement = state.announcements[index];
                return AnimatedListItem(
                  index: index,
                  child: Padding(
                    padding: EdgeInsets.only(bottom: 12.w),
                    child: AnnouncementCard(
                      announcement: announcement,
                      votingPollId: state.votingPollId,
                      onVote: (pollId, optionIds) => context
                          .read<AnnouncementsCubit>()
                          .votePoll(pollId, optionIds),
                    ),
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}
