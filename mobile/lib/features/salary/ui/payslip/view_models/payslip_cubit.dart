import 'package:exn_hr/features/salary/domain/usecases/get_payslip_usecase.dart';
import 'package:exn_hr/features/salary/ui/payslip/view_models/payslip_state.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class PayslipCubit extends Cubit<PayslipState> {
  PayslipCubit({required GetPayslipUseCase getPayslipUseCase})
      : _getPayslipUseCase = getPayslipUseCase,
        super(PayslipState(
          selectedMonth: DateTime.now().month,
          selectedYear: DateTime.now().year,
        )) {
    loadPayslip();
  }

  final GetPayslipUseCase _getPayslipUseCase;

  Future<void> loadPayslip() async {
    emit(state.copyWith(status: PayslipStatus.loading));
    final month = state.selectedMonth ?? DateTime.now().month;
    final year = state.selectedYear ?? DateTime.now().year;
    final result = await _getPayslipUseCase(month: month, year: year);
    if (isClosed) return;
    result.fold(
      (error) => emit(state.copyWith(
        status: PayslipStatus.failure,
        errorMessage: error.message,
      )),
      (payslip) => emit(state.copyWith(
        status: PayslipStatus.success,
        selectedPayslip: payslip,
      )),
    );
  }

  // Keep for backward compat with page that calls loadPayslips()
  Future<void> loadPayslips() => loadPayslip();

  void selectMonth(int month, int year) {
    emit(state.copyWith(
      selectedMonth: month,
      selectedYear: year,
      selectedPayslip: null,
    ));
    loadPayslip();
  }
}
