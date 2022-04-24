<h1 align="center">condition.js</h1>
<p align="center">
    Filter JSONs using SQL-like syntax!
</p>

<p align="center">
  <a href="https://github.com/mg98/condition-js/actions/workflows/test.yml">
    <img src="https://github.com/mg98/condition-js/actions/workflows/test.yml/badge.svg">
  </a>
  <a href="https://codecov.io/gh/mg98/condition-js">
    <img src="https://codecov.io/gh/mg98/condition-js/branch/main/graph/badge.svg?token=RNG38NX4WY">
  </a>
  <a href="https://deepscan.io/dashboard#view=project&tid=17510&pid=20859&bid=581033">
    <img src="https://deepscan.io/api/teams/17510/projects/20859/branches/581033/badge/grade.svg">
  </a>
  <a href="https://www.npmjs.com/package/@mg98/condition-js">
    <img src="https://img.shields.io/npm/v/@mg98/condition-js">
  </a>
  <a href="./LICENSE">
    <img src="https://img.shields.io/github/license/mg98/condition-js">
  </a>
</p>

<hr>

_condition.js_ is a lightweight JavaScript library that enables you to use a comprehensible string syntax to run complex filter operations on a set of JSONs (or only one for that matter).
The syntax is strongly inspired by the syntax for the expression of conditions in SQL and is meant to be simple and intuitive, even for non-technical people. [See a demo!](https://condition.js.org)

## Install

```
npm i @mg98/condition-js
```

## Example

```js
import { matchCondition } from 'condition-js';

const clients = [
    {
        name: 'Batu',
        age: 17,
        country: 'Turkey'
    },
    {
        name: 'Hai Dang',
        age: 24,
        country: 'Vietnam'
    },
    {
        name: 'Miles',
        age: 16,
        country: 'USA'
    },
    {
        name: 'Philipp',
        age: 58,
        country: 'Germany'
    }
]

const alcoholClients = data.filter(client => matchCondition(client, 
  "(age >= 18 and country in ('Germany', 'Turkey', 'Vietnam') or age >= 21 and country = 'USA') and country != 'Arabia'"
));

console.log(alcoholClients);
// [
//     {
//         name: 'Hai Dang',
//         age: 24,
//         country: 'Vietnam'
//     },
//     {
//         name: 'Philipp',
//         age: 58,
//         country: 'Germany'
//     }
// ]
```

## Features

The goal of _condition.js_ is to create a language that is not only a powerful tool, but also a convenient and fault-tolerant one.

✅ Basic comparison operators `=`, `!=`, `>`, `<`, `>=`, `<=`

✅ Operators `in` and `not in` in combination with array values (`('Apple', 'Peach', 'Banana')`)

✅ Supports value types string and number (including floating values)

✅ Supports operations on arrays (e.g. `hobbies > 3` is valid if `hobbies` in an array of length > 3)

✅ Logical operators `and` and `or` to combine expressions

✅ Deep property access (e.g. `address.street = 'Elm Str'`)

✅ Nested expressions using parantheses

**Not yet supported...**

❌ Boolean type

❌ Symbol to escape character `'` in value definition

❌ Support for `"` as alternative value quotation marks
