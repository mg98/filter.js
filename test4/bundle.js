(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.filterjs = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateGrammer = void 0;
const types_1 = require("./types");
/**
 * Check for the sequence of words to be in legal order and complete.
 *
 * @param words - The sequence of words
 * @returns true if grammer was valid
 *
 * @throws {@link GrammarError}
 */
function validateGrammer(words) {
    if (words.length === 0)
        return true;
    let expectedTypes = [types_1.WordType.Field, types_1.WordType.Group];
    for (let i = 0; i < words.length; i++) {
        if (!expectedTypes.includes(words[i].type)) {
            const pos = i > 0 ? `after ...${words[i - 1].toString().slice(-20)}` : 'as the first word.';
            throw new types_1.GrammarError(`expected word of type ${expectedTypes.join(' or ')} ${pos}`);
        }
        // set next expected type
        switch (words[i].type) {
            case types_1.WordType.Field:
                expectedTypes = [types_1.WordType.Operator];
                break;
            case types_1.WordType.Operator:
                expectedTypes = [types_1.WordType.Value];
                break;
            case types_1.WordType.LogicalOperator:
                expectedTypes = [types_1.WordType.Field, types_1.WordType.Group];
                break;
            case types_1.WordType.Value:
                expectedTypes = [types_1.WordType.LogicalOperator, types_1.WordType.Group];
                break;
            case types_1.WordType.Group:
                if (!words[i].words)
                    throw new types_1.GrammarError('internal error');
                validateGrammer(words[i].words || []);
                expectedTypes = [types_1.WordType.LogicalOperator];
                break;
        }
        // validate last word
        if (i === words.length - 1) {
            if (![types_1.WordType.Value, types_1.WordType.Group].includes(words[i].type)) {
                throw new types_1.GrammarError(`expected word of type ${expectedTypes.join(' or ')} after ...${words[i].toString().slice(-20)}`);
            }
        }
    }
    return true;
}
exports.validateGrammer = validateGrammer;

},{"./types":5}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchCondition = void 0;
const grammar_1 = require("./grammar");
const semantic_1 = require("./semantic");
const syntax_1 = require("./syntax");
/**
 * Matches an object with the conditions expressed in the query.
 *
 * @param obj - The object to be validated
 * @param query - The expression of the conditions
 * @returns if object matches the expression
 *
 * @throws {@link SyntaxError}
 * This exception is thrown when there was an error parsing the query.
 *
 * @throws {@link GrammarError}
 * This exception is thrown when the sequence of expressions is invalid.
 *
 * @throws {@link ObjectKeyNotFoundError}
 * This exception is thrown when the fields targetted in the query were not found in the given object.
 */
function matchCondition(obj, query) {
    const words = (0, syntax_1.parseWords)(query || '');
    (0, grammar_1.validateGrammer)(words);
    return (0, semantic_1.matchWords)(obj, words);
}
exports.matchCondition = matchCondition;

},{"./grammar":1,"./semantic":3,"./syntax":4}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchWords = exports.evaluate = exports.express = void 0;
const types_1 = require("./types");
/**
 * Expresses the relation of a to be using a generic operator.
 *
 * @param a - Left-side value
 * @param b - Right-side value
 * @param op - Operator to apply
 * @returns expressive value of a op b
 */
function express(a, b, op) {
    switch (op) {
        case '=':
            return a == b;
        case '!=':
            return a != b;
        case '>':
            return a > b;
        case '>=':
            return a >= b;
        case '<':
            return a < b;
        case '<=':
            return a <= b;
        case 'in':
            return b.includes(a);
        case 'not in':
            return !b.includes(a);
        default:
            throw new Error('internal error');
    }
}
exports.express = express;
/**
 * Performs propositional logic on a sequence of expressions.
 *
 * @param expressions - Array of expressions
 * @param logicalOps - Array of operators where the first item is the operation between the first and second item in expression and so forth
 * @returns the result of the processing of all expressions
 */
function evaluate(expressions, logicalOps) {
    if (expressions.length === 1)
        return expressions[0];
    // merge logical AND operations first
    for (let i = 1; i < expressions.length; i++) {
        if (logicalOps[i - 1] === 'and') {
            expressions[i - 1] = expressions[i - 1] && expressions[i];
            expressions = [...expressions.slice(0, i), ...expressions.slice(i + 1)];
            logicalOps = [...logicalOps.slice(0, i - 1), ...logicalOps.slice(i)];
            i--;
        }
    }
    // now process OR operations
    for (let i = 1; i < expressions.length; i++) {
        if (logicalOps[i - 1] === 'or') {
            expressions[i - 1] = expressions[i - 1] || expressions[i];
            expressions = [...expressions.slice(0, i), ...expressions.slice(i + 1)];
            logicalOps = [...logicalOps.slice(0, i - 1), ...logicalOps.slice(i)];
            i--;
        }
    }
    return expressions.length > 0 ? expressions[0] : true;
}
exports.evaluate = evaluate;
/**
 * Check if object matches the rules formulated by the sequence of words.
 *
 * @param obj - Object to validate
 * @param words - Sequence of words to formulate the set of rules to apply
 * @returns
 *
 * @throws {@link ObjectKeyNotFound}
 * This exception is thrown when the field in a word was not found in the given object.
 */
