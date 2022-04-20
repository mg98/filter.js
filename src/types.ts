export enum WordType {
    Field = 'FIELD',
    Value = 'VALUE',
    Operator = 'OPERATOR',
    Group = 'GROUP'
}

export interface Word {
    type: WordType;
    value?: Value;
    words?: Word[]
}

export type Value = string | number | Array<string|number>;

