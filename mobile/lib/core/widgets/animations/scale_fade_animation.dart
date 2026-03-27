import 'package:flutter/material.dart';

/// A widget that applies a scale + fade entrance animation.
///
/// Good for cards, avatars, and buttons. Supports an optional bounce effect
/// via [curve] (use [Curves.easeOutBack] for a subtle overshoot).
///
/// Usage:
/// ```dart
/// ScaleFadeAnimation(
///   delay: Duration(milliseconds: 100),
///   curve: Curves.easeOutBack,
///   child: MyCard(),
/// )
/// ```
class ScaleFadeAnimation extends StatefulWidget {
  const ScaleFadeAnimation({
    super.key,
    required this.child,
    this.delay = Duration.zero,
    this.duration = const Duration(milliseconds: 400),
    this.curve = Curves.easeOutBack,
    this.beginScale = 0.85,
  });

  final Widget child;
  final Duration delay;
  final Duration duration;
  final Curve curve;

  /// The starting scale value. Defaults to 0.85 (85% of final size).
  final double beginScale;

  @override
  State<ScaleFadeAnimation> createState() => _ScaleFadeAnimationState();
}

class _ScaleFadeAnimationState extends State<ScaleFadeAnimation>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _scale;
  late final Animation<double> _fade;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: widget.duration);

    _scale = Tween<double>(
      begin: widget.beginScale,
      end: 1.0,
    ).animate(CurvedAnimation(parent: _controller, curve: widget.curve));

    _fade = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: const Interval(0.0, 0.7, curve: Curves.easeOut),
    ));

    if (widget.delay == Duration.zero) {
      _controller.forward();
    } else {
      Future.delayed(widget.delay, () {
        if (mounted) _controller.forward();
      });
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Opacity(
          opacity: _fade.value,
          child: Transform.scale(
            scale: _scale.value,
            child: child,
          ),
        );
      },
      child: widget.child,
    );
  }
}
