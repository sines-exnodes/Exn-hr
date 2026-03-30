import 'package:exn_hr/config/di.dart';
import 'package:exn_hr/core/themes/app_colors.dart';
import 'package:exn_hr/core/themes/app_text_styles.dart';
import 'package:exn_hr/features/leave/ui/request/view_models/leave_request_cubit.dart';
import 'package:exn_hr/features/leave/ui/request/view_models/leave_request_state.dart';
import 'package:exn_hr/shared/ui/widgets/app_button.dart';
import 'package:exn_hr/shared/ui/widgets/app_input.dart';
import 'package:exn_hr/core/widgets/animations/animations.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:exn_hr/core/utils/date_utils.dart';
import 'package:intl/intl.dart';

class LeaveRequestPage extends StatelessWidget {
  const LeaveRequestPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => getIt<LeaveRequestCubit>(),
      child: const _LeaveRequestView(),
    );
  }
}

class _LeaveRequestView extends StatefulWidget {
  const _LeaveRequestView();

  @override
  State<_LeaveRequestView> createState() => _LeaveRequestViewState();
}

class _LeaveRequestViewState extends State<_LeaveRequestView> {
  final _formKey = GlobalKey<FormState>();
  final _reasonController = TextEditingController();
  final _startController = TextEditingController();
  final _endController = TextEditingController();

  // Backend only accepts 'paid' or 'unpaid'
  static const _leaveTypes = [
    ('paid', 'Có lương'),
    ('unpaid', 'Không lương'),
  ];

  @override
  void dispose() {
    _reasonController.dispose();
    _startController.dispose();
    _endController.dispose();
    super.dispose();
  }

  Future<void> _pickDate(BuildContext context, bool isStart) async {
    final date = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (date == null) return;
    final apiDate = DateFormat('yyyy-MM-dd').format(date);
    final display = formatDateDisplay(apiDate);
    if (isStart) {
      _startController.text = display;
      context.read<LeaveRequestCubit>().setStartDate(apiDate);
    } else {
      _endController.text = display;
      context.read<LeaveRequestCubit>().setEndDate(apiDate);
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => FocusScope.of(context).unfocus(),
      child: Scaffold(
        backgroundColor: AppColors.bgPage,
        appBar: AppBar(
          title: const Text('Đơn nghỉ phép'),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_rounded),
            onPressed: () => context.pop(),
          ),
        ),
        body: BlocConsumer<LeaveRequestCubit, LeaveRequestState>(
          listener: (context, state) {
            if (state.status == LeaveRequestStatus.success) {
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                content: Text('Gửi đơn nghỉ phép thành công!'),
                backgroundColor: AppColors.success,
              ));
              context.pop(true);
            } else if (state.status == LeaveRequestStatus.failure) {
              ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                content: Text(state.errorMessage ?? 'Gửi thất bại'),
                backgroundColor: AppColors.error,
              ));
            }
          },
          builder: (context, state) {
            return SingleChildScrollView(
              padding: EdgeInsets.all(20.w),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    FadeSlideAnimation(
                      child: _buildLeaveTypePicker(context, state.selectedType),
                    ),
                    SizedBox(height: 16.w),
                    FadeSlideAnimation(
                      delay: const Duration(milliseconds: 100),
                      child: AppInput(
                        label: 'Ngày bắt đầu',
                        hint: 'Chọn ngày bắt đầu',
                        controller: _startController,
                        readOnly: true,
                        onTap: () => _pickDate(context, true),
                        suffixIcon: Icon(Icons.calendar_today_rounded, size: 18.sp),
                        validator: (v) => v == null || v.isEmpty ? 'Bắt buộc' : null,
                      ),
                    ),
                    SizedBox(height: 16.w),
                    FadeSlideAnimation(
                      delay: const Duration(milliseconds: 200),
                      child: AppInput(
                        label: 'Ngày kết thúc',
                        hint: 'Chọn ngày kết thúc',
                        controller: _endController,
                        readOnly: true,
                        onTap: () => _pickDate(context, false),
                        suffixIcon: Icon(Icons.calendar_today_rounded, size: 18.sp),
                        validator: (v) => v == null || v.isEmpty ? 'Bắt buộc' : null,
                      ),
                    ),
                    SizedBox(height: 16.w),
                    FadeSlideAnimation(
                      delay: const Duration(milliseconds: 300),
                      child: AppInput(
                        label: 'Lý do',
                        hint: 'Mô tả lý do nghỉ phép',
                        controller: _reasonController,
                        maxLines: 4,
                        validator: (v) => v == null || v.isEmpty ? 'Lý do là bắt buộc' : null,
                      ),
                    ),
                    SizedBox(height: 32.w),
                    ScaleFadeAnimation(
                      delay: const Duration(milliseconds: 400),
                      child: AppButton(
                        label: 'Gửi đơn nghỉ phép',
                        isLoading: state.status == LeaveRequestStatus.loading,
                        onPressed: () {
                          if (_formKey.currentState?.validate() ?? false) {
                            context.read<LeaveRequestCubit>().submit(
                              reason: _reasonController.text.trim(),
                            );
                          }
                        },
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildLeaveTypePicker(BuildContext context, String selected) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Loại nghỉ phép', style: AppTextStyles.labelMedium),
        SizedBox(height: 8.w),
        Row(
          children: _leaveTypes.map((type) {
            final isSelected = type.$1 == selected;
            return Expanded(
              child: Padding(
                padding: EdgeInsets.only(
                  right: type.$1 != _leaveTypes.last.$1 ? 8.w : 0,
                ),
                child: GestureDetector(
                  onTap: () => context.read<LeaveRequestCubit>().setType(type.$1),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    padding: EdgeInsets.symmetric(vertical: 14.w),
                    decoration: BoxDecoration(
                      color: isSelected
                          ? AppColors.primaryLight
                          : AppColors.bgCard,
                      borderRadius: BorderRadius.circular(12.r),
                      border: Border.all(
                        color: isSelected ? AppColors.primary : AppColors.border,
                        width: isSelected ? 1.5 : 1,
                      ),
                      boxShadow: isSelected
                          ? [
                              BoxShadow(
                                color: AppColors.primary.withOpacity(0.1),
                                blurRadius: 8,
                                offset: const Offset(0, 2),
                              ),
                            ]
                          : null,
                    ),
                    child: Center(
                      child: Text(
                        type.$2,
                        style: AppTextStyles.labelMedium.copyWith(
                          color: isSelected ? AppColors.primary : AppColors.textPrimary,
                          fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }
}
