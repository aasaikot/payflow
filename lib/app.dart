import 'package:flutter/material.dart';
import 'core/theme/payflow_theme.dart';
import 'screens/auth/auth_screen.dart';

class PayFlowApp extends StatelessWidget {
  const PayFlowApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'PayFlow - Secure Salary Management',
      debugShowCheckedModeBanner: false,
      theme: PayFlowTheme.lightTheme,
      home: const AuthScreen(),
    );
  }
}
