import 'package:exn_hr/features/attendance/data/models/attendance_model.dart';
import 'package:exn_hr/features/attendance/domain/entities/attendance_record.dart';

extension AttendanceMapper on AttendanceModel {
  AttendanceRecord toEntity() {
    return AttendanceRecord(
      id: id, employeeId: employeeId,
      checkInTime: checkInTime, checkOutTime: checkOutTime,
      gpsLat: gpsLat, gpsLng: gpsLng, wifiSsid: wifiSsid, status: status,
    );
  }
}
