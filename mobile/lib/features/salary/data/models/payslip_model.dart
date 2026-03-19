import 'package:json_annotation/json_annotation.dart';

part 'payslip_model.g.dart';

@JsonSerializable()
class PayslipModel {
  const PayslipModel({
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
  @JsonKey(name: 'base_salary')
  final double baseSalary;
  @JsonKey(name: 'net_salary')
  final double netSalary;
  @JsonKey(name: 'overtime_pay')
  final double? overtimePay;
  final List<AllowanceItemModel>? allowances;
  final List<DeductionItemModel>? deductions;
  @JsonKey(name: 'insurance_salary')
  final double? insuranceSalary;
  @JsonKey(name: 'paid_at')
  final String? paidAt;

  factory PayslipModel.fromJson(Map<String, dynamic> json) => _$PayslipModelFromJson(json);
  Map<String, dynamic> toJson() => _$PayslipModelToJson(this);
}

@JsonSerializable()
class AllowanceItemModel {
  const AllowanceItemModel({required this.name, required this.amount});
  final String name;
  final double amount;
  factory AllowanceItemModel.fromJson(Map<String, dynamic> json) =>
      _$AllowanceItemModelFromJson(json);
  Map<String, dynamic> toJson() => _$AllowanceItemModelToJson(this);
}

@JsonSerializable()
class DeductionItemModel {
  const DeductionItemModel({required this.name, required this.amount});
  final String name;
  final double amount;
  factory DeductionItemModel.fromJson(Map<String, dynamic> json) =>
      _$DeductionItemModelFromJson(json);
  Map<String, dynamic> toJson() => _$DeductionItemModelToJson(this);
}
