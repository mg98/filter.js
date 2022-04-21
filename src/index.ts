import { matchWords } from "./semantic";
import { extractWords } from "./syntax";

export function match(obj: object, conditionString: string): boolean {
  const words = extractWords(conditionString)
  return matchWords(obj, words)
}