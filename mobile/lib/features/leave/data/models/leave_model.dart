class LeaveModel {
  const LeaveModel({
    required this.id,
    required this.employeeId,
    required this.type,
    required this.startDate,
    required this.endDate,
    required this.days,
    required this.reason,
    required this.leaderStatus,
    required this.hrStatus,
    required this.overallStatus,
    this.leaderComment,
    this.hrComment,
    this.employee,
    this.isHalfDay = false,
    this.halfDayPeriod,
  });

  final int id;
  final int employeeId;
  final String type;
  final String startDate;
  final String endDate;
  final double days;
  final String reason;
  final String leaderStatus;
  final String hrStatus;
  final String overallStatus;
  final String? leaderComment;
  final String? hrComment;
  final Map<String, dynamic>? employee;
  final bool isHalfDay;
  final String? halfDayPeriod;

  String? get employeeName {
    if (employee == null) return null;
    return employee!['full_name'] as String?;
  }

  factory LeaveModel.fromJson(Map<String, dynamic> json) {
    return LeaveModel(
      id: json['id'] as int,
      employeeId: json['employee_id'] as int,
      type: json['type'] as String,
      startDate: json['start_date'] as String,
      endDate: json['end_date'] as String,
      days: (json['days'] as num).toDouble(),
      reason: json['reason'] as String? ?? '',
      leaderStatus: json['leader_status'] as String? ?? 'pending',
      hrStatus: json['hr_status'] as String? ?? 'pending',
      overallStatus: json['overall_status'] as String? ?? 'pending',
      leaderComment: json['leader_comment'] as String?,
      hrComment: json['hr_comment'] as String?,
      employee: json['employee'] as Map<String, dynamic>?,
      isHalfDay: json['is_half_day'] as bool? ?? false,
      halfDayPeriod: json['half_day_period'] as String?,
    );
  }
}

class LeaveBalanceModel {
  const LeaveBalanceModel({
    required this.id,
    required this.employeeId,
    required this.year,
    required this.totalDays,
    required this.usedDays,
    required this.remainingDays,
  });

  final int id;
  final int employeeId;
  final int year;
  final int totalDays;
  final double usedDays;
  final double remainingDays;

  factory LeaveBalanceModel.fromJson(Map<String, dynamic> json) {
    return LeaveBalanceModel(
      id: json['id'] as int,
      employeeId: json['employee_id'] as int,
      year: json['year'] as int,
      totalDays: json['total_days'] as int,
      usedDays: (json['used_days'] as num).toDouble(),
      remainingDays: (json['remaining_days'] as num).toDouble(),
    );
  }
}
