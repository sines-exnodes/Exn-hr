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

class _AnnouncementsView extends StatelessWidget {
  const _AnnouncementsView();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Thong bao'),
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
                    Icon(Icons.error_outline,
                        size: 48.sp, color: AppColors.error),
                    SizedBox(height: 12.w),
                    Text(
                      state.errorMessage ??
                          'Khong tai duoc danh sach thong bao',
                      style: AppTextStyles.bodyMedium,
                      textAlign: TextAlign.center,
                    ),
                    SizedBox(height: 16.w),
                    TextButton(
                      onPressed: () =>
                          context.read<AnnouncementsCubit>().loadAnnouncements(),
                      child: const Text('Thu lai'),
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
                  Icon(Icons.campaign_outlined,
                      size: 48.sp, color: AppColors.textHint),
                  SizedBox(height: 12.w),
                  Text('Chua co thong bao nao',
                      style: AppTextStyles.bodyMedium),
                ],
              ),
            );
          }
          return RefreshIndicator(
            onRefresh: () =>
                context.read<AnnouncementsCubit>().loadAnnouncements(),
            color: AppColors.primary,
            child: ListView.builder(
              padding: EdgeInsets.all(16.w),
              itemCount: state.announcements.length,
              itemBuilder: (context, index) {
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
