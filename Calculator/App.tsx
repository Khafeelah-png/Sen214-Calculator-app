import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, StyleSheet, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  Outfit_400Regular,
  Outfit_600SemiBold,
  Outfit_700Bold,
} from '@expo-google-fonts/outfit';
import * as SplashScreen from 'expo-splash-screen';

import { COLORS, themeStyles } from './src/theme';
import { calculate } from './src/mathEngine';
import { Display } from './src/components/Display';
import { Keypad } from './src/components/Keypad';
import { InputModal } from './src/components/InputModal';

// Prevent the splash screen from auto-hiding until fonts are loaded
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    Outfit_400Regular,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });

  // State Management
  const [expressionTokens, setExpressionTokens] = useState<string[]>([]);
  const [result, setResult] = useState('0');
  const [isEvaluated, setIsEvaluated] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [livePreview, setLivePreview] = useState('');

  // Mode Toggle (Basic vs Scientific)
  const [isScientific, setIsScientific] = useState(false);

  // Modal controls
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'nPr' | 'nCr' | 'STAT' | null>(null);

  // Hide Splash Screen once fonts are loaded
  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Compute live preview on expression change
  useEffect(() => {
    if (expressionTokens.length === 0 || isEvaluated || hasError) {
      setLivePreview('');
      return;
    }

    const previewVal = calculate(expressionTokens);
    if (previewVal === 'Error') {
      setLivePreview('');
    } else {
      setLivePreview(previewVal);
    }
  }, [expressionTokens, isEvaluated, hasError]);

  if (!fontsLoaded) {
    return null;
  }

  // DEL helper: deletes numbers char-by-char or functions as a unit
  const handleDelete = (tokens: string[]): string[] => {
    if (tokens.length === 0) return [];
    const nextTokens = [...tokens];
    const lastToken = nextTokens[nextTokens.length - 1];

    // If last token is a number with multiple digits, pop the last digit
    if (/^\d+\.?\d*$/.test(lastToken) && lastToken.length > 1) {
      nextTokens[nextTokens.length - 1] = lastToken.slice(0, -1);
      return nextTokens;
    }

    // Otherwise pop the whole token
    nextTokens.pop();

    // If popped token was '(' and the new last token is a function, pop the function too
    if (nextTokens.length > 0 && lastToken === '(') {
      const prevToken = nextTokens[nextTokens.length - 1];
      const isFunction = [
        'sin', 'cos', 'tan', 'asin', 'acos', 'atan',
        'sinh', 'cosh', 'tanh', 'sqrt', 'ln', 'log'
      ].includes(prevToken);
      if (isFunction) {
        nextTokens.pop();
      }
    }

    return nextTokens;
  };

  // Keyboard press handler
  const handleKeyPress = (value: string, type: string) => {
    // If calculator shows "Error", any key press recovers the state
    if (hasError) {
      setHasError(false);
      setExpressionTokens([]);
      setResult('0');
      setIsEvaluated(false);
      if (value === 'AC') return;
    }

    // AC reset
    if (value === 'AC') {
      setExpressionTokens([]);
      setResult('0');
      setIsEvaluated(false);
      setHasError(false);
      return;
    }

    // DEL character backspace
    if (value === 'DEL') {
      if (isEvaluated) {
        setIsEvaluated(false);
      } else {
        setExpressionTokens((prev) => handleDelete(prev));
      }
      return;
    }

    // Modal popup triggers
    if (value === 'nPr' || value === 'nCr' || value === 'STAT') {
      setModalType(value as 'nPr' | 'nCr' | 'STAT');
      setModalVisible(true);
      return;
    }

    // Evaluate on equals
    if (value === '=') {
      if (expressionTokens.length === 0) return;
      const finalResult = calculate(expressionTokens);
      if (finalResult === 'Error') {
        setHasError(true);
        setResult('Error');
      } else {
        setResult(finalResult);
        setIsEvaluated(true);
      }
      return;
    }

    // Operators
    const isOperator = ['+', '-', '×', '÷', '^'].includes(value);
    if (isOperator) {
      // Standardize input operator character
      const normalizedOp = value === '×' ? '*' : (value === '÷' ? '/' : value);

      if (isEvaluated) {
        // Continue calculations from the result
        setExpressionTokens([result, normalizedOp]);
        setIsEvaluated(false);
      } else {
        if (expressionTokens.length === 0) {
          if (normalizedOp === '-') {
            setExpressionTokens(['-']); // Starts negative number
          } else {
            setExpressionTokens(['0', normalizedOp]);
          }
        } else {
          const lastToken = expressionTokens[expressionTokens.length - 1];
          const isLastOp = ['+', '-', '*', '/', '^'].includes(lastToken);

          if (isLastOp) {
            // Replace consecutive operators
            setExpressionTokens((prev) => [...prev.slice(0, -1), normalizedOp]);
          } else {
            setExpressionTokens((prev) => [...prev, normalizedOp]);
          }
        }
      }
      return;
    }

    // Postfix squared key (x²)
    if (value === 'x²') {
      if (isEvaluated) {
        setExpressionTokens([result, '²']);
        setIsEvaluated(false);
      } else {
        if (expressionTokens.length === 0) {
          setExpressionTokens(['0', '²']);
        } else {
          setExpressionTokens((prev) => [...prev, '²']);
        }
      }
      return;
    }

    // Function inputs
    if (type === 'function') {
      if (isEvaluated) {
        setExpressionTokens([value, '(']);
        setIsEvaluated(false);
      } else {
        setExpressionTokens((prev) => [...prev, value, '(']);
      }
      return;
    }

    // Numbers & decimals
    if (type === 'number' || value === '.') {
      if (isEvaluated) {
        setExpressionTokens([value === '.' ? '0.' : value]);
        setIsEvaluated(false);
        return;
      }

      if (expressionTokens.length === 0) {
        setExpressionTokens([value === '.' ? '0.' : value]);
      } else {
        const lastToken = expressionTokens[expressionTokens.length - 1];
        const isLastNum = /^\d+\.?\d*$/.test(lastToken);

        if (isLastNum) {
          if (value === '.') {
            if (lastToken.includes('.')) return; // No duplicate decimal points
            setExpressionTokens((prev) => [...prev.slice(0, -1), lastToken + '.']);
          } else if (lastToken === '0') {
            // Replace standalone leading zero
            setExpressionTokens((prev) => [...prev.slice(0, -1), value]);
          } else {
            setExpressionTokens((prev) => [...prev.slice(0, -1), lastToken + value]);
          }
        } else {
          setExpressionTokens((prev) => [...prev, value === '.' ? '0.' : value]);
        }
      }
      return;
    }

    // Constants & Parentheses
    if (type === 'constant' || value === '(' || value === ')') {
      if (isEvaluated) {
        setExpressionTokens([value]);
        setIsEvaluated(false);
      } else {
        setExpressionTokens((prev) => [...prev, value]);
      }
      return;
    }
  };

  // Callback to insert computed modal values directly into active expression
  const handleInsertModalValue = (value: string) => {
    if (isEvaluated) {
      setExpressionTokens([value]);
      setIsEvaluated(false);
    } else {
      setExpressionTokens((prev) => [...prev, value]);
    }
  };

  const lastTokenVal = expressionTokens.length > 0 ? expressionTokens[expressionTokens.length - 1] : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" backgroundColor={COLORS.background} />
      
      {/* Top Display Area */}
      <Display
        expression={expressionTokens}
        result={result}
        isEvaluated={isEvaluated}
        livePreview={livePreview}
      />

      {/* Spacing / Keypad Container */}
      <View style={styles.keypadWrapper}>
        <Keypad
          isScientific={isScientific}
          setIsScientific={setIsScientific}
          onKeyPress={handleKeyPress}
          lastToken={lastTokenVal}
        />
      </View>

      {/* Input Modal for nPr, nCr, and STAT */}
      <InputModal
        visible={modalVisible}
        type={modalType}
        onClose={() => {
          setModalVisible(false);
          setModalType(null);
        }}
        onInsertValue={handleInsertModalValue}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'space-between',
  },
  keypadWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
});
