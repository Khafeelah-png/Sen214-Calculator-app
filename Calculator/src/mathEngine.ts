/**
 * Mathematical Engine for the Scientific Calculator.
 * Pure TypeScript, no external imports.
 */

// Custom Factorial implementation
export const factorial = (n: number): number => {
  if (n < 0 || !Number.isInteger(n)) return NaN;
  if (n > 170) return Infinity; // Max value before float overflow (1.79e308)
  if (n === 0 || n === 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
};

// nPr: Permutations
export const computeNPr = (n: number, r: number): number => {
  if (n < 0 || r < 0 || n < r || !Number.isInteger(n) || !Number.isInteger(r)) return NaN;
  let result = 1;
  for (let i = 0; i < r; i++) {
    result *= (n - i);
  }
  return result;
};

// nCr: Combinations
export const computeNCr = (n: number, r: number): number => {
  if (n < 0 || r < 0 || n < r || !Number.isInteger(n) || !Number.isInteger(r)) return NaN;
  if (r > n / 2) r = n - r; // Using symmetry
  let result = 1;
  for (let i = 1; i <= r; i++) {
    result = (result * (n - i + 1)) / i;
  }
  return result;
};

// STAT calculations
export interface StatResults {
  mean: number;
  variance: number;
  stdDev: number;
}

export const computeStats = (numbers: number[]): StatResults | null => {
  if (numbers.length === 0) return null;
  const n = numbers.length;
  const mean = numbers.reduce((sum, val) => sum + val, 0) / n;
  
  // Using sample variance/stdDev (n - 1) as standard for calculators,
  // falling back to 0 if n === 1 to avoid division by zero.
  const sumSqDiff = numbers.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0);
  const variance = n > 1 ? sumSqDiff / (n - 1) : 0;
  const stdDev = Math.sqrt(variance);

  return { mean, variance, stdDev };
};

// Clean up floating point noise to 10 significant figures
export const cleanupFloat = (val: number): number => {
  if (!isFinite(val) || isNaN(val)) return val;
  // Use toPrecision(10) then parse to strip trailing zeros/floating errors
  const prec = val.toPrecision(10);
  // Handle case where parsing toPrecision might return scientific notation we want to preserve
  return parseFloat(prec);
};

// Precedence mapping
const PRECEDENCE: Record<string, number> = {
  '+': 1,
  '-': 1,
  '*': 2,
  '/': 2,
  'u-': 3, // Unary minus
  '^': 4,  // Exponentiation
  '!': 5,  // Factorial
  '²': 5,  // Squared
};

// Associativity: true for Right-to-Left, false for Left-to-Right
const IS_RIGHT_ASSOCIATIVE: Record<string, boolean> = {
  '+': false,
  '-': false,
  '*': false,
  '/': false,
  'u-': true,
  '^': true,
  '!': false,
  '²': false,
};

const FUNCTIONS = new Set([
  'sin', 'cos', 'tan', 'asin', 'acos', 'atan',
  'sinh', 'cosh', 'tanh', 'sqrt', 'ln', 'log'
]);

const CONSTANTS: Record<string, number> = {
  'π': Math.PI,
  'e': Math.E,
};

/**
 * Tokenizes a raw string expression into a token list
 */
export const tokenize = (expr: string): string[] => {
  const tokens: string[] = [];
  let i = 0;

  while (i < expr.length) {
    const char = expr[i];

    // Skip whitespace
    if (/\s/.test(char)) {
      i++;
      continue;
    }

    // Number parsing (digits and decimal point)
    if (/\d/.test(char) || (char === '.' && i + 1 < expr.length && /\d/.test(expr[i + 1]))) {
      let numStr = '';
      while (i < expr.length && (/\d/.test(expr[i]) || expr[i] === '.')) {
        numStr += expr[i];
        i++;
      }
      tokens.push(numStr);
      continue;
    }

    // Alphabetic parsing (functions, constants, etc.)
    if (/[a-zA-Z]/.test(char)) {
      let word = '';
      while (i < expr.length && /[a-zA-Z]/.test(expr[i])) {
        word += expr[i];
        i++;
      }
      tokens.push(word);
      continue;
    }

    // Multi-character operations/constants or single operators
    if (char === 'π' || char === 'e') {
      tokens.push(char);
      i++;
      continue;
    }

    // Check for double symbols or operators
    if (['+', '-', '*', '/', '^', '!', '(', ')', '²', '×', '÷'].includes(char)) {
      // Normalize operators on the fly
      if (char === '×') tokens.push('*');
      else if (char === '÷') tokens.push('/');
      else tokens.push(char);
      i++;
      continue;
    }

    // If we hit an unrecognized character, skip it to prevent loops
    i++;
  }

  return tokens;
};

