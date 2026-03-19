import 'package:exn_hr/config/di.dart';
import 'package:exn_hr/core/themes/app_colors.dart';
import 'package:exn_hr/core/themes/app_text_styles.dart';
import 'package:exn_hr/features/leave/ui/request/view_models/leave_request_cubit.dart';
import 'package:exn_hr/features/leave/ui/request/view_models/leave_request_state.dart';
import 'package:exn_hr/shared/ui/widgets/app_button.dart';
import 'package:exn_hr/shared/ui/widgets/app_input.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
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

  final _leaveTypes = ['annual', 'sick', 'personal', 'unpaid'];

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
    final formatted = DateFormat('yyyy-MM-dd').format(date);
    if (isStart) {
      _startController.text = formatted;
      context.read<LeaveRequestCubit>().setStartDate(formatted);
    } else {
      _endController.text = formatted;
      context.read<LeaveRequestCubit>().setEndDate(formatted);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Request Leave'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.pop(),
        ),
      ),
      body: BlocConsumer<LeaveRequestCubit, LeaveRequestState>(
        listener: (context, state) {
          if (state.status == LeaveRequestStatus.success) {
            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
              content: Text('Leave request submitted successfully!'),
              backgroundColor: AppColors.success,
            ));
            context.pop();
          } else if (state.status == LeaveRequestStatus.failure) {
            ScaffoldMessenger.of(context).showSnackBar(SnackBar(
              content: Text(state.errorMessage ?? 'Failed to submit'),
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
                  Text('Leave Type', style: AppTextStyles.labelMedium),
                  SizedBox(height: 8.w),
                  _buildLeaveTypeSelector(context, state),
                  SizedBox(height: 16.w),
                  AppInput(
                    label: 'Start Date',
                    hint: 'Select start date',
                    controller: _startController,
                    readOnly: true,
                    onTap: () => _pickDate(context, true),
                    suffixIcon: Icon(Icons.calendar_today_rounded, size: 18.sp),
                    validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                  ),
                  SizedBox(height: 16.w),
                  AppInput(
                    label: 'End Date',
                    hint: 'Select end date',
                    controller: _endController,
                    readOnly: true,
                    onTap: () => _pickDate(context, false),
                    suffixIcon: Icon(Icons.calendar_today_rounded, size: 18.sp),
                    validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                  ),
                  SizedBox(height: 16.w),
                  AppInput(
                    label: 'Reason',
                    hint: 'Describe the reason for your leave',
                    controller: _reasonController,
                    maxLines: 4,
                    validator: (v) => v == null || v.isEmpty ? 'Reason is required' : null,
                  ),
                  SizedBox(height: 32.w),
                  AppButton(
                    label: 'Submit Request',
                    isLoading: state.status == LeaveRequestStatus.loading,
                    onPressed: () {
                      if (_formKey.currentState?.validate() ?? false) {
                        context.read<LeaveRequestCubit>().submit(
                          reason: _reasonController.text.trim(),
                        );
                      }
                    },
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildLeaveTypeSelector(BuildContext context, LeaveRequestState state) {
    return Wrap(
      spacing: 8.w,
      children: _leaveTypes.map((type) {
        final isSelected = state.selectedType == type;
        return ChoiceChip(
          label: Text(type[0].toUpperCase() + type.substring(1)),
          selected: isSelected,
          onSelected: (_) => context.read<LeaveRequestCubit>().setType(type),
          selectedColor: AppColors.primary.withOpacity(0.15),
          labelStyle: AppTextStyles.labelSmall.copyWith(
            color: isSelected ? AppColors.primary : AppColors.textSecondary,
          ),
        );
      }).toList(),
    );
  }
}
