// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'payslip_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

PayslipModel _$PayslipModelFromJson(Map<String, dynamic> json) => PayslipModel(
      id: json['id'] as String,
      month: (json['month'] as num).toInt(),
      year: (json['year'] as num).toInt(),
      baseSalary: (json['base_salary'] as num).toDouble(),
      netSalary: (json['net_salary'] as num).toDouble(),
      overtimePay: (json['overtime_pay'] as num?)?.toDouble(),
      allowances: (json['allowances'] as List<dynamic>?)
          ?.map((e) => AllowanceItemModel.fromJson(e as Map<String, dynamic>))
          .toList(),
      deductions: (json['deductions'] as List<dynamic>?)
          ?.map((e) => DeductionItemModel.fromJson(e as Map<String, dynamic>))
          .toList(),
      insuranceSalary: (json['insurance_salary'] as num?)?.toDouble(),
      paidAt: json['paid_at'] as String?,
    );

Map<String, dynamic> _$PayslipModelToJson(PayslipModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'month': instance.month,
      'year': instance.year,
      'base_salary': instance.baseSalary,
      'net_salary': instance.netSalary,
      'overtime_pay': instance.overtimePay,
      'allowances': instance.allowances,
      'deductions': instance.deductions,
      'insurance_salary': instance.insuranceSalary,
      'paid_at': instance.paidAt,
    };

AllowanceItemModel _$AllowanceItemModelFromJson(Map<String, dynamic> json) =>
    AllowanceItemModel(
      name: json['name'] as String,
      amount: (json['amount'] as num).toDouble(),
    );

Map<String, dynamic> _$AllowanceItemModelToJson(AllowanceItemModel instance) =>
    <String, dynamic>{
      'name': instance.name,
      'amount': instance.amount,
    };

DeductionItemModel _$DeductionItemModelFromJson(Map<String, dynamic> json) =>
    DeductionItemModel(
      name: json['name'] as String,
      amount: (json['amount'] as num).toDouble(),
    );

Map<String, dynamic> _$DeductionItemModelToJson(DeductionItemModel instance) =>
    <String, dynamic>{
      'name': instance.name,
      'amount': instance.amount,
    };
