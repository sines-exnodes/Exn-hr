import 'package:exn_hr/features/announcements/domain/entities/announcement.dart';
import 'package:exn_hr/features/announcements/domain/usecases/get_my_announcements_usecase.dart';
import 'package:exn_hr/features/announcements/domain/usecases/get_poll_results_usecase.dart';
import 'package:exn_hr/features/announcements/domain/usecases/vote_poll_usecase.dart';
import 'package:exn_hr/features/announcements/ui/list/view_models/announcements_state.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class AnnouncementsCubit extends Cubit<AnnouncementsState> {
  AnnouncementsCubit({
    required GetMyAnnouncementsUseCase getMyAnnouncementsUseCase,
    required VotePollUseCase votePollUseCase,
    required GetPollResultsUseCase getPollResultsUseCase,
  })  : _getMyAnnouncementsUseCase = getMyAnnouncementsUseCase,
        _votePollUseCase = votePollUseCase,
        _getPollResultsUseCase = getPollResultsUseCase,
        super(const AnnouncementsState()) {
    loadAnnouncements();
  }

  final GetMyAnnouncementsUseCase _getMyAnnouncementsUseCase;
  final VotePollUseCase _votePollUseCase;
  final GetPollResultsUseCase _getPollResultsUseCase;

  static const int _pageSize = 15;

  /// Initial load or pull-to-refresh (resets pagination).
  Future<void> loadAnnouncements() async {
    emit(state.copyWith(
      status: AnnouncementsStatus.loading,
      announcements: const [],
      currentPage: 1,
      hasMore: true,
      isPaginating: false,
    ));
    final result = await _getMyAnnouncementsUseCase(page: 1, size: _pageSize);
    if (isClosed) return;
    result.fold(
      (error) => emit(state.copyWith(
        status: AnnouncementsStatus.failure,
        errorMessage: error.message,
      )),
      (announcements) {
        final sorted = _sortAnnouncements(announcements);
        emit(state.copyWith(
          status: AnnouncementsStatus.success,
          announcements: sorted,
          currentPage: 1,
          hasMore: announcements.length >= _pageSize,
        ));
      },
    );
  }

  /// Load the next page and append.
  Future<void> loadNextPage() async {
    if (!state.hasMore || state.isPaginating) return;
    emit(state.copyWith(isPaginating: true));
    final nextPage = state.currentPage + 1;
    final result =
        await _getMyAnnouncementsUseCase(page: nextPage, size: _pageSize);
    if (isClosed) return;
    result.fold(
      (error) => emit(state.copyWith(isPaginating: false)),
      (newAnnouncements) {
        final combined = [...state.announcements, ..._sortAnnouncements(newAnnouncements)];
        emit(state.copyWith(
          announcements: combined,
          currentPage: nextPage,
          hasMore: newAnnouncements.length >= _pageSize,
          isPaginating: false,
        ));
      },
    );
  }

  List<Announcement> _sortAnnouncements(List<Announcement> announcements) {
    return [...announcements]..sort((a, b) {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return b.createdAt.compareTo(a.createdAt);
      });
  }

  Future<void> votePoll(int pollId, List<int> optionIds) async {
    emit(state.copyWith(votingPollId: pollId));
    final result = await _votePollUseCase(pollId: pollId, optionIds: optionIds);
    if (isClosed) return;
    result.fold(
      (error) {
        emit(state.copyWith(
          clearVotingPollId: true,
          errorMessage: error.message,
        ));
      },
      (updatedPoll) {
        final updatedAnnouncements = state.announcements.map((a) {
          if (a.poll?.id == pollId) {
            return Announcement(
              id: a.id,
              title: a.title,
              content: a.content,
              targetType: a.targetType,
              createdAt: a.createdAt,
              targetId: a.targetId,
              isPinned: a.isPinned,
              expiresAt: a.expiresAt,
              poll: updatedPoll,
            );
          }
          return a;
        }).toList();
        emit(state.copyWith(
          announcements: updatedAnnouncements,
          clearVotingPollId: true,
        ));
      },
    );
  }

  Future<void> loadPollResults(int pollId) async {
    final result = await _getPollResultsUseCase(pollId);
    if (isClosed) return;
    result.fold(
      (_) {},
      (updatedPoll) {
        final updatedAnnouncements = state.announcements.map((a) {
          if (a.poll?.id == pollId) {
            return Announcement(
              id: a.id,
              title: a.title,
              content: a.content,
              targetType: a.targetType,
              createdAt: a.createdAt,
              targetId: a.targetId,
              isPinned: a.isPinned,
              expiresAt: a.expiresAt,
              poll: updatedPoll,
            );
          }
          return a;
        }).toList();
        emit(state.copyWith(announcements: updatedAnnouncements));
      },
    );
  }
}
