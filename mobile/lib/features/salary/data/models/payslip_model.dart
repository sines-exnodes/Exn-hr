class PayslipModel {
  const PayslipModel({
    required this.id,
    required this.employeeId,
    required this.month,
    required this.year,
    required this.basicSalary,
    required this.proratedSalary,
    required this.standardWorkDays,
    required this.actualWorkDays,
    required this.totalAllowances,
    required this.otPayNormal,
    required this.otPayWeekend,
    required this.otPayHoliday,
    required this.totalOtPay,
    required this.totalBonus,
    required this.totalIncome,
    required this.totalInsuranceEmployee,
    required this.unionFeeEmployee,
    required this.pitAmount,
    required this.totalDeductions,
    required this.salaryAdvance,
    required this.parkingFee,
    required this.netSalary,
    required this.status,
  });

  final int id;
  final int employeeId;
  final int month;
  final int year;
  final double basicSalary;
  final double proratedSalary;
  final int standardWorkDays;
  final double actualWorkDays;
  final double totalAllowances;
  final double otPayNormal;
  final double otPayWeekend;
  final double otPayHoliday;
  final double totalOtPay;
  final double totalBonus;
  final double totalIncome;
  final double totalInsuranceEmployee;
  final double unionFeeEmployee;
  final double pitAmount;
  final double totalDeductions;
  final double salaryAdvance;
  final double parkingFee;
  final double netSalary;
  final String status;

  factory PayslipModel.fromJson(Map<String, dynamic> json) {
    return PayslipModel(
      id: json['id'] as int,
      employeeId: json['employee_id'] as int,
      month: json['month'] as int,
      year: json['year'] as int,
      basicSalary: (json['basic_salary'] as num).toDouble(),
      proratedSalary: (json['prorated_salary'] as num? ?? 0).toDouble(),
      standardWorkDays: json['standard_work_days'] as int? ?? 0,
      actualWorkDays: (json['actual_work_days'] as num? ?? 0).toDouble(),
      totalAllowances: (json['total_allowances'] as num? ?? 0).toDouble(),
      otPayNormal: (json['ot_pay_normal'] as num? ?? 0).toDouble(),
      otPayWeekend: (json['ot_pay_weekend'] as num? ?? 0).toDouble(),
      otPayHoliday: (json['ot_pay_holiday'] as num? ?? 0).toDouble(),
      totalOtPay: (json['total_ot_pay'] as num? ?? 0).toDouble(),
      totalBonus: (json['total_bonus'] as num? ?? 0).toDouble(),
      totalIncome: (json['total_income'] as num? ?? 0).toDouble(),
      totalInsuranceEmployee: (json['total_insurance_employee'] as num? ?? 0).toDouble(),
      unionFeeEmployee: (json['union_fee_employee'] as num? ?? 0).toDouble(),
      pitAmount: (json['pit_amount'] as num? ?? 0).toDouble(),
      totalDeductions: (json['total_deductions'] as num? ?? 0).toDouble(),
      salaryAdvance: (json['salary_advance'] as num? ?? 0).toDouble(),
      parkingFee: (json['parking_fee'] as num? ?? 0).toDouble(),
      netSalary: (json['net_salary'] as num).toDouble(),
      status: json['status'] as String? ?? 'draft',
    );
  }
}
