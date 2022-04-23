import { Word, WordType } from "./types"

describe('Word toString', () => {
    let w: Word;

    it('field', () => {
        w = new Word({ type: WordType.Field, value: 'brother' });
    });

    it('value', () => {
        w = new Word({ type: WordType.Value, value: 'hey' });
        expect(w.toString()).toEqual("'hey'");
        w = new Word({ type: WordType.Value, value: 7 });
        expect(w.toString()).toEqual('7');
        w = new Word({ type: WordType.Value, value: [1, 8, 7] });
        expect(w.toString()).toEqual('(1, 8, 7)');
        w = new Word({ type: WordType.Value, value: ['java', 'script', 'yeah'] });
        expect(w.toString()).toEqual("('java', 'script', 'yeah')");
    });

    it('operator and logical operator', () => {
        w = new Word({ type: WordType.Operator, value: '>' });
        expect(w.toString()).toEqual('>');
        w = new Word({ type: WordType.LogicalOperator, value: 'and' });
        expect(w.toString()).toEqual('and');
    });

    it('group', () => {
        w = new Word({ type: WordType.Group, words: [
            new Word({ type: WordType.Field, value: 'brother' }),
            new Word({ type: WordType.Operator, value: '>' }),
            new Word({ type: WordType.Value, value: 'hey' }),
            new Word({ type: WordType.LogicalOperator, value: 'or' }),
            new Word({ type: WordType.Group, words: [
                new Word({ type: WordType.Field, value: 'brother' }),
                new Word({ type: WordType.Operator, value: '=' }),
                new Word({ type: WordType.Value, value: 'hey' })
            ] })
        ] });
        expect(w.toString()).toEqual("(`brother` > 'hey' or (`brother` = 'hey'))");
    });
});
