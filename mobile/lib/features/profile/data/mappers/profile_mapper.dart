import 'package:exn_hr/features/profile/data/models/profile_model.dart';
import 'package:exn_hr/features/profile/domain/entities/profile.dart';

extension ProfileMapper on ProfileModel {
  Profile toEntity() {
    return Profile(
      id: id, userId: userId, fullName: fullName,
      email: user?.email ?? '', role: user?.role ?? 'employee',
      phone: phone, address: address, dob: dob, gender: gender,
      joinDate: joinDate, position: position,
      teamId: teamId, teamName: team?.name,
      basicSalary: basicSalary, insuranceSalary: insuranceSalary,
      department: null,
      contractType: contractType, numberOfDependents: numberOfDependents,
      bankAccount: bankAccount, bankName: bankName,
      bankHolderName: bankHolderName, paymentMethod: paymentMethod,
    );
  }
}
