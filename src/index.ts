import { validateGrammer } from './grammar';
import { matchWords } from './semantic';
import { parseWords } from './syntax';
import { SyntaxError, GrammarError, ObjectKeyNotFound } from './types';

/**
 * Matches an object with the conditions expressed in the query.
 *
 * @param obj - The object to be validated
 * @param query - The expression of the conditions
 * @returns if object matches the expression
 *
 * @throws {@link SyntaxError}
 * This exception is thrown when there was an error parsing the query.
 * 
 * @throws {@link GrammarError}
 * This exception is thrown when the sequence of expressions is invalid.
 * 
 * @throws {@link ObjectKeyNotFound}
 * This exception is thrown when the fields targetted in the query were not found in the given object.
 */
export function match(obj: object, query: string): boolean {
  const words = parseWords(query);
  validateGrammer(words);
  return matchWords(obj, words);
}
