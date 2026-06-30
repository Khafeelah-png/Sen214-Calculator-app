/**
 * Keypad layout definitions for Basic and Scientific modes.
 * Layout: Bottom Bar (operators in a horizontal row below numbers)
 */

export interface KeyConfig {
  label: string;
  value: string;
  type: 'number' | 'operator' | 'accent' | 'function' | 'constant' | 'disabled';
}

// Basic Mode Keypad Configuration
// Main grid is 3 columns, Bottom Bar is 5 columns.
export const BASIC_GRID: KeyConfig[][] = [
  [
    { label: 'AC', value: 'AC', type: 'accent' },
    { label: 'DEL', value: 'DEL', type: 'accent' },
    { label: '(', value: '(', type: 'operator' },
  ],
  [
    { label: '7', value: '7', type: 'number' },
    { label: '8', value: '8', type: 'number' },
    { label: '9', value: '9', type: 'number' },
  ],
  [
    { label: '4', value: '4', type: 'number' },
    { label: '5', value: '5', type: 'number' },
    { label: '6', value: '6', type: 'number' },
  ],
  [
    { label: '1', value: '1', type: 'number' },
    { label: '2', value: '2', type: 'number' },
    { label: '3', value: '3', type: 'number' },
  ],
  [
    { label: '0', value: '0', type: 'number' },
    { label: '.', value: '.', type: 'number' },
    { label: ')', value: ')', type: 'operator' },
  ],
];

// Horizontal row of operators at the very bottom
export const BOTTOM_BAR: KeyConfig[] = [
  { label: '+', value: '+', type: 'operator' },
  { label: '−', value: '-', type: 'operator' },
  { label: '×', value: '×', type: 'operator' },
  { label: '÷', value: '÷', type: 'operator' },
  { label: '=', value: '=', type: 'accent' },
];

// Scientific Mode specific keys, to be rendered in a 5-column panel above the basic grid.
export const SCIENTIFIC_PANEL: KeyConfig[][] = [
  [
    { label: 'sin', value: 'sin', type: 'function' },
    { label: 'cos', value: 'cos', type: 'function' },
    { label: 'tan', value: 'tan', type: 'function' },
    { label: 'sin⁻¹', value: 'asin', type: 'function' },
    { label: 'cos⁻¹', value: 'acos', type: 'function' },
  ],
  [
    { label: 'tan⁻¹', value: 'atan', type: 'function' },
    { label: 'sinh', value: 'sinh', type: 'function' },
    { label: 'cosh', value: 'cosh', type: 'function' },
    { label: 'tanh', value: 'tanh', type: 'function' },
    { label: '√', value: 'sqrt', type: 'function' },
  ],
  [
    { label: 'ln', value: 'ln', type: 'function' },
    { label: 'log', value: 'log', type: 'function' },
    { label: 'x²', value: 'x²', type: 'function' },
    { label: 'xʸ', value: '^', type: 'operator' },
    { label: 'π', value: 'π', type: 'constant' },
  ],
  [
    { label: 'e', value: 'e', type: 'constant' },
    { label: 'nPr', value: 'nPr', type: 'function' },
    { label: 'nCr', value: 'nCr', type: 'function' },
    { label: 'STAT', value: 'STAT', type: 'function' },
    { label: 'DEG', value: 'DEG', type: 'disabled' }, // Disabled static degrees indicator
  ],
];
