import 'package:equatable/equatable.dart';

class AppNotification extends Equatable {
  const AppNotification({
    required this.id,
    required this.userId,
    required this.title,
    required this.body,
    required this.type,
    required this.isRead,
    this.referenceId, this.referenceType, this.createdAt,
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

  AppNotification copyWith({
    int? id,
    int? userId,
    String? title,
    String? body,
    String? type,
    bool? isRead,
    int? referenceId,
    String? referenceType,
    String? createdAt,
  }) {
    return AppNotification(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      title: title ?? this.title,
      body: body ?? this.body,
      type: type ?? this.type,
      isRead: isRead ?? this.isRead,
      referenceId: referenceId ?? this.referenceId,
      referenceType: referenceType ?? this.referenceType,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  @override
  List<Object?> get props => [id, title, type, isRead, createdAt];
}
