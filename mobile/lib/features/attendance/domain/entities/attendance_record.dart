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
  });

  final int id;
  final int employeeId;
  final String? checkInTime;
  final String? checkOutTime;
  final double? gpsLat;
  final double? gpsLng;
  final String? wifiSsid;
  final String? status;

  @override
  List<Object?> get props => [id, employeeId, checkInTime, checkOutTime, status];
}
