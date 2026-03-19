import 'package:json_annotation/json_annotation.dart';

part 'notification_model.g.dart';

@JsonSerializable()
class NotificationModel {
  const NotificationModel({
    required this.id,
    required this.title,
    required this.body,
    required this.type,
    this.isRead,
    this.createdAt,
    this.referenceId,
  });

  final String id;
  final String title;
  final String body;
  final String type;
  @JsonKey(name: 'is_read')
  final bool? isRead;
  @JsonKey(name: 'created_at')
  final String? createdAt;
  @JsonKey(name: 'reference_id')
  final String? referenceId;

  factory NotificationModel.fromJson(Map<String, dynamic> json) =>
      _$NotificationModelFromJson(json);
  Map<String, dynamic> toJson() => _$NotificationModelToJson(this);
}
