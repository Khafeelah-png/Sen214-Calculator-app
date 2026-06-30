/**
 * Theme configuration representing the randomized design choices:
 * Color Scheme:  4 → Warm Stone
 * Key Shape:     3 → Pill/Capsule (borderRadius 999, aspect ratio ~1.8:1)
 * Layout:        4 → Bottom Bar
 * Typography:    4 → Outfit
 * Accent Color:  4 → Violet (#7C4DFF, lightened high-contrast version #B392FF)
 * Display Style: 1 → Floating Card
 */

import { StyleSheet } from 'react-native';

export const COLORS = {
  background: '#3C3633',         // Warm Stone background
  surface: '#504A46',            // Warm Stone keys/surface
  text: '#F0E6D9',               // Warm Stone main text
  border: '#635C57',             // Warm Stone subtle border
  
  accent: '#7C4DFF',             // Violet solid background (accent)
  accentLight: '#B392FF',        // Lightened Violet for text/active states with high contrast
  accentDark: '#5E35B1',         // Pressed accent state
  
  textMuted: '#A8A29E',          // Secondary muted text (live preview, expression)
  cardBackground: '#2E2825',     // Slightly darker display card background
  buttonPressed: '#69615C',      // Key background when pressed
  overlayBackground: 'rgba(29, 26, 25, 0.75)', // Modal semi-transparent backdrop
};

export const TYPOGRAPHY = {
  fontRegular: 'Outfit_400Regular',
  fontSemiBold: 'Outfit_600SemiBold',
  fontBold: 'Outfit_700Bold',
};

export const themeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  displayCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    // Floating Card Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  // Keypad style container
  keypadContainer: {
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
  // Button shapes
  buttonCapsule: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: TYPOGRAPHY.fontSemiBold,
    fontSize: 20,
    color: COLORS.text,
  },
  // Text sizes
  expressionText: {
    fontFamily: TYPOGRAPHY.fontRegular,
    fontSize: 22,
    color: COLORS.textMuted,
  },
  resultText: {
    fontFamily: TYPOGRAPHY.fontBold,
    fontSize: 40,
    color: COLORS.text,
  },
});