function matchWords(obj, words) {
    var _a, _b, _c;
    let field;
    let op;
    let value;
    const expressions = [];
    const logicalOps = [];
    function resetExprVars() {
        field = undefined;
        op = undefined;
        value = undefined;
    }
    for (const word of words) {
        switch (word.type) {
            case types_1.WordType.Field:
                field = (_a = word.value) === null || _a === void 0 ? void 0 : _a.toString();
                break;
            case types_1.WordType.Operator:
            case types_1.WordType.LogicalOperator:
                op = (_b = word.value) === null || _b === void 0 ? void 0 : _b.toString();
                break;
            case types_1.WordType.Value:
                value = (_c = word.value) === null || _c === void 0 ? void 0 : _c.toString();
                break;
        }
        if (word.type === types_1.WordType.Group) {
            const groupWords = word.words;
            if (!groupWords)
                throw new Error('internal error');
            expressions.push(matchWords(obj, groupWords));
            resetExprVars();
            continue;
        }
        if (op === 'and' || op === 'or') {
            logicalOps.push(op);
            resetExprVars();
            continue;
        }
        if (field && op && value) {
            let objValue = obj;
            for (const subfield of field.split('.')) {
                if (!objValue.hasOwnProperty(subfield))
                    throw new types_1.ObjectKeyNotFoundError(field);
                objValue = objValue[subfield];
            }
            expressions.push(express(objValue, value, op));
            resetExprVars();
        }
    }
    return evaluate(expressions, logicalOps);
}
exports.matchWords = matchWords;

},{"./types":5}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseWords = exports.eq = exports.arrIncludes = void 0;
const types_1 = require("./types");
/**
 * Case insensitive implementation of Array.includes.
 *
 * @param arr - Accepted values
 * @param v - Searched string
 * @returns if a includes b
 */
function arrIncludes(arr, v) {
    for (const val of arr) {
        if (val.toUpperCase() === v.toUpperCase())
            return true;
    }
    return false;
}
exports.arrIncludes = arrIncludes;
/**
 * Case insensitive implementation of the === operator.
 *
 * @param a - First value
 * @param b - Second value
 * @returns if a and b are equal
 */
function eq(a, b) {
    return a.toUpperCase() === b.toUpperCase();
}
exports.eq = eq;
/**
 * Parse words from a query string.
 *
 * @param query - Expression of conditions
 * @returns the ordered sequence of words
 *
 * @throws {@link SyntaxError}
 * This exception is thrown when there was an error parsing the query.
 */
