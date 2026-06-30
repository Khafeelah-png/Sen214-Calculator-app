import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { COLORS, TYPOGRAPHY } from '../theme';
import { computeNPr, computeNCr, computeStats, StatResults } from '../mathEngine';

interface InputModalProps {
  visible: boolean;
  type: 'nPr' | 'nCr' | 'STAT' | null;
  onClose: () => void;
  onInsertValue: (value: string) => void;
}

export const InputModal: React.FC<InputModalProps> = ({
  visible,
  type,
  onClose,
  onInsertValue,
}) => {
  // Local state for nPr / nCr
  const [valN, setValN] = useState('');
  const [valR, setValR] = useState('');
  const [combError, setCombError] = useState('');

  // Local state for STAT
  const [statInput, setStatInput] = useState('');
  const [statResults, setStatResults] = useState<StatResults | null>(null);
  const [statError, setStatError] = useState('');

  // Reset inputs when modal type changes or closes
  useEffect(() => {
    setValN('');
    setValR('');
    setCombError('');
    setStatInput('');
    setStatResults(null);
    setStatError('');
  }, [type, visible]);

  const handleCombinatoricsConfirm = () => {
    const n = parseInt(valN, 10);
    const r = parseInt(valR, 10);

    if (isNaN(n) || isNaN(r)) {
      setCombError('Please enter valid integers.');
      return;
    }

    if (n < 0 || r < 0) {
      setCombError('Values must be non-negative.');
      return;
    }

    if (n < r) {
      setCombError('n must be greater than or equal to r.');
      return;
    }

    let result = 0;
    if (type === 'nPr') {
      result = computeNPr(n, r);
    } else {
      result = computeNCr(n, r);
    }

    if (isNaN(result) || !isFinite(result)) {
      setCombError('Calculation overflowed or failed.');
    } else {
      onInsertValue(result.toString());
      onClose();
    }
  };

  const handleStatCalculate = () => {
    setStatError('');
    setStatResults(null);

    if (!statInput.trim()) {
      setStatError('Please enter some numbers.');
      return;
    }

    // Split by commas, trim, filter out empty strings, and parse numbers
    const parts = statInput.split(',').map((p) => p.trim()).filter((p) => p !== '');
    const numbers = parts.map((p) => parseFloat(p));

    if (numbers.some(isNaN)) {
      setStatError('List contains invalid numbers.');
      return;
    }

    if (numbers.length === 0) {
      setStatError('Please enter at least one number.');
      return;
    }

    const results = computeStats(numbers);
    if (!results) {
      setStatError('Calculation failed.');
    } else {
      setStatResults(results);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.backdrop}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        
        <View style={styles.modalCard}>
          <Text style={styles.title}>
            {type === 'nPr' && 'Permutations (nPr)'}
            {type === 'nCr' && 'Combinations (nCr)'}
            {type === 'STAT' && 'Statistics Helper'}
          </Text>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Permutations (nPr) or Combinations (nCr) Modal Content */}
            {(type === 'nPr' || type === 'nCr') && (
              <View style={styles.formContainer}>
                <Text style={styles.description}>
                  Computes {type === 'nPr' ? 'n! / (n-r)!' : 'n! / (r!(n-r)!)'}.
                  The result will be inserted into your active expression.
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Enter n (total items):</Text>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="number-pad"
                    value={valN}
                    onChangeText={setValN}
                    placeholder="e.g. 5"
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Enter r (items to select):</Text>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="number-pad"
                    value={valR}
                    onChangeText={setValR}
                    placeholder="e.g. 2"
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>

                {combError !== '' && <Text style={styles.errorText}>{combError}</Text>}

                <View style={styles.buttonRow}>
                  <Pressable style={styles.cancelButton} onPress={onClose}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={styles.confirmButton}
                    onPress={handleCombinatoricsConfirm}
                  >
                    <Text style={styles.confirmButtonText}>Insert Result</Text>
                  </Pressable>
                </View>
              </View>
            )}

            {/* STAT Modal Content */}
            {type === 'STAT' && (
              <View style={styles.formContainer}>
                <Text style={styles.description}>
                  Enter a list of numbers separated by commas to calculate statistics.
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Data points (comma-separated):</Text>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    value={statInput}
                    onChangeText={setStatInput}
                    multiline
                    numberOfLines={3}
                    placeholder="e.g. 10, 15, 23, 8.5, 42"
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>

                {statError !== '' && <Text style={styles.errorText}>{statError}</Text>}

                <Pressable
                  style={styles.calcStatButton}
                  onPress={handleStatCalculate}
                >
                  <Text style={styles.calcStatButtonText}>Calculate Stats</Text>
                </Pressable>

                {/* Stat results breakdown */}
                {statResults && (
                  <View style={styles.resultsContainer}>
                    <Text style={styles.resultsHeader}>Results:</Text>
                    <View style={styles.resultRow}>
                      <Text style={styles.resultLabel}>Mean (μ):</Text>
                      <Text style={styles.resultValue}>{statResults.mean.toFixed(6).replace(/\.?0+$/, '')}</Text>
                    </View>
                    <View style={styles.resultRow}>
                      <Text style={styles.resultLabel}>Variance (s²):</Text>
                      <Text style={styles.resultValue}>{statResults.variance.toFixed(6).replace(/\.?0+$/, '')}</Text>
                    </View>
                    <View style={styles.resultRow}>
                      <Text style={styles.resultLabel}>Std Deviation (s):</Text>
                      <Text style={styles.resultValue}>{statResults.stdDev.toFixed(6).replace(/\.?0+$/, '')}</Text>
                    </View>
                  </View>
                )}

                <View style={[styles.buttonRow, { marginTop: 16 }]}>
                  <Pressable
                    style={[styles.cancelButton, { flex: 1 }]}
                    onPress={onClose}
                  >
                    <Text style={styles.cancelButtonText}>Close</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.overlayBackground,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontFamily: TYPOGRAPHY.fontBold,
    fontSize: 20,
    color: COLORS.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  scrollContent: {
    flexGrow: 1,
  },
  formContainer: {
    width: '100%',
  },
  description: {
    fontFamily: TYPOGRAPHY.fontRegular,
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 20,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontFamily: TYPOGRAPHY.fontSemiBold,
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 6,
  },
  textInput: {
    fontFamily: TYPOGRAPHY.fontRegular,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  textArea: {
    height: 72,
    textAlignVertical: 'top',
  },
  errorText: {
    fontFamily: TYPOGRAPHY.fontRegular,
    fontSize: 13,
    color: '#FF6B6B', // Red warning color
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.cardBackground,
  },
  cancelButtonText: {
    fontFamily: TYPOGRAPHY.fontSemiBold,
    fontSize: 15,
    color: COLORS.text,
  },
  confirmButton: {
    flex: 1.2,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accent,
  },
  confirmButtonText: {
    fontFamily: TYPOGRAPHY.fontSemiBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  calcStatButton: {
    width: '100%',
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accent,
    marginBottom: 16,
  },
  calcStatButtonText: {
    fontFamily: TYPOGRAPHY.fontBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  resultsContainer: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginTop: 8,
  },
  resultsHeader: {
    fontFamily: TYPOGRAPHY.fontBold,
    fontSize: 15,
    color: COLORS.accentLight,
    marginBottom: 8,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  resultLabel: {
    fontFamily: TYPOGRAPHY.fontSemiBold,
    fontSize: 14,
    color: COLORS.textMuted,
  },
  resultValue: {
    fontFamily: TYPOGRAPHY.fontRegular,
    fontSize: 14,
    color: COLORS.text,
  },
});
