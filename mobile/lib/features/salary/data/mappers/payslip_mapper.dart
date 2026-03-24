import 'package:exn_hr/features/salary/data/models/payslip_model.dart';
import 'package:exn_hr/features/salary/domain/entities/payslip.dart';

extension PayslipMapper on PayslipModel {
  Payslip toEntity() {
    return Payslip(
      id: id, employeeId: employeeId, month: month, year: year,
      basicSalary: basicSalary, totalAllowances: totalAllowances,
      totalOtPay: totalOtPay, totalBonus: totalBonus,
      totalDeductions: totalDeductions, salaryAdvance: salaryAdvance,
      netSalary: netSalary, status: status,
    );
  }
}
