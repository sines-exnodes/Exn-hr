import 'package:exn_hr/config/di.dart';
import 'package:exn_hr/core/themes/app_colors.dart';
import 'package:exn_hr/core/themes/app_text_styles.dart';
import 'package:exn_hr/features/profile/domain/entities/profile.dart';
import 'package:exn_hr/features/profile/domain/usecases/update_profile_usecase.dart';
import 'package:exn_hr/features/profile/ui/edit/view_models/edit_profile_cubit.dart';
import 'package:exn_hr/features/profile/ui/edit/view_models/edit_profile_state.dart';
import 'package:exn_hr/shared/ui/widgets/app_button.dart';
import 'package:exn_hr/shared/ui/widgets/app_input.dart';
import 'package:exn_hr/core/widgets/animations/animations.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:exn_hr/core/utils/date_utils.dart';
import 'package:intl/intl.dart';

class EditProfilePage extends StatelessWidget {
  const EditProfilePage({super.key, required this.profile});

  final Profile profile;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => EditProfileCubit(
        updateProfileUseCase: getIt<UpdateProfileUseCase>(),
        profile: profile,
      ),
      child: const _EditProfileView(),
    );
  }
}

class _EditProfileView extends StatefulWidget {
  const _EditProfileView();

  @override
  State<_EditProfileView> createState() => _EditProfileViewState();
}

