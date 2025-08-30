import React, { memo } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
} from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';

export type ButtonVariant =
  | 'primary'
  | 'danger'
  | 'ghost'
  | 'icon'
  | 'add'
  | 'delete'
  | 'imageAdd';

export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title?: string;
  icon?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  onPress: (event: GestureResponderEvent) => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  hitSlop?: { top?: number; right?: number; bottom?: number; left?: number };
  activeOpacity?: number;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: 'button' | 'text';
}

export const Button = memo<ButtonProps>(
  ({
    title,
    icon,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    onPress,
    style,
    textStyle,
    hitSlop,
    activeOpacity = 0.7,
    accessibilityLabel,
    accessibilityHint,
    accessibilityRole = 'button',
  }) => {
    const { colors } = useThemeColors();

    const getVariantStyles = () => {
      switch (variant) {
        case 'primary':
        case 'icon':
        case 'add':
          return {
            backgroundColor: colors.primaryButtonBackground,
            color: colors.primaryButtonText,
          };
        case 'danger':
        case 'delete':
          return {
            backgroundColor: colors.dangerButtonBackground,
            color: colors.dangerButtonText,
          };
        case 'ghost':
          return {
            backgroundColor: colors.ghostButtonBackground,
            color: colors.ghostButtonText,
          };
        case 'imageAdd':
          return {
            backgroundColor: colors.primaryButtonBackgroundLight,
            color: colors.primary,
            borderColor: colors.primary,
          };
        default:
          return {
            backgroundColor: colors.primaryButtonBackground,
            color: colors.primaryButtonText,
          };
      }
    };

    const variantStyles = getVariantStyles();
    const isVerticalLayout = variant === 'imageAdd' || variant === 'delete';
    const textColor = disabled ? colors.disabledGray : variantStyles.color;

    const buttonStyles = [
      styles.button,
      styles[`${variant}Button`],
      styles[`${size}Button`],
      { backgroundColor: variantStyles.backgroundColor },
      variant === 'imageAdd' && { borderColor: variantStyles.borderColor },
      variant === 'delete' && { shadowColor: colors.shadowColor },
      disabled && styles.disabledButton,
      style,
    ];

    const textStyles = [
      styles.text,
      styles[`${size}Text`],
      styles[`${variant}Text`],
      { color: textColor },
      textStyle,
    ];

    const iconStyles = [
      styles.icon,
      styles[`${size}Icon`],
      (variant === 'imageAdd' || variant === 'delete') && styles.imageAddIcon,
      { color: textColor },
      textStyle,
    ];

    return (
      <TouchableOpacity
        style={[buttonStyles, isVerticalLayout && styles.verticalLayout]}
        onPress={onPress}
        disabled={disabled}
        hitSlop={hitSlop}
        activeOpacity={disabled ? 1 : activeOpacity}
        accessibilityRole={accessibilityRole}
        accessibilityLabel={accessibilityLabel || title}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled }}>
        {icon && <Text style={iconStyles}>{icon}</Text>}
        {title && <Text style={textStyles}>{title}</Text>}
      </TouchableOpacity>
    );
  },
);

Button.displayName = 'Button';

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  icon: {
    textAlign: 'center',
  },

  verticalLayout: {
    flexDirection: 'column',
  },

  primaryButton: {},
  primaryText: {},
  dangerButton: {},
  dangerText: {},
  ghostText: {},

  ghostButton: {
    backgroundColor: 'transparent',
  },

  iconButton: {
    borderRadius: 16,
    width: 32,
    height: 32,
    minWidth: 32,
    paddingHorizontal: 0,
  },
  iconText: {
    fontSize: 20,
    lineHeight: 20,
  },

  addButton: {
    borderRadius: 16,
  },
  addText: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 20,
  },

  deleteButton: {
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deleteText: {
    fontSize: 12,
    fontWeight: '600',
  },

  imageAddButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    width: 80,
    height: 80,
  },
  imageAddText: {
    fontSize: 12,
    fontWeight: '500',
  },
  imageAddIcon: {
    fontSize: 24,
    marginBottom: 2,
    marginRight: 0,
  },

  smallButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  smallText: {
    fontSize: 14,
  },
  smallIcon: {
    fontSize: 16,
    marginRight: 4,
  },

  mediumButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  mediumText: {
    fontSize: 16,
  },
  mediumIcon: {
    fontSize: 20,
    marginRight: 6,
  },

  largeButton: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  largeText: {
    fontSize: 18,
  },
  largeIcon: {
    fontSize: 24,
    marginRight: 8,
  },

  disabledButton: {
    opacity: 0.6,
  },
});

export default Button;
