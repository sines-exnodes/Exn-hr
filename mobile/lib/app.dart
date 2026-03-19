import 'package:exn_hr/core/routing/app_router.dart';
import 'package:exn_hr/core/themes/app_theme.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class ExnHrApp extends StatelessWidget {
  const ExnHrApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ScreenUtilInit(
      designSize: const Size(375, 812),
      minTextAdapt: true,
      splitScreenMode: true,
      builder: (context, child) {
        return MaterialApp.router(
          title: 'Exn HR',
          debugShowCheckedModeBanner: false,
          theme: AppTheme.greenTheme,
          routerConfig: AppRouter.router,
        );
      },
    );
  }
}
