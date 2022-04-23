import { evaluate, express, matchWords } from './semantic';
import { WordType } from './types';

describe('logical evaluation', () => {
  it('single value', () => {
    expect(evaluate([true], [])).toBeTruthy();
    expect(evaluate([false], [])).toBeFalsy();
  });

  it('and', () => {
    expect(evaluate([true, true], ['and'])).toBeTruthy();
    expect(evaluate([true, false], ['and'])).toBeFalsy();
    expect(evaluate([false, true], ['and'])).toBeFalsy();
    expect(evaluate([false, false], ['and'])).toBeFalsy();
    expect(evaluate([true, true, true, true], ['and', 'and', 'and'])).toBeTruthy();
    expect(evaluate([true, true, false, true], ['and', 'and', 'and'])).toBeFalsy();
  });

  it('or', () => {
    expect(evaluate([true, true], ['or'])).toBeTruthy();
    expect(evaluate([true, false], ['or'])).toBeTruthy();
    expect(evaluate([false, true], ['or'])).toBeTruthy();
    expect(evaluate([false, false], ['or'])).toBeFalsy();
    expect(evaluate([false, true, false, false], ['or', 'or', 'or'])).toBeTruthy();
  });

  it('complex and and or', () => {
    expect(evaluate([true, true, false], ['and', 'or'])).toBeTruthy();
    expect(evaluate([false, true, false], ['and', 'or'])).toBeFalsy();
  });
});

describe('match words', () => {
  it('empty query', () => {
    expect(matchWords({ a: 3, b: 'hi' }, [])).toBeTruthy();
  });

  it('one field equals value', () => {
    expect(
      matchWords({ a: 5, b: 3 }, [
        { type: WordType.Field, value: 'a' },
        { type: WordType.Operator, value: '=' },
        { type: WordType.Value, value: '5' },
      ]),
    ).toBeTruthy();
    expect(
      matchWords({ a: 5, b: 3 }, [
        { type: WordType.Field, value: 'a' },
        { type: WordType.Operator, value: '=' },
        { type: WordType.Value, value: '2' },
      ]),
    ).toBeFalsy();
  });

  it('two expressions connected by and', () => {
    expect(
      matchWords({ a: 5, b: 3 }, [
        { type: WordType.Field, value: 'a' },
        { type: WordType.Operator, value: '=' },
        { type: WordType.Value, value: '5' },
        { type: WordType.LogicalOperator, value: 'and' },
        { type: WordType.Field, value: 'b' },
        { type: WordType.Operator, value: '>' },
        { type: WordType.Value, value: '0' },
      ]),
    ).toBeTruthy();
    expect(
      matchWords({ a: 5, b: 0 }, [
        { type: WordType.Field, value: 'a' },
        { type: WordType.Operator, value: '=' },
        { type: WordType.Value, value: '5' },
        { type: WordType.LogicalOperator, value: 'and' },
        { type: WordType.Field, value: 'b' },
        { type: WordType.Operator, value: '>' },
        { type: WordType.Value, value: '0' },
      ]),
    ).toBeFalsy();
  });

  it('grouped expressions', () => {
    expect(
      matchWords({ a: 5, b: 3, c: 'jeff' }, [
        { type: WordType.Field, value: 'a' },
        { type: WordType.Operator, value: '>=' },
        { type: WordType.Value, value: '5' },
        { type: WordType.LogicalOperator, value: 'and' },
        {
          type: WordType.Group,
          words: [
            { type: WordType.Field, value: 'b' },
            { type: WordType.Operator, value: '>' },
            { type: WordType.Value, value: '10' },
            { type: WordType.LogicalOperator, value: 'or' },
            { type: WordType.Field, value: 'c' },
            { type: WordType.Operator, value: '=' },
            { type: WordType.Value, value: 'jeff' },
          ],
        },
      ]),
    ).toBeTruthy();

    expect(
      matchWords({ a: 5, b: 3, c: 'jeff' }, [
        { type: WordType.Field, value: 'a' },
        { type: WordType.Operator, value: '>=' },
        { type: WordType.Value, value: '5' },
        { type: WordType.LogicalOperator, value: 'and' },
        {
          type: WordType.Group,
          words: [
            { type: WordType.Field, value: 'b' },
            { type: WordType.Operator, value: '>' },
            { type: WordType.Value, value: '10' },
            { type: WordType.LogicalOperator, value: 'and' },
            { type: WordType.Field, value: 'c' },
            { type: WordType.Operator, value: '=' },
            { type: WordType.Value, value: 'jeff' },
          ],
        },
      ]),
    ).toBeFalsy();
  });
});

