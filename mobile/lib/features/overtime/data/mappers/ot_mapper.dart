import 'package:exn_hr/features/overtime/data/models/ot_model.dart';
import 'package:exn_hr/features/overtime/domain/entities/ot_request.dart';

extension OtMapper on OtModel {
  OtRequest toEntity() {
    return OtRequest(
      id: id,
      date: date,
      startTime: startTime,
      endTime: endTime,
      totalHours: totalHours,
      reason: reason,
      status: status,
      leaderApproval: leaderApproval,
      ceoApproval: ceoApproval,
      createdAt: createdAt,
      employeeId: employeeId,
      employeeName: employeeName,
    );
  }
}
