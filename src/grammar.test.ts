import { validateGrammer } from './grammar';
import { GrammarError, WordType } from './types';

describe('grammar validation', () => {
  it('field op value', () => {
    validateGrammer([{ type: WordType.Field }, { type: WordType.Operator }, { type: WordType.Value }]);
  });

  it('field op group', () => {
    try {
      validateGrammer([{ type: WordType.Field }, { type: WordType.Operator }, { type: WordType.Group }]);
      expect(true).toBeFalsy();
    } catch (e: any) {
      if (!(e instanceof GrammarError)) throw e;
    }
  });

  it('field field op value', () => {
    try {
      validateGrammer([
        { type: WordType.Field },
        { type: WordType.Field },
        { type: WordType.Operator },
        { type: WordType.Value },
      ]);
      expect(true).toBeFalsy();
    } catch (e: any) {
      if (!(e instanceof GrammarError)) throw e;
    }
  });

  it('field op op value', () => {
    try {
      validateGrammer([
        { type: WordType.Field },
        { type: WordType.Operator },
        { type: WordType.Operator },
        { type: WordType.Value },
      ]);
      expect(true).toBeFalsy();
    } catch (e: any) {
      if (!(e instanceof GrammarError)) throw e;
    }
  });

  it('field op value value', () => {
    try {
      validateGrammer([
        { type: WordType.Field },
        { type: WordType.Operator },
        { type: WordType.Value },
        { type: WordType.Value },
      ]);
      expect(true).toBeFalsy();
    } catch (e: any) {
      if (!(e instanceof GrammarError)) throw e;
    }
  });

  it('field op group value', () => {
    try {
      validateGrammer([
        { type: WordType.Field },
        { type: WordType.Operator },
        { type: WordType.Group },
        { type: WordType.Value },
      ]);
      expect(true).toBeFalsy();
    } catch (e: any) {
      if (!(e instanceof GrammarError)) throw e;
    }
  });

  it('field op value group', () => {
    try {
      validateGrammer([
        { type: WordType.Field },
        { type: WordType.Operator },
        { type: WordType.Value },
        { type: WordType.Group },
      ]);
      expect(true).toBeFalsy();
    } catch (e: any) {
      if (!(e instanceof GrammarError)) throw e;
    }
  });

  it('field op value op group', () => {
    try {
      validateGrammer([
        { type: WordType.Field },
        { type: WordType.Operator },
        { type: WordType.Value },
        { type: WordType.Operator },
        { type: WordType.Group },
      ]);
      expect(true).toBeFalsy();
    } catch (e: any) {
      if (!(e instanceof GrammarError)) throw e;
    }
  });

  it('field op value logical op group', () => {
    validateGrammer([
      { type: WordType.Field },
      { type: WordType.Operator },
      { type: WordType.Value },
      { type: WordType.LogicalOperator },
      {
        type: WordType.Group,
        words: [{ type: WordType.Field }, { type: WordType.Operator }, { type: WordType.Value }],
      },
    ]);
  });

  it('field op value op field', () => {
    try {
      validateGrammer([
        { type: WordType.Field },
        { type: WordType.Operator },
        { type: WordType.Value },
        { type: WordType.Operator },
        { type: WordType.Field },
      ]);
      expect(true).toBeFalsy();
    } catch (e: any) {
      if (!(e instanceof GrammarError)) throw e;
    }
  });

  it('field op value op field op', () => {
    try {
      validateGrammer([
        { type: WordType.Field },
        { type: WordType.Operator },
        { type: WordType.Value },
        { type: WordType.Operator },
        { type: WordType.Field },
        { type: WordType.Operator },
      ]);
      expect(true).toBeFalsy();
    } catch (e: any) {
      if (!(e instanceof GrammarError)) throw e;
    }
  });

  it('op value', () => {
    try {
      validateGrammer([{ type: WordType.Operator }, { type: WordType.Value }]);
      expect(true).toBeFalsy();
    } catch (e: any) {
      if (!(e instanceof GrammarError)) throw e;
    }
  });

  it('field op', () => {
    try {
      validateGrammer([{ type: WordType.Field }, { type: WordType.Value }]);
      expect(true).toBeFalsy();
    } catch (e: any) {
      if (!(e instanceof GrammarError)) throw e;
    }
  });

  it('group', () => {
    validateGrammer([
      {
        type: WordType.Group,
        words: [{ type: WordType.Field }, { type: WordType.Operator }, { type: WordType.Value }],
      },
    ]);
  });

  it('group logical op group', () => {
    validateGrammer([
      {
        type: WordType.Group,
        words: [{ type: WordType.Field }, { type: WordType.Operator }, { type: WordType.Value }],
      },
      { type: WordType.LogicalOperator },
      {
        type: WordType.Group,
        words: [{ type: WordType.Field }, { type: WordType.Operator }, { type: WordType.Value }],
      },
    ]);
  });
});
