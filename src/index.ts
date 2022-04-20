import { matchWords } from "./semantic";
import { extractWords } from "./syntax";

export function match(obj: Object, conditionString: string): Boolean {
  const words = extractWords(conditionString)
  return matchWords(obj, words)
}