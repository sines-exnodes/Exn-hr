import 'package:exn_hr/features/salary/data/models/payslip_model.dart';
import 'package:exn_hr/features/salary/domain/entities/payslip.dart';

extension PayslipMapper on PayslipModel {
  Payslip toEntity() {
    return Payslip(
      id: id, employeeId: employeeId, month: month, year: year,
      basicSalary: basicSalary, proratedSalary: proratedSalary,
      standardWorkDays: standardWorkDays, actualWorkDays: actualWorkDays,
      totalAllowances: totalAllowances,
      otPayNormal: otPayNormal, otPayWeekend: otPayWeekend,
      otPayHoliday: otPayHoliday, totalOtPay: totalOtPay,
      totalBonus: totalBonus, totalIncome: totalIncome,
      totalInsuranceEmployee: totalInsuranceEmployee,
      unionFeeEmployee: unionFeeEmployee, pitAmount: pitAmount,
      totalDeductions: totalDeductions, salaryAdvance: salaryAdvance,
      parkingFee: parkingFee, netSalary: netSalary, status: status,
    );
  }
}
