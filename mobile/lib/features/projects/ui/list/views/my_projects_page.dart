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

class _MyProjectsView extends StatefulWidget {
  const _MyProjectsView();

  @override
  State<_MyProjectsView> createState() => _MyProjectsViewState();
}

class _MyProjectsViewState extends State<_MyProjectsView> {
  final ScrollController _scrollController = ScrollController();
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      context.read<ProjectsCubit>().loadNextPage();
    }
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgPage,
      appBar: AppBar(
        title: const Text('Dự án của tôi'),
        automaticallyImplyLeading: true,
      ),
      body: Column(
        children: [
          _SearchAndFilterBar(searchController: _searchController),
          Expanded(
            child: BlocBuilder<ProjectsCubit, ProjectsState>(
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
                          Container(
                            width: 64.w,
                            height: 64.w,
                            decoration: BoxDecoration(
                              color: AppColors.errorBg,
                              borderRadius: BorderRadius.circular(20.r),
                            ),
                            child: Icon(Icons.error_outline, size: 32.sp, color: AppColors.error),
                          ),
                          SizedBox(height: 16.w),
                          Text(
                            state.errorMessage ??
                                'Không tải được danh sách dự án',
                            style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w600),
                            textAlign: TextAlign.center,
                          ),
                          SizedBox(height: 16.w),
                          TextButton.icon(
                            onPressed: () =>
                                context.read<ProjectsCubit>().loadProjects(),
                            icon: const Icon(Icons.refresh_rounded),
                            label: const Text('Thử lại'),
                          ),
                        ],
                      ),
                    ),
                  );
                }
                if (state.filteredProjects.isEmpty &&
                    state.status == ProjectsStatus.success) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          width: 64.w,
                          height: 64.w,
                          decoration: BoxDecoration(
                            color: const Color(0xFFD1FAE5),
                            borderRadius: BorderRadius.circular(20.r),
                          ),
                          child: Icon(Icons.folder_open_rounded, size: 32.sp, color: const Color(0xFF059669)),
                        ),
                        SizedBox(height: 16.w),
                        Text(
                          state.searchQuery.isNotEmpty ||
                                  state.statusFilter !=
                                      ProjectStatusFilter.all
                              ? 'Không có dự án phù hợp'
                              : 'Bạn chưa tham gia dự án nào',
                          style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w600),
                        ),
                        SizedBox(height: 4.w),
                        Text('Tham gia dự án để xem tại đây', style: AppTextStyles.caption),
                      ],
                    ),
                  );
                }
                return RefreshIndicator(
                  onRefresh: () =>
                      context.read<ProjectsCubit>().loadProjects(),
                  color: AppColors.primary,
                  child: ListView.builder(
                    controller: _scrollController,
                    padding: EdgeInsets.all(16.w),
                    itemCount: state.filteredProjects.length +
                        (state.isPaginating ? 1 : 0),
                    itemBuilder: (context, index) {
                      if (index == state.filteredProjects.length) {
                        return Padding(
                          padding: EdgeInsets.symmetric(vertical: 16.w),
                          child: const Center(
                            child: CircularProgressIndicator(),
                          ),
                        );
                      }
                      final project = state.filteredProjects[index];
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
          ),
        ],
      ),
    );
  }
}

class _SearchAndFilterBar extends StatelessWidget {
  const _SearchAndFilterBar({required this.searchController});

  final TextEditingController searchController;

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.surface,
      padding: EdgeInsets.fromLTRB(16.w, 12.w, 16.w, 0),
      child: Column(
        children: [
          TextField(
            controller: searchController,
            onChanged: (q) =>
                context.read<ProjectsCubit>().updateSearchQuery(q),
            decoration: InputDecoration(
              hintText: 'Tìm kiếm dự án...',
              prefixIcon: const Icon(Icons.search_rounded),
              suffixIcon: BlocBuilder<ProjectsCubit, ProjectsState>(
                buildWhen: (prev, curr) =>
                    prev.searchQuery != curr.searchQuery,
                builder: (context, state) {
                  if (state.searchQuery.isEmpty) return const SizedBox.shrink();
                  return IconButton(
                    icon: const Icon(Icons.clear_rounded),
                    onPressed: () {
                      searchController.clear();
                      context
                          .read<ProjectsCubit>()
                          .updateSearchQuery('');
                    },
                  );
                },
              ),
              filled: true,
              fillColor: AppColors.background,
              contentPadding:
                  EdgeInsets.symmetric(horizontal: 14.w, vertical: 10.w),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10.r),
                borderSide: const BorderSide(color: AppColors.border),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10.r),
                borderSide: const BorderSide(color: AppColors.border),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10.r),
                borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
              ),
            ),
          ),
          SizedBox(height: 10.w),
          BlocBuilder<ProjectsCubit, ProjectsState>(
            buildWhen: (prev, curr) =>
                prev.statusFilter != curr.statusFilter,
            builder: (context, state) {
              return SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: ProjectStatusFilter.values.map((filter) {
                    final isSelected = state.statusFilter == filter;
                    return Padding(
                      padding: EdgeInsets.only(right: 8.w),
                      child: FilterChip(
                        label: Text(filter.label),
                        selected: isSelected,
                        onSelected: (_) => context
                            .read<ProjectsCubit>()
                            .updateStatusFilter(filter),
                        selectedColor:
                            AppColors.primary.withValues(alpha: 0.15),
                        checkmarkColor: AppColors.primary,
                        labelStyle: AppTextStyles.caption.copyWith(
                          color: isSelected
                              ? AppColors.primary
                              : AppColors.textSecondary,
                          fontWeight: isSelected
                              ? FontWeight.w600
                              : FontWeight.w400,
                        ),
                        side: BorderSide(
                          color: isSelected
                              ? AppColors.primary
                              : AppColors.border,
                        ),
                        padding: EdgeInsets.symmetric(horizontal: 4.w),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(20.r),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              );
            },
          ),
          SizedBox(height: 12.w),
        ],
      ),
    );
  }
}
