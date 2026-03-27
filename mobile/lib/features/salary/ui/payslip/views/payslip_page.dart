import 'package:exn_hr/config/di.dart';
import 'package:exn_hr/core/themes/app_colors.dart';
import 'package:exn_hr/core/themes/app_text_styles.dart';
import 'package:exn_hr/features/salary/domain/entities/payslip.dart';
import 'package:exn_hr/features/salary/ui/payslip/view_models/payslip_cubit.dart';
import 'package:exn_hr/features/salary/ui/payslip/view_models/payslip_state.dart';
import 'package:exn_hr/core/widgets/animations/animations.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

class PayslipPage extends StatelessWidget {
  const PayslipPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => getIt<PayslipCubit>(),
      child: const _PayslipView(),
    );
  }
}

class _PayslipView extends StatelessWidget {
  const _PayslipView();

  String _fmt(double amount) {
    final formatter = NumberFormat('#,###', 'vi_VN');
    return '${formatter.format(amount)}đ';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Phiếu lương'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.pop(),
        ),
      ),
      body: BlocBuilder<PayslipCubit, PayslipState>(
        builder: (context, state) {
          if (state.status == PayslipStatus.loading) {
            return const Center(child: CircularProgressIndicator());
          }
          if (state.status == PayslipStatus.failure) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.error_outline, size: 48.sp, color: AppColors.error),
                  SizedBox(height: 12.w),
                  Text(state.errorMessage ?? 'Không tải được dữ liệu',
                      style: AppTextStyles.bodyMedium),
                  SizedBox(height: 16.w),
                  TextButton(
                    onPressed: () => context.read<PayslipCubit>().loadPayslips(),
                    child: const Text('Thử lại'),
                  ),
                ],
              ),
            );
          }
          return SingleChildScrollView(
            padding: EdgeInsets.all(20.w),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildMonthSelector(context, state),
                SizedBox(height: 24.w),
                if (state.selectedPayslip != null) ...[
                  ScaleFadeAnimation(
                    child: _buildNetSalaryCard(state.selectedPayslip!),
                  ),
                  SizedBox(height: 16.w),
                  FadeSlideAnimation(
                    delay: const Duration(milliseconds: 100),
                    child: _buildWorkDaysCard(state.selectedPayslip!),
                  ),
                  SizedBox(height: 16.w),
                  FadeSlideAnimation(
                    delay: const Duration(milliseconds: 200),
                    child: _buildIncomeCard(state.selectedPayslip!),
                  ),
                  SizedBox(height: 16.w),
                  FadeSlideAnimation(
                    delay: const Duration(milliseconds: 300),
                    child: _buildDeductionsCard(state.selectedPayslip!),
                  ),
                ] else
                  _buildEmptyState(),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildMonthSelector(BuildContext context, PayslipState state) {
    final months = List.generate(12, (i) => i + 1);
    final year = state.selectedYear ?? DateTime.now().year;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Chọn tháng', style: AppTextStyles.labelLarge),
            Text('$year', style: AppTextStyles.bodyMedium.copyWith(
              color: AppColors.textSecondary,
            )),
          ],
        ),
        SizedBox(height: 12.w),
        SizedBox(
          height: 40.w,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: months.length,
            itemBuilder: (context, index) {
              final month = months[index];
              final isSelected = month == state.selectedMonth;
              return GestureDetector(
                onTap: () => context.read<PayslipCubit>().selectMonth(month, year),
                child: Container(
                  margin: EdgeInsets.only(right: 8.w),
                  padding: EdgeInsets.symmetric(horizontal: 16.w),
                  decoration: BoxDecoration(
                    color: isSelected ? AppColors.primary : AppColors.surface,
                    borderRadius: BorderRadius.circular(20.r),
                    border: Border.all(
                      color: isSelected ? AppColors.primary : AppColors.border,
                    ),
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    'T$month',
                    style: AppTextStyles.labelMedium.copyWith(
                      color: isSelected ? Colors.white : AppColors.textSecondary,
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildNetSalaryCard(Payslip p) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(24.w),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [AppColors.primary, AppColors.primaryDark],
        ),
        borderRadius: BorderRadius.circular(20.r),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withOpacity(0.3),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Lương thực nhận', style: AppTextStyles.labelMedium.copyWith(color: Colors.white70)),
          SizedBox(height: 8.w),
          Text(_fmt(p.netSalary), style: AppTextStyles.h2.copyWith(color: Colors.white)),
          SizedBox(height: 4.w),
          Text('Tháng ${p.month}/${p.year}', style: AppTextStyles.caption.copyWith(color: Colors.white70)),
        ],
      ),
    );
  }

  Widget _buildWorkDaysCard(Payslip p) {
    return Container(
      padding: EdgeInsets.all(16.w),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12.r),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Expanded(child: _miniStat('Ngày chuẩn', '${p.standardWorkDays}')),
          Container(width: 1, height: 36.w, color: AppColors.divider),
          Expanded(child: _miniStat('Ngày thực tế', '${p.actualWorkDays}')),
          Container(width: 1, height: 36.w, color: AppColors.divider),
          Expanded(child: _miniStat('Lương theo ngày', _fmt(p.proratedSalary))),
        ],
      ),
    );
  }

  Widget _miniStat(String label, String value) {
    return Column(
      children: [
        Text(value, style: AppTextStyles.labelMedium),
        SizedBox(height: 2.w),
        Text(label, style: AppTextStyles.caption),
      ],
    );
  }

  Widget _buildIncomeCard(Payslip p) {
    return _buildSection('Thu nhập', [
      _line('Lương theo ngày công', p.proratedSalary, true),
      if (p.totalAllowances > 0) _line('Phụ cấp', p.totalAllowances, true),
      if (p.otPayNormal > 0) _line('OT ngày thường (x1.5)', p.otPayNormal, true),
      if (p.otPayWeekend > 0) _line('OT cuối tuần (x2.0)', p.otPayWeekend, true),
      if (p.otPayHoliday > 0) _line('OT ngày lễ (x3.0)', p.otPayHoliday, true),
      if (p.totalBonus > 0) _line('Thưởng', p.totalBonus, true),
      Divider(height: 20.w, color: AppColors.divider),
      _totalLine('Tổng thu nhập', p.totalIncome),
    ]);
  }

  Widget _buildDeductionsCard(Payslip p) {
    return _buildSection('Các khoản trừ', [
      if (p.totalInsuranceEmployee > 0) _line('Bảo hiểm (BHXH+BHYT+BHTN)', p.totalInsuranceEmployee, false),
      if (p.unionFeeEmployee > 0) _line('Phí công đoàn', p.unionFeeEmployee, false),
      if (p.pitAmount > 0) _line('Thuế TNCN', p.pitAmount, false),
      if (p.salaryAdvance > 0) _line('Tạm ứng', p.salaryAdvance, false),
      if (p.parkingFee > 0) _line('Phí gửi xe', p.parkingFee, false),
      Divider(height: 20.w, color: AppColors.divider),
      _totalLine('Tổng khấu trừ', p.totalDeductions),
      SizedBox(height: 8.w),
      Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text('Thực nhận', style: AppTextStyles.labelLarge.copyWith(color: AppColors.primary)),
          Text(_fmt(p.netSalary), style: AppTextStyles.labelLarge.copyWith(color: AppColors.primary, fontSize: 16.sp)),
        ],
      ),
    ]);
  }

  Widget _buildSection(String title, List<Widget> children) {
    return Container(
      padding: EdgeInsets.all(20.w),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16.r),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: AppTextStyles.h4),
          SizedBox(height: 14.w),
          ...children,
        ],
      ),
    );
  }

  Widget _line(String label, double amount, bool isIncome) {
    return Padding(
      padding: EdgeInsets.only(bottom: 10.w),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(child: Text(label, style: AppTextStyles.bodySmall)),
          Text(
            '${isIncome ? '+' : '-'} ${_fmt(amount)}',
            style: AppTextStyles.labelMedium.copyWith(
              color: isIncome ? AppColors.success : AppColors.error,
            ),
          ),
        ],
      ),
    );
  }

  Widget _totalLine(String label, double amount) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: AppTextStyles.labelMedium),
        Text(_fmt(amount), style: AppTextStyles.labelMedium),
      ],
    );
  }

  Widget _buildEmptyState() {
    return Container(
      padding: EdgeInsets.symmetric(vertical: 48.w),
      child: Center(
        child: Column(
          children: [
            Icon(Icons.receipt_long_rounded, size: 48.sp, color: AppColors.textHint),
            SizedBox(height: 12.w),
            Text('Chưa có phiếu lương tháng này', style: AppTextStyles.bodyMedium),
          ],
        ),
      ),
    );
  }
}
