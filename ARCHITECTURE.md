# Ennam Flutter Base — Architecture & Project Structure

> Reference guide for setting up new Flutter projects based on this template.

---

## Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Architecture Pattern](#architecture-pattern)
- [Layer Details](#layer-details)
- [State Management](#state-management)
- [Dependency Injection](#dependency-injection)
- [Networking & Caching](#networking--caching)
- [Routing](#routing)
- [Design System](#design-system)
- [Internationalization](#internationalization)
- [Environment Configuration](#environment-configuration)
- [Error Handling](#error-handling)
- [Pagination](#pagination)
- [Event Streams (Cross-Cubit Communication)](#event-streams-cross-cubit-communication)
- [Mock Data Pattern](#mock-data-pattern)
- [Shared Widgets](#shared-widgets)
- [Scaffolding Commands](#scaffolding-commands)
- [App Initialization Sequence](#app-initialization-sequence)
- [Key Dependencies](#key-dependencies)
- [Responsive Sizing](#responsive-sizing)

---

## Overview

A production-ready Flutter template built on **Clean Architecture** with **Cubit** state management, **GetIt** DI, **GoRouter** navigation, and **Dio** networking with 4-strategy caching.

**Key Principles:**

- Clean Architecture: `UI → Domain ← Data`
- SOLID principles throughout
- Composition over inheritance
- Immutable state with Equatable + copyWith
- Either pattern for functional error handling
- Scaffolding scripts for rapid feature creation

---

## Project Structure

```
lib/
├── config/                         # Global configuration & DI
│   ├── service_locator.dart        # GetIt DI registration
│   ├── constants.dart              # App-wide constants, keys, defaults
│   ├── currency.dart               # 130+ CurrencyConstants
│   ├── enums.dart                  # Central enum exports
│   ├── status_mapper.dart          # Status → color/icon/text mapping
│   ├── global_context.dart         # Global navigator key & context
│   └── assets.dart                 # Asset path constants
│
├── core/                           # Shared infrastructure
│   ├── network/                    # HTTP client & API layer
│   │   ├── dio_client.dart         # Singleton Dio with interceptors
│   │   ├── cached_api_executor.dart# Generic caching executor
│   │   ├── api_url.dart            # Centralized API endpoints
│   │   ├── dio_exception.dart      # Custom exception classes
│   │   └── api/                    # Per-feature API classes
│   │       ├── auth_api.dart
│   │       ├── user_api.dart
│   │       └── example_api.dart
│   │
│   ├── enums/                      # Core enums
│   │   ├── request_status.dart     # initial|loading|success|error|empty|refresh|pending
│   │   └── cache_strategy.dart     # cacheFirst|networkFirst|cacheOnly|networkOnly
│   │
│   ├── themes/                     # Design system tokens
│   │   ├── colors.dart             # AppColors
│   │   ├── font_sizes.dart         # AppFontSizes (.sp scaled)
│   │   ├── icon_sizes.dart         # IconSizes (.sp scaled)
│   │   ├── text_style.dart         # AppTextStyle (Google Fonts)
│   │   ├── dimensions.dart         # AppDimensions
│   │   └── app_themes.dart         # Light/Dark Material 3 ThemeData
│   │
│   ├── utils/                      # Utility classes
│   │   ├── currency_utils.dart     # Currency formatting (130+ currencies)
│   │   ├── number_formatter_utils.dart  # Abbreviations (1M, 1B)
│   │   ├── pagination_utils.dart   # Generic pagination handler
│   │   ├── error_utils.dart        # DioException → ErrorResponse
│   │   ├── validation_utils.dart   # Email, phone, min/max validators
│   │   ├── authentication_utils.dart# Auth token management (singleton)
│   │   ├── error_handler_utils.dart # Error display & snackbar
│   │   ├── loading_utils.dart      # Global loading overlay
│   │   ├── date_utils.dart         # Date parsing & formatting
│   │   └── ...                     # location, upload, user utils
│   │
│   ├── formatters/                 # Input formatters
│   │   └── currency_input_formatter.dart
│   │
│   ├── extensions/                 # Dart extensions
│   │   ├── string.dart
│   │   ├── date.dart
│   │   └── image.dart
│   │
│   ├── env/                        # Environment configuration
│   │   ├── environment.dart        # Flavor abstraction (dev|staging|prod)
│   │   └── env.dart                # Generated via envied
│   │
│   ├── storage/                    # Local storage
│   │   ├── shared_preferences_service.dart
│   │   └── secure_storage_service.dart
│   │
│   ├── routing/                    # Navigation
│   │   ├── app_routes.dart         # Route path constants
│   │   ├── app_router.dart         # GoRouter config + auth guard
│   │   └── app_navigation.dart     # Navigation helpers
│   │
│   ├── services/                   # App services
│   │   ├── connectivity_service.dart    # Network monitoring
│   │   ├── language_service.dart        # i18n language switching
│   │   ├── cache_service.dart           # Hive-based caching
│   │   └── notification_service/        # FCM push notifications
│   │
│   ├── logging/
│   │   └── app_bloc_observer.dart  # Bloc state/event logger
│   │
│   └── cache/                      # Cache integration (Hive + DioCache)
│
├── features/                       # Feature modules
│   ├── authentication/             # Sign-in, token management
│   ├── main_home/                  # Bottom nav host, user profile
│   ├── example/                    # Full CRUD reference implementation
│   └── template/                   # Blank scaffold (clone for new features)
│
├── shared/                         # Cross-feature shared code
│   ├── ui/
│   │   ├── widgets/                # 30+ reusable components
│   │   └── custom_theme/           # Light/Dark mode provider
│   ├── domain/
│   │   ├── entities/               # Shared entities (ErrorResponse, etc.)
│   │   └── streams/                # Event streams for cross-cubit sync
│   └── data/
│       └── repositories/           # Shared repos (user profile, S3 upload)
│
└── main.dart                       # App entry point
```

---

## Architecture Pattern

**Clean Architecture — 3-Layer per Feature:**

```
┌─────────────────────────────────────────────┐
│                    UI Layer                  │
│  Screens · Widgets · Cubits · States        │
│         (depends on Domain only)            │
├─────────────────────────────────────────────┤
│                 Domain Layer                 │
│  Entities · Use Cases · Repository Interfaces│
│           (NO dependencies)                 │
├─────────────────────────────────────────────┤
│                  Data Layer                  │
│  Models · Mappers · Repository Impls · APIs │
│        (implements Domain interfaces)       │
└─────────────────────────────────────────────┘

Dependency Rule: UI → Domain ← Data
Domain has ZERO dependencies on Data or UI.
```

### Feature Directory Structure

```
features/<feature_name>/
├── data/
│   ├── models/                    # @freezed + @JsonSerializable
│   │   ├── <name>_response_model.dart
│   │   └── <name>_data_model.dart
│   ├── mappers/                   # Extension methods: Model → Entity
│   │   └── <feature>_mapper.dart
│   └── repositories/              # Implements Domain interface
│       └── <feature>_repository_impl.dart
│
├── domain/
│   ├── entities/                  # @freezed (no JSON annotations)
│   │   ├── <name>_entity.dart
│   │   └── <name>_list_entity.dart
│   ├── repositories/              # Abstract class / interface
│   │   └── <feature>_repository.dart
│   └── usecases/                  # Single-purpose classes
│       ├── get_<name>_list_usecase.dart
│       ├── create_<name>_usecase.dart
│       └── update_<name>_usecase.dart
│
└── ui/
    └── <screen_name>/
        ├── view_models/           # part/part of linked trio
        │   ├── <name>_cubit.dart
        │   ├── <name>_state.dart
        │   ├── <name>_validator.dart   # form screens only
        │   └── <name>_mock_data.dart   # before API ready
        ├── views/
        │   └── <name>_screen.dart
        └── widgets/               # Screen-specific widgets
            └── <widget>.dart
```

---

## Layer Details

### Data Layer

**Models** — Map 1:1 with API response, all fields nullable:

```dart
@freezed
abstract class ExampleListResponseModel with _$ExampleListResponseModel {
  const factory ExampleListResponseModel({
    bool? success,
    @JsonKey(name: 'status') int? statusCode,
    String? message,
    ExampleListDataModel? data,
  }) = _ExampleListResponseModel;

  factory ExampleListResponseModel.fromJson(Map<String, dynamic> json) =>
      _$ExampleListResponseModelFromJson(json);
}
```

**Mappers** — Extension methods converting Model → Entity:

```dart
extension ExampleDataMapper on ExampleDataModel {
  ExampleDataEntity toEntity() {
    return ExampleDataEntity(
      id: id ?? 0,
      title: title ?? '',
      price: price ?? 0.0,
      description: description,
    );
  }
}
```

**Repository Implementation** — API calls with Either + CachedApiExecutor:

```dart
class ExampleRepositoryImpl extends ExampleRepository {
  final ExampleApi _exampleApi;
  final CachedApiExecutor _cachedApiExecutor;

  @override
  Future<Either<ErrorResponse, ExampleListEntity?>> getExampleList({
    Map<String, dynamic>? queryParameters,
    CacheStrategy strategy = CacheStrategy.cacheFirst,
    Function(ExampleListEntity?)? onCached,
  }) async {
    return _cachedApiExecutor.execute<ExampleListEntity, ExampleListResponseModel>(
      cacheKey: 'example_list_${jsonEncode(queryParameters ?? {})}',
      apiCall: () => _exampleApi.getExampleList(queryParameters: queryParameters),
      parseResponse: (json) => ExampleListResponseModel.fromJson(json),
      fromResponseModel: (model) => model?.data?.toEntity(),
      strategy: strategy,
      ttl: const Duration(minutes: 5),
      onCached: onCached,
    );
  }
}
```

### Domain Layer

**Entities** — Pure Freezed, no JSON annotations:

```dart
@freezed
abstract class ExampleDataEntity with _$ExampleDataEntity {
  const factory ExampleDataEntity({
    required int id,
    required String title,
    required double price,
    String? description,
  }) = _ExampleDataEntity;
}
```

**Paginated List Entity** — Implements `PaginationResponse<T>`:

```dart
@freezed
abstract class ExampleListEntity
    with _$ExampleListEntity
    implements PaginationResponse<ExampleDataEntity> {
  const factory ExampleListEntity({
    List<ExampleDataEntity>? items,
    int? total,
    int? page,
    int? size,
    @JsonKey(name: 'pages') int? totalPages,
  }) = _ExampleListEntity;

  const ExampleListEntity._();

  @override
  int? get hasNext => hasNextPage;
}
```

**Repository Interface:**

```dart
abstract class ExampleRepository {
  Future<Either<ErrorResponse, ExampleListEntity?>> getExampleList({
    Map<String, dynamic>? queryParameters,
    CancelToken? cancelToken,
    CacheStrategy strategy = CacheStrategy.cacheFirst,
    Function(ExampleListEntity?)? onCached,
  });
}
```

**Use Case** — Single-purpose, delegates to repository:

```dart
class GetExampleListUseCase {
  final ExampleRepository repository;

  GetExampleListUseCase(this.repository);

  Future<Either<ErrorResponse, ExampleListEntity?>> call({
    Map<String, dynamic>? queryParameters,
    CancelToken? cancelToken,
    CacheStrategy strategy = CacheStrategy.cacheFirst,
    Function(ExampleListEntity?)? onCached,
  }) async {
    return repository.getExampleList(
      queryParameters: queryParameters,
      cancelToken: cancelToken,
      strategy: strategy,
      onCached: onCached,
    );
  }
}
```

### UI Layer

**Screen** — BlocProvider + BlocBuilder pattern:

```dart
class ExampleListScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => getIt<ExampleListCubit>(),
      child: const _ExampleListView(),
    );
  }
}

class _ExampleListView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ExampleListCubit, ExampleListState>(
      builder: (context, state) {
        return ExnRefreshLoadMore(
          onRefresh: () => context.read<ExampleListCubit>()
              .loadExampleList(strategy: CacheStrategy.networkFirst),
          onLoadMore: () => context.read<ExampleListCubit>()
              .loadExampleList(isLoadMore: true),
          child: /* list content */,
        );
      },
    );
  }
}
```

---

## State Management

**Cubit + Immutable State (flutter_bloc):**

Each screen's `view_models/` has 3 files linked with `part`/`part of`:

| File                    | Purpose                                               |
| ----------------------- | ----------------------------------------------------- |
| `<name>_cubit.dart`     | Business logic, async ops, CancelToken management     |
| `<name>_state.dart`     | Immutable state extending Equatable with `copyWith()` |
| `<name>_validator.dart` | Singleton validator (form screens only)               |

**State Pattern:**

```dart
final class ExampleListState extends Equatable {
  const ExampleListState({
    this.status = RequestStatus.initial,
    this.exampleListPaginationState = const PaginationState<ExampleDataEntity>(),
    this.searchQuery = '',
  });

  final RequestStatus status;
  final PaginationState<ExampleDataEntity> exampleListPaginationState;
  final String searchQuery;

  ExampleListState copyWith({
    RequestStatus? status,
    PaginationState<ExampleDataEntity>? exampleListPaginationState,
    String? searchQuery,
  }) {
    return ExampleListState(
      status: status ?? this.status,
      exampleListPaginationState: exampleListPaginationState ?? this.exampleListPaginationState,
      searchQuery: searchQuery ?? this.searchQuery,
    );
  }

  @override
  List<Object> get props => [status, exampleListPaginationState, searchQuery];
}
```

**Cubit Pattern (with CancelToken + lifecycle):**

```dart
class ExampleListCubit extends Cubit<ExampleListState> {
  ExampleListCubit({
    required GetExampleListUseCase getExampleListUseCase,
    required AppEventStream appEventStream,
    required ConnectivityService connectivityService,
  }) : super(const ExampleListState()) {
    // Subscribe to cross-cubit events
    _exampleCreatedSubscription = appEventStream.exampleCreatedStream.listen((_) {
      loadExampleList(strategy: CacheStrategy.networkFirst);
    });
    // Subscribe to network recovery
    _connectivitySubscription = connectivityService.onNetworkRecovery.listen((_) {
      if (state.exampleListPaginationState.items.isNotEmpty) {
        loadExampleList(strategy: CacheStrategy.networkFirst, silent: true);
      }
    });
    // Initial load
    loadExampleList(strategy: CacheStrategy.cacheFirst);
  }

  CancelToken? _cancelToken;

  @override
  Future<void> close() async {
    _cancelToken?.cancel('ExampleListCubit closed');
    await _exampleCreatedSubscription?.cancel();
    await _connectivitySubscription?.cancel();
    return super.close();
  }

  Future<void> loadExampleList({...}) async {
    _cancelToken?.cancel('New request started');
    _cancelToken = CancelToken();
    // ... API call with PaginationUtils
    if (!isClosed) {
      emit(state.copyWith(exampleListPaginationState: newState));
    }
  }
}
```

**Critical Rules:**

- CancelToken **must** be cancelled in `close()`
- Always check `if (isClosed) return` after async gaps
- Always check `if (ErrorUtils.isCancelled(error)) return` for cancelled requests

---

## Dependency Injection

**GetIt Service Locator** (`lib/config/service_locator.dart`):

| Category         | Registration            | Reason                                        |
| ---------------- | ----------------------- | --------------------------------------------- |
| Services (async) | `registerSingleton`     | SharedPreferences, DioClient, LanguageService |
| Services (sync)  | `registerSingleton`     | CacheService, ConnectivityService             |
| APIs             | `registerSingleton`     | AuthApi, UserApi, ExampleApi                  |
| Event Streams    | `registerLazySingleton` | AppEventStream, TemplateEventStream           |
| Repositories     | `registerLazySingleton` | All repository implementations                |
| Use Cases        | `registerLazySingleton` | All use case classes                          |
| Cubits           | `registerFactory`       | New instance per screen (avoids stale state)  |

**Registration Order:**

```
1. Core services (async init first)
2. API classes (singletons)
3. Repositories (lazy singletons)
4. Use Cases (lazy singletons)
5. Event Streams (lazy singletons)
6. Cubits (factory — new instance each time)
```

**Every new feature requires adding registrations here.**

---

## Networking & Caching

### DioClient

- Singleton Dio HTTP client
- Interceptors: auth token, retry (3 attempts, exponential backoff), cache, curl logging
- Timeout: 30s connect/send/receive
- Token refresh on 401 (checks JWT expiry)

### Cache Strategies

| Strategy       | Behavior                                      | When to Use                            |
| -------------- | --------------------------------------------- | -------------------------------------- |
| `cacheFirst`   | Return cache instantly, refresh in background | Initial screen loads, pagination       |
| `networkFirst` | Fetch fresh, fallback to cache if offline     | After mutations (create/update/delete) |
| `cacheOnly`    | Only cache, no network call                   | Offline mode                           |
| `networkOnly`  | No cache involvement                          | Sensitive data                         |

### CachedApiExecutor

```dart
return _cachedApiExecutor.execute<EntityType, ResponseModelType>(
  cacheKey: 'unique_cache_key',
  apiCall: () => _api.getData(),
  parseResponse: (json) => ResponseModel.fromJson(json),
  fromResponseModel: (model) => model?.data?.toEntity(),
  strategy: CacheStrategy.cacheFirst,
  ttl: const Duration(minutes: 5),
  onCached: onCached,  // Instant UI feedback from cache
);
```

---

## Routing

**GoRouter** with auth guard redirect.

**Route Constants** (`lib/core/routing/app_routes.dart`):

```dart
class AppRoutes {
  static const home = '/home';
  static const signIn = '/login';
  static const exampleCreate = '/example/create';
  static const exampleEdit = '/example/edit/:id';
  static const exampleDetails = '/example/details/:id';
}
```

**Auth Guard:**

- Checks `AuthenticationUtils().isAuthenticated`
- Public routes: `[signIn]`
- Unauthenticated → redirect to sign-in
- Authenticated on sign-in → redirect to home

**ShellRoute Pattern** — Wraps protected routes with shared BlocProviders:

```dart
ShellRoute(
  builder: (context, state, child) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(
          create: (_) => getIt<UserProfileCubit>()..getProfile(),
          lazy: false,
        ),
      ],
      child: child,
    );
  },
  routes: [ /* protected routes */ ],
);
```

---

## Design System

### Theme Tokens

| Token             | File                                         | Usage                                              |
| ----------------- | -------------------------------------------- | -------------------------------------------------- |
| `AppColors`       | `lib/core/themes/colors.dart`                | Static colors (same in light/dark)                 |
| `CustomThemeData` | `shared/domain/entities/custom_theme_model/` | Dynamic colors (change with theme)                 |
| `AppFontSizes`    | `lib/core/themes/font_sizes.dart`            | Font sizes with `.sp`                              |
| `IconSizes`       | `lib/core/themes/icon_sizes.dart`            | Icon sizes with `.sp`                              |
| `AppTextStyle`    | `lib/core/themes/text_style.dart`            | Base text styles (Regular, Medium, SemiBold, Bold) |
| `AppDimensions`   | `lib/core/themes/dimensions.dart`            | Spacing, padding, radius, button height            |

### Usage Example

```dart
Container(
  width: 200.w,
  height: 100.w,          // Always .w, never .h
  padding: EdgeInsets.symmetric(
    horizontal: AppDimensions.defaultPadding,
    vertical: 12.w,
  ),
  decoration: BoxDecoration(
    color: AppColors.kLightBackground,
    borderRadius: BorderRadius.circular(AppDimensions.inputRadius),
  ),
  child: Text(
    'key.translation'.tr(),
    style: AppTextStyle.baseFontSemiBold.copyWith(
      fontSize: AppFontSizes.fontSize16,
      color: AppColors.kTextColorBlack,
    ),
  ),
)
```

---

## Internationalization

**EasyLocalization** with flat key structure.

| File                                | Purpose                     |
| ----------------------------------- | --------------------------- |
| `assets/translations/generate.json` | Source of truth (flat keys) |
| `assets/translations/en.json`       | English (auto-synced)       |
| `assets/translations/vi.json`       | Vietnamese (auto-synced)    |

**Sync command:** `make translations_builder`

**Usage:**

```dart
Text('authentication.sign_in.welcome_back'.tr())
Text('hello_user'.tr(args: [userName]))
```

---

## Environment Configuration

**3 Flavors via `envied`:**

| File           | Flavor      |
| -------------- | ----------- |
| `.env.dev`     | Development |
| `.env.staging` | Staging     |
| `.env.prod`    | Production  |

**Build:**

```bash
flutter run --dart-define=FLAVOR=dev
flutter run --dart-define=FLAVOR=staging
flutter run --dart-define=FLAVOR=prod
```

**Re-run `dart run build_runner build --delete-conflicting-outputs` after changing env files.**

---

## Error Handling

**Error Flow:**

```
DioException
  → AppInterceptors (catch)
  → Custom exceptions (BadRequest, InvalidAuthorized, etc.)
  → Repository catches, converts via ErrorUtils
  → Either<ErrorResponse, T> returned
  → Cubit emits state with RequestStatus.error
  → UI displays via ExnSnackBar with i18n message
```

**Key Files:**

| File                                     | Purpose                      |
| ---------------------------------------- | ---------------------------- |
| `core/network/dio_exception.dart`        | Custom exception classes     |
| `core/utils/error_utils.dart`            | DioException → ErrorResponse |
| `shared/domain/entities/error_response/` | Standard error format        |

---

## Pagination

**PaginationState<T>:**

```dart
class PaginationState<T> {
  final List<T> items;
  final int currentPage;
  final int? hasNextPage;
  final RequestStatus status;
  final bool isRefreshing;
  final int total;
}
```

**Entity must implement `PaginationResponse<T>`:**

```dart
@freezed
abstract class ExampleListEntity
    with _$ExampleListEntity
    implements PaginationResponse<ExampleDataEntity> { ... }
```

**Cubit uses `PaginationUtils.handlePaginationLoad`:**

```dart
final newState = await PaginationUtils.handlePaginationLoad<ExampleDataEntity, ExampleListEntity>(
  currentState: state.exampleListPaginationState,
  isLoadMore: isLoadMore,
  apiCall: (params) async { /* API call */ },
  pageSize: 10,
);
```

**UI uses `ExnRefreshLoadMore` widget for pull-to-refresh + infinite scroll.**

---

## Event Streams (Cross-Cubit Communication)

**Pattern:** Singleton broadcast streams for app-wide events.

**Base:** `lib/shared/domain/streams/base_event_stream.dart`

**AppEventStream** — Global events:

```dart
// Emitting (from form cubit after create/update)
appEventStream.emit(ExampleCreatedEvent(exampleData: entity));

// Listening (in list cubit)
_subscription = appEventStream.exampleCreatedStream.listen((_) {
  loadExampleList(strategy: CacheStrategy.networkFirst);
});
```

**Template available** at `lib/shared/domain/streams/template_event_stream/` — clone for new feature streams.

---

## Mock Data Pattern

**Before API is ready:**

```
Entity → Mock data → UI
```

**When API is ready:**

```
Entity ← Mapper ← Model ← API Response → UI (unchanged)
```

1. Define Entity first (domain layer, UI-facing fields only)
2. Create mock data in `view_models/<name>_mock_data.dart`
3. Use in Cubit with `// TODO: Replace with real API call`
4. When API ready: add Model + Mapper + Repository, delete mock file

---

## Shared Widgets

Located in `lib/shared/ui/widgets/`:

| Widget                      | Purpose                                            |
| --------------------------- | -------------------------------------------------- |
| `ExnButton`                 | Multi-type button (primary, secondary, text, etc.) |
| `ExnTextField`              | Text input with label, error, icons                |
| `ExnSearchField`            | Search input field                                 |
| `ExnCheckbox`               | Custom checkbox                                    |
| `ExnRadioButton`            | Custom radio button                                |
| `ExnAppBar`                 | Custom app bar                                     |
| `ExnAvatar`                 | User avatar                                        |
| `ExnSnackBar`               | Snackbar notifications                             |
| `ExnConfirmDialog`          | Confirmation dialog                                |
| `ExnLoading`                | Loading indicator                                  |
| `ExnSkeleton`               | Skeleton loading state                             |
| `ExnAnimatedSwitcher`       | Multi-state smooth transitions                     |
| `ExnFadeInView`             | Fade animation                                     |
| `ExnEmptyListBlock`         | Empty state placeholder                            |
| `ExnAsyncNetworkImage`      | Cached image with error handling                   |
| `ExnRefreshLoadMore`        | Pull-to-refresh + infinite scroll                  |
| `ExnFloatingActionButton`   | Custom FAB                                         |
| `ExnBottomSheet`            | Base bottom sheet                                  |
| `ExnSelectorBottomSheet`    | Selection bottom sheet                             |
| `ExnActionBottomSheet`      | Action bottom sheet                                |
| `ExnMediaPickerBottomSheet` | Media picker                                       |
| `ExnDatetimePickerField`    | Date/time picker field                             |
| `ExnTimeRangeField`         | Time range picker                                  |
| `ExnLabelField`             | Label display field                                |

**Rule:** Always check shared widgets first. Create feature-specific widgets in `ui/<screen>/widgets/` — only add to shared if truly reusable across multiple features.

---

## Scaffolding Commands

```bash
# Full feature (data/domain/ui layers)
make create_blank_feature <name>

# Directory structure only
make create_blank_feature <name> only-folder

# Basic screen (list/detail)
make create_blank_ui <folder_path> <name>

# Form screen
make create_blank_form_ui <folder_path> <name>

# Cubit + state + validator
make create_blank_cubit <folder_path> <name>

# Form cubit
make create_blank_form_cubit <folder_path> <name>

# Repository (interface + implementation)
make create_blank_repository <folder_path> <name>

# Use case
make create_blank_usecase <folder_path> <name>

# Sync translations
make translations_builder

# Code generation (freezed, json_serializable, envied)
dart run build_runner build --delete-conflicting-outputs
```

All scaffolding commands clone from `lib/features/template/` and rename everything automatically.

---

## App Initialization Sequence

`main.dart` bootstraps in this order:

```
1.  Setup logging
2.  Environment.init()                    # Read FLAVOR env var
3.  Bloc.observer = AppBlocObserver()     # Bloc state/event logging
4.  Hive.initFlutter()                    # Cache initialization
5.  Firebase.initializeApp()              # Firebase services
6.  NotificationService.init()            # FCM push notifications
7.  EasyLocalization.ensureInitialized()  # i18n
8.  configureDependencies()               # GetIt DI registration
9.  CurlTracking.init()                   # Dev environment only
10. LanguageService initialization        # Locale setup
11. AuthRepositoryImpl.checkAuthenticated()# Load stored tokens
12. runApp(EasyLocalization → CustomThemeWrapper → MyApp → GoRouter)
```

---

## Key Dependencies

| Package                                                         | Purpose                             |
| --------------------------------------------------------------- | ----------------------------------- |
| `flutter_bloc` / `bloc`                                         | State management (Cubit)            |
| `go_router`                                                     | Declarative routing with auth guard |
| `get_it`                                                        | Service locator / DI                |
| `dio`                                                           | HTTP client                         |
| `dio_smart_retry`                                               | Retry with exponential backoff      |
| `dio_cache_interceptor`                                         | HTTP response caching               |
| `hive` / `hive_flutter`                                         | Local key-value cache               |
| `freezed` / `freezed_annotation`                                | Immutable data classes              |
| `json_serializable` / `json_annotation`                         | JSON serialization                  |
| `either_dart`                                                   | Functional error handling           |
| `easy_localization`                                             | Internationalization                |
| `flutter_screenutil`                                            | Responsive sizing                   |
| `google_fonts`                                                  | Typography                          |
| `phosphor_flutter`                                              | Icon library                        |
| `envied`                                                        | Environment variable management     |
| `firebase_core` / `firebase_messaging` / `firebase_crashlytics` | Firebase services                   |
| `flutter_secure_storage`                                        | Secure token storage                |
| `shared_preferences`                                            | Simple key-value storage            |
| `equatable`                                                     | Value equality for states           |

---

## Responsive Sizing

**flutter_screenutil** — Design size: 375 x 812 (iPhone 12)

| Extension          | Use For                        | Example                      |
| ------------------ | ------------------------------ | ---------------------------- |
| `.sp`              | Font sizes, icon sizes         | `fontSize: 14.sp`            |
| `.w`               | Width, height, padding, margin | `height: 50.w`               |
| `.r`               | Border radius                  | `BorderRadius.circular(8.r)` |
| `.verticalSpace`   | Vertical gap                   | `10.w.verticalSpace`         |
| `.horizontalSpace` | Horizontal gap                 | `8.w.horizontalSpace`        |

**Rules:**

- Always use `.w` for ALL dimensions (including height) — never `.h`
- Only use `AppDimensions` if the value already exists — don't add new ones
- Font/icon sizes always through `AppFontSizes` / `IconSizes` (which use `.sp`)

---

## New Project Setup Checklist

1. Clone this template repository
2. Rename package: update `pubspec.yaml`, run find-replace on `package:ennam_flutter_base/`
3. Create `.env.dev`, `.env.staging`, `.env.prod` files
4. Run `dart run build_runner build --delete-conflicting-outputs`
5. Update `lib/config/service_locator.dart` — remove example registrations
6. Update `lib/core/routing/app_routes.dart` — define your routes
7. Update `lib/core/network/api_url.dart` — define your API endpoints
8. Update `assets/translations/generate.json` — add your translation keys
9. Run `make translations_builder`
10. Start creating features with `make create_blank_feature <name>`
