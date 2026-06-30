import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { COLORS, TYPOGRAPHY, themeStyles } from '../theme';

interface CalcButtonProps {
  label: string;
  onPress: () => void;
  type?: 'number' | 'operator' | 'accent' | 'function' | 'constant' | 'disabled';
  height: number;
  isActive?: boolean;
}

export const CalcButton: React.FC<CalcButtonProps> = ({
  label,
  onPress,
  type = 'number',
  height,
  isActive = false,
}) => {
  const getButtonStyles = (pressed: boolean): ViewStyle => {
    const baseStyle: ViewStyle = {
      height,
      width: height * 1.8, // Maintain mandatory aspect ratio of ~1.8:1
      justifyContent: 'center',
      alignItems: 'center',
      margin: 4,
    };

    // Disabled state
    if (type === 'disabled') {
      return {
        ...baseStyle,
        ...themeStyles.buttonCapsule,
        backgroundColor: COLORS.surface,
        borderColor: COLORS.border,
        opacity: 0.5,
      };
    }

    // Interactive button colors
    let backgroundColor = COLORS.surface;
    let borderColor = COLORS.border;

    if (isActive) {
      backgroundColor = COLORS.accent;
      borderColor = COLORS.accentLight;
    } else if (type === 'accent') {
      backgroundColor = COLORS.accent;
      borderColor = COLORS.accentLight;
    }

    // Pressed state modifications
    if (pressed) {
      if (type === 'accent' || isActive) {
        backgroundColor = COLORS.accentDark;
      } else {
        backgroundColor = COLORS.buttonPressed;
      }
    }

    return {
      ...baseStyle,
      ...themeStyles.buttonCapsule,
      backgroundColor,
      borderColor,
    };
  };

  const getLabelStyle = (): TextStyle => {
    let color = COLORS.text;
    let fontSize = 20;

    if (type === 'accent') {
      color = '#FFFFFF'; // White text on solid accent keys
      fontSize = 18;
    } else if (type === 'operator' || type === 'function') {
      color = COLORS.accentLight; // Lightened violet for functions/operators
      fontSize = 18;
    } else if (type === 'disabled') {
      color = COLORS.textMuted;
      fontSize = 14;
    }

    // Tweak font size for longer labels
    if (label.length > 4) {
      fontSize = 14;
    } else if (label.length > 2) {
      fontSize = 16;
    }

    return {
      fontFamily: TYPOGRAPHY.fontSemiBold,
      fontSize,
      color,
    };
  };

  return (
    <Pressable
      onPress={type === 'disabled' ? undefined : onPress}
      style={({ pressed }) => [
        getButtonStyles(pressed),
        // Premium micro-animation: subtle scale down on press
        {
          transform: [{ scale: pressed && type !== 'disabled' ? 0.95 : 1 }],
        },
      ]}
    >
      <Text style={getLabelStyle()}>{label}</Text>
    </Pressable>
  );
};
