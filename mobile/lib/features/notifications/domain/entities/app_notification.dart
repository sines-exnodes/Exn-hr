import 'package:equatable/equatable.dart';

class AppNotification extends Equatable {
  const AppNotification({
    required this.id,
    required this.title,
    required this.body,
    required this.type,
    required this.isRead,
    this.createdAt,
    this.referenceId,
  });

  final String id;
  final String title;
  final String body;
  final String type; // leave_approved, leave_rejected, ot_approved, attendance, etc.
  final bool isRead;
  final String? createdAt;
  final String? referenceId;

  @override
  List<Object?> get props => [id, title, type, isRead, createdAt];
}
