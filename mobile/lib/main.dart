import 'package:exn_hr/app.dart';
import 'package:exn_hr/config/di.dart';
import 'package:flutter/material.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await configureDependencies();
  runApp(const ExnHrApp());
}
