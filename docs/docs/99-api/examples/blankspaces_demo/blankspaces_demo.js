/**
 * This file demonstrates the ability to leave "blanks" when the 'automated.md' option is on.
 *
 * To define a blank box, you specify it as an object in the array (the classic array of objects) with three attributes:
 * - name: This must be equal to "BLANK"
 * - width: the desired width of the blank box (I say box but in reality there aren't any borders)
 * - height: the desired height of the blank box
 *
 * NOTE:
 *   All these attributes are mandatory, and any additional attributes will not have any effect whatsoever in the
 *   rendering of the blank space.
 *   Furthermore, note that configuration.sort_by should be null, as otherwise you cannot control where the
 *   blank space will be located.
 *
 * OUTPUT FILE: ~/examples/blankspaces_demo/blankspaces_demo.svg"
 */

const { draw } = require("../../dist/memory_models_rough.js");

const WIDTH = 1300;

const listOfObjs = [
    {
        isClass: true,
        name: "__main__",
        id: null,
        value: { lst1: 82, lst2: 84, p: 99, d: 10, t: 11 },
        stack_frame: true,
    },
    { name: "BLANK", width: 100, height: 200, stack_frame: true },
    {
        isClass: true,
        name: "func",
        id: null,
        value: { age: 12, name: 17 },
        stack_frame: true,
    },
    { isClass: false, name: "list", id: 82, value: [19, 43, 28, 49] },
    {
        isClass: false,
        name: "list",
        id: 84,
        value: [32, 10, 90, 57],
        show_indexes: true,
    },
    { isClass: false, name: "int", id: 19, value: 1969 },
    { name: "BLANK", width: 100, height: 200 },
    { isClass: false, name: "bool", id: 32, value: true },
    { isClass: false, name: "str", id: 43, value: "David is cool" },
    { name: "BLANK", width: 200, height: 150 },
    { isClass: false, name: "tuple", id: 11, value: [82, 76] },
];

const configuration = {
    width: WIDTH,
    padding: 30,
    right_margin: 20,
    bottom_margin: 20,
    sort_by: null,
};

const m = draw(listOfObjs, true, configuration);

m.save("blankspaces_demo.svg");
