import 'package:equatable/equatable.dart';

class Payslip extends Equatable {
  const Payslip({
    required this.id,
    required this.month,
    required this.year,
    required this.baseSalary,
    required this.netSalary,
    this.overtimePay,
    this.allowances,
    this.deductions,
    this.insuranceSalary,
    this.paidAt,
  });

  final String id;
  final int month;
  final int year;
  final double baseSalary;
  final double netSalary;
  final double? overtimePay;
  final List<AllowanceItem>? allowances;
  final List<DeductionItem>? deductions;
  final double? insuranceSalary;
  final String? paidAt;

  @override
  List<Object?> get props => [id, month, year, netSalary];
}

class AllowanceItem extends Equatable {
  const AllowanceItem({required this.name, required this.amount});

  final String name;
  final double amount;

  @override
  List<Object> get props => [name, amount];
}

class DeductionItem extends Equatable {
  const DeductionItem({required this.name, required this.amount});

  final String name;
  final double amount;

  @override
  List<Object> get props => [name, amount];
}
