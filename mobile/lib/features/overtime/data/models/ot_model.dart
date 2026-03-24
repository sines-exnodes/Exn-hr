class OtModel {
  const OtModel({
    required this.id,
    required this.employeeId,
    required this.date,
    required this.startTime,
    required this.endTime,
    required this.hours,
    required this.reason,
    required this.leaderStatus,
    required this.ceoStatus,
    required this.overallStatus,
    this.employee,
  });

  final int id;
  final int employeeId;
  final String date;
  final String startTime;
  final String endTime;
  final double hours;
  final String reason;
  final String leaderStatus;
  final String ceoStatus;
  final String overallStatus;
  final Map<String, dynamic>? employee;

  String? get employeeName {
    if (employee == null) return null;
    return employee!['full_name'] as String?;
  }

  factory OtModel.fromJson(Map<String, dynamic> json) {
    return OtModel(
      id: json['id'] as int,
      employeeId: json['employee_id'] as int,
      date: json['date'] as String,
      startTime: json['start_time'] as String,
      endTime: json['end_time'] as String,
      hours: (json['hours'] as num).toDouble(),
      reason: json['reason'] as String? ?? '',
      leaderStatus: json['leader_status'] as String? ?? 'pending',
      ceoStatus: json['ceo_status'] as String? ?? 'pending',
      overallStatus: json['overall_status'] as String? ?? 'pending',
      employee: json['employee'] as Map<String, dynamic>?,
    );
  }
}
