import 'package:exn_hr/config/di.dart';
import 'package:exn_hr/core/themes/app_colors.dart';
import 'package:exn_hr/core/themes/app_text_styles.dart';
import 'package:exn_hr/features/salary/domain/entities/payslip.dart';
import 'package:exn_hr/features/salary/ui/payslip/view_models/payslip_cubit.dart';
import 'package:exn_hr/features/salary/ui/payslip/view_models/payslip_state.dart';
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

  String _formatCurrency(double amount) {
    final formatter = NumberFormat('#,###', 'vi_VN');
    return '${formatter.format(amount)} VND';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Payslip'),
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
                  Text(state.errorMessage ?? 'Failed to load',
                      style: AppTextStyles.bodyMedium),
                  SizedBox(height: 16.w),
                  TextButton(
                    onPressed: () => context.read<PayslipCubit>().loadPayslips(),
                    child: const Text('Retry'),
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
                  _buildNetSalaryCard(state.selectedPayslip!),
                  SizedBox(height: 20.w),
                  _buildBreakdownCard(state.selectedPayslip!),
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
            Text('Select Month', style: AppTextStyles.labelLarge),
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
                    'T${month}',
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

  Widget _buildNetSalaryCard(Payslip payslip) {
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
          Text(
            'Net Salary',
            style: AppTextStyles.labelMedium.copyWith(color: Colors.white70),
          ),
          SizedBox(height: 8.w),
          Text(
            _formatCurrency(payslip.netSalary),
            style: AppTextStyles.h2.copyWith(color: Colors.white),
          ),
          SizedBox(height: 4.w),
          Text(
            'Month ${payslip.month}/${payslip.year}',
            style: AppTextStyles.caption.copyWith(color: Colors.white70),
          ),
        ],
      ),
    );
  }

  Widget _buildBreakdownCard(Payslip payslip) {
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
          Text('Salary Breakdown', style: AppTextStyles.h4),
          SizedBox(height: 16.w),
          _buildLineItem('Basic Salary', payslip.basicSalary, isIncome: true),
          if (payslip.totalOtPay > 0)
            _buildLineItem('Overtime Pay (x1.5)', payslip.totalOtPay,
                isIncome: true),
          if (payslip.totalAllowances > 0)
            _buildLineItem('Allowances', payslip.totalAllowances, isIncome: true),
          if (payslip.totalBonus > 0)
            _buildLineItem('Bonus', payslip.totalBonus, isIncome: true),
          Divider(height: 24.w, color: AppColors.divider),
          if (payslip.totalDeductions > 0)
            _buildLineItem('Deductions', payslip.totalDeductions, isIncome: false),
          if (payslip.salaryAdvance > 0)
            _buildLineItem('Salary Advance', payslip.salaryAdvance,
                isIncome: false),
          Divider(height: 24.w, color: AppColors.divider),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Net Salary', style: AppTextStyles.labelLarge),
              Text(
                _formatCurrency(payslip.netSalary),
                style: AppTextStyles.labelLarge.copyWith(
                  color: AppColors.primary,
                  fontSize: 16.sp,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildLineItem(String label, double amount, {required bool isIncome}) {
    return Padding(
      padding: EdgeInsets.only(bottom: 10.w),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: AppTextStyles.bodySmall),
          Text(
            '${isIncome ? '+' : '-'} ${_formatCurrency(amount)}',
            style: AppTextStyles.labelMedium.copyWith(
              color: isIncome ? AppColors.success : AppColors.error,
            ),
          ),
        ],
      ),
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
            Text('No payslip for this month', style: AppTextStyles.bodyMedium),
          ],
        ),
      ),
    );
  }
}