function parseWords(query) {
    const root = [];
    let accentFieldRec = -1;
    let plainFieldRec = -1;
    let sqStringValueRec = -1; // single quotes
    let dqStringValueRec = -1; // double quotes
    let numericValueRec = -1;
    let notRec = false; // recording "!"
    let lessThanRec = false;
    let greaterThanRec = false;
    let arrayRec = false;
    let lastEscape = -2;
    let groupDepth = 0;
    const s = query + ' ';
    for (let i = 0; i < s.length; i++) {
        let words = root;
        for (let depth = 0; depth < groupDepth; depth++) {
            if (words[words.length - 1].type !== types_1.WordType.Group || !Array.isArray(words[words.length - 1].words))
                throw new Error('internal error');
            words = words[words.length - 1].words || [];
        }
        const lastWord = words[words.length - 1] || new types_1.Word({ type: types_1.WordType.LogicalOperator });
        // Convenience function to push new values.
        // Will either add it as a new word or append it the array value of the previous word.
        function pushValue(value) {
            if (arrayRec) {
                if (!Array.isArray(lastWord.value))
                    throw new Error('internal error');
                lastWord.value.push(typeof value === 'number' ? value : value.toString());
                lastWord.value = lastWord.value;
            }
            else {
                if (typeof value === 'string') {
                    value = value.replace(/\\/g, '');
                }
                words.push(new types_1.Word({ type: types_1.WordType.Value, value }));
            }
        }
        if (s[i] === '\\') {
            lastEscape = i;
            continue;
        }
        if (s[i] === '=' && accentFieldRec === -1 && sqStringValueRec === -1 && dqStringValueRec === -1) {
            if (plainFieldRec !== -1) {
                words.push(new types_1.Word({
                    type: types_1.WordType.Field,
                    value: s.slice(plainFieldRec, i),
                }));
                plainFieldRec = -1;
            }
            if (numericValueRec !== -1) {
                words.push(new types_1.Word({
                    type: types_1.WordType.Value,
                    value: parseFloat(s.slice(numericValueRec, i)),
                }));
                numericValueRec = -1;
            }
            if (lessThanRec) {
                words.push(new types_1.Word({
                    type: types_1.WordType.Operator,
                    value: '<=',
                }));
                lessThanRec = false;
            }
            else if (greaterThanRec) {
                words.push(new types_1.Word({
                    type: types_1.WordType.Operator,
                    value: '>=',
                }));
                greaterThanRec = false;
            }
            else if (notRec) {
                words.push(new types_1.Word({
                    type: types_1.WordType.Operator,
                    value: '!=',
                }));
                notRec = false;
            }
            else {
                words.push(new types_1.Word({
                    type: types_1.WordType.Operator,
                    value: '=',
                }));
            }
            continue;
        }
        else {
            if (lessThanRec) {
                words.push(new types_1.Word({
                    type: types_1.WordType.Operator,
                    value: '<',
                }));
                lessThanRec = false;
            }
            else if (greaterThanRec) {
                words.push(new types_1.Word({
                    type: types_1.WordType.Operator,
                    value: '>',
                }));
                greaterThanRec = false;
            }
        }
        if (s[i] === '(') {
            if (lastWord.type === types_1.WordType.Operator &&
                lastWord.value &&
                arrIncludes(['in', 'not in'], lastWord.value.toString())) {
                arrayRec = true;
                words.push(new types_1.Word({
                    type: types_1.WordType.Value,
                    value: [],
                }));
            }
            else {
                groupDepth++;
                words.push(new types_1.Word({
                    type: types_1.WordType.Group,
                    words: [],
                }));
            }
            continue;
        }
        if (s[i] === ')') {
            if (numericValueRec !== -1) {
                pushValue(parseFloat(s.slice(numericValueRec, i)));
                numericValueRec = -1;
            }
            if (arrayRec)
                arrayRec = false;
            else
                groupDepth--;
            continue;
        }
        if (s[i] === ' ' || (s[i] == ',' && arrayRec)) {
            if (plainFieldRec !== -1) {
                const value = s.slice(plainFieldRec, i);
                if (arrIncludes(['not', 'in', 'and', 'or'], value)) {
                    if (eq(value, 'in') && lastWord.type === types_1.WordType.Operator && lastWord.value === 'not') {
                        words[words.length - 1].value = 'not in';
                    }
                    else {
                        const type = arrIncludes(['and', 'or'], value) ? types_1.WordType.LogicalOperator : types_1.WordType.Operator;
                        words.push(new types_1.Word({ type, value: value.toLowerCase() }));
                    }
                }
                else {
                    words.push(new types_1.Word({ type: types_1.WordType.Field, value }));
                }
                plainFieldRec = -1;
            }
            else if (numericValueRec !== -1) {
                pushValue(parseFloat(s.slice(numericValueRec, i)));
                numericValueRec = -1;
            }
            continue;
        }
        if (s[i] === '`' && lastEscape !== i - 1 && sqStringValueRec === -1 && dqStringValueRec === -1) {
            if (plainFieldRec !== -1)
                throw new types_1.SyntaxError('illegal character inside field definition', i);
            if (accentFieldRec === -1) {
                accentFieldRec = i;
            }
            else {
                words.push(new types_1.Word({
                    type: types_1.WordType.Field,
                    value: s.slice(accentFieldRec + 1, i).replace(/\\/g, ''),
                }));
                accentFieldRec = -1;
            }
            continue;
        }
        if (s[i] === "'" && lastEscape !== i - 1 && dqStringValueRec === -1) {
            if (accentFieldRec !== -1 || plainFieldRec !== -1)
                throw new types_1.SyntaxError('illegal character inside field definition', i);
            if (sqStringValueRec === -1) {
                sqStringValueRec = i;
            }
            else {
                pushValue(s.slice(sqStringValueRec + 1, i));
                sqStringValueRec = -1;
            }
            continue;
        }
        if (s[i] === '"' && lastEscape !== i - 1 && sqStringValueRec === -1) {
            if (accentFieldRec !== -1 || plainFieldRec !== -1)
                throw new types_1.SyntaxError('illegal character inside field definition', i);
            if (dqStringValueRec === -1) {
                dqStringValueRec = i;
            }
            else {
                pushValue(s.slice(dqStringValueRec + 1, i));
                dqStringValueRec = -1;
            }
            continue;
        }
        if (s[i] === '<' && accentFieldRec === -1 && sqStringValueRec === -1 && dqStringValueRec === -1) {
            lessThanRec = true;
            continue;
        }
        if (s[i] === '>' && accentFieldRec === -1 && sqStringValueRec === -1 && dqStringValueRec === -1) {
            if (plainFieldRec !== -1) {
                words.push(new types_1.Word({
                    type: types_1.WordType.Field,
                    value: s.slice(plainFieldRec, i),
                }));
                plainFieldRec = -1;
            }
            if (numericValueRec !== -1) {
                words.push(new types_1.Word({
                    type: types_1.WordType.Value,
                    value: parseFloat(s.slice(numericValueRec, i)),
                }));
                numericValueRec = -1;
            }
            greaterThanRec = true;
            continue;
        }
        if (s[i] === '!') {
            notRec = true;
            continue;
        }
        if (s[i].match(/[0-9]|\./) &&
            sqStringValueRec === -1 &&
            dqStringValueRec === -1 &&
            accentFieldRec === -1 &&
            plainFieldRec === -1) {
            if (numericValueRec === -1)
                numericValueRec = i;
            continue;
        }
        if (s[i].match(/[a-zA-Z0-9]|\_|\./)) {
            if (sqStringValueRec === -1 && dqStringValueRec === -1 && accentFieldRec === -1 && plainFieldRec === -1) {
                if (numericValueRec !== -1)
                    throw new types_1.SyntaxError('illegal character inside value definition', i);
                plainFieldRec = i;
            }
            continue;
        }
        if (accentFieldRec !== -1 || sqStringValueRec !== -1 || dqStringValueRec !== -1) {
            continue;
        }
        throw new types_1.SyntaxError(`illegal character ${s[i]}`, i);
    }
    if (sqStringValueRec !== -1 || dqStringValueRec !== -1 || accentFieldRec !== -1)
        throw new types_1.SyntaxError('quotation mark expected', s.length);
    return root;
}
exports.parseWords = parseWords;

},{"./types":5}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectKeyNotFoundError = exports.GrammarError = exports.SyntaxError = exports.Word = exports.WordType = void 0;
/**
 * Possible types of a `Word`.
 */
