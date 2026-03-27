import 'package:exn_hr/config/di.dart';
import 'package:exn_hr/core/themes/app_colors.dart';
import 'package:exn_hr/core/themes/app_text_styles.dart';
import 'package:exn_hr/features/overtime/ui/request/view_models/ot_request_cubit.dart';
import 'package:exn_hr/features/overtime/ui/request/view_models/ot_request_state.dart';
import 'package:exn_hr/shared/ui/widgets/app_button.dart';
import 'package:exn_hr/shared/ui/widgets/app_input.dart';
import 'package:exn_hr/core/widgets/animations/animations.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

class OtRequestPage extends StatelessWidget {
  const OtRequestPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => getIt<OtRequestCubit>(),
      child: const _OtRequestView(),
    );
  }
}

class _OtRequestView extends StatefulWidget {
  const _OtRequestView();

  @override
  State<_OtRequestView> createState() => _OtRequestViewState();
}

class _OtRequestViewState extends State<_OtRequestView> {
  final _formKey = GlobalKey<FormState>();
  final _reasonController = TextEditingController();
  final _dateController = TextEditingController();
  final _startController = TextEditingController();
  final _endController = TextEditingController();

  @override
  void dispose() {
    _reasonController.dispose();
    _dateController.dispose();
    _startController.dispose();
    _endController.dispose();
    super.dispose();
  }

  Future<void> _pickDate(BuildContext context) async {
    final date = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime.now().subtract(const Duration(days: 30)),
      lastDate: DateTime.now().add(const Duration(days: 30)),
    );
    if (date == null) return;
    final formatted = DateFormat('yyyy-MM-dd').format(date);
    _dateController.text = formatted;
    context.read<OtRequestCubit>().setDate(formatted);
  }

  Future<void> _pickTime(BuildContext context, bool isStart) async {
    final time = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.now(),
    );
    if (time == null) return;
    final formatted = '${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}';
    if (isStart) {
      _startController.text = formatted;
      context.read<OtRequestCubit>().setStartTime(formatted);
    } else {
      _endController.text = formatted;
      context.read<OtRequestCubit>().setEndTime(formatted);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Overtime Request'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.pop(),
        ),
      ),
      body: BlocConsumer<OtRequestCubit, OtRequestState>(
        listener: (context, state) {
          if (state.status == OtRequestStatus.success) {
            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
              content: Text('OT request submitted!'),
              backgroundColor: AppColors.success,
            ));
            context.pop();
          } else if (state.status == OtRequestStatus.failure) {
            ScaffoldMessenger.of(context).showSnackBar(SnackBar(
              content: Text(state.errorMessage ?? 'Failed'),
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
                children: [
                  FadeSlideAnimation(
                    child: AppInput(
                      label: 'Date',
                      hint: 'Select OT date',
                      controller: _dateController,
                      readOnly: true,
                      onTap: () => _pickDate(context),
                      suffixIcon: Icon(Icons.calendar_today_rounded, size: 18.sp),
                      validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                    ),
                  ),
                  SizedBox(height: 16.w),
                  FadeSlideAnimation(
                    delay: const Duration(milliseconds: 100),
                    child: Row(
                      children: [
                        Expanded(
                          child: AppInput(
                            label: 'Start Time',
                            hint: '18:00',
                            controller: _startController,
                            readOnly: true,
                            onTap: () => _pickTime(context, true),
                            validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                          ),
                        ),
                        SizedBox(width: 12.w),
                        Expanded(
                          child: AppInput(
                            label: 'End Time',
                            hint: '20:00',
                            controller: _endController,
                            readOnly: true,
                            onTap: () => _pickTime(context, false),
                            validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                          ),
                        ),
                      ],
                    ),
                  ),
                  SizedBox(height: 16.w),
                  FadeSlideAnimation(
                    delay: const Duration(milliseconds: 200),
                    child: Container(
                      padding: EdgeInsets.all(14.w),
                      decoration: BoxDecoration(
                        color: AppColors.warning.withOpacity(0.08),
                        borderRadius: BorderRadius.circular(10.r),
                        border: Border.all(color: AppColors.warning.withOpacity(0.3)),
                      ),
                      child: Row(
                        children: [
                          Icon(Icons.info_outline, color: AppColors.warning, size: 18.sp),
                          SizedBox(width: 8.w),
                          Expanded(
                            child: Text(
                              'OT is compensated at x1.5 rate. Requires leader and CEO approval.',
                              style: AppTextStyles.caption,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  SizedBox(height: 16.w),
                  FadeSlideAnimation(
                    delay: const Duration(milliseconds: 300),
                    child: AppInput(
                      label: 'Reason',
                      hint: 'Describe the reason for overtime',
                      controller: _reasonController,
                      maxLines: 4,
                      validator: (v) => v == null || v.isEmpty ? 'Reason is required' : null,
                    ),
                  ),
                  SizedBox(height: 32.w),
                  ScaleFadeAnimation(
                    delay: const Duration(milliseconds: 400),
                    child: AppButton(
                      label: 'Submit OT Request',
                      isLoading: state.status == OtRequestStatus.loading,
                      onPressed: () {
                        if (_formKey.currentState?.validate() ?? false) {
                          context.read<OtRequestCubit>().submit(
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
    );
  }
}
