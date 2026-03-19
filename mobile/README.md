# Exn-Hr Mobile App

Flutter mobile app following Ennam Flutter Base architecture.

## Setup

1. Install Flutter SDK: https://flutter.dev/docs/get-started/install
2. Clone the Ennam Flutter Base template into this directory
3. Run `flutter pub get`
4. Copy `.env.example` to `.env.dev`
5. Run `dart run build_runner build --delete-conflicting-outputs`
6. Run `flutter run`

## Architecture

See `ARCHITECTURE.md` in project root for full architecture guide.

This app follows Clean Architecture with:
- **Cubit** for state management
- **GetIt** for dependency injection
- **GoRouter** for navigation
- **Dio** for networking
- **Freezed** for immutable data classes

## Features (Modules)
- `authentication/` — Login
- `main_home/` — Home screen with check-in
- `attendance/` — Check-in/out, history
- `leave/` — Leave requests, list, approval
- `overtime/` — OT requests, list
- `salary/` — Payslip view
- `profile/` — Profile, change password
- `notifications/` — Push notification list
