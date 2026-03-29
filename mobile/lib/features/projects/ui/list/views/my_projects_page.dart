import 'package:exn_hr/config/di.dart';
import 'package:exn_hr/core/routing/app_router.dart';
import 'package:exn_hr/core/themes/app_colors.dart';
import 'package:exn_hr/core/themes/app_text_styles.dart';
import 'package:exn_hr/core/widgets/animations/animations.dart';
import 'package:exn_hr/features/projects/ui/list/view_models/projects_cubit.dart';
import 'package:exn_hr/features/projects/ui/list/view_models/projects_state.dart';
import 'package:exn_hr/features/projects/ui/list/widgets/project_card.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';

class MyProjectsPage extends StatelessWidget {
  const MyProjectsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => getIt<ProjectsCubit>(),
      child: const _MyProjectsView(),
    );
  }
}

class _MyProjectsView extends StatelessWidget {
  const _MyProjectsView();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Dự án của tôi'),
        automaticallyImplyLeading: true,
      ),
      body: BlocBuilder<ProjectsCubit, ProjectsState>(
        builder: (context, state) {
          if (state.status == ProjectsStatus.loading) {
            return const Center(child: CircularProgressIndicator());
          }
          if (state.status == ProjectsStatus.failure) {
            return Center(
              child: Padding(
                padding: EdgeInsets.all(24.w),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.error_outline,
                        size: 48.sp, color: AppColors.error),
                    SizedBox(height: 12.w),
                    Text(
                      state.errorMessage ?? 'Không tải được danh sách dự án',
                      style: AppTextStyles.bodyMedium,
                      textAlign: TextAlign.center,
                    ),
                    SizedBox(height: 16.w),
                    TextButton(
                      onPressed: () =>
                          context.read<ProjectsCubit>().loadProjects(),
                      child: const Text('Thử lại'),
                    ),
                  ],
                ),
              ),
            );
          }
          if (state.projects.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.folder_open_rounded,
                      size: 48.sp, color: AppColors.textHint),
                  SizedBox(height: 12.w),
                  Text('Bạn chưa tham gia dự án nào',
                      style: AppTextStyles.bodyMedium),
                ],
              ),
            );
          }
          return RefreshIndicator(
            onRefresh: () => context.read<ProjectsCubit>().loadProjects(),
            color: AppColors.primary,
            child: ListView.builder(
              padding: EdgeInsets.all(16.w),
              itemCount: state.projects.length,
              itemBuilder: (context, index) {
                final project = state.projects[index];
                return AnimatedListItem(
                  index: index,
                  child: Padding(
                    padding: EdgeInsets.only(bottom: 12.w),
                    child: ProjectCard(
                      project: project,
                      onTap: () => context.push(
                        AppRoutes.projectDetail,
                        extra: project.id,
                      ),
                    ),
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}
