import 'package:exn_hr/features/overtime/data/models/ot_model.dart';
import 'package:exn_hr/features/overtime/domain/entities/ot_request.dart';

extension OtMapper on OtModel {
  OtRequest toEntity() {
    return OtRequest(
      id: id, employeeId: employeeId, date: date,
      startTime: startTime, endTime: endTime, hours: hours,
      otType: otType, reason: reason, leaderStatus: leaderStatus,
      ceoStatus: ceoStatus, overallStatus: overallStatus,
      employeeName: employeeName,
    );
  }
}
