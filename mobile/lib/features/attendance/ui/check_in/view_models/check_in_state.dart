import 'package:equatable/equatable.dart';
import 'package:exn_hr/features/attendance/domain/entities/attendance_record.dart';

enum CheckInStatus { initial, loading, success, failure }
enum LocationStatus { unknown, detecting, granted, denied }

class CheckInState extends Equatable {
  const CheckInState({
    this.status = CheckInStatus.initial,
    this.locationStatus = LocationStatus.unknown,
    this.isCheckedIn = false,
    this.record,
    this.latitude,
    this.longitude,
    this.wifiSsid,
    this.errorMessage,
  });

  final CheckInStatus status;
  final LocationStatus locationStatus;
  final bool isCheckedIn;
  final AttendanceRecord? record;
  final double? latitude;
  final double? longitude;
  final String? wifiSsid;
  final String? errorMessage;

  CheckInState copyWith({
    CheckInStatus? status,
    LocationStatus? locationStatus,
    bool? isCheckedIn,
    AttendanceRecord? record,
    double? latitude,
    double? longitude,
    String? wifiSsid,
    String? errorMessage,
  }) {
    return CheckInState(
      status: status ?? this.status,
      locationStatus: locationStatus ?? this.locationStatus,
      isCheckedIn: isCheckedIn ?? this.isCheckedIn,
      record: record ?? this.record,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      wifiSsid: wifiSsid ?? this.wifiSsid,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }

  @override
  List<Object?> get props => [
        status, locationStatus, isCheckedIn, record,
        latitude, longitude, wifiSsid, errorMessage,
      ];
}
