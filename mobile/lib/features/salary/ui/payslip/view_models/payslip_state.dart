import 'package:equatable/equatable.dart';
import 'package:exn_hr/features/salary/domain/entities/payslip.dart';

enum PayslipStatus { initial, loading, success, failure }

class PayslipState extends Equatable {
  const PayslipState({
    this.status = PayslipStatus.initial,
    this.payslips = const [],
    this.selectedPayslip,
    this.selectedMonth,
    this.selectedYear,
    this.errorMessage,
  });

  final PayslipStatus status;
  final List<Payslip> payslips;
  final Payslip? selectedPayslip;
  final int? selectedMonth;
  final int? selectedYear;
  final String? errorMessage;

  PayslipState copyWith({
    PayslipStatus? status,
    List<Payslip>? payslips,
    Payslip? selectedPayslip,
    int? selectedMonth,
    int? selectedYear,
    String? errorMessage,
  }) {
    return PayslipState(
      status: status ?? this.status,
      payslips: payslips ?? this.payslips,
      selectedPayslip: selectedPayslip ?? this.selectedPayslip,
      selectedMonth: selectedMonth ?? this.selectedMonth,
      selectedYear: selectedYear ?? this.selectedYear,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }

  @override
  List<Object?> get props => [
        status,
        payslips,
        selectedPayslip,
        selectedMonth,
        selectedYear,
        errorMessage,
      ];
}
