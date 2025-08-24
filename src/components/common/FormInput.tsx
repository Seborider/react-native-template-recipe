import React, { memo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';

interface FormInputProps extends Omit<TextInputProps, 'style'> {
  label: string;
  required?: boolean;
  showCharacterCount?: boolean;
  accessibilityHint?: string;
  error?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  showRequiredFieldsHint?: boolean;
}

export const FormInput = memo<FormInputProps>(
  ({
    label,
    value,
    onChangeText,
    placeholder,
    required = false,
    showCharacterCount = false,
    maxLength,
    multiline = false,
    numberOfLines,
    accessibilityHint,
    error,
    containerStyle,
    inputStyle,
    showRequiredFieldsHint = false,
    ...textInputProps
  }) => {
    const colors = useThemeColors();

    const labelId = `${label.toLowerCase().replace(/\s+/g, '-')}-label`;
    const displayLabel = required ? `${label} *` : label;

    return (
      <View style={[styles.container, containerStyle]}>
        <Text style={[styles.label, { color: colors.text }]} nativeID={labelId}>
          {displayLabel}
        </Text>

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.inputBackground,
              color: colors.text,
              borderColor: colors.inputBorder,
            },
            multiline && styles.multilineInput,
            error && { borderColor: colors.error },
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={multiline ? 'top' : 'center'}
          maxLength={maxLength}
          accessibilityHint={accessibilityHint}
          accessibilityLabelledBy={labelId}
          {...textInputProps}
        />

        {showRequiredFieldsHint && required && (
          <Text style={[styles.requiredHint, { color: colors.placeholder }]}>
            * indicates field is required
          </Text>
        )}

        {showCharacterCount && maxLength && value && (
          <Text
            style={[styles.characterCount, { color: colors.placeholder }]}
            accessibilityLabel={`${value.length} of ${maxLength} characters used`}>
            {value.length}/{maxLength}
          </Text>
        )}

        {error && (
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error}
          </Text>
        )}
      </View>
    );
  },
);

FormInput.displayName = 'FormInput';

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  requiredHint: {
    fontSize: 12,
    textAlign: 'right',
    marginBottom: 8,
    marginTop: 4,
  },
  input: {
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    minHeight: 52,
  },
  multilineInput: {
    minHeight: 100,
    maxHeight: 200,
  },
  characterCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
});
