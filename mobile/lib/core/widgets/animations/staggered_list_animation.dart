import 'package:flutter/material.dart';

/// A widget for animating list items with a stagger effect based on [index].
///
/// Each item is delayed by `index * baseDelay` so items appear one after another.
///
/// Usage inside a ListView.builder:
/// ```dart
/// itemBuilder: (context, index) => StaggeredListAnimation(
///   index: index,
///   child: MyListItem(),
/// )
/// ```
class StaggeredListAnimation extends StatefulWidget {
  const StaggeredListAnimation({
    super.key,
    required this.index,
    required this.child,
    this.baseDelay = const Duration(milliseconds: 60),
    this.duration = const Duration(milliseconds: 320),
    this.curve = Curves.easeOutCubic,
    this.maxDelay = const Duration(milliseconds: 500),
  });

  final int index;
  final Widget child;

  /// Delay multiplied by [index] to stagger items.
  final Duration baseDelay;
  final Duration duration;
  final Curve curve;

  /// Cap on total delay so late items don't take forever to appear.
  final Duration maxDelay;

  @override
  State<StaggeredListAnimation> createState() => _StaggeredListAnimationState();
}

class _StaggeredListAnimationState extends State<StaggeredListAnimation>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _fade;
  late final Animation<Offset> _slide;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: widget.duration);

    _fade = CurvedAnimation(parent: _controller, curve: widget.curve);
    _slide = Tween<Offset>(
      begin: const Offset(0, 20),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _controller, curve: widget.curve));

    final rawDelay = Duration(
      milliseconds: widget.baseDelay.inMilliseconds * widget.index,
    );
    final delay = rawDelay > widget.maxDelay ? widget.maxDelay : rawDelay;

    if (delay == Duration.zero) {
      _controller.forward();
    } else {
      Future.delayed(delay, () {
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
          child: Transform.translate(
            offset: _slide.value,
            child: child,
          ),
        );
      },
      child: widget.child,
    );
  }
}
