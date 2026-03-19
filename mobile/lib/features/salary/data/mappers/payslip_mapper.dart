import 'package:exn_hr/features/salary/data/models/payslip_model.dart';
import 'package:exn_hr/features/salary/domain/entities/payslip.dart';

extension PayslipMapper on PayslipModel {
  Payslip toEntity() {
    return Payslip(
      id: id,
      month: month,
      year: year,
      baseSalary: baseSalary,
      netSalary: netSalary,
      overtimePay: overtimePay,
      allowances: allowances?.map((a) => AllowanceItem(name: a.name, amount: a.amount)).toList(),
      deductions: deductions?.map((d) => DeductionItem(name: d.name, amount: d.amount)).toList(),
      insuranceSalary: insuranceSalary,
      paidAt: paidAt,
    );
  }
}
