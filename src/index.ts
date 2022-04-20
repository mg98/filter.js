// import { Word, WordType, Group } from "./types";

// export const interpretConstraints = (records: Array<Object>, constraints: string) => {
//     //const operators = ['and', 'or', '(', ')', 'not', 'in', '=', '!=', '>', '>=', '<', '<=', "'", '`']
// }

interface Word {
    value: string[] | string;
}

const w: Word = {
    value: ['']
}

if (Array.isArray(w.value)) w.value.push('')

export function extractWords(constraints: string): Word[] {
    let arrayRec = false;
    const words: Word[] = [];
    const s = constraints+' ';

    for (let i = 0; i < s.length; i++) {
        if (s[i] === '(') {
            arrayRec = true;
            words.push({
                value: [] as string[]
            });
            continue;
        }
        
        if (arrayRec) {
            const lastWord = words[words.length-1];
            if (Array.isArray(lastWord.value)) lastWord.value.push('');
        }
    }

    return words;
}