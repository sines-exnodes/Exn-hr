import 'package:equatable/equatable.dart';

class Payslip extends Equatable {
  const Payslip({
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

  double get grossIncome => basicSalary + totalAllowances + totalOtPay + totalBonus;

  @override
  List<Object?> get props => [id, month, year, netSalary];
}
