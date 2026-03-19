import 'package:exn_hr/features/leave/data/models/leave_model.dart';
import 'package:exn_hr/features/leave/domain/entities/leave_request.dart';

extension LeaveMapper on LeaveModel {
  LeaveRequest toEntity() {
    return LeaveRequest(
      id: id,
      type: type,
      startDate: startDate,
      endDate: endDate,
      totalDays: totalDays,
      reason: reason,
      status: status,
      leaderApproval: leaderApproval,
      hrApproval: hrApproval,
      createdAt: createdAt,
      employeeId: employeeId,
      employeeName: employeeName,
    );
  }
}
