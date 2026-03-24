class PayslipModel {
  const PayslipModel({
    required this.id,
    required this.employeeId,
    required this.month,
    required this.year,
    required this.basicSalary,
    required this.totalAllowances,
    required this.totalOtPay,
    required this.totalBonus,
    required this.totalDeductions,
    required this.salaryAdvance,
    required this.netSalary,
    required this.status,
  });

  final int id;
  final int employeeId;
  final int month;
  final int year;
  final double basicSalary;
  final double totalAllowances;
  final double totalOtPay;
  final double totalBonus;
  final double totalDeductions;
  final double salaryAdvance;
  final double netSalary;
  final String status;

  factory PayslipModel.fromJson(Map<String, dynamic> json) {
    return PayslipModel(
      id: json['id'] as int,
      employeeId: json['employee_id'] as int,
      month: json['month'] as int,
      year: json['year'] as int,
      basicSalary: (json['basic_salary'] as num).toDouble(),
      totalAllowances: (json['total_allowances'] as num? ?? 0).toDouble(),
      totalOtPay: (json['total_ot_pay'] as num? ?? 0).toDouble(),
      totalBonus: (json['total_bonus'] as num? ?? 0).toDouble(),
      totalDeductions: (json['total_deductions'] as num? ?? 0).toDouble(),
      salaryAdvance: (json['salary_advance'] as num? ?? 0).toDouble(),
      netSalary: (json['net_salary'] as num).toDouble(),
      status: json['status'] as String? ?? 'draft',
    );
  }
}
