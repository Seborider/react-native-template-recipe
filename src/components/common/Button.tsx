import React, { memo } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
} from 'react-native';

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
    const buttonStyles = [
      styles.button,
      styles[`${variant}Button`],
      styles[`${size}Button`],
      disabled && styles.disabledButton,
      style,
    ];

    const textStyles = [
      styles.text,
      styles[`${size}Text`],
      styles[`${variant}Text`],
      disabled && styles.disabledText,
      textStyle,
    ];

    const iconStyles = [
      styles.icon,
      styles[`${size}Icon`],
      (variant === 'imageAdd' || variant === 'delete') && styles.imageAddIcon,
      disabled && styles.disabledText,
      textStyle,
    ];

    const isVerticalLayout = variant === 'imageAdd' || variant === 'delete';

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

  primaryButton: {
    backgroundColor: '#007AFF',
  },
  primaryText: {
    color: '#FFFFFF',
  },

  dangerButton: {
    backgroundColor: '#FF3B30',
  },
  dangerText: {
    color: '#FFFFFF',
  },

  ghostButton: {
    backgroundColor: 'transparent',
  },
  ghostText: {
    color: '#007AFF',
  },

  iconButton: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    width: 32,
    height: 32,
    minWidth: 32,
    paddingHorizontal: 0,
  },
  iconText: {
    color: '#FFFFFF',
    fontSize: 20,
    lineHeight: 20,
  },

  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
  },
  addText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 20,
  },

  deleteButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deleteText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },

  imageAddButton: {
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    backgroundColor: '#F8F9FF',
    width: 80,
    height: 80,
  },
  imageAddText: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: '500',
  },
  imageAddIcon: {
    fontSize: 24,
    color: '#007AFF',
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
  disabledText: {
    color: '#C7C7CC',
  },
});

export default Button;
