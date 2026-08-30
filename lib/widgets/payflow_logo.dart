import 'package:flutter/material.dart';
import '../core/constants/payflow_colors.dart';

class PayFlowLogo extends StatelessWidget {
  final double iconSize;
  final double fontSize;
  final bool showSubtitle;
  final bool isHorizontal;
  final MainAxisAlignment alignment;

  const PayFlowLogo({
    super.key,
    this.iconSize = 48,
    this.fontSize = 24,
    this.showSubtitle = true,
    this.isHorizontal = false,
    this.alignment = MainAxisAlignment.center,
  });

  @override
  Widget build(BuildContext context) {
    final iconWidget = Container(
      width: iconSize,
      height: iconSize,
      decoration: BoxDecoration(
        color: PayFlowColors.primaryGreen,
        borderRadius: BorderRadius.circular(iconSize * 0.28),
        boxShadow: [
          BoxShadow(
            color: PayFlowColors.primaryGreen.withOpacity(0.25),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Center(
        child: Text(
          'P',
          style: TextStyle(
            color: PayFlowColors.white,
            fontSize: iconSize * 0.58,
            fontWeight: FontWeight.w800,
            fontFamily: 'sans-serif',
          ),
        ),
      ),
    );

    final textWidget = Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: isHorizontal ? CrossAxisAlignment.start : CrossAxisAlignment.center,
      children: [
        RichText(
          text: TextSpan(
            children: [
              TextSpan(
                text: 'Pay',
                style: TextStyle(
                  color: PayFlowColors.darkText,
                  fontSize: fontSize,
                  fontWeight: FontWeight.w800,
                  letterSpacing: -0.5,
                ),
              ),
              TextSpan(
                text: 'Flow',
                style: TextStyle(
                  color: PayFlowColors.primaryGreen,
                  fontSize: fontSize,
                  fontWeight: FontWeight.w800,
                  letterSpacing: -0.5,
                ),
              ),
            ],
          ),
        ),
        if (showSubtitle) ...[
          const SizedBox(height: 2),
          Text(
            'Secure Salary Management',
            style: TextStyle(
              color: PayFlowColors.secondaryText,
              fontSize: fontSize * 0.48,
              fontWeight: FontWeight.w500,
              letterSpacing: 0.2,
            ),
          ),
        ],
      ],
    );

    if (isHorizontal) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: alignment,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          iconWidget,
          SizedBox(width: iconSize * 0.3),
          textWidget,
        ],
      );
    }

    return Column(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: alignment,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        iconWidget,
        SizedBox(height: iconSize * 0.22),
        textWidget,
      ],
    );
  }
}
