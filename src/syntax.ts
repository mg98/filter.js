import { SyntaxError, Value, Word, WordType } from './types';

/**
 * Case insensitive implementation of Array.includes.
 *
 * @param arr - Accepted values
 * @param v - Searched string
 * @returns if a includes b
 */
export function arrIncludes(arr: string[], v: string): boolean {
  for (const val of arr) {
    if (val.toUpperCase() === v.toUpperCase()) return true;
  }
  return false;
}

/**
 * Case insensitive implementation of the === operator.
 *
 * @param a - First value
 * @param b - Second value
 * @returns if a and b are equal
 */
export function eq(a: string, b: string) {
  return a.toUpperCase() === b.toUpperCase();
}

/**
 * Parse words from a query string.
 *
 * @param query - Expression of conditions
 * @returns the ordered sequence of words
 *
 * @throws {@link SyntaxError}
 * This exception is thrown when there was an error parsing the query.
 */
export function parseWords(query: string): Word[] {
  const root: Word[] = [];

  let accentFieldRec = -1;
  let plainFieldRec = -1;
  let sqStringValueRec = -1; // single quotes
  let dqStringValueRec = -1; // double quotes
  let numericValueRec = -1;
  let notRec = false; // recording "!"
  let lessThanRec = false;
  let greaterThanRec = false;
  let arrayRec = false;
  let lastEscape = -2;
  let groupDepth = 0;

  const s = query + ' ';
  for (let i = 0; i < s.length; i++) {
    let words = root;
    for (let depth = 0; depth < groupDepth; depth++) {
      if (words[words.length - 1].type !== WordType.Group || !Array.isArray(words[words.length - 1].words))
        throw new Error('internal error');
      words = words[words.length - 1].words || [];
    }

    const lastWord = words[words.length - 1] || new Word({ type: WordType.LogicalOperator });

    // Convenience function to push new values.
    // Will either add it as a new word or append it the array value of the previous word.
    function pushValue(value: Value) {
      if (arrayRec) {
        if (!Array.isArray(lastWord.value)) throw new Error('internal error');
        lastWord.value.push(typeof value === 'number' ? value : value.toString());
        lastWord.value = lastWord.value;
      } else {
        if (typeof value === 'string') {
          value = value.replace(/\\/g, '');
        }
        words.push(new Word({ type: WordType.Value, value }));
      }
    }

    if (s[i] === '\\') {
      lastEscape = i;
      continue;
    }

    if (s[i] === '=' && accentFieldRec === -1 && sqStringValueRec === -1 && dqStringValueRec === -1) {
      if (plainFieldRec !== -1) {
        words.push(
          new Word({
            type: WordType.Field,
            value: s.slice(plainFieldRec, i),
          }),
        );
        plainFieldRec = -1;
      }

      if (numericValueRec !== -1) {
        words.push(
          new Word({
            type: WordType.Value,
            value: parseFloat(s.slice(numericValueRec, i)),
          }),
        );
        numericValueRec = -1;
      }

      if (lessThanRec) {
        words.push(
          new Word({
            type: WordType.Operator,
            value: '<=',
          }),
        );
        lessThanRec = false;
      } else if (greaterThanRec) {
        words.push(
          new Word({
            type: WordType.Operator,
            value: '>=',
          }),
        );
        greaterThanRec = false;
      } else if (notRec) {
        words.push(
          new Word({
            type: WordType.Operator,
            value: '!=',
          }),
        );
        notRec = false;
      } else {
        words.push(
          new Word({
            type: WordType.Operator,
            value: '=',
          }),
        );
      }
      continue;
    } else {
      if (lessThanRec) {
        words.push(
          new Word({
            type: WordType.Operator,
            value: '<',
          }),
        );
        lessThanRec = false;
      } else if (greaterThanRec) {
        words.push(
          new Word({
            type: WordType.Operator,
            value: '>',
          }),
        );
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
        words.push(
          new Word({
            type: WordType.Value,
            value: [],
          }),
        );
      } else {
        groupDepth++;
        words.push(
          new Word({
            type: WordType.Group,
            words: [],
          }),
        );
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
            const type = arrIncludes(['and', 'or'], value) ? WordType.LogicalOperator : WordType.Operator;
            words.push(new Word({ type, value: value.toLowerCase() }));
          }
        } else {
          words.push(new Word({ type: WordType.Field, value }));
        }
        plainFieldRec = -1;
      } else if (numericValueRec !== -1) {
        pushValue(parseFloat(s.slice(numericValueRec, i)));
        numericValueRec = -1;
      }
      continue;
    }

    if (s[i] === '`' && lastEscape !== i - 1 && sqStringValueRec === -1 && dqStringValueRec === -1) {
      if (plainFieldRec !== -1) throw new SyntaxError('illegal character inside field definition', i);

      if (accentFieldRec === -1) {
        accentFieldRec = i;
      } else {
        words.push(
          new Word({
            type: WordType.Field,
            value: s.slice(accentFieldRec + 1, i).replace(/\\/g, ''),
          }),
        );
        accentFieldRec = -1;
      }
      continue;
    }

    if (s[i] === "'" && lastEscape !== i - 1 && dqStringValueRec === -1) {
      if (accentFieldRec !== -1 || plainFieldRec !== -1)
        throw new SyntaxError('illegal character inside field definition', i);

      if (sqStringValueRec === -1) {
        sqStringValueRec = i;
      } else {
        pushValue(s.slice(sqStringValueRec + 1, i));
        sqStringValueRec = -1;
      }
      continue;
    }

    if (s[i] === '"' && lastEscape !== i - 1 && sqStringValueRec === -1) {
      if (accentFieldRec !== -1 || plainFieldRec !== -1)
        throw new SyntaxError('illegal character inside field definition', i);

      if (dqStringValueRec === -1) {
        dqStringValueRec = i;
      } else {
        pushValue(s.slice(dqStringValueRec + 1, i));
        dqStringValueRec = -1;
      }
      continue;
    }

    if (s[i] === '<' && accentFieldRec === -1 && sqStringValueRec === -1 && dqStringValueRec === -1) {
      lessThanRec = true;
      continue;
    }

    if (s[i] === '>' && accentFieldRec === -1 && sqStringValueRec === -1 && dqStringValueRec === -1) {
      if (plainFieldRec !== -1) {
        words.push(
          new Word({
            type: WordType.Field,
            value: s.slice(plainFieldRec, i),
          }),
        );
        plainFieldRec = -1;
      }

      if (numericValueRec !== -1) {
        words.push(
          new Word({
            type: WordType.Value,
            value: parseFloat(s.slice(numericValueRec, i)),
          }),
        );
        numericValueRec = -1;
      }

      greaterThanRec = true;
      continue;
    }

    if (s[i] === '!') {
      notRec = true;
      continue;
    }

    if (
      s[i].match(/[0-9]|\./) &&
      sqStringValueRec === -1 &&
      dqStringValueRec === -1 &&
      accentFieldRec === -1 &&
      plainFieldRec === -1
    ) {
      if (numericValueRec === -1) numericValueRec = i;
      continue;
    }

    if (s[i].match(/[a-zA-Z0-9]|\_|\./)) {
      if (sqStringValueRec === -1 && dqStringValueRec === -1 && accentFieldRec === -1 && plainFieldRec === -1) {
        if (numericValueRec !== -1) throw new SyntaxError('illegal character inside value definition', i);
        plainFieldRec = i;
      }
      continue;
    }

    if (accentFieldRec !== -1 || sqStringValueRec !== -1 || dqStringValueRec !== -1) {
      continue;
    }

    throw new SyntaxError(`illegal character ${s[i]}`, i);
  }

  if (sqStringValueRec !== -1 || dqStringValueRec !== -1 || accentFieldRec !== -1)
    throw new SyntaxError('quotation mark expected', s.length);

  return root;
}
