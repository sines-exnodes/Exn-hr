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

  @override
  List<Object?> get props => [id, title, type, isRead, createdAt];
}
