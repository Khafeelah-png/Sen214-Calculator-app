import React from 'react';
import { View, StyleSheet, useWindowDimensions, Pressable, Text } from 'react-native';
import { BASIC_GRID, SCIENTIFIC_PANEL, BOTTOM_BAR, KeyConfig } from '../keyLayouts';
import { CalcButton } from './CalcButton';
import { COLORS, TYPOGRAPHY } from '../theme';

interface KeypadProps {
  isScientific: boolean;
  setIsScientific: (val: boolean) => void;
  onKeyPress: (value: string, type: string) => void;
  lastToken: string | null;
}

export const Keypad: React.FC<KeypadProps> = ({
  isScientific,
  setIsScientific,
  onKeyPress,
  lastToken,
}) => {
  const { width } = useWindowDimensions();

  // Keypad dimensions
  const keypadPadding = 12 * 2;
  const keypadWidth = width - keypadPadding;

  // Calculate dynamic heights to keep exact 1.8:1 aspect ratio
  const getButtonHeight = (cols: number): number => {
    const totalMargins = cols * 8; // 4px margin on each side of the key
    const keyWidth = (keypadWidth - totalMargins) / cols;
    return keyWidth / 1.8;
  };

  const height3Cols = getButtonHeight(3);
  const height5Cols = getButtonHeight(5);

  const renderRow = (row: KeyConfig[], cols: number, height: number, rowIndex: number) => {
    return (
      <View key={`row-${rowIndex}`} style={styles.row}>
        {row.map((key) => {
          // Check if operator is active (highlight state)
          const isOperator = ['+', '-', '×', '÷', '^'].includes(key.value) || (key.value === '/' && lastToken === '/') || (key.value === '*' && lastToken === '*');
          const isCurrentActive = isOperator && (
            lastToken === key.value || 
            (key.value === '×' && lastToken === '*') || 
            (key.value === '÷' && lastToken === '/')
          );

          return (
            <CalcButton
              key={`key-${key.label}-${key.value}`}
              label={key.label}
              type={key.type}
              height={height}
              isActive={isCurrentActive}
              onPress={() => onKeyPress(key.value, key.type)}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Mode Selector Segmented Control */}
      <View style={styles.selectorContainer}>
        <Pressable
          style={[styles.selectorButton, !isScientific && styles.selectorActive]}
          onPress={() => setIsScientific(false)}
        >
          <Text
            style={[
              styles.selectorText,
              !isScientific && styles.selectorTextActive,
            ]}
          >
            Basic
          </Text>
        </Pressable>
        <Pressable
          style={[styles.selectorButton, isScientific && styles.selectorActive]}
          onPress={() => setIsScientific(true)}
        >
          <Text
            style={[
              styles.selectorText,
              isScientific && styles.selectorTextActive,
            ]}
          >
            Scientific
          </Text>
        </Pressable>
      </View>

      {/* Scientific Keys (Rendered above numbers if mode is active) */}
      {isScientific && (
        <View style={styles.scientificContainer}>
          {SCIENTIFIC_PANEL.map((row, idx) =>
            renderRow(row, 5, height5Cols, `sci-${idx}`)
          )}
        </View>
      )}

      {/* Basic Keys Grid (3 columns) */}
      <View style={styles.basicContainer}>
        {BASIC_GRID.map((row, idx) =>
          renderRow(row, 3, height3Cols, `basic-${idx}`)
        )}
      </View>

      {/* Operators Bottom Bar (5 columns) */}
      <View style={styles.bottomBarContainer}>
        {renderRow(BOTTOM_BAR, 5, height5Cols, 'bottom-bar')}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
  },
  selectorContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 999,
    padding: 4,
    marginHorizontal: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectorButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
  },
  selectorActive: {
    backgroundColor: COLORS.accent,
  },
  selectorText: {
    fontFamily: TYPOGRAPHY.fontSemiBold,
    fontSize: 15,
    color: COLORS.textMuted,
  },
  selectorTextActive: {
    color: '#FFFFFF',
  },
  scientificContainer: {
    marginBottom: 8,
  },
  basicContainer: {
    marginBottom: 8,
  },
  bottomBarContainer: {
    marginTop: 4,
  },
});
