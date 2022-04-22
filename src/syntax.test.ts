import { extractWords } from './syntax';
import { WordType } from './types';

describe('interpret syntax from input', () => {
  it('field equals string (plain field definition)', () => {
    expect(extractWords("his_name = 'Manni'")).toEqual([
      { type: WordType.Field, value: 'his_name' },
      { type: WordType.Operator, value: '=' },
      { type: WordType.Value, value: 'Manni' },
    ]);
  });

  it('field equals string (plain field definition and subfield)', () => {
    expect(extractWords("friends.besties.name = 'Manni'")).toEqual([
      { type: WordType.Field, value: 'friends.besties.name' },
      { type: WordType.Operator, value: '=' },
      { type: WordType.Value, value: 'Manni' },
    ]);
  });

  it('field equals string (accent field definition)', () => {
    expect(extractWords("`Current Mood` = 'ok'")).toEqual([
      { type: WordType.Field, value: 'Current Mood' },
      { type: WordType.Operator, value: '=' },
      { type: WordType.Value, value: 'ok' },
    ]);
  });

  it('field definition with numbers and no accents', () => {
    expect(extractWords("Name1 = 'Manni'")).toEqual([
      { type: WordType.Field, value: 'Name1' },
      { type: WordType.Operator, value: '=' },
      { type: WordType.Value, value: 'Manni' },
    ]);
  });

  it('field definition with special characters', () => {
    expect(extractWords("`$his-na0me` = 'Manni'")).toEqual([
      { type: WordType.Field, value: '$his-na0me' },
      { type: WordType.Operator, value: '=' },
      { type: WordType.Value, value: 'Manni' },
    ]);
  });

  it('field equals number', () => {
    expect(extractWords('age = 21')).toEqual([
      { type: WordType.Field, value: 'age' },
      { type: WordType.Operator, value: '=' },
      { type: WordType.Value, value: 21 },
    ]);
  });

  it('field equals float', () => {
    expect(extractWords('age = 0.25')).toEqual([
      { type: WordType.Field, value: 'age' },
      { type: WordType.Operator, value: '=' },
      { type: WordType.Value, value: 0.25 },
    ]);
  });

  it('field is greater than value', () => {
    expect(extractWords('age > 17')).toEqual([
      { type: WordType.Field, value: 'age' },
      { type: WordType.Operator, value: '>' },
      { type: WordType.Value, value: 17 },
    ]);
  });

  it('field is less than value', () => {
    expect(extractWords('age < 66')).toEqual([
      { type: WordType.Field, value: 'age' },
      { type: WordType.Operator, value: '<' },
      { type: WordType.Value, value: 66 },
    ]);
  });

  it('field is greater than or equal value', () => {
    expect(extractWords('`age` >= 18')).toEqual([
      { type: WordType.Field, value: 'age' },
      { type: WordType.Operator, value: '>=' },
      { type: WordType.Value, value: 18 },
    ]);
  });

  it('field is less than or equal value', () => {
    expect(extractWords('age <= 18')).toEqual([
      { type: WordType.Field, value: 'age' },
      { type: WordType.Operator, value: '<=' },
      { type: WordType.Value, value: 18 },
    ]);
  });

  it('field does not equal value', () => {
    expect(extractWords('age != 18')).toEqual([
      { type: WordType.Field, value: 'age' },
      { type: WordType.Operator, value: '!=' },
      { type: WordType.Value, value: 18 },
    ]);
  });

  it('logical and', () => {
    expect(extractWords("a = 'ok' and b >= 3.3")).toEqual([
      { type: WordType.Field, value: 'a' },
      { type: WordType.Operator, value: '=' },
      { type: WordType.Value, value: 'ok' },
      { type: WordType.Operator, value: 'and' },
      { type: WordType.Field, value: 'b' },
      { type: WordType.Operator, value: '>=' },
      { type: WordType.Value, value: 3.3 },
    ]);
  });

  it('logical or', () => {
    expect(extractWords("a = 'ok' or b >= 3.3")).toEqual([
      { type: WordType.Field, value: 'a' },
      { type: WordType.Operator, value: '=' },
      { type: WordType.Value, value: 'ok' },
      { type: WordType.Operator, value: 'or' },
      { type: WordType.Field, value: 'b' },
      { type: WordType.Operator, value: '>=' },
      { type: WordType.Value, value: 3.3 },
    ]);
  });

  it('logical and/or case insentivie', () => {
    expect(extractWords("a = 'ok' AnD b >= 3.3 Or b < 1")).toEqual([
      { type: WordType.Field, value: 'a' },
      { type: WordType.Operator, value: '=' },
      { type: WordType.Value, value: 'ok' },
      { type: WordType.Operator, value: 'and' },
      { type: WordType.Field, value: 'b' },
      { type: WordType.Operator, value: '>=' },
      { type: WordType.Value, value: 3.3 },
      { type: WordType.Operator, value: 'or' },
      { type: WordType.Field, value: 'b' },
      { type: WordType.Operator, value: '<' },
      { type: WordType.Value, value: 1 },
    ]);
  });

  it('multiple logical connections', () => {
    expect(extractWords("name = 'Wolfram' and age >= 18 or age = 0")).toEqual([
      { type: WordType.Field, value: 'name' },
      { type: WordType.Operator, value: '=' },
      { type: WordType.Value, value: 'Wolfram' },
      { type: WordType.Operator, value: 'and' },
      { type: WordType.Field, value: 'age' },
      { type: WordType.Operator, value: '>=' },
      { type: WordType.Value, value: 18 },
      { type: WordType.Operator, value: 'or' },
      { type: WordType.Field, value: 'age' },
      { type: WordType.Operator, value: '=' },
      { type: WordType.Value, value: 0 },
    ]);
  });

  it('array of strings (no space)', () => {
    expect(extractWords("company in ('Apple','Google','Microsoft') ")).toEqual([
      { type: WordType.Field, value: 'company' },
      { type: WordType.Operator, value: 'in' },
      { type: WordType.Value, value: ['Apple', 'Google', 'Microsoft'] },
    ]);
  });

  it('array of strings', () => {
    expect(extractWords("company in ( 'Apple','Google', 'Microsoft' ) ")).toEqual([
      { type: WordType.Field, value: 'company' },
      { type: WordType.Operator, value: 'in' },
      { type: WordType.Value, value: ['Apple', 'Google', 'Microsoft'] },
    ]);
  });

  it('array of numbers (no space)', () => {
    expect(extractWords('price in (5,1.1,0) ')).toEqual([
      { type: WordType.Field, value: 'price' },
      { type: WordType.Operator, value: 'in' },
      { type: WordType.Value, value: [5, 1.1, 0] },
    ]);
  });

  it('array of numbers', () => {
    expect(extractWords('price in ( 5, 1.1, 0 ) ')).toEqual([
      { type: WordType.Field, value: 'price' },
      { type: WordType.Operator, value: 'in' },
      { type: WordType.Value, value: [5, 1.1, 0] },
    ]);
  });

  it('array of strings and numbers', () => {
    expect(extractWords("x in ( 'Apple', 3.141, 'Banana Juice', 8, 200 ) ")).toEqual([
      { type: WordType.Field, value: 'x' },
      { type: WordType.Operator, value: 'in' },
      { type: WordType.Value, value: ['Apple', 3.141, 'Banana Juice', 8, 200] },
    ]);
  });

  it('array of strings and numbers (no space)', () => {
    expect(extractWords("x in ('Apple',3.141,'Banana',8,200) ")).toEqual([
      { type: WordType.Field, value: 'x' },
      { type: WordType.Operator, value: 'in' },
      { type: WordType.Value, value: ['Apple', 3.141, 'Banana', 8, 200] },
    ]);
  });

  it('array of strings and numbers (no comma)', () => {
    expect(extractWords("x in ('Apple' 3.141 'Banana' 8 200) ")).toEqual([
      { type: WordType.Field, value: 'x' },
      { type: WordType.Operator, value: 'in' },
      { type: WordType.Value, value: ['Apple', 3.141, 'Banana', 8, 200] },
    ]);
  });

  it('"not in" operator', () => {
    expect(extractWords("x not in ('Apple' 3.141 'Banana' 8 200) ")).toEqual([
      { type: WordType.Field, value: 'x' },
      { type: WordType.Operator, value: 'not in' },
      { type: WordType.Value, value: ['Apple', 3.141, 'Banana', 8, 200] },
    ]);
  });

  it('"not in" operator case-insensitive', () => {
    expect(extractWords("x NOT iN ('Apple' 3.141 'Banana' 8 200) ")).toEqual([
      { type: WordType.Field, value: 'x' },
      { type: WordType.Operator, value: 'not in' },
      { type: WordType.Value, value: ['Apple', 3.141, 'Banana', 8, 200] },
    ]);
  });

  it('"not in" operator with extra space', () => {
    expect(extractWords("x not  in ('Apple' 3.141 'Banana' 8 200) ")).toEqual([
      { type: WordType.Field, value: 'x' },
      { type: WordType.Operator, value: 'not in' },
      { type: WordType.Value, value: ['Apple', 3.141, 'Banana', 8, 200] },
    ]);
  });

  it('grouping', () => {
    expect(extractWords('a = 1 and (b = 2 or b > 10)')).toEqual([
      { type: WordType.Field, value: 'a' },
      { type: WordType.Operator, value: '=' },
      { type: WordType.Value, value: 1 },
      { type: WordType.Operator, value: 'and' },
      {
        type: WordType.Group,
        words: [
          { type: WordType.Field, value: 'b' },
          { type: WordType.Operator, value: '=' },
          { type: WordType.Value, value: 2 },
          { type: WordType.Operator, value: 'or' },
          { type: WordType.Field, value: 'b' },
          { type: WordType.Operator, value: '>' },
          { type: WordType.Value, value: 10 },
        ],
      },
    ]);
  });

  it('depth grouping', () => {
    expect(extractWords('a = 1 and (b = 2 or (b > 10 or c = 4)) and a != 0')).toEqual([
      { type: WordType.Field, value: 'a' },
      { type: WordType.Operator, value: '=' },
      { type: WordType.Value, value: 1 },
      { type: WordType.Operator, value: 'and' },
      {
        type: WordType.Group,
        words: [
          { type: WordType.Field, value: 'b' },
          { type: WordType.Operator, value: '=' },
          { type: WordType.Value, value: 2 },
          { type: WordType.Operator, value: 'or' },
          {
            type: WordType.Group,
            words: [
              { type: WordType.Field, value: 'b' },
              { type: WordType.Operator, value: '>' },
              { type: WordType.Value, value: 10 },
              { type: WordType.Operator, value: 'or' },
              { type: WordType.Field, value: 'c' },
              { type: WordType.Operator, value: '=' },
              { type: WordType.Value, value: 4 },
            ],
          },
        ],
      },
      { type: WordType.Operator, value: 'and' },
      { type: WordType.Field, value: 'a' },
      { type: WordType.Operator, value: '!=' },
      { type: WordType.Value, value: 0 },
    ]);
  });
});
