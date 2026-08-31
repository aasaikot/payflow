import React, { useState } from 'react';
import { Copy, Check, FileCode, FolderTree, Code2 } from 'lucide-react';

interface FlutterFile {
  name: string;
  path: string;
  category: string;
  code: string;
}

const FLUTTER_FILES: FlutterFile[] = [
  {
    name: 'payflow_top_bar.dart',
    path: 'lib/widgets/payflow_top_bar.dart',
    category: 'Widgets (Navigation)',
    code: `import 'package:flutter/material.dart';

/// PayFlowTopBar
///
/// Clean, modern, premium minimalist full-width mobile top navigation bar widget.
/// - Full-width, rectangular (no radius) fixed top bar
/// - Subtle bottom border & soft shadow
/// - Left: Rounded-square logo badge with teal/cyan gradient, stylized 'P', and 'PayFlow' title (Pay: Navy, Flow: Teal)
/// - Right: Subtle pale mint circular button with teal vertical three-dot menu icon
/// - Zero unnecessary avatars, notifications, or badges
/// - Safe-area friendly, responsive, customizable callbacks and dimensions
class PayFlowTopBar extends StatelessWidget implements PreferredSizeWidget {
  final VoidCallback? onMenuPressed;
  final double height;
  final EdgeInsetsGeometry padding;
  final Color backgroundColor;
  final Color navyTextColor;
  final Color tealColor;
  final Color menuButtonBgColor;

  const PayFlowTopBar({
    super.key,
    this.onMenuPressed,
    this.height = 64.0,
    this.padding = const EdgeInsets.symmetric(horizontal: 16.0),
    this.backgroundColor = Colors.white,
    this.navyTextColor = const Color(0xFF0F172A),
    this.tealColor = const Color(0xFF008F5B),
    this.menuButtonBgColor = const Color(0xFFE9F7F1),
  });

  @override
  Size get preferredSize => Size.fromHeight(height);

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: backgroundColor,
        border: const Border(
          bottom: BorderSide(
            color: Color(0xFFF1F5F9),
            width: 1.0,
          ),
        ),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF0F172A).withOpacity(0.03),
            blurRadius: 6,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      child: SafeArea(
        bottom: false,
        child: Container(
          height: height,
          padding: padding,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // 1. Left Side: PayFlow Logo & Text
              Row(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  // Gradient Logo Badge with Stylized "P"
                  Container(
                    width: 34,
                    height: 34,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [
                          Color(0xFF00A86B),
                          Color(0xFF008F5B),
                          Color(0xFF007A4D),
                        ],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(10),
                      boxShadow: [
                        BoxShadow(
                          color: tealColor.withOpacity(0.20),
                          blurRadius: 6,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    alignment: Alignment.center,
                    child: const Text(
                      'P',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.w900,
                        height: 1.0,
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),

                  // "PayFlow" Brand Typography
                  RichText(
                    text: TextSpan(
                      style: const TextStyle(
                        fontSize: 19,
                        fontWeight: FontWeight.w800,
                        letterSpacing: -0.5,
                        fontFamily: 'Inter',
                      ),
                      children: [
                        TextSpan(
                          text: 'Pay',
                          style: TextStyle(
                            color: navyTextColor,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                        TextSpan(
                          text: 'Flow',
                          style: TextStyle(
                            color: tealColor,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),

              // 2. Right Side: Circular Menu Button with Vertical Three-Dots
              Material(
                color: Colors.transparent,
                child: InkWell(
                  onTap: onMenuPressed ?? () {},
                  borderRadius: BorderRadius.circular(20),
                  splashColor: tealColor.withOpacity(0.12),
                  highlightColor: tealColor.withOpacity(0.06),
                  child: Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: menuButtonBgColor,
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: tealColor.withOpacity(0.10),
                        width: 1.0,
                      ),
                    ),
                    alignment: Alignment.center,
                    child: Icon(
                      Icons.more_vert_rounded,
                      color: tealColor,
                      size: 20,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
`,
  },
  {
    name: 'dashboard_screen.dart',
    path: 'lib/screens/dashboard/dashboard_screen.dart',
    category: 'Screens (Dashboard)',
    code: `import 'package:flutter/material.dart';
import '../../core/constants/payflow_colors.dart';
import '../../models/salary_record.dart';
import '../../models/user_profile.dart';
import '../../widgets/payflow_top_bar.dart';
import '../../widgets/bottom_nav_dock.dart';
import '../../services/salary_service.dart';

class DashboardScreen extends StatefulWidget {
  final UserProfile userProfile;
  final VoidCallback onOpenHistory;
  final VoidCallback onOpenAdd;
  final VoidCallback onOpenReports;
  final VoidCallback onOpenProfile;
  final Function(String month) onOpenDetails;

  const DashboardScreen({
    super.key,
    required this.userProfile,
    required this.onOpenHistory,
    required this.onOpenAdd,
    required this.onOpenReports,
    required this.onOpenProfile,
    required this.onOpenDetails,
  });

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final SalaryService _salaryService = SalaryService();
  String _selectedMonth = '2026-08';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: PayFlowTopBar(
        onMenuPressed: () {
          // Placeholder callback for menu options
        },
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            // 1. Deep Emerald Green Hero Card
            _buildHeroSalaryCard(),
            const SizedBox(height: 16),

            // 2. Gross / Deduction / Net 3-Column Bar
            _buildMetricsBar(),
            const SizedBox(height: 16),

            // 3. Income vs Deduction Donut Card
            _buildIncomeVsDeductionCard(),
            const SizedBox(height: 16),

            // 4. Month Comparison Card
            _buildMonthComparisonCard(),
            const SizedBox(height: 16),

            // 5. Last 3 History Card
            _buildLast3HistoryCard(),
          ],
        ),
      ),
      bottomNavigationBar: BottomNavDock(
        currentIndex: 0,
        onTap: (index) {
          if (index == 1) widget.onOpenHistory();
          if (index == 2) widget.onOpenAdd();
          if (index == 3) widget.onOpenReports();
          if (index == 4) widget.onOpenProfile();
        },
      ),
    );
  }

  Widget _buildHeroSalaryCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF021811), Color(0xFF05291E), Color(0xFF0A3D2D)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFFD7F8EE), Color(0xFFBEF3E3), Color(0xFF59D9B7)],
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFA1E2CF), width: 1),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF008F5B).withOpacity(0.08),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                // Left Profile Info Column
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.apartment_rounded, size: 16, color: Color(0xFF0E3B2E)),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              widget.userProfile.companyName,
                              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF0E3B2E)),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          const Icon(Icons.person_outline_rounded, size: 16, color: Color(0xFF0E3B2E)),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              widget.userProfile.name,
                              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF0E3B2E)),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          const Icon(Icons.work_outline_rounded, size: 16, color: Color(0xFF0E3B2E)),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              widget.userProfile.designation,
                              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF0E3B2E)),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          const Icon(Icons.shield_outlined, size: 16, color: Color(0xFF0E3B2E)),
                          const SizedBox(width: 8),
                          Text(
                            'PIN: \${widget.userProfile.employeeId}',
                            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF0E3B2E)),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                // Dashed Divider
                Container(
                  height: 90,
                  width: 1,
                  margin: const EdgeInsets.symmetric(horizontal: 10),
                  color: const Color(0xFF48BF9F).withOpacity(0.6),
                ),
                // Right Side: Clean NET AMOUNT & Repositioned Verified Pill Badge
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.4),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: Colors.white.withOpacity(0.7)),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.verified_user_rounded, size: 10, color: Color(0xFF059669)),
                            SizedBox(width: 3),
                            Text('VERIFIED', style: TextStyle(fontSize: 8.5, fontWeight: FontWeight.bold, color: Color(0xFF0E3B2E))),
                          ],
                        ),
                      ),
                      const SizedBox(height: 3),
                      const Text(
                        'NET AMOUNT',
                        style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 0.8, color: Color(0xFF226352)),
                      ),
                      const SizedBox(height: 2),
                      const Text(
                        '৳85,256.00',
                        style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xFF08281F)),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          // Bottom Month Strip
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 8),
            decoration: const BoxDecoration(
              color: Color(0xD8B9EEDB),
              border: Border(top: BorderSide(color: Color(0xCCA1E2CF))),
            ),
            child: const Center(
              child: Text(
                'MONTH OF AUGUST 2026',
                style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 2.0, color: Color(0xFF1B5746)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMetricsBar() {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: PayFlowColors.borderLight),
      ),
      child: const Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _MetricItem(label: 'GROSS', value: '৳126,500.00', color: PayFlowColors.darkText),
          _VerticalDivider(),
          _MetricItem(label: 'DEDUCTION', value: '৳41,244.00', color: PayFlowColors.error),
          _VerticalDivider(),
          _MetricItem(label: 'NET', value: '৳85,256.00', color: PayFlowColors.primaryGreen),
        ],
      ),
    );
  }

  Widget _buildIncomeVsDeductionCard() {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: PayFlowColors.borderLight),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Income vs Deduction', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800)),
              GestureDetector(
                onTap: () => widget.onOpenDetails('2026-08'),
                child: const Text('Details >', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: PayFlowColors.primaryGreen)),
              ),
            ],
          ),
          const SizedBox(height: 14),
          const Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _LegendRow(color: PayFlowColors.primaryGreen, label: 'Income', amount: '৳126,500.00'),
                  SizedBox(height: 8),
                  _LegendRow(color: PayFlowColors.error, label: 'Deduction', amount: '৳41,244.00'),
                ],
              ),
              // Donut Chart Graphic representation
              Stack(
                alignment: Alignment.center,
                children: [
                  SizedBox(
                    width: 72,
                    height: 72,
                    child: CircularProgressIndicator(
                      value: 0.67,
                      strokeWidth: 8,
                      backgroundColor: Color(0xFFFFECEC),
                      valueColor: AlwaysStoppedAnimation(PayFlowColors.primaryGreen),
                    ),
                  ),
                  Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text('66%', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w900)),
                      Text('Income', style: TextStyle(fontSize: 8, color: Colors.grey)),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMonthComparisonCard() {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: PayFlowColors.borderLight),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Month Comparison', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800)),
              GestureDetector(
                onTap: widget.onOpenHistory,
                child: const Text('Full View', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: PayFlowColors.primaryGreen)),
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Row(
            children: [
              Expanded(child: _SparkColumn(month: 'JUNE', amount: '৳78,500', vs: 'vs May')),
              SizedBox(width: 8),
              Expanded(child: _SparkColumn(month: 'JULY', amount: '৳79,000', vs: 'vs Jun')),
              SizedBox(width: 8),
              Expanded(child: _SparkColumn(month: 'AUGUST', amount: '৳85,256', vs: 'vs Jul', isHighlight: true)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildLast3HistoryCard() {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: PayFlowColors.borderLight),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Last 3 Salary History', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800)),
              GestureDetector(
                onTap: widget.onOpenHistory,
                child: const Text('Full View', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: PayFlowColors.primaryGreen)),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(child: _HistoryPill(month: 'August 2026', amount: '৳85,256.00', isHighlight: true, onTap: () => widget.onOpenDetails('2026-08'))),
              const SizedBox(width: 8),
              Expanded(child: _HistoryPill(month: 'July 2026', amount: '৳79,000.00', onTap: () => widget.onOpenDetails('2026-07'))),
              const SizedBox(width: 8),
              Expanded(child: _HistoryPill(month: 'June 2026', amount: '৳82,300.00', onTap: () => widget.onOpenDetails('2026-06'))),
            ],
          ),
        ],
      ),
    );
  }
}

class _MetricItem extends StatelessWidget {
  final String label;
  final String value;
  final Color color;

  const _MetricItem({required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(label, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: PayFlowColors.secondaryText)),
        const SizedBox(height: 4),
        Text(value, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: color)),
      ],
    );
  }
}

class _VerticalDivider extends StatelessWidget {
  const _VerticalDivider();

  @override
  Widget build(BuildContext context) {
    return Container(width: 1, height: 28, color: PayFlowColors.borderLight);
  }
}

class _LegendRow extends StatelessWidget {
  final Color color;
  final String label;
  final String amount;

  const _LegendRow({required this.color, required this.label, required this.amount});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        CircleAvatar(radius: 4, backgroundColor: color),
        const SizedBox(width: 6),
        Text(label, style: const TextStyle(fontSize: 12, color: PayFlowColors.secondaryText)),
        const SizedBox(width: 14),
        Text(amount, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
      ],
    );
  }
}

class _SparkColumn extends StatelessWidget {
  final String month;
  final String amount;
  final String vs;
  final bool isHighlight;

  const _SparkColumn({required this.month, required this.amount, required this.vs, this.isHighlight = false});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
      decoration: BoxDecoration(
        color: isHighlight ? const Color(0xFFE9F7F1) : const Color(0xFFF5FAF7),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: isHighlight ? PayFlowColors.primaryGreen.withOpacity(0.4) : PayFlowColors.borderLight),
      ),
      child: Column(
        children: [
          Text(month, style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: isHighlight ? PayFlowColors.primaryGreen : Colors.grey)),
          const SizedBox(height: 2),
          Text(amount, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: isHighlight ? PayFlowColors.primaryGreen : PayFlowColors.darkText)),
          Text(vs, style: const TextStyle(fontSize: 9, color: Colors.grey)),
        ],
      ),
    );
  }
}

class _HistoryPill extends StatelessWidget {
  final String month;
  final String amount;
  final bool isHighlight;
  final VoidCallback onTap;

  const _HistoryPill({required this.month, required this.amount, this.isHighlight = false, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 6),
        decoration: BoxDecoration(
          color: isHighlight ? const Color(0xFFE9F7F1) : const Color(0xFFF5FAF7),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: isHighlight ? PayFlowColors.primaryGreen.withOpacity(0.4) : PayFlowColors.borderLight),
        ),
        child: Column(
          children: [
            Text(month, style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: isHighlight ? PayFlowColors.primaryGreen : Colors.grey), overflow: TextOverflow.ellipsis),
            const SizedBox(height: 2),
            Text(amount, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: isHighlight ? PayFlowColors.primaryGreen : PayFlowColors.darkText), overflow: TextOverflow.ellipsis),
          ],
        ),
      ),
    );
  }
}`,
  },
  {
    name: 'salary_details_screen.dart',
    path: 'lib/screens/salary/salary_details_screen.dart',
    category: 'Screens (Salary)',
    code: `import 'package:flutter/material.dart';
import '../../core/constants/payflow_colors.dart';
import '../../models/salary_record.dart';

class SalaryDetailsScreen extends StatefulWidget {
  final SalaryRecord record;
  final VoidCallback onBack;
  final VoidCallback onEdit;

  const SalaryDetailsScreen({
    super.key,
    required this.record,
    required this.onBack,
    required this.onEdit,
  });

  @override
  State<SalaryDetailsScreen> createState() => _SalaryDetailsScreenState();
}

class _SalaryDetailsScreenState extends State<SalaryDetailsScreen> {
  int _selectedTab = 0; // 0 = Income, 1 = Deduction

  @override
  Widget build(BuildContext context) {
    final isIncome = _selectedTab == 0;

    return Scaffold(
      backgroundColor: PayFlowColors.pageBackground,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: PayFlowColors.darkText),
          onPressed: widget.onBack,
        ),
        title: Text(
          isIncome ? 'Salary Details' : 'Details – Deduction',
          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: PayFlowColors.darkText),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit_outlined, color: PayFlowColors.darkText),
            onPressed: widget.onEdit,
          ),
          IconButton(
            icon: const Icon(Icons.share_outlined, color: PayFlowColors.darkText),
            onPressed: () {},
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            // Dynamic Hero Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: isIncome
                      ? [const Color(0xFF063F2D), const Color(0xFF008F5B)]
                      : [const Color(0xFF8C1B1B), const Color(0xFFD83B3B)],
                ),
                borderRadius: BorderRadius.circular(24),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(widget.record.monthLabel, style: const TextStyle(color: Colors.white70, fontSize: 13)),
                          const SizedBox(height: 6),
                          Text(isIncome ? 'NET SALARY' : 'DEDUCTION', style: const TextStyle(color: Colors.white70, fontSize: 10, fontWeight: FontWeight.bold)),
                          Text(isIncome ? '৳85,256.00' : '৳41,244.00', style: const TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.w900)),
                        ],
                      ),
                      Icon(isIncome ? Icons.account_balance_wallet_outlined : Icons.arrow_circle_down_outlined, color: Colors.white, size: 36),
                    ],
                  ),
                  if (isIncome) ...[
                    const Divider(color: Colors.white24, height: 24),
                    const Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Gross: ৳126,500.00', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                        Text('Deduction: ৳41,244.00', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Tab Switcher
            Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: const Color(0xFFE4ECE8),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: isIncome ? PayFlowColors.primaryGreen : Colors.transparent,
                        foregroundColor: isIncome ? Colors.white : PayFlowColors.secondaryText,
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: () => setState(() => _selectedTab = 0),
                      child: const Text('Income Breakdown'),
                    ),
                  ),
                  Expanded(
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: !isIncome ? PayFlowColors.error : Colors.transparent,
                        foregroundColor: !isIncome ? Colors.white : PayFlowColors.secondaryText,
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: () => setState(() => _selectedTab = 1),
                      child: const Text('Deduction Breakdown'),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Breakdown List
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(22),
                border: Border.all(color: PayFlowColors.borderLight),
              ),
              child: Column(
                children: [
                  _buildRow('Basic Pay', '৳50,000.00'),
                  _buildRow('House Rent', '৳20,000.00'),
                  _buildRow('Medical', '৳5,000.00'),
                  _buildRow('Conveyance', '৳3,000.00'),
                  _buildRow('Special', '৳10,000.00'),
                  _buildRow('Dearness', '৳15,000.00'),
                  _buildRow('Refreshment', '৳5,000.00'),
                  _buildRow('Utility', '৳2,500.00'),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRow(String name, String amount) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(name, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
          Text(amount, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}`,
  },
  {
    name: 'salary_service.dart',
    path: 'lib/services/salary_service.dart',
    category: 'Services',
    code: `import 'package:firebase_database/firebase_database.dart';
import '../models/salary_record.dart';

class SalaryService {
  final FirebaseDatabase _db = FirebaseDatabase.instance;

  Future<void> saveSalaryRecord(String uid, SalaryRecord record) async {
    final ref = _db.ref('users/\$uid/months/\${record.month}');
    await ref.set(record.toMap());
  }

  Stream<List<SalaryRecord>> getSalaryRecordsStream(String uid) {
    return _db.ref('users/\$uid/months').onValue.map((event) {
      final data = event.snapshot.value as Map<dynamic, dynamic>?;
      if (data == null) return [];
      return data.entries.map((e) => SalaryRecord.fromMap(e.key.toString(), e.value as Map)).toList();
    });
  }
}`,
  },
  {
    name: 'reports_calendar_widget.dart',
    path: 'lib/widgets/reports_calendar_widget.dart',
    category: 'Widgets',
    code: `import 'package:flutter/material.dart';
import 'package:table_calendar/table_calendar.dart';
import '../core/constants/payflow_colors.dart';

class ReportsCalendarWidget extends StatefulWidget {
  final DateTime focusedDay;
  final DateTime selectedDay;
  final Function(DateTime) onMonthSelected;
  final VoidCallback onClose;

  const ReportsCalendarWidget({
    super.key,
    required this.focusedDay,
    required this.selectedDay,
    required this.onMonthSelected,
    required this.onClose,
  });

  @override
  State<ReportsCalendarWidget> createState() => _ReportsCalendarWidgetState();
}

class _ReportsCalendarWidgetState extends State<ReportsCalendarWidget> {
  late DateTime _focused;
  late DateTime _selected;

  @override
  void initState() {
    super.initState();
    _focused = widget.focusedDay;
    _selected = widget.selectedDay;
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAF9),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: PayFlowColors.borderLight),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    decoration: const BoxDecoration(
                      color: PayFlowColors.primaryGreen,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 8),
                  const Text(
                    'Salary Calendar Matrix',
                    style: TextStyle(fontWeight: FontWeight.w900, fontSize: 12, color: PayFlowColors.darkText),
                  ),
                ],
              ),
              TextButton(
                onPressed: widget.onClose,
                child: const Text('Close', style: TextStyle(color: PayFlowColors.primaryGreen, fontWeight: FontWeight.bold, fontSize: 11)),
              ),
            ],
          ),
          TableCalendar(
            firstDay: DateTime(2020),
            lastDay: DateTime(2030),
            focusedDay: _focused,
            calendarFormat: CalendarFormat.month,
            headerVisible: false,
            selectedDayPredicate: (day) => isSameDay(_selected, day),
            onDaySelected: (selectedDay, focusedDay) {
              setState(() {
                _selected = selectedDay;
                _focused = focusedDay;
              });
              widget.onMonthSelected(selectedDay);
            },
            calendarStyle: CalendarStyle(
              todayDecoration: BoxDecoration(
                color: PayFlowColors.primaryGreen.withOpacity(0.15),
                shape: BoxShape.rectangle,
                borderRadius: BorderRadius.circular(8),
              ),
              selectedDecoration: BoxDecoration(
                color: PayFlowColors.primaryGreen,
                shape: BoxShape.rectangle,
                borderRadius: BorderRadius.circular(8),
              ),
              defaultTextStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }
}`,
  },
  {
    name: 'bottom_nav_bar.dart',
    path: 'lib/widgets/bottom_nav_bar.dart',
    category: 'Widgets',
    code: `import 'package:flutter/material.dart';
import '../core/constants/payflow_colors.dart';

class BottomNavBar extends StatelessWidget {
  final int currentIndex;
  final Function(int) onTap;

  const BottomNavBar({super.key, required this.currentIndex, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        border: const Border(top: BorderSide(color: Color(0xFFE3EAE6), width: 1)),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF002314).withOpacity(0.06),
            blurRadius: 24,
            offset: const Offset(0, -6),
          ),
        ],
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 6),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildNavItem(0, Icons.home_rounded, 'Home', isSolid: true),
              _buildDivider(),
              _buildNavItem(1, Icons.access_time_rounded, 'History'),
              _buildDivider(),
              _buildFloatingDiamondAddButton(),
              _buildDivider(),
              _buildAnalyticsItem(3, 'Analytics'),
              _buildDivider(),
              _buildNavItem(4, Icons.person_outline_rounded, 'Profile'),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDivider() {
    return Container(
      width: 1,
      height: 32,
      color: const Color(0xFFEDF2F0),
    );
  }

  Widget _buildNavItem(int index, IconData icon, String label, {bool isSolid = false}) {
    final isSelected = currentIndex == index;
    return Expanded(
      child: InkWell(
        onTap: () => onTap(index),
        borderRadius: BorderRadius.circular(20),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 4),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                icon,
                color: isSelected ? PayFlowColors.primaryGreen : const Color(0xFF475569),
                size: 22,
              ),
              const SizedBox(height: 2),
              Text(
                label,
                style: TextStyle(
                  fontSize: 11.5,
                  fontWeight: isSelected ? FontWeight.w700 : FontWeight.w600,
                  color: isSelected ? const Color(0xFF1E293B) : const Color(0xFF475569),
                ),
              ),
              const SizedBox(height: 4),
              AnimatedContainer(
                duration: const Duration(milliseconds: 250),
                width: isSelected ? 28 : 0,
                height: 3.5,
                decoration: BoxDecoration(
                  color: isSelected ? PayFlowColors.primaryGreen : Colors.transparent,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAnalyticsItem(int index, String label) {
    final isSelected = currentIndex == index;
    return Expanded(
      child: InkWell(
        onTap: () => onTap(index),
        borderRadius: BorderRadius.circular(20),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 4),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                Icons.bar_chart_rounded,
                color: isSelected ? PayFlowColors.primaryGreen : const Color(0xFF475569),
                size: 22,
              ),
              const SizedBox(height: 2),
              Text(
                label,
                style: TextStyle(
                  fontSize: 11.5,
                  fontWeight: isSelected ? FontWeight.w700 : FontWeight.w600,
                  color: isSelected ? const Color(0xFF1E293B) : const Color(0xFF475569),
                ),
              ),
              const SizedBox(height: 4),
              AnimatedContainer(
                duration: const Duration(milliseconds: 250),
                width: isSelected ? 28 : 0,
                height: 3.5,
                decoration: BoxDecoration(
                  color: isSelected ? PayFlowColors.primaryGreen : Colors.transparent,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFloatingDiamondAddButton() {
    final isSelected = currentIndex == 2;
    return Expanded(
      child: Transform.translate(
        offset: const Offset(0, -22),
        child: InkWell(
          onTap: () => onTap(2),
          borderRadius: BorderRadius.circular(30),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 52,
                height: 52,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: PayFlowColors.primaryGreen.withOpacity(0.35),
                      blurRadius: 20,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                padding: const EdgeInsets.all(2),
                child: Transform.rotate(
                  angle: 0.785398, // 45 degrees
                  child: Container(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(18),
                      gradient: const LinearGradient(
                        colors: [Color(0xFF1AD69E), Color(0xFF00B377), Color(0xFF009E68)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                    ),
                    child: Transform.rotate(
                      angle: -0.785398, // counter rotate for upright icon
                      child: Icon(
                        isSelected ? Icons.close_rounded : Icons.add_rounded,
                        color: Colors.white,
                        size: 26,
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'Add',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: PayFlowColors.primaryGreen,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
`,
  },
  {
    name: 'salary_record.dart',
    path: 'lib/models/salary_record.dart',
    category: 'Models',
    code: `class SalaryRecord {
  final String month; // e.g. "2026-08"
  final String monthLabel;
  final String createdDate;
  final double gross;
  final double deduction;
  final double net;
  final Map<String, double> incomes;
  final Map<String, double> deductions;

  SalaryRecord({
    required this.month,
    required this.monthLabel,
    required this.createdDate,
    required this.gross,
    required this.deduction,
    required this.net,
    required this.incomes,
    required this.deductions,
  });

  factory SalaryRecord.fromMap(String month, Map<dynamic, dynamic> map) {
    return SalaryRecord(
      month: month,
      monthLabel: map['monthLabel']?.toString() ?? month,
      createdDate: map['createdDate']?.toString() ?? '',
      gross: (map['gross'] ?? 0).toDouble(),
      deduction: (map['deduction'] ?? 0).toDouble(),
      net: (map['net'] ?? 0).toDouble(),
      incomes: Map<String, double>.from(map['incomes'] ?? {}),
      deductions: Map<String, double>.from(map['deductions'] ?? {}),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'monthLabel': monthLabel,
      'createdDate': createdDate,
      'gross': gross,
      'deduction': deduction,
      'net': net,
      'incomes': incomes,
      'deductions': deductions,
    };
  }
}`,
  },
  {
    name: 'login_screen.dart',
    path: 'lib/screens/auth/login_screen.dart',
    category: 'Screens (Auth)',
    code: `import 'package:flutter/material.dart';
import '../../core/constants/payflow_colors.dart';
import '../../services/auth_service.dart';
import '../../widgets/payflow_logo.dart';
import 'forgot_password_dialog.dart';

class LoginScreen extends StatefulWidget {
  final VoidCallback onNavigateToRegister;
  final VoidCallback? onLoginSuccess;

  const LoginScreen({
    super.key,
    required this.onNavigateToRegister,
    this.onLoginSuccess,
  });

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final AuthService _authService = AuthService();

  bool _obscurePassword = true;
  bool _rememberMe = false;
  bool _isLoading = false;
  bool _isGoogleLoading = false;
  String? _errorMessage;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: PayFlowColors.pageBackground,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 24.0),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 440),
              child: Column(
                children: [
                  const PayFlowLogo(iconSize: 52, fontSize: 26, showSubtitle: true),
                  const SizedBox(height: 28),
                  const Text('Welcome back!', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800)),
                  const Text('Please login to continue', style: TextStyle(color: PayFlowColors.secondaryText)),
                  const SizedBox(height: 24),
                  // Form Card
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}`,
  },
  {
    name: 'pubspec.yaml',
    path: 'pubspec.yaml',
    category: 'Project Config',
    code: `name: payflow
description: "PayFlow - Secure Salary Management Android Application"
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  firebase_core: ^3.10.1
  firebase_auth: ^5.4.4
  firebase_database: ^11.3.3
  google_sign_in: ^6.2.2
  fl_chart: ^0.70.2
  intl: ^0.20.2

flutter:
  uses-material-design: true`,
  },
];

