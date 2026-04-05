import 'package:exn_hr/features/profile/data/models/profile_model.dart';
import 'package:exn_hr/features/profile/domain/entities/profile.dart';

extension ProfileMapper on ProfileModel {
  Profile toEntity() {
    return Profile(
      id: id,
      userId: userId,
      fullName: fullName,
      email: user?.email ?? '',
      role: user?.role ?? 'employee',
      phone: phone,
      personalEmail: personalEmail,
      dob: dob,
      gender: gender,
      permanentAddress: permanentAddress,
      currentAddress: currentAddress,
      nationality: nationality,
      idNumber: idNumber,
      idIssueDate: idIssueDate,
      idFrontImage: idFrontImage,
      idBackImage: idBackImage,
      avatarUrl: avatarUrl,
      education: education,
      maritalStatus: maritalStatus,
      emergencyContactName: emergencyContactName,
      emergencyContactRelation: emergencyContactRelation,
      emergencyContactPhone: emergencyContactPhone,
      joinDate: joinDate,
      departmentId: department?.id ?? departmentId,
      departmentName: department?.name,
      managerId: manager?.id ?? managerId,
      managerName: manager?.fullName,
      basicSalary: basicSalary,
      insuranceSalary: insuranceSalary,
      contractType: contractType,
      contractSignDate: contractSignDate,
      contractEndDate: contractEndDate,
      contractRenewal: contractRenewal,
      bankAccount: bankAccount,
      bankName: bankName,
      bankHolderName: bankHolderName,
      paymentMethod: paymentMethod,
      dependents: dependents
          ?.map((d) => ProfileDependent(
                id: d.id,
                employeeId: d.employeeId,
                fullName: d.fullName,
                dob: d.dob,
                gender: d.gender,
                relationship: d.relationship,
              ))
          .toList(),
    );
  }
}
