import 'package:exn_hr/features/leave/data/models/leave_model.dart';
import 'package:exn_hr/features/leave/domain/entities/leave_request.dart';

extension LeaveMapper on LeaveModel {
  LeaveRequest toEntity() {
    return LeaveRequest(
      id: id, employeeId: employeeId, type: type,
      startDate: startDate, endDate: endDate, days: days,
      reason: reason, leaderStatus: leaderStatus,
      hrStatus: hrStatus, overallStatus: overallStatus,
      employeeName: employeeName,
    );
  }
}

extension LeaveBalanceMapper on LeaveBalanceModel {
  LeaveBalance toEntity() {
    return LeaveBalance(totalDays: totalDays, usedDays: usedDays, remainingDays: remainingDays);
  }
}
