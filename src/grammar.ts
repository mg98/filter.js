import { GrammarError, Word, WordType } from './types';

/**
 * Check for the sequence of words to be in legal order and complete.
 *
 * @param words - The sequence of words
 * @returns true if grammer was valid
 *
 * @throws {@link GrammarError}
 */
export function validateGrammer(words: Word[]): boolean {
  if (words.length === 0) return true;
  let expectedTypes = [WordType.Field, WordType.Group];

  for (let i = 0; i < words.length; i++) {
    if (!expectedTypes.includes(words[i].type)) {
      const pos = i > 0 ? `after ...${words[i - 1].toString().slice(-20)}` : 'as the first word.';
      throw new GrammarError(`expected word of type ${expectedTypes.join(' or ')} ${pos}`);
    }

    // set next expected type
    switch (words[i].type) {
      case WordType.Field:
        expectedTypes = [WordType.Operator];
        break;
      case WordType.Operator:
        expectedTypes = [WordType.Value];
        break;
      case WordType.LogicalOperator:
        expectedTypes = [WordType.Field, WordType.Group];
        break;
      case WordType.Value:
        expectedTypes = [WordType.LogicalOperator, WordType.Group];
        break;
      case WordType.Group:
        if (!words[i].words) throw new GrammarError('internal error');
        validateGrammer(words[i].words || []);
        expectedTypes = [WordType.LogicalOperator];
        break;
    }

    // validate last word
    if (i === words.length - 1) {
      if (![WordType.Value, WordType.Group].includes(words[i].type)) {
        throw new GrammarError(
          `expected word of type ${expectedTypes.join(' or ')} after ...${words[i].toString().slice(-20)}`,
        );
      }
    }
  }

  return true;
}
