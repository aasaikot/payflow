import 'package:flutter/material.dart';
import 'login_screen.dart';
import 'register_screen.dart';

enum AuthMode { login, register }

class AuthScreen extends StatefulWidget {
  final AuthMode initialMode;

  const AuthScreen({
    super.key,
    this.initialMode = AuthMode.login,
  });

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  late AuthMode _currentMode;

  @override
  void initState() {
    super.initState();
    _currentMode = widget.initialMode;
  }

  void _switchToRegister() {
    setState(() {
      _currentMode = AuthMode.register;
    });
  }

  void _switchToLogin() {
    setState(() {
      _currentMode = AuthMode.login;
    });
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 300),
      switchInCurve: Curves.easeOutCubic,
      switchOutCurve: Curves.easeInCubic,
      transitionBuilder: (child, animation) {
        return FadeTransition(
          opacity: animation,
          child: SlideTransition(
            position: Tween<Offset>(
              begin: _currentMode == AuthMode.register
                  ? const Offset(0.05, 0.0)
                  : const Offset(-0.05, 0.0),
              end: Offset.zero,
            ).animate(animation),
            child: child,
          ),
        );
      },
      child: _currentMode == AuthMode.login
          ? LoginScreen(
              key: const ValueKey('login_screen'),
              onNavigateToRegister: _switchToRegister,
            )
          : RegisterScreen(
              key: const ValueKey('register_screen'),
              onNavigateToLogin: _switchToLogin,
            ),
    );
  }
}
