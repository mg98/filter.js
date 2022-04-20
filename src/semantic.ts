import { Word, WordType } from './types';

// application of generic operator on two generics
function express(a: any, b: any, op: string): Boolean {
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
export function evaluate(expressions: Boolean[], logicalOps: string[]): Boolean {
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

  return expressions[0];
}

export function matchWords(record: Record<string, any>, words: Word[]): Boolean {
  let field: string | undefined;
  let op: string | undefined;
  let value: string | undefined;
  let expressions: Boolean[] = [];
  let logicalOps: string[] = [];

  function resetExprVars() {
    field = undefined;
    op = undefined;
    value = undefined;
  }

  for (let i = 0; i < words.length; i++) {
    switch (words[i].type) {
      case WordType.Field:
        field = words[i].value?.toString();
        break;
      case WordType.Operator:
        op = words[i].value?.toString();
        break;
      case WordType.Value:
        value = words[i].value?.toString();
        break;
    }

    if (words[i].type === WordType.Group) {
      const groupWords = words[i].words;
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
      if (!record.hasOwnProperty(field)) throw new Error('internal error');
      expressions.push(express(record[field], value, op));
      resetExprVars();
    }
  }

  return evaluate(expressions, logicalOps);
}
