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
    loadPayslips();
  }

  final GetPayslipUseCase _getPayslipUseCase;

  Future<void> loadPayslips() async {
    emit(state.copyWith(status: PayslipStatus.loading));
    final result = await _getPayslipUseCase();
    if (isClosed) return;
    result.fold(
      (error) => emit(state.copyWith(
        status: PayslipStatus.failure,
        errorMessage: error.message,
      )),
      (payslips) {
        final selected = payslips.isNotEmpty
            ? payslips.firstWhere(
                (p) =>
                    p.month == state.selectedMonth &&
                    p.year == state.selectedYear,
                orElse: () => payslips.first,
              )
            : null;
        emit(state.copyWith(
          status: PayslipStatus.success,
          payslips: payslips,
          selectedPayslip: selected,
        ));
      },
    );
  }

  void selectMonth(int month, int year) {
    final selected = state.payslips.where(
      (p) => p.month == month && p.year == year,
    );
    emit(state.copyWith(
      selectedMonth: month,
      selectedYear: year,
      selectedPayslip: selected.isNotEmpty ? selected.first : null,
    ));
  }
}
