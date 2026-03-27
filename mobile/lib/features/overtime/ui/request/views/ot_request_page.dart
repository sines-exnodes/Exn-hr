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
import 'package:exn_hr/core/utils/date_utils.dart';
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

  static const _otTypes = [
    ('normal', 'Ngày thường', 'x1.5'),
    ('weekend', 'Cuối tuần', 'x2.0'),
    ('holiday', 'Ngày lễ', 'x3.0'),
  ];

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
    final apiDate = DateFormat('yyyy-MM-dd').format(date);
    _dateController.text = formatDateDisplay(apiDate);
    context.read<OtRequestCubit>().setDate(apiDate);
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
    return GestureDetector(
      onTap: () => FocusScope.of(context).unfocus(),
      child: Scaffold(
      backgroundColor: AppColors.bgPage,
      appBar: AppBar(
        title: const Text('Yêu cầu làm thêm (OT)'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.pop(),
        ),
      ),
      body: BlocConsumer<OtRequestCubit, OtRequestState>(
        listener: (context, state) {
          if (state.status == OtRequestStatus.success) {
            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
              content: Text('Gửi yêu cầu OT thành công!'),
              backgroundColor: AppColors.success,
            ));
            context.pop(true);
          } else if (state.status == OtRequestStatus.failure) {
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
                children: [
                  FadeSlideAnimation(
                    child: AppInput(
                      label: 'Ngày làm thêm',
                      hint: 'Chọn ngày',
                      controller: _dateController,
                      readOnly: true,
                      onTap: () => _pickDate(context),
                      suffixIcon: Icon(Icons.calendar_today_rounded, size: 18.sp),
                      validator: (v) => v == null || v.isEmpty ? 'Bắt buộc' : null,
                    ),
                  ),
                  SizedBox(height: 16.w),
                  FadeSlideAnimation(
                    delay: const Duration(milliseconds: 100),
                    child: Row(
                      children: [
                        Expanded(
                          child: AppInput(
                            label: 'Giờ bắt đầu',
                            hint: '18:00',
                            controller: _startController,
                            readOnly: true,
                            onTap: () => _pickTime(context, true),
                            validator: (v) => v == null || v.isEmpty ? 'Bắt buộc' : null,
                          ),
                        ),
                        SizedBox(width: 12.w),
                        Expanded(
                          child: AppInput(
                            label: 'Giờ kết thúc',
                            hint: '20:00',
                            controller: _endController,
                            readOnly: true,
                            onTap: () => _pickTime(context, false),
                            validator: (v) => v == null || v.isEmpty ? 'Bắt buộc' : null,
                          ),
                        ),
                      ],
                    ),
                  ),
                  SizedBox(height: 16.w),
                  FadeSlideAnimation(
                    delay: const Duration(milliseconds: 150),
                    child: _buildOtTypePicker(context, state.otType),
                  ),
                  SizedBox(height: 16.w),
                  FadeSlideAnimation(
                    delay: const Duration(milliseconds: 200),
                    child: _buildRateInfo(state.otType),
                  ),
                  SizedBox(height: 16.w),
                  FadeSlideAnimation(
                    delay: const Duration(milliseconds: 300),
                    child: AppInput(
                      label: 'Lý do',
                      hint: 'Mô tả lý do làm thêm',
                      controller: _reasonController,
                      maxLines: 4,
                      validator: (v) => v == null || v.isEmpty ? 'Lý do là bắt buộc' : null,
                    ),
                  ),
                  SizedBox(height: 32.w),
                  ScaleFadeAnimation(
                    delay: const Duration(milliseconds: 400),
                    child: AppButton(
                      label: 'Gửi yêu cầu OT',
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
    ),
    );
  }

  Widget _buildOtTypePicker(BuildContext context, String selected) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Loại OT', style: AppTextStyles.labelMedium),
        SizedBox(height: 8.w),
        Row(
          children: _otTypes.map((type) {
            final isSelected = type.$1 == selected;
            return Expanded(
              child: Padding(
                padding: EdgeInsets.only(
                  right: type.$1 != _otTypes.last.$1 ? 8.w : 0,
                ),
                child: GestureDetector(
                  onTap: () => context.read<OtRequestCubit>().setOtType(type.$1),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    padding: EdgeInsets.symmetric(vertical: 12.w),
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
                    child: Column(
                      children: [
                        Text(
                          type.$2,
                          style: AppTextStyles.labelSmall.copyWith(
                            color: isSelected ? AppColors.primary : AppColors.textPrimary,
                            fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                          ),
                        ),
                        SizedBox(height: 2.w),
                        Text(
                          type.$3,
                          style: AppTextStyles.caption.copyWith(
                            color: isSelected ? AppColors.primary : AppColors.textSecondary,
                            fontWeight: isSelected ? FontWeight.w700 : FontWeight.normal,
                          ),
                        ),
                      ],
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

  Widget _buildRateInfo(String otType) {
    final rateText = switch (otType) {
      'weekend' => 'OT cuối tuần được tính hệ số x2.0.',
      'holiday' => 'OT ngày lễ được tính hệ số x3.0.',
      _ => 'OT ngày thường được tính hệ số x1.5.',
    };

    return Container(
      padding: EdgeInsets.all(14.w),
      decoration: BoxDecoration(
        color: AppColors.infoBg,
        borderRadius: BorderRadius.circular(12.r),
      ),
      child: Row(
        children: [
          Container(
            width: 32.w,
            height: 32.w,
            decoration: BoxDecoration(
              color: AppColors.info.withOpacity(0.15),
              borderRadius: BorderRadius.circular(8.r),
            ),
            child: Icon(Icons.info_outline, color: AppColors.info, size: 16.sp),
          ),
          SizedBox(width: 10.w),
          Expanded(
            child: Text(
              '$rateText Cần leader và CEO duyệt.',
              style: AppTextStyles.caption.copyWith(color: AppColors.info),
            ),
          ),
        ],
      ),
    );
  }
}
