import { useState, useEffect } from 'react';
import { Keyboard, Platform, KeyboardEvent } from 'react-native';

/**
 * useKeyboardOffset Hook
 *
 * Dynamically tracks software keyboard appearance and height.
 * - On Android (especially in Expo edge-to-edge mode where window resizing is bypassed),
 *   it dynamically expands the bottom padding of scrollable views so inputs and submit
 *   buttons are NEVER covered or overlaid by the keyboard.
 * - On iOS, native `automaticallyAdjustKeyboardInsets` handles inset expansion,
 *   while this hook provides comfortable breathing room.
 * - When the keyboard closes, padding instantly reverts to default (`defaultPadding`),
 *   ensuring zero unwanted empty whitespace below submit buttons.
 */
export function useKeyboardOffset(defaultPadding: number = 16) {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = (e: KeyboardEvent) => {
      const height = e.endCoordinates ? e.endCoordinates.height : 280;
      setKeyboardHeight(height);
      setIsKeyboardVisible(true);
    };

    const onHide = () => {
      setKeyboardHeight(0);
      setIsKeyboardVisible(false);
    };

    const showSub = Keyboard.addListener(showEvent, onShow);
    const hideSub = Keyboard.addListener(hideEvent, onHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // On Android, ScrollViews need explicit bottom padding when the keyboard is open
  // so the user can freely scroll past the keyboard to view fields & buttons.
  const dynamicPaddingBottom = isKeyboardVisible
    ? (Platform.OS === 'android' ? keyboardHeight + 24 : 24)
    : defaultPadding;

  return {
    keyboardHeight,
    isKeyboardVisible,
    dynamicPaddingBottom,
  };
}