var WordType;
(function (WordType) {
    /**
     * Field refers to an object key or path to a subfield.
     */
    WordType["Field"] = "FIELD";
    /**
     * Literal value used in comparison to a field.
     */
    WordType["Value"] = "VALUE";
    /**
     * Comparative/arithmetic operator.
     */
    WordType["Operator"] = "OPERATOR";
    /**
     * Logical operator to link expressions.
     */
    WordType["LogicalOperator"] = "LOGICAL_OPERATOR";
    /**
     * Group of words.
     */
    WordType["Group"] = "GROUP";
})(WordType = exports.WordType || (exports.WordType = {}));
/**
 * A word is a syntactical building block, a single unit in the semantical evaluation of a query.
 */
class Word {
    constructor(props) {
        /**
         * Type of the word.
         */
        this.type = WordType.Field;
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
    toString() {
        if (this.value) {
            if (this.type === WordType.Field) {
                return `\`${this.value}\``;
            }
            // array value
            if (typeof this.value === 'object') {
                if (this.value.length > 0 && typeof this.value[0] === 'string') {
                    return `('${this.value.join("', '")}')`;
                }
                else {
                    return `(${this.value.join(', ')})`;
                }
            }
            // primitive value
            if (this.type === WordType.Value && typeof this.value === 'string') {
                return `'${this.value}'`;
            }
            else {
                return this.value.toString();
            }
        }
        // group
        if (this.words) {
            if (this.words.length === 0)
                return '()';
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
exports.Word = Word;
/**
 * SyntaxError is thrown when a query string could not be parsed.
 */
class SyntaxError extends Error {
    constructor(msg, index) {
        super(`syntax error at position ${index}: ${msg}`);
        this.index = index;
        Object.setPrototypeOf(this, SyntaxError.prototype);
    }
}
exports.SyntaxError = SyntaxError;
/**
 * GrammarError is thrown when the order of words is invalid or the sequence is incomplete.
 */
class GrammarError extends Error {
    constructor(msg) {
        super(msg);
        Object.setPrototypeOf(this, GrammarError.prototype);
    }
}
exports.GrammarError = GrammarError;
/**
 * ObjectKeyNotFoundError is thrown when a given object was mising a desired field (or subfield).
 */
class ObjectKeyNotFoundError extends Error {
    constructor(key) {
        super(`object has no key \`${key}\``);
        this.key = key;
        Object.setPrototypeOf(this, ObjectKeyNotFoundError.prototype);
    }
}
exports.ObjectKeyNotFoundError = ObjectKeyNotFoundError;

},{}]},{},[2])(2)
});
