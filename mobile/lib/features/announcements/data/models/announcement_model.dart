class PollOptionModel {
  const PollOptionModel({
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

  factory PollOptionModel.fromJson(Map<String, dynamic> json) {
    return PollOptionModel(
      id: json['id'] as int,
      pollId: json['poll_id'] as int? ?? 0,
      text: json['text'] as String,
      voteCount: json['vote_count'] as int? ?? 0,
      displayOrder: json['display_order'] as int? ?? 0,
      percentage: (json['percentage'] as num?)?.toDouble() ?? 0.0,
    );
  }
}

class PollModel {
  const PollModel({
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
  final List<PollOptionModel> options;
  final List<int> myVotes;
  final int totalVotes;

  factory PollModel.fromJson(Map<String, dynamic> json) {
    return PollModel(
      id: json['id'] as int,
      announcementId: json['announcement_id'] as int? ?? 0,
      question: json['question'] as String,
      isMultipleChoice: json['is_multiple_choice'] as bool? ?? false,
      isAnonymous: json['is_anonymous'] as bool? ?? true,
      status: json['status'] as String? ?? 'active',
      deadline: json['deadline'] as String?,
      options: (json['options'] as List<dynamic>? ?? [])
          .map((e) => PollOptionModel.fromJson(e as Map<String, dynamic>))
          .toList(),
      myVotes: (json['my_votes'] as List<dynamic>? ?? [])
          .map((e) => e as int)
          .toList(),
      totalVotes: json['total_votes'] as int? ?? 0,
    );
  }
}

class AnnouncementModel {
  const AnnouncementModel({
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
  final PollModel? poll;

  factory AnnouncementModel.fromJson(Map<String, dynamic> json) {
    final pollJson = json['poll'] as Map<String, dynamic>?;
    return AnnouncementModel(
      id: json['id'] as int,
      title: json['title'] as String,
      content: json['content'] as String,
      targetType: json['target_type'] as String? ?? 'all',
      createdAt: json['created_at'] as String,
      targetId: json['target_id'] as int?,
      isPinned: json['is_pinned'] as bool? ?? false,
      expiresAt: json['expires_at'] as String?,
      poll: pollJson != null ? PollModel.fromJson(pollJson) : null,
    );
  }
}
