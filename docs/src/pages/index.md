---
title: Home
sidebar_position: 1
---

# Memory model diagrams

This package generates memory model diagrams for Python code in the style of CSC110/111/148 at the University of Toronto.
This uses the [Rough.js](https://roughjs.com/) Javascript library to emulate the look of hand-drawn diagrams.

**Note**: this project is currently experimental, and may undergo significant changes before stabilizing.

## Installation

You can install the `memory-models-rough` package from GitHub (it is currently not on npm):

```console
$ npm install git+https://github.com/david-yz-liu/memory-models-rough.git
```

## Example

Here's an example of using this package in a Javascript file executed by NodeJS.

```javascript
// simple_demo.js
const { draw } = require("memory_models_rough");

const objects = [
    {
        isClass: true,
        name: "__main__",
        id: null,
        value: { lst1: 82, lst2: 84, p: 99, d: 10, t: 11 },
        stack_frame: true,
    },
    {
        isClass: false,
        name: "str",
        id: 19,
        value: "David is cool!",
        style: ["highlight"],
    },
    { isClass: false, name: "int", id: 13, value: 7 },
];

const m = draw(objects, true, { width: 1300 });

m.save("simple_demo.svg");
```

Running `$ node simple_demo.js` produces the following file:

![Diagram generated for simple_demo.js file.](images/simple_demo.svg)
