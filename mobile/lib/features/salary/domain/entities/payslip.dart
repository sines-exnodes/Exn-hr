import 'package:equatable/equatable.dart';

class Payslip extends Equatable {
  const Payslip({
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

  @override
  List<Object?> get props => [id, month, year, netSalary];
}
