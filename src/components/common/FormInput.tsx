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

interface FormInputProps extends Omit<TextInputProps, 'style'> {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  required?: boolean;
  showCharacterCount?: boolean;
  maxLength?: number;
  multiline?: boolean;
  numberOfLines?: number;
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
    const labelId = `${label.toLowerCase().replace(/\s+/g, '-')}-label`;
    const displayLabel = required ? `${label} *` : label;

    return (
      <View style={[styles.container, containerStyle]}>
        <Text style={styles.label} accessibilityRole="text" nativeID={labelId}>
          {displayLabel}
        </Text>

        <TextInput
          style={[
            styles.input,
            multiline && styles.multilineInput,
            error && styles.inputError,
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#999999"
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={multiline ? 'top' : 'center'}
          maxLength={maxLength}
          accessibilityLabel={label}
          accessibilityHint={accessibilityHint}
          accessibilityLabelledBy={labelId}
          {...textInputProps}
        />
        {showRequiredFieldsHint && required && (
          <Text style={styles.requiredHint} accessibilityRole="text">
            * indicates field is required
          </Text>
        )}
        {showCharacterCount && maxLength && (
          <Text
            style={styles.characterCount}
            accessibilityLabel={`${value.length} of ${maxLength} characters used`}
            accessibilityRole="text">
            {value.length}/{maxLength}
          </Text>
        )}
        {error && (
          <Text style={styles.errorText} accessibilityRole="text">
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
    color: '#000000',
    marginBottom: 8,
  },
  requiredHint: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'right',
    marginBottom: 8,
    marginTop: 4,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#000000',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minHeight: 52,
  },
  multilineInput: {
    minHeight: 100,
    maxHeight: 200,
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  characterCount: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'right',
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 4,
  },
});
