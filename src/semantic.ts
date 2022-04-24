import { ObjectKeyNotFoundError, Word, WordType } from './types';

/**
 * Expresses the relation of a to be using a generic operator.
 *
 * @param a - Left-side value
 * @param b - Right-side value
 * @param op - Operator to apply
 * @returns expressive value of a op b
 */
export function express(a: any, b: any, op: string): boolean {
  switch (op) {
    case '=':
      return a == b;
    case '!=':
      return a != b;
    case '>':
      return a > b;
    case '>=':
      return a >= b;
    case '<':
      return a < b;
    case '<=':
      return a <= b;
    case 'in':
      return b.includes(a);
    case 'not in':
      return !b.includes(a);
    default:
      throw new Error('internal error');
  }
}

/**
 * Performs propositional logic on a sequence of expressions.
 *
 * @param expressions - Array of expressions
 * @param logicalOps - Array of operators where the first item is the operation between the first and second item in expression and so forth
 * @returns the result of the processing of all expressions
 */
export function evaluate(expressions: boolean[], logicalOps: string[]): boolean {
  if (expressions.length === 1) return expressions[0];

  // merge logical AND operations first
  for (let i = 1; i < expressions.length; i++) {
    if (logicalOps[i - 1] === 'and') {
      expressions[i - 1] = expressions[i - 1] && expressions[i];
      expressions = [...expressions.slice(0, i), ...expressions.slice(i + 1)];
      logicalOps = [...logicalOps.slice(0, i - 1), ...logicalOps.slice(i)];
      i--;
    }
  }

  // now process OR operations
  for (let i = 1; i < expressions.length; i++) {
    if (logicalOps[i - 1] === 'or') {
      expressions[i - 1] = expressions[i - 1] || expressions[i];
      expressions = [...expressions.slice(0, i), ...expressions.slice(i + 1)];
      logicalOps = [...logicalOps.slice(0, i - 1), ...logicalOps.slice(i)];
      i--;
    }
  }

  return expressions.length > 0 ? expressions[0] : true;
}

/**
 * Check if object matches the rules formulated by the sequence of words.
 *
 * @param obj - Object to validate
 * @param words - Sequence of words to formulate the set of rules to apply
 * @returns
 *
 * @throws {@link ObjectKeyNotFound}
 * This exception is thrown when the field in a word was not found in the given object.
 */
export function matchWords(obj: Record<string, any>, words: Word[]): boolean {
  let field: string | undefined;
  let op: string | undefined;
  let value: string | undefined;
  const expressions: boolean[] = [];
  const logicalOps: string[] = [];

  function resetExprVars() {
    field = undefined;
    op = undefined;
    value = undefined;
  }

  for (const word of words) {
    switch (word.type) {
      case WordType.Field:
        field = word.value?.toString();
        break;
      case WordType.Operator:
      case WordType.LogicalOperator:
        op = word.value?.toString();
        break;
      case WordType.Value:
        value = word.value?.toString();
        break;
    }

    if (word.type === WordType.Group) {
      const groupWords = word.words;
      if (!groupWords) throw new Error('internal error');
      expressions.push(matchWords(obj, groupWords));
      resetExprVars();
      continue;
    }

    if (op === 'and' || op === 'or') {
      logicalOps.push(op);
      resetExprVars();
      continue;
    }

    if (field && op && value) {
      let objValue = obj;
      for (const subfield of field.split('.')) {
        if (!objValue.hasOwnProperty(subfield)) throw new ObjectKeyNotFoundError(field);
        objValue = objValue[subfield];
      }

      expressions.push(express(objValue, value, op));
      resetExprVars();
    }
  }

  return evaluate(expressions, logicalOps);
}
