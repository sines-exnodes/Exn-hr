import 'package:equatable/equatable.dart';
import 'package:exn_hr/features/announcements/domain/entities/announcement.dart';

enum AnnouncementsStatus { initial, loading, success, failure }

class AnnouncementsState extends Equatable {
  const AnnouncementsState({
    this.status = AnnouncementsStatus.initial,
    this.announcements = const [],
    this.votingPollId,
    this.errorMessage,
    this.currentPage = 1,
    this.hasMore = true,
    this.isPaginating = false,
  });

  final AnnouncementsStatus status;
  final List<Announcement> announcements;
  final int? votingPollId;
  final String? errorMessage;
  final int currentPage;
  final bool hasMore;
  final bool isPaginating;

  AnnouncementsState copyWith({
    AnnouncementsStatus? status,
    List<Announcement>? announcements,
    int? votingPollId,
    String? errorMessage,
    bool clearVotingPollId = false,
    int? currentPage,
    bool? hasMore,
    bool? isPaginating,
  }) {
    return AnnouncementsState(
      status: status ?? this.status,
      announcements: announcements ?? this.announcements,
      votingPollId:
          clearVotingPollId ? null : (votingPollId ?? this.votingPollId),
      errorMessage: errorMessage ?? this.errorMessage,
      currentPage: currentPage ?? this.currentPage,
      hasMore: hasMore ?? this.hasMore,
      isPaginating: isPaginating ?? this.isPaginating,
    );
  }

  @override
  List<Object?> get props =>
      [status, announcements, votingPollId, errorMessage, currentPage, hasMore, isPaginating];
}
