<h1 align="center">condition.js</h1>
<p align="center">
    Filter JSONs using SQL-like string syntax!
</p>

> 🚧👷‍♂️ This project is still under construction and the library is **not yet available**! Star this repository to stay updated.

<p align="center">
  <a href="https://github.com/mg98/constraint-js/actions/workflows/test.yml">
    <img src="https://github.com/mg98/constraint-js/actions/workflows/test.yml/badge.svg">
  </a>
  <a href="https://codecov.io/gh/mg98/constraint-js">
    <img src="https://codecov.io/gh/mg98/constraint-js/branch/main/graph/badge.svg?token=RNG38NX4WY">
  </a>
  <a href="./LICENSE">
    <img src="https://img.shields.io/github/license/mg98/constraiint-js">
  </a>
</p>

<hr>

_condition.js_ is a lightweight JavaScript library that enables you to use a comprehensible string syntax to run complex filter operations on a set of JSONs (or only one for that matter).
The syntax is strongly inspired by the syntax for the expression of conditions in SQL and is meant to be simple and intuitive, even for non-technical people.

## Install

```
npm i condition-js
```

## Example

```js
import condition from 'condition-js';

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

const alcoholClients = data.filter(client => condition.match(cliemt "(age >= 18 and country in ('Germany', 'Turkey', 'Vietnam') or age >= 21 and country = 'USA') and country != 'Arabia'"));

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