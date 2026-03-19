import 'package:exn_hr/features/attendance/data/models/attendance_model.dart';
import 'package:exn_hr/features/attendance/domain/entities/attendance_record.dart';

extension AttendanceMapper on AttendanceModel {
  AttendanceRecord toEntity() {
    return AttendanceRecord(
      id: id,
      date: date,
      checkInTime: checkInTime,
      checkOutTime: checkOutTime,
      totalHours: totalHours,
      location: location,
      verificationMethod: verificationMethod,
    );
  }
}
