/**
 * Possible types of a `Word`.
 */
export enum WordType {
  /**
   * Field refers to an object key or path to a subfield.
   */
  Field = 'FIELD',

  /**
   * Literal value used in comparison to a field.
   */
  Value = 'VALUE',

  /**
   * Comparative/arithmetic operator.
   */
  Operator = 'OPERATOR',

  /**
   * Logical operator to link expressions.
   */
  LogicalOperator = 'LOGICAL_OPERATOR',

  /**
   * Group of words.
   */
  Group = 'GROUP',
}

/**
 * A `Word`'s value.
 */
export type Value = string | number | Array<string | number>;

/**
 * A word is a syntactical building block, a single unit in the semantical evaluation of a query.
 */
export class Word {
  /**
   * Type of the word.
   */
  type: WordType = WordType.Field;

  /**
   * Value of the word (`undefined` if `type == WordType.Group`).
   */
  value?: Value;

  /**
   * Words inside this group (only defined if `type == WordType.Group`).
   */
  words?: Word[];

  constructor(props: Word) {
    this.type = props.type;
    this.value = props.value;
    this.words = props.words;
  }

  /**
   * Get string representation of word as it would look in a query string.
   *
   * @example
   * Here is an example with word type `WordType.Value`.
   * ```
   * const word = { type: WordType.Value, value: [4, 8, 9] };
   * // Prints "(4, 8, 9)"
   * console.log(word.toString());
   * ```
   *
   * @example
   * Here is an example with word type `WordType.Operator`.
   * ```
   * const word = { type: WordType.Operator, value: 'and' };
   * // Prints "and"
   * console.log(word.toString());
   * ```
   *
   * @returns string representation
   */
  toString(): string {
    if (this.value) {
      if (this.type === WordType.Field) {
        return `\`${this.value}\``;
      }
      // array value
      if (typeof this.value === 'object') {
        if (this.value.length > 0 && typeof this.value[0] === 'string') {
          return `('${this.value.join("', '")}')`;
        } else {
          return `(${this.value.join(', ')})`;
        }
      }
      // primitive value
      if (this.type === WordType.Value && typeof this.value === 'string') {
        return `'${this.value}'`;
      } else {
        return this.value.toString();
      }
    }

    // group
    if (this.words) {
      if (this.words.length === 0) return '()';
      let res = '(';
      for (const word of this.words) {
        res += word.toString() + ' ';
      }
      res = res.slice(0, -1) + ')';
      return res;
    }

    throw new Error('word is invalid');
  }
}

/**
 * SyntaxError is thrown when a query string could not be parsed.
 */
export class SyntaxError extends Error {
  readonly index: number;

  constructor(msg: string, index: number) {
    super(`syntax error at position ${index}: ${msg}`);
    this.index = index;
    Object.setPrototypeOf(this, SyntaxError.prototype);
  }
}

/**
 * GrammarError is thrown when the order of words is invalid or the sequence is incomplete.
 */
export class GrammarError extends Error {
  constructor(msg: string) {
    super(msg);
    Object.setPrototypeOf(this, GrammarError.prototype);
  }
}

/**
 * ObjectKeyNotFoundError is thrown when a given object was mising a desired field (or subfield).
 */
export class ObjectKeyNotFoundError extends Error {
  /**
   * Missing key.
   */
  readonly key: string;

  constructor(msg: string, key: string) {
    super(`object has no key \`${key}\``);
    this.key = key;
    Object.setPrototypeOf(this, ObjectKeyNotFoundError.prototype);
  }
}
