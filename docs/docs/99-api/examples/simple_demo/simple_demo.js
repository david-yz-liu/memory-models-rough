/**
 * This file is a simple demonstration of the framework.
 *
 * OUTPUT FILES: ~/examples/simple_demo/simple_demo.svg
 *

 */
const { draw } = require("../../dist/memory_models_rough.js");

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
