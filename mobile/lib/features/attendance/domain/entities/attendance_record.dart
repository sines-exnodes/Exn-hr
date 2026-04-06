import 'package:equatable/equatable.dart';

class AttendanceRecord extends Equatable {
  const AttendanceRecord({
    required this.id,
    required this.employeeId,
    this.checkInTime,
    this.checkOutTime,
    this.gpsLat,
    this.gpsLng,
    this.wifiSsid,
    this.status,
    this.isLate = false,
    this.lateMinutes = 0,
  });

  final int id;
  final int employeeId;
  final String? checkInTime;
  final String? checkOutTime;
  final double? gpsLat;
  final double? gpsLng;
  final String? wifiSsid;
  final String? status;
  final bool isLate;
  final int lateMinutes;

  @override
  List<Object?> get props => [id, employeeId, checkInTime, checkOutTime, status, isLate, lateMinutes];
}