/**
 * Normalizes user-input tokens:
 * 1. Resolves operator aliases (*, /, etc.)
 * 2. Identifies unary minus and translates it to 'u-'
 * 3. Injects implicit multiplications
 */
export const preprocessTokens = (tokens: string[]): string[] => {
  const normalized: string[] = [];

  // Step 1: Normalize symbols
  for (const t of tokens) {
    if (t === '×') normalized.push('*');
    else if (t === '÷') normalized.push('/');
    else normalized.push(t);
  }

  // Step 2: Identify Unary Minus
  const resolvedUnary: string[] = [];
  for (let i = 0; i < normalized.length; i++) {
    const t = normalized[i];
    if (t === '-') {
      const prev = i > 0 ? resolvedUnary[resolvedUnary.length - 1] : null;
      // Unary minus conditions:
      // - First token
      // - Preceded by another operator (+, -, *, /, ^)
      // - Preceded by left parenthesis '('
      // - Preceded by a function name
      const isUnary = !prev || 
                      ['+', '-', '*', '/', '^', '('].includes(prev) || 
                      FUNCTIONS.has(prev);
      resolvedUnary.push(isUnary ? 'u-' : '-');
    } else {
      resolvedUnary.push(t);
    }
  }

  // Step 3: Inject implicit multiplication
  const result: string[] = [];
  for (let i = 0; i < resolvedUnary.length; i++) {
    const current = resolvedUnary[i];
    if (i > 0) {
      const prev = resolvedUnary[i - 1];

      // Insert implicit '*' between:
      // A (number, constant, ')', '!', '²') and B (number, constant, function, '(')
      const isPrevNumericLike = /^\d+\.?\d*$/.test(prev) || CONSTANTS[prev] !== undefined || prev === ')' || prev === '!' || prev === '²';
      const isCurrentNumericLike = /^\d+\.?\d*$/.test(current) || CONSTANTS[current] !== undefined || FUNCTIONS.has(current) || current === '(';

      if (isPrevNumericLike && isCurrentNumericLike) {
        result.push('*');
      }
    }
    result.push(current);
  }

  return result;
};

/**
 * Shunting-Yard Algorithm to convert infix tokens to RPN
 */
export const shuntingYard = (tokens: string[]): string[] | null => {
  const outputQueue: string[] = [];
  const operatorStack: string[] = [];

  for (const token of tokens) {
    // Number or Constant
    if (/^\d+\.?\d*$/.test(token) || CONSTANTS[token] !== undefined) {
      outputQueue.push(token);
    }
    // Function
    else if (FUNCTIONS.has(token)) {
      operatorStack.push(token);
    }
    // Left parenthesis
    else if (token === '(') {
      operatorStack.push(token);
    }
    // Right parenthesis
    else if (token === ')') {
      let popped = false;
      while (operatorStack.length > 0) {
        const top = operatorStack[operatorStack.length - 1];
        if (top === '(') {
          operatorStack.pop();
          popped = true;
          break;
        }
        outputQueue.push(operatorStack.pop()!);
      }
      if (!popped) return null; // Mismatched brackets

      // If top of stack is a function, pop it to output
      if (operatorStack.length > 0 && FUNCTIONS.has(operatorStack[operatorStack.length - 1])) {
        outputQueue.push(operatorStack.pop()!);
      }
    }
    // Operator or Postfix operator
    else if (PRECEDENCE[token] !== undefined) {
      const isPostfix = token === '!' || token === '²';
      
      if (isPostfix) {
        // Postfix operators have extremely high precedence, but let's evaluate them immediately
        // or push them following standard precedence rules.
        while (operatorStack.length > 0) {
          const top = operatorStack[operatorStack.length - 1];
          if (top === '(') break;
          
          const topPrec = PRECEDENCE[top] || 0;
          const currPrec = PRECEDENCE[token];
          
          if (topPrec > currPrec || (topPrec === currPrec && !IS_RIGHT_ASSOCIATIVE[token])) {
            outputQueue.push(operatorStack.pop()!);
          } else {
            break;
          }
        }
        operatorStack.push(token);
      } else {
        // Standard Binary Operator or Unary Prefix Operator
        while (operatorStack.length > 0) {
          const top = operatorStack[operatorStack.length - 1];
          if (top === '(') break;
          
          const topIsFunc = FUNCTIONS.has(top);
          const topPrec = PRECEDENCE[top] || 0;
          const currPrec = PRECEDENCE[token];
          
          if (topIsFunc || topPrec > currPrec || (topPrec === currPrec && !IS_RIGHT_ASSOCIATIVE[token])) {
            outputQueue.push(operatorStack.pop()!);
          } else {
            break;
          }
        }
        operatorStack.push(token);
      }
    } else {
      // Unrecognized token
      return null;
    }
  }

  // Pop remaining operators
  while (operatorStack.length > 0) {
    const top = operatorStack.pop()!;
    if (top === '(' || top === ')') return null; // Mismatched brackets
    outputQueue.push(top);
  }

  return outputQueue;
};