class _EditProfileViewState extends State<_EditProfileView> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _phoneController;
  late final TextEditingController _permanentAddressController;
  late final TextEditingController _currentAddressController;
  late final TextEditingController _dobController;
  late final TextEditingController _bankAccountController;
  late final TextEditingController _bankNameController;
  late final TextEditingController _bankHolderController;
  String _selectedGender = '';
  String _dobApiValue = '';

  static const _genderOptions = ['male', 'female', 'other'];

  @override
  void initState() {
    super.initState();
    final profile = context.read<EditProfileCubit>().state.profile!;
    _phoneController = TextEditingController(text: profile.phone ?? '');
    _permanentAddressController =
        TextEditingController(text: profile.permanentAddress ?? '');
    _currentAddressController =
        TextEditingController(text: profile.currentAddress ?? '');
    _dobApiValue = profile.dob ?? '';
    _dobController = TextEditingController(
      text: _dobApiValue.isNotEmpty ? formatDateDisplay(_dobApiValue) : '',
    );
    _bankAccountController = TextEditingController(text: profile.bankAccount ?? '');
    _bankNameController = TextEditingController(text: profile.bankName ?? '');
    _bankHolderController = TextEditingController(text: profile.bankHolderName ?? '');
    _selectedGender = profile.gender ?? '';
  }

  @override
  void dispose() {
    _phoneController.dispose();
    _permanentAddressController.dispose();
    _currentAddressController.dispose();
    _dobController.dispose();
    _bankAccountController.dispose();
    _bankNameController.dispose();
    _bankHolderController.dispose();
    super.dispose();
  }

  Future<void> _pickDob(BuildContext context) async {
    DateTime initial = DateTime.now().subtract(const Duration(days: 365 * 25));
    if (_dobApiValue.isNotEmpty) {
      try {
        initial = DateTime.parse(_dobApiValue);
      } catch (_) {}
    }
    final date = await showDatePicker(
      context: context,
      initialDate: initial,
      firstDate: DateTime(1950),
      lastDate: DateTime.now(),
    );
    if (date == null) return;
    _dobApiValue = DateFormat('yyyy-MM-dd').format(date);
    _dobController.text = formatDateDisplay(_dobApiValue);
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => FocusScope.of(context).unfocus(),
      child: Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Chỉnh sửa thông tin'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.pop(),
        ),
      ),
      body: BlocConsumer<EditProfileCubit, EditProfileState>(
        listener: (context, state) {
          if (state.status == EditProfileStatus.success) {
            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
              content: Text('Cập nhật thành công!'),
              backgroundColor: AppColors.success,
            ));
            context.pop(true);
          } else if (state.status == EditProfileStatus.failure) {
            ScaffoldMessenger.of(context).showSnackBar(SnackBar(
              content: Text(state.errorMessage ?? 'Cập nhật thất bại'),
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
                  // --- Personal Info ---
                  Text('Thông tin cá nhân', style: AppTextStyles.h4),
                  SizedBox(height: 16.w),
                  FadeSlideAnimation(
                    child: AppInput(
                      label: 'Số điện thoại',
                      hint: 'Nhập số điện thoại',
                      controller: _phoneController,
                      keyboardType: TextInputType.phone,
                    ),
                  ),
                  SizedBox(height: 16.w),
                  FadeSlideAnimation(
                    delay: const Duration(milliseconds: 50),
                    child: AppInput(
                      label: 'Ngày sinh',
                      hint: 'Chọn ngày sinh',
                      controller: _dobController,
                      readOnly: true,
                      onTap: () => _pickDob(context),
                      suffixIcon: Icon(Icons.calendar_today_rounded, size: 18.sp),
                    ),
                  ),
                  SizedBox(height: 16.w),
                  FadeSlideAnimation(
                    delay: const Duration(milliseconds: 100),
                    child: _buildGenderPicker(),
                  ),
                  SizedBox(height: 16.w),
                  FadeSlideAnimation(
                    delay: const Duration(milliseconds: 150),
                    child: AppInput(
                      label: 'Địa chỉ thường trú',
                      hint: 'Nhập địa chỉ thường trú',
                      controller: _permanentAddressController,
                      maxLines: 2,
                    ),
                  ),
                  SizedBox(height: 16.w),
                  FadeSlideAnimation(
                    delay: const Duration(milliseconds: 175),
                    child: AppInput(
                      label: 'Địa chỉ hiện tại',
                      hint: 'Nhập địa chỉ hiện tại',
                      controller: _currentAddressController,
                      maxLines: 2,
                    ),
                  ),
                  SizedBox(height: 28.w),
                  // --- Bank Info ---
                  FadeSlideAnimation(
                    delay: const Duration(milliseconds: 200),
                    child: Text('Thông tin ngân hàng', style: AppTextStyles.h4),
                  ),
                  SizedBox(height: 16.w),
                  FadeSlideAnimation(
                    delay: const Duration(milliseconds: 250),
                    child: AppInput(
                      label: 'Số tài khoản',
                      hint: 'Nhập số tài khoản',
                      controller: _bankAccountController,
                      keyboardType: TextInputType.number,
                    ),
                  ),
                  SizedBox(height: 16.w),
                  FadeSlideAnimation(
                    delay: const Duration(milliseconds: 300),
                    child: AppInput(
                      label: 'Tên ngân hàng',
                      hint: 'VD: Vietcombank, MB Bank...',
                      controller: _bankNameController,
                    ),
                  ),
                  SizedBox(height: 16.w),
                  FadeSlideAnimation(
                    delay: const Duration(milliseconds: 350),
                    child: AppInput(
                      label: 'Chủ tài khoản',
                      hint: 'Tên chủ tài khoản',
                      controller: _bankHolderController,
                    ),
                  ),
                  SizedBox(height: 32.w),
                  ScaleFadeAnimation(
                    delay: const Duration(milliseconds: 400),
                    child: AppButton(
                      label: 'Lưu thay đổi',
                      isLoading: state.status == EditProfileStatus.loading,
                      onPressed: () {
                        if (_formKey.currentState?.validate() ?? false) {
                          context.read<EditProfileCubit>().save(
                            phone: _phoneController.text.trim(),
                            permanentAddress:
                                _permanentAddressController.text.trim(),
                            currentAddress:
                                _currentAddressController.text.trim(),
                            dob: _dobApiValue,
                            gender: _selectedGender,
                            bankAccount: _bankAccountController.text.trim(),
                            bankName: _bankNameController.text.trim(),
                            bankHolderName: _bankHolderController.text.trim(),
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

  Widget _buildGenderPicker() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Giới tính', style: AppTextStyles.labelMedium),
        SizedBox(height: 8.w),
        Row(
          children: _genderOptions.map((g) {
            final isSelected = _selectedGender == g;
            final label = g == 'male'
                ? 'Nam'
                : g == 'female'
                    ? 'Nữ'
                    : 'Khác';
            final isLast = g == _genderOptions.last;
            return Expanded(
              child: Padding(
                padding: EdgeInsets.only(right: isLast ? 0 : 8.w),
                child: GestureDetector(
                  onTap: () => setState(() => _selectedGender = g),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    padding: EdgeInsets.symmetric(vertical: 14.w),
                    decoration: BoxDecoration(
                      color: isSelected
                          ? AppColors.primary.withValues(alpha: 0.1)
                          : AppColors.surface,
                      borderRadius: BorderRadius.circular(10.r),
                      border: Border.all(
                        color: isSelected ? AppColors.primary : AppColors.border,
                        width: isSelected ? 1.5 : 1,
                      ),
                    ),
                    child: Center(
                      child: Text(
                        label,
                        style: AppTextStyles.labelMedium.copyWith(
                          color: isSelected
                              ? AppColors.primary
                              : AppColors.textPrimary,
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
