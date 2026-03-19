import 'package:json_annotation/json_annotation.dart';

part 'attendance_model.g.dart';

@JsonSerializable()
class AttendanceModel {
  const AttendanceModel({
    required this.id,
    required this.date,
    this.checkInTime,
    this.checkOutTime,
    this.totalHours,
    this.location,
    this.verificationMethod,
  });

  final String id;
  final String date;
  @JsonKey(name: 'check_in_time')
  final String? checkInTime;
  @JsonKey(name: 'check_out_time')
  final String? checkOutTime;
  @JsonKey(name: 'total_hours')
  final String? totalHours;
  final String? location;
  @JsonKey(name: 'verification_method')
  final String? verificationMethod;

  factory AttendanceModel.fromJson(Map<String, dynamic> json) =>
      _$AttendanceModelFromJson(json);
  Map<String, dynamic> toJson() => _$AttendanceModelToJson(this);
}
