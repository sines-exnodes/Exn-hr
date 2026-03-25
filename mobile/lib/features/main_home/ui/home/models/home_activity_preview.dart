import 'package:equatable/equatable.dart';
import 'package:flutter/material.dart';

/// Một dòng hiển thị trên home (Recent activity).
class HomeActivityPreview extends Equatable {
  const HomeActivityPreview({
    required this.title,
    required this.subtitle,
    required this.timeLabel,
    required this.icon,
    required this.color,
  });

  final String title;
  final String subtitle;
  final String timeLabel;
  final IconData icon;
  final Color color;

  @override
  List<Object?> get props => [title, subtitle, timeLabel, icon, color];
}
