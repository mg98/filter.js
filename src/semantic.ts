import { Word, WordType } from './types';

// application of generic operator on two generics
function express(a: any, b: any, op: string): boolean {
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

// logical evaluation
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

export function matchWords(record: Record<string, any>, words: Word[]): boolean {
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
        op = word.value?.toString();
        break;
      case WordType.Value:
        value = word.value?.toString();
        break;
    }

    if (word.type === WordType.Group) {
      const groupWords = word.words;
      if (!groupWords) throw new Error('internal error');
      expressions.push(matchWords(record, groupWords));
      resetExprVars();
      continue;
    }

    if (op === 'and' || op === 'or') {
      logicalOps.push(op);
      resetExprVars();
      continue;
    }

    if (field && op && value) {
      let recordValue = record;
      for (const subfield of field.split('.')) {
        if (!recordValue.hasOwnProperty(subfield)) throw new Error(`object has no key \`${field}\``);
        recordValue = recordValue[subfield];
      }

      expressions.push(express(recordValue, value, op));
      resetExprVars();
    }
  }

  return evaluate(expressions, logicalOps);
}
