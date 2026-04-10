/**
 * useHaptics – platform-aware haptic feedback hook.
 *
 * iOS  → Uses UIFeedbackGenerator (impact / notification / selection).
 * Android → Uses native HapticFeedbackConstants (effectClick, confirm,
 *            reject, toggleOn/Off, contextClick, etc.) for real haptics
 *            instead of plain vibration fallback.
 *
 * Usage:
 *   const { impact, selection, success, warning, error } = useHaptics();
 */

import { Platform } from 'react-native';
import ReactNativeHapticFeedback, {
  HapticFeedbackTypes,
} from 'react-native-haptic-feedback';

const OPTIONS = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

const isAndroid = Platform.OS === 'android';

export function useHaptics() {
  type HType = keyof typeof HapticFeedbackTypes;

  const trigger = (type: HType) => {
    ReactNativeHapticFeedback.trigger(type, OPTIONS);
  };

  /** Pick from two typed keys based on platform. */
  const pick = (android: HType, ios: HType): HType =>
    isAndroid ? android : ios;

  return {
    /**
     * Standard tap / button press.
     * iOS: impactMedium  |  Android: effectClick
     */
    impact: () => trigger(pick('effectClick', 'impactMedium')),

    /**
     * Light tick for list selections, chip picks, toggles.
     * iOS: selection  |  Android: clockTick (short, subtle)
     */
    selection: () => trigger(pick('clockTick', 'selection')),

    /**
     * Positive confirmation – save succeeded / onboarding complete.
     * iOS: notificationSuccess  |  Android: confirm (API 30+)
     */
    success: () => trigger(pick('confirm', 'notificationSuccess')),

    /**
     * Warning state.
     * iOS: notificationWarning  |  Android: effectHeavyClick
     */
    warning: () => trigger(pick('effectHeavyClick', 'notificationWarning')),

    /**
     * Validation error / failed action.
     * iOS: notificationError  |  Android: reject (API 30+)
     */
    error: () => trigger(pick('reject', 'notificationError')),

    /**
     * Heavy impact – FAB, primary CTA.
     * iOS: impactHeavy  |  Android: effectHeavyClick
     */
    heavy: () => trigger(pick('effectHeavyClick', 'impactHeavy')),

    /**
     * Light touch – back button, secondary navigation.
     * iOS: impactLight  |  Android: contextClick (very subtle)
     */
    light: () => trigger(pick('contextClick', 'impactLight')),

    /**
     * Toggle switch turned on.
     * iOS: selection  |  Android: toggleOn (API 34+)
     */
    toggleOn: () => trigger(pick('toggleOn', 'selection')),

    /**
     * Toggle switch turned off.
     * iOS: selection  |  Android: toggleOff (API 34+)
     */
    toggleOff: () => trigger(pick('toggleOff', 'selection')),
  };
}
