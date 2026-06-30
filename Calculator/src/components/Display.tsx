import React, { useRef } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { COLORS, themeStyles, TYPOGRAPHY } from '../theme';

interface DisplayProps {
  expression: string[];
  result: string;
  isEvaluated: boolean;
  livePreview: string;
}

export const Display: React.FC<DisplayProps> = ({
  expression,
  result,
  isEvaluated,
  livePreview,
}) => {
  const exprScrollRef = useRef<ScrollView>(null);
  const resultScrollRef = useRef<ScrollView>(null);

  // Prettify expression tokens for user presentation
  const formatExpression = (tokens: string[]): string => {
    if (tokens.length === 0) return ' ';
    return tokens
      .map((token) => {
        switch (token) {
          case '*':
          case '×':
            return ' × ';
          case '/':
          case '÷':
            return ' ÷ ';
          case '+':
            return ' + ';
          case '-':
            return ' − ';
          case 'asin':
            return 'sin⁻¹';
          case 'acos':
            return 'cos⁻¹';
          case 'atan':
            return 'tan⁻¹';
          case 'sqrt':
            return '√';
          case 'u-':
            return '−';
          default:
            return token;
        }
      })
      .join('');
  };

  const formattedExpr = formatExpression(expression);

  // Display the main result (or 0 if empty)
  // If evaluated, we show the final result in full color.
  // If not evaluated, we show the active typing or live preview in the result area.
  const displayResult = isEvaluated ? result : (livePreview !== '' ? livePreview : '0');
  const isResultMuted = !isEvaluated && livePreview === '';

  return (
    <View style={themeStyles.displayCard}>
      {/* Expression Area (Top Line) */}
      <View style={styles.expressionContainer}>
        <ScrollView
          ref={exprScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          onContentSizeChange={() => exprScrollRef.current?.scrollToEnd({ animated: true })}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={themeStyles.expressionText}>{formattedExpr}</Text>
        </ScrollView>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Result Area (Bottom Line) */}
      <View style={styles.resultContainer}>
        <ScrollView
          ref={resultScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          onContentSizeChange={() => resultScrollRef.current?.scrollToEnd({ animated: true })}
          contentContainerStyle={styles.scrollContent}
        >
          <Text
            style={[
              themeStyles.resultText,
              isResultMuted && styles.resultMuted,
              !isEvaluated && livePreview !== '' && styles.resultLivePreview,
            ]}
          >
            {displayResult}
          </Text>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  expressionContainer: {
    height: 36,
    justifyContent: 'center',
    width: '100%',
  },
  resultContainer: {
    height: 56,
    justifyContent: 'center',
    width: '100%',
    marginTop: 4,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    opacity: 0.3,
    marginVertical: 4,
  },
  resultMuted: {
    color: COLORS.textMuted,
    opacity: 0.5,
  },
  resultLivePreview: {
    color: COLORS.accentLight, // Live preview shows in a subtle accent tint
    opacity: 0.8,
  },
});