describe('express', () => {
  it('equal', () => {
    expect(express(5, 5, '=')).toBeTruthy();
    expect(express(5, 8, '=')).toBeFalsy();
    expect(express('alpha', 'alpha', '=')).toBeTruthy();
    expect(express('alpha', 'alpha1', '=')).toBeFalsy();
  });

  it('not equal', () => {
    expect(express(5, 5, '!=')).toBeFalsy();
    expect(express(5, 8, '!=')).toBeTruthy();
    expect(express('alpha', 'alpha', '!=')).toBeFalsy();
    expect(express('alpha', 'alpha1', '!=')).toBeTruthy();
  });

  it('greater than', () => {
    expect(express(8, 5, '>')).toBeTruthy();
    expect(express(5, 8, '>')).toBeFalsy();
    expect(express(5, 5, '>')).toBeFalsy();
    expect(express('alpha', 'alpha', '>')).toBeFalsy();
    expect(express('beta', 'alpha', '>')).toBeTruthy();
    expect(express('alpha', 'beta', '>')).toBeFalsy();
  });

  it('greater than or equal', () => {
    expect(express(8, 5, '>=')).toBeTruthy();
    expect(express(5, 8, '>=')).toBeFalsy();
    expect(express(5, 5, '>=')).toBeTruthy();
    expect(express('alpha', 'alpha', '>=')).toBeTruthy();
    expect(express('beta', 'alpha', '>=')).toBeTruthy();
    expect(express('alpha', 'beta', '>=')).toBeFalsy();
  });

  it('less than', () => {
    expect(express(8, 5, '<')).toBeFalsy();
    expect(express(5, 8, '<')).toBeTruthy();
    expect(express(5, 5, '<')).toBeFalsy();
    expect(express('alpha', 'alpha', '<')).toBeFalsy();
    expect(express('beta', 'alpha', '<')).toBeFalsy();
    expect(express('alpha', 'beta', '<')).toBeTruthy();
  });

  it('less than or equal', () => {
    expect(express(8, 5, '<=')).toBeFalsy();
    expect(express(5, 8, '<=')).toBeTruthy();
    expect(express(5, 5, '<=')).toBeTruthy();
    expect(express('alpha', 'alpha', '<=')).toBeTruthy();
    expect(express('beta', 'alpha', '<=')).toBeFalsy();
    expect(express('alpha', 'beta', '<=')).toBeTruthy();
  });

  it('in array', () => {
    expect(express(5, [1, 2, 3, 4, 5], 'in')).toBeTruthy();
    expect(express(5, [1, 2, 3, 4], 'in')).toBeFalsy();
    expect(express('ok', ['ah', 'okay'], 'in')).toBeFalsy();
    expect(express('ok', ['ah', 'ok', 'fine'], 'in')).toBeTruthy();
    expect(express('ok', [], 'in')).toBeFalsy();
  });

  it('in string', () => {
    expect(express('you', 'How are you?', 'in')).toBeTruthy();
    expect(express('you', 'How are they/them?', 'in')).toBeFalsy();
  });

  it('not in array', () => {
    expect(express(5, [1, 2, 3, 4, 5], 'not in')).toBeFalsy();
    expect(express(5, [1, 2, 3, 4], 'not in')).toBeTruthy();
    expect(express('ok', ['ah', 'okay'], 'not in')).toBeTruthy();
    expect(express('ok', ['ah', 'ok', 'fine'], 'not in')).toBeFalsy();
    expect(express('ok', [], 'not in')).toBeTruthy();
  });

  it('not in string', () => {
    expect(express('you', 'How are you?', 'not in')).toBeFalsy();
    expect(express('you', 'How are they/them?', 'not in')).toBeTruthy();
  });
});
