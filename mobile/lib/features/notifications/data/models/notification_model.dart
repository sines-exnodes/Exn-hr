class NotificationModel {
  const NotificationModel({
    required this.id,
    required this.userId,
    required this.title,
    required this.body,
    required this.type,
    required this.isRead,
    this.referenceId,
    this.referenceType,
    this.createdAt,
  });

  final int id;
  final int userId;
  final String title;
  final String body;
  final String type;
  final bool isRead;
  final int? referenceId;
  final String? referenceType;
  final String? createdAt;

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      id: json['id'] as int,
      userId: json['user_id'] as int,
      title: json['title'] as String,
      body: json['body'] as String,
      type: json['type'] as String,
      isRead: json['is_read'] as bool? ?? false,
      referenceId: json['reference_id'] as int?,
      referenceType: json['reference_type'] as String?,
      createdAt: json['created_at'] as String?,
    );
  }
}
