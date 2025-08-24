import { renderHook, act } from '@testing-library/react-native';
import { useHapticFeedback } from '../../src/hooks/useHapticFeedback';
import { HAPTIC_OPTIONS } from '../../src/constants';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

describe('useHapticFeedback', () => {
  const mockTrigger = ReactNativeHapticFeedback.trigger as jest.MockedFunction<
    typeof ReactNativeHapticFeedback.trigger
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('triggerHaptic', () => {
    it('calls ReactNativeHapticFeedback.trigger with correct parameters', () => {
      const { result } = renderHook(() => useHapticFeedback());

      act(() => {
        result.current.triggerHaptic('impactLight');
      });

      expect(mockTrigger).toHaveBeenCalledWith('impactLight', HAPTIC_OPTIONS);
      expect(mockTrigger).toHaveBeenCalledTimes(1);
    });

    it('handles errors gracefully and logs warning', () => {
      const consoleWarnSpy = jest
        .spyOn(console, 'warn')
        .mockImplementation(() => {});
      mockTrigger.mockImplementationOnce(() => {
        throw new Error('Haptic not available');
      });

      const { result } = renderHook(() => useHapticFeedback());

      act(() => {
        result.current.triggerHaptic('impactMedium');
      });

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Haptic feedback not available:',
        expect.any(Error),
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe('specific haptic functions', () => {
    it('triggerImpactLight calls triggerHaptic with impactLight', () => {
      const { result } = renderHook(() => useHapticFeedback());

      act(() => {
        result.current.triggerImpactLight();
      });

      expect(mockTrigger).toHaveBeenCalledWith('impactLight', HAPTIC_OPTIONS);
    });

    it('triggerImpactMedium calls triggerHaptic with impactMedium', () => {
      const { result } = renderHook(() => useHapticFeedback());

      act(() => {
        result.current.triggerImpactMedium();
      });

      expect(mockTrigger).toHaveBeenCalledWith('impactMedium', HAPTIC_OPTIONS);
    });

    it('triggerImpactHeavy calls triggerHaptic with impactHeavy', () => {
      const { result } = renderHook(() => useHapticFeedback());

      act(() => {
        result.current.triggerImpactHeavy();
      });

      expect(mockTrigger).toHaveBeenCalledWith('impactHeavy', HAPTIC_OPTIONS);
    });

    it('triggerNotificationSuccess calls triggerHaptic with notificationSuccess', () => {
      const { result } = renderHook(() => useHapticFeedback());

      act(() => {
        result.current.triggerNotificationSuccess();
      });

      expect(mockTrigger).toHaveBeenCalledWith(
        'notificationSuccess',
        HAPTIC_OPTIONS,
      );
    });

    it('triggerNotificationWarning calls triggerHaptic with notificationWarning', () => {
      const { result } = renderHook(() => useHapticFeedback());

      act(() => {
        result.current.triggerNotificationWarning();
      });

      expect(mockTrigger).toHaveBeenCalledWith(
        'notificationWarning',
        HAPTIC_OPTIONS,
      );
    });

    it('triggerNotificationError calls triggerHaptic with notificationError', () => {
      const { result } = renderHook(() => useHapticFeedback());

      act(() => {
        result.current.triggerNotificationError();
      });

      expect(mockTrigger).toHaveBeenCalledWith(
        'notificationError',
        HAPTIC_OPTIONS,
      );
    });

    it('triggerSelection calls triggerHaptic with selection', () => {
      const { result } = renderHook(() => useHapticFeedback());

      act(() => {
        result.current.triggerSelection();
      });

      expect(mockTrigger).toHaveBeenCalledWith('selection', HAPTIC_OPTIONS);
    });
  });

  describe('hook return value', () => {
    it('returns all expected functions', () => {
      const { result } = renderHook(() => useHapticFeedback());

      expect(typeof result.current.triggerHaptic).toBe('function');
      expect(typeof result.current.triggerImpactLight).toBe('function');
      expect(typeof result.current.triggerImpactMedium).toBe('function');
      expect(typeof result.current.triggerImpactHeavy).toBe('function');
      expect(typeof result.current.triggerNotificationSuccess).toBe('function');
      expect(typeof result.current.triggerNotificationWarning).toBe('function');
      expect(typeof result.current.triggerNotificationError).toBe('function');
      expect(typeof result.current.triggerSelection).toBe('function');
    });

    it('maintains referential stability across re-renders', () => {
      const { result, rerender } = renderHook(() => useHapticFeedback());

      const initialFunctions = {
        triggerHaptic: result.current.triggerHaptic,
        triggerImpactLight: result.current.triggerImpactLight,
        triggerImpactMedium: result.current.triggerImpactMedium,
        triggerImpactHeavy: result.current.triggerImpactHeavy,
        triggerNotificationSuccess: result.current.triggerNotificationSuccess,
        triggerNotificationWarning: result.current.triggerNotificationWarning,
        triggerNotificationError: result.current.triggerNotificationError,
        triggerSelection: result.current.triggerSelection,
      };

      rerender({});

      expect(result.current.triggerHaptic).toBe(initialFunctions.triggerHaptic);
      expect(result.current.triggerImpactLight).toBe(
        initialFunctions.triggerImpactLight,
      );
      expect(result.current.triggerImpactMedium).toBe(
        initialFunctions.triggerImpactMedium,
      );
      expect(result.current.triggerImpactHeavy).toBe(
        initialFunctions.triggerImpactHeavy,
      );
      expect(result.current.triggerNotificationSuccess).toBe(
        initialFunctions.triggerNotificationSuccess,
      );
      expect(result.current.triggerNotificationWarning).toBe(
        initialFunctions.triggerNotificationWarning,
      );
      expect(result.current.triggerNotificationError).toBe(
        initialFunctions.triggerNotificationError,
      );
      expect(result.current.triggerSelection).toBe(
        initialFunctions.triggerSelection,
      );
    });
  });

  describe('multiple trigger calls', () => {
    it('handles multiple successive haptic triggers', () => {
      const { result } = renderHook(() => useHapticFeedback());

      act(() => {
        result.current.triggerImpactLight();
        result.current.triggerImpactMedium();
        result.current.triggerSelection();
      });

      expect(mockTrigger).toHaveBeenCalledTimes(3);
      expect(mockTrigger).toHaveBeenNthCalledWith(
        1,
        'impactLight',
        HAPTIC_OPTIONS,
      );
      expect(mockTrigger).toHaveBeenNthCalledWith(
        2,
        'impactMedium',
        HAPTIC_OPTIONS,
      );
      expect(mockTrigger).toHaveBeenNthCalledWith(
        3,
        'selection',
        HAPTIC_OPTIONS,
      );
    });
  });
});
