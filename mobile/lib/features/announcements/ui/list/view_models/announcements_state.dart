import 'package:equatable/equatable.dart';
import 'package:exn_hr/features/announcements/domain/entities/announcement.dart';

enum AnnouncementsStatus { initial, loading, success, failure }

class AnnouncementsState extends Equatable {
  const AnnouncementsState({
    this.status = AnnouncementsStatus.initial,
    this.announcements = const [],
    this.votingPollId,
    this.errorMessage,
  });

  final AnnouncementsStatus status;
  final List<Announcement> announcements;
  final int? votingPollId;
  final String? errorMessage;

  AnnouncementsState copyWith({
    AnnouncementsStatus? status,
    List<Announcement>? announcements,
    int? votingPollId,
    String? errorMessage,
    bool clearVotingPollId = false,
  }) {
    return AnnouncementsState(
      status: status ?? this.status,
      announcements: announcements ?? this.announcements,
      votingPollId:
          clearVotingPollId ? null : (votingPollId ?? this.votingPollId),
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }

  @override
  List<Object?> get props =>
      [status, announcements, votingPollId, errorMessage];
}
