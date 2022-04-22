import { Value, Word, WordType } from './types';

// case insensitive implementation of Array.includes
export function arrIncludes(arr: string[], v: string): boolean {
  for (const val of arr) {
    if (val.toUpperCase() === v.toUpperCase()) return true;
  }
  return false;
}

// case insensitive implementation of the === operator
export function eq(a: string, b: string) {
  return a.toUpperCase() === b.toUpperCase();
}

export function extractWords(conditionString: string): Word[] {
  const root: Word[] = [];

  let accentFieldRec = -1;
  let plainFieldRec = -1;
  let stringValueRec = -1;
  let numericValueRec = -1;
  let notRec = false;
  let lessThanRec = false;
  let greaterThanRec = false;
  let arrayRec = false;
  let groupDepth = 0;

  const s = conditionString + ' ';
  for (let i = 0; i < s.length; i++) {
    let words = root;
    for (let depth = 0; depth < groupDepth; depth++) {
      if (words[words.length - 1].type !== WordType.Group || !Array.isArray(words[words.length - 1].words))
        throw new Error('internal error');
      words = words[words.length - 1].words || [];
    }

    const lastWord = words[words.length - 1];

    // Convenience function to push new values.
    // Will either add it as a new word or append it the array value of the previous word.
    function pushValue(value: Value) {
      if (arrayRec) {
        if (!Array.isArray(lastWord.value)) throw new Error('internal error');
        lastWord.value.push(typeof value === 'number' ? value : value.toString());
        lastWord.value = lastWord.value;
      } else {
        words.push({ type: WordType.Value, value });
      }
    }

    if (s[i] === '=') {
      if (accentFieldRec !== -1 || plainFieldRec !== -1) throw new Error('illegal character inside field definition');

      if (lessThanRec) {
        words.push({
          type: WordType.Operator,
          value: '<=',
        });
        lessThanRec = false;
      } else if (greaterThanRec) {
        words.push({
          type: WordType.Operator,
          value: '>=',
        });
        greaterThanRec = false;
      } else if (notRec) {
        words.push({
          type: WordType.Operator,
          value: '!=',
        });
        notRec = false;
      } else {
        words.push({
          type: WordType.Operator,
          value: '=',
        });
      }
      continue;
    } else {
      if (lessThanRec) {
        words.push({
          type: WordType.Operator,
          value: '<',
        });
        lessThanRec = false;
      } else if (greaterThanRec) {
        words.push({
          type: WordType.Operator,
          value: '>',
        });
        greaterThanRec = false;
      }
    }

    if (s[i] === '(') {
      if (
        lastWord.type === WordType.Operator &&
        lastWord.value &&
        arrIncludes(['in', 'not in'], lastWord.value.toString())
      ) {
        arrayRec = true;
        words.push({
          type: WordType.Value,
          value: [],
        });
      } else {
        groupDepth++;
        words.push({
          type: WordType.Group,
          words: [],
        });
      }
      continue;
    }

    if (s[i] === ')') {
      if (numericValueRec !== -1) {
        pushValue(parseFloat(s.slice(numericValueRec, i)));
        numericValueRec = -1;
      }
      if (arrayRec) arrayRec = false;
      else groupDepth--;
      continue;
    }

    if (s[i] === ' ' || (s[i] == ',' && arrayRec)) {
      if (plainFieldRec !== -1) {
        const value = s.slice(plainFieldRec, i);
        if (arrIncludes(['not', 'in', 'and', 'or'], value)) {
          if (eq(value, 'in') && lastWord.type === WordType.Operator && lastWord.value === 'not') {
            words[words.length - 1].value = 'not in';
          } else {
            words.push({ type: WordType.Operator, value: value.toLowerCase() });
          }
        } else {
          words.push({ type: WordType.Field, value });
        }
        plainFieldRec = -1;
      } else if (numericValueRec !== -1) {
        pushValue(parseFloat(s.slice(numericValueRec, i)));
        numericValueRec = -1;
      }
      continue;
    }

    if (s[i] === '`') {
      if (stringValueRec !== -1) throw new Error('illegal character inside value definition');
      if (plainFieldRec !== -1) throw new Error('illegal character inside field definition');

      if (accentFieldRec === -1) {
        accentFieldRec = i;
      } else {
        words.push({
          type: WordType.Field,
          value: s.slice(accentFieldRec + 1, i),
        });
        accentFieldRec = -1;
      }
      continue;
    }

    if (s[i] === "'") {
      if (accentFieldRec !== -1 || plainFieldRec !== -1) throw new Error('illegal character inside field definition');

      if (stringValueRec === -1) {
        stringValueRec = i;
      } else {
        pushValue(s.slice(stringValueRec + 1, i));
        stringValueRec = -1;
      }
      continue;
    }

    if (s[i] === '<') {
      lessThanRec = true;
      continue;
    }

    if (s[i] === '>') {
      greaterThanRec = true;
      continue;
    }

    if (s[i] === '!') {
      notRec = true;
      continue;
    }

    if (s[i].match(/[0-9]|\./) && stringValueRec === -1 && accentFieldRec === -1 && plainFieldRec === -1) {
      if (numericValueRec === -1) numericValueRec = i;
      continue;
    }

    if (s[i].match(/[a-zA-Z]|\_|\./)) {
      if (stringValueRec === -1 && accentFieldRec === -1 && plainFieldRec === -1) {
        if (numericValueRec !== -1) throw new Error('illegal character inside value definition');
        plainFieldRec = i;
      }
      continue;
    }

    throw new Error(`illegal character ${s[i]}.`);
  }

  if (stringValueRec !== -1 || accentFieldRec !== -1) throw new Error('quotation mark expected');

  return root;
}