/**
 * Evaluates an RPN stack and returns the numeric result.
 */
export const evaluateRPN = (rpn: string[]): number => {
  const stack: number[] = [];

  for (const token of rpn) {
    // Constant
    if (CONSTANTS[token] !== undefined) {
      stack.push(CONSTANTS[token]);
    }
    // Number
    else if (/^\d+\.?\d*$/.test(token)) {
      stack.push(parseFloat(token));
    }
    // Unary Operator / Postfix
    else if (token === 'u-' || token === '!' || token === '²') {
      if (stack.length < 1) return NaN;
      const val = stack.pop()!;

      if (token === 'u-') {
        stack.push(-val);
      } else if (token === '!') {
        const fact = factorial(val);
        if (isNaN(fact)) return NaN;
        stack.push(fact);
      } else if (token === '²') {
        stack.push(val * val);
      }
    }
    // Functions
    else if (FUNCTIONS.has(token)) {
      if (stack.length < 1) return NaN;
      const val = stack.pop()!;

      switch (token) {
        case 'sin':
          stack.push(Math.sin(val * Math.PI / 180));
          break;
        case 'cos':
          stack.push(Math.cos(val * Math.PI / 180));
          break;
        case 'tan': {
          // tan is undefined for odd multiples of 90 degrees
          const is90Multiple = Math.abs((Math.abs(val) - 90) % 180);
          if (is90Multiple < 1e-9) return NaN; // Triggers Error
          stack.push(Math.tan(val * Math.PI / 180));
          break;
        }
        case 'asin':
          if (val < -1 || val > 1) return NaN;
          stack.push(Math.asin(val) * 180 / Math.PI);
          break;
        case 'acos':
          if (val < -1 || val > 1) return NaN;
          stack.push(Math.acos(val) * 180 / Math.PI);
          break;
        case 'atan':
          stack.push(Math.atan(val) * 180 / Math.PI);
          break;
        case 'sinh':
          stack.push(Math.sinh(val));
          break;
        case 'cosh':
          stack.push(Math.cosh(val));
          break;
        case 'tanh':
          stack.push(Math.tanh(val));
          break;
        case 'sqrt':
          if (val < 0) return NaN;
          stack.push(Math.sqrt(val));
          break;
        case 'ln':
          if (val <= 0) return NaN;
          stack.push(Math.log(val));
          break;
        case 'log':
          if (val <= 0) return NaN;
          stack.push(Math.log10(val));
          break;
        default:
          return NaN;
      }
    }
    // Binary Operator
    else if (PRECEDENCE[token] !== undefined) {
      if (stack.length < 2) return NaN;
      const b = stack.pop()!;
      const a = stack.pop()!;

      switch (token) {
        case '+':
          stack.push(a + b);
          break;
        case '-':
          stack.push(a - b);
          break;
        case '*':
          stack.push(a * b);
          break;
        case '/':
          if (b === 0) return NaN; // Division by zero
          stack.push(a / b);
          break;
        case '^':
          stack.push(Math.pow(a, b));
          break;
        default:
          return NaN;
      }
    } else {
      return NaN;
    }
  }

  if (stack.length !== 1) return NaN;
  return stack[0];
};

/**
 * Main calculation function. Takes a token array or raw string, pre-processes,
 * runs Shunting-Yard, evaluates RPN, cleans up float precision, and handles errors.
 */
export const calculate = (input: string[] | string): string => {
  try {
    let tokens: string[];
    if (typeof input === 'string') {
      tokens = tokenize(input);
    } else {
      tokens = input;
    }

    if (tokens.length === 0) return '0';

    const processed = preprocessTokens(tokens);
    const rpn = shuntingYard(processed);

    if (!rpn) return 'Error';

    const rawResult = evaluateRPN(rpn);

    if (isNaN(rawResult) || !isFinite(rawResult)) {
      return 'Error';
    }

    const cleaned = cleanupFloat(rawResult);
    return cleaned.toString();
  } catch (error) {
    return 'Error';
  }
};
