import 'package:flutter/material.dart';

/// A convenience widget that combines fade + slide-up for individual list items
/// with index-based stagger.
///
/// Thin wrapper around [StaggeredListAnimation] with sensible defaults for
/// list item use-cases. Prefer this over [StaggeredListAnimation] directly when
/// used inside a [ListView.builder].
///
/// Usage:
/// ```dart
/// itemBuilder: (context, index) => AnimatedListItem(
///   index: index,
///   child: MyItemCard(),
/// )
/// ```
class AnimatedListItem extends StatefulWidget {
  const AnimatedListItem({
    super.key,
    required this.index,
    required this.child,
    this.baseDelay = const Duration(milliseconds: 60),
    this.duration = const Duration(milliseconds: 300),
  });

  final int index;
  final Widget child;
  final Duration baseDelay;
  final Duration duration;

  @override
  State<AnimatedListItem> createState() => _AnimatedListItemState();
}

class _AnimatedListItemState extends State<AnimatedListItem>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _fade;
  late final Animation<Offset> _slide;

  static const _maxDelay = Duration(milliseconds: 480);
  static const _curve = Curves.easeOutCubic;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: widget.duration);

    _fade = CurvedAnimation(parent: _controller, curve: _curve);
    _slide = Tween<Offset>(
      begin: const Offset(0, 18),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _controller, curve: _curve));

    final rawDelay = Duration(
      milliseconds: widget.baseDelay.inMilliseconds * widget.index,
    );
    final delay = rawDelay > _maxDelay ? _maxDelay : rawDelay;

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