export const FlutterCodeViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<FlutterFile>(FLUTTER_FILES[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="flutter-code-viewer-container" className="flex flex-col h-full bg-[#17211D] rounded-2xl overflow-hidden border border-[#D7E0DC]/20 shadow-xl text-white">
      {/* Top Header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-[#1F2B26] border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <Code2 size={20} className="text-[#008F5B]" />
          <span className="font-bold text-sm text-white">Flutter / Dart Source Code</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="copy-dart-code-btn"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#008F5B] hover:bg-[#007A4D] text-xs font-semibold transition-all cursor-pointer text-white"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? 'Copied!' : 'Copy File'}</span>
          </button>
        </div>
      </div>

      {/* Main Split Body */}
      <div className="flex flex-1 min-h-[460px] overflow-hidden">
        {/* File Navigator Sidebar */}
        <div className="w-56 bg-[#17211D] border-r border-white/10 p-3 overflow-y-auto shrink-0 flex flex-col gap-1">
          <div className="text-[11px] font-bold text-[#9EABA5] uppercase tracking-wider px-2 py-1 flex items-center gap-1.5">
            <FolderTree size={12} />
            <span>Project Files ({FLUTTER_FILES.length})</span>
          </div>

          {FLUTTER_FILES.map((file) => {
            const isSelected = selectedFile.name === file.name;
            return (
              <button
                key={file.path}
                onClick={() => setSelectedFile(file)}
                className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#008F5B] text-white font-semibold'
                    : 'text-[#D7E0DC] hover:bg-white/5 hover:text-white'
                }`}
              >
                <FileCode size={14} className={isSelected ? 'text-white' : 'text-[#008F5B]'} />
                <span className="truncate">{file.name}</span>
              </button>
            );
          })}
        </div>

        {/* Code Content Window */}
        <div className="flex-1 flex flex-col bg-[#121A17] overflow-hidden">
          <div className="px-4 py-2 bg-[#1A2520] border-b border-white/10 text-xs text-[#9EABA5] flex items-center justify-between">
            <span className="font-mono">{selectedFile.path}</span>
            <span className="text-[11px] bg-white/10 px-2 py-0.5 rounded text-white/80">
              {selectedFile.category}
            </span>
          </div>

          <pre className="flex-1 p-4 text-xs font-mono overflow-auto text-[#E4ECE8] leading-relaxed select-text">
            <code>{selectedFile.code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
