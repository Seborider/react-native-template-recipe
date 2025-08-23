import { useCallback } from 'react';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { HAPTIC_OPTIONS } from '../constants';

type HapticType =
  | 'impactLight'
  | 'impactMedium'
  | 'impactHeavy'
  | 'notificationSuccess'
  | 'notificationWarning'
  | 'notificationError'
  | 'selection';

export const useHapticFeedback = () => {
  const triggerHaptic = useCallback((type: HapticType) => {
    try {
      ReactNativeHapticFeedback.trigger(type, HAPTIC_OPTIONS);
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  }, []);

  const triggerImpactLight = useCallback(() => {
    triggerHaptic('impactLight');
  }, [triggerHaptic]);

  const triggerImpactMedium = useCallback(() => {
    triggerHaptic('impactMedium');
  }, [triggerHaptic]);

  const triggerImpactHeavy = useCallback(() => {
    triggerHaptic('impactHeavy');
  }, [triggerHaptic]);

  const triggerNotificationSuccess = useCallback(() => {
    triggerHaptic('notificationSuccess');
  }, [triggerHaptic]);

  const triggerNotificationWarning = useCallback(() => {
    triggerHaptic('notificationWarning');
  }, [triggerHaptic]);

  const triggerNotificationError = useCallback(() => {
    triggerHaptic('notificationError');
  }, [triggerHaptic]);

  const triggerSelection = useCallback(() => {
    triggerHaptic('selection');
  }, [triggerHaptic]);

  return {
    triggerHaptic,
    triggerImpactLight,
    triggerImpactMedium,
    triggerImpactHeavy,
    triggerNotificationSuccess,
    triggerNotificationWarning,
    triggerNotificationError,
    triggerSelection,
  };
};
