import { evaluate, filter } from "./semantic";
import { WordType } from "./types";

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
    
})

describe('interpret semantics', () => {
    it('one field equals value', () => {
        expect(
            filter({ a: 5, b: 3 }, [
                { type: WordType.Field, value: 'a' },
                { type: WordType.Operator, value: '=' },
                { type: WordType.Value, value: '5' },
            ])
        ).toBeTruthy();
        expect(
            filter({ a: 5, b: 3 }, [
                { type: WordType.Field, value: 'a' },
                { type: WordType.Operator, value: '=' },
                { type: WordType.Value, value: '2' },
            ])
        ).toBeFalsy();
    });

    it('two expressions connected by and', () => {
        expect(
            filter({ a: 5, b: 3 }, [
                { type: WordType.Field, value: 'a' },
                { type: WordType.Operator, value: '=' },
                { type: WordType.Value, value: '5' },
                { type: WordType.Operator, value: 'and' },
                { type: WordType.Field, value: 'b' },
                { type: WordType.Operator, value: '>' },
                { type: WordType.Value, value: '0' },
            ])
        ).toBeTruthy();
        expect(
            filter({ a: 5, b: 0 }, [
                { type: WordType.Field, value: 'a' },
                { type: WordType.Operator, value: '=' },
                { type: WordType.Value, value: '5' },
                { type: WordType.Operator, value: 'and' },
                { type: WordType.Field, value: 'b' },
                { type: WordType.Operator, value: '>' },
                { type: WordType.Value, value: '0' },
            ])
        ).toBeFalsy();
    });

    it('grouped expressions', () => {
        expect(
            filter({ a: 5, b: 3, c: 'jeff' }, [
                { type: WordType.Field, value: 'a' },
                { type: WordType.Operator, value: '>=' },
                { type: WordType.Value, value: '5' },
                { type: WordType.Operator, value: 'and' },
                { type: WordType.Group, words: [
                    { type: WordType.Field, value: 'b' },
                    { type: WordType.Operator, value: '>' },
                    { type: WordType.Value, value: '10' },
                    { type: WordType.Operator, value: 'or' },
                    { type: WordType.Field, value: 'c' },
                    { type: WordType.Operator, value: '=' },
                    { type: WordType.Value, value: 'jeff' },
                ] }
            ])
        ).toBeTruthy();

        expect(
            filter({ a: 5, b: 3, c: 'jeff' }, [
                { type: WordType.Field, value: 'a' },
                { type: WordType.Operator, value: '>=' },
                { type: WordType.Value, value: '5' },
                { type: WordType.Operator, value: 'and' },
                { type: WordType.Group, words: [
                    { type: WordType.Field, value: 'b' },
                    { type: WordType.Operator, value: '>' },
                    { type: WordType.Value, value: '10' },
                    { type: WordType.Operator, value: 'and' },
                    { type: WordType.Field, value: 'c' },
                    { type: WordType.Operator, value: '=' },
                    { type: WordType.Value, value: 'jeff' },
                ] }
            ])
        ).toBeFalsy();
    });
    
});