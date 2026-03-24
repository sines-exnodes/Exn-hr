import 'package:exn_hr/features/notifications/data/models/notification_model.dart';
import 'package:exn_hr/features/notifications/domain/entities/app_notification.dart';

extension NotificationMapper on NotificationModel {
  AppNotification toEntity() {
    return AppNotification(
      id: id, userId: userId, title: title, body: body,
      type: type, isRead: isRead,
      referenceId: referenceId, referenceType: referenceType, createdAt: createdAt,
    );
  }
}
