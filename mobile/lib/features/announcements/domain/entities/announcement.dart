import 'package:equatable/equatable.dart';

class PollOption extends Equatable {
  const PollOption({
    required this.id,
    required this.pollId,
    required this.text,
    required this.voteCount,
    required this.displayOrder,
    this.percentage = 0.0,
  });

  final int id;
  final int pollId;
  final String text;
  final int voteCount;
  final int displayOrder;
  final double percentage;

  @override
  List<Object?> get props => [id, pollId, text, voteCount, displayOrder];
}

class Poll extends Equatable {
  const Poll({
    required this.id,
    required this.announcementId,
    required this.question,
    required this.isMultipleChoice,
    required this.isAnonymous,
    required this.status,
    this.deadline,
    this.options = const [],
    this.myVotes = const [],
    this.totalVotes = 0,
  });

  final int id;
  final int announcementId;
  final String question;
  final bool isMultipleChoice;
  final bool isAnonymous;
  final String status;
  final String? deadline;
  final List<PollOption> options;
  final List<int> myVotes;
  final int totalVotes;

  bool get isClosed => status == 'closed';
  bool get hasVoted => myVotes.isNotEmpty;

  bool get isDeadlinePassed {
    if (deadline == null) return false;
    final dl = DateTime.tryParse(deadline!);
    if (dl == null) return false;
    return dl.isBefore(DateTime.now());
  }

  @override
  List<Object?> get props => [id, announcementId, question, status, myVotes];
}

class Announcement extends Equatable {
  const Announcement({
    required this.id,
    required this.title,
    required this.content,
    required this.targetType,
    required this.createdAt,
    this.targetId,
    this.isPinned = false,
    this.expiresAt,
    this.poll,
  });

  final int id;
  final String title;
  final String content;
  final String targetType;
  final String createdAt;
  final int? targetId;
  final bool isPinned;
  final String? expiresAt;
  final Poll? poll;

  @override
  List<Object?> get props => [id, title, targetType, createdAt, isPinned];
}
