import 'package:exn_hr/features/announcements/data/models/announcement_model.dart';
import 'package:exn_hr/features/announcements/domain/entities/announcement.dart';

extension PollOptionMapper on PollOptionModel {
  PollOption toEntity() {
    return PollOption(
      id: id,
      pollId: pollId,
      text: text,
      voteCount: voteCount,
      displayOrder: displayOrder,
      percentage: percentage,
    );
  }
}

extension PollMapper on PollModel {
  Poll toEntity() {
    return Poll(
      id: id,
      announcementId: announcementId,
      question: question,
      isMultipleChoice: isMultipleChoice,
      isAnonymous: isAnonymous,
      status: status,
      deadline: deadline,
      options: options.map((o) => o.toEntity()).toList(),
      myVotes: myVotes,
      totalVotes: totalVotes,
    );
  }
}

extension AnnouncementMapper on AnnouncementModel {
  Announcement toEntity() {
    return Announcement(
      id: id,
      title: title,
      content: content,
      targetType: targetType,
      createdAt: createdAt,
      targetId: targetId,
      isPinned: isPinned,
      expiresAt: expiresAt,
      poll: poll?.toEntity(),
    );
  }
}
