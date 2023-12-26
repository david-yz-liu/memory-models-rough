/**
 * This file demonstrates an example where the coordinates of objects are hardcoded (the x and y coordinates of the
 * boxes are given by the user) by the user. It uses 'draw' function from the 'user_interface.js' module.
 * The major difference with `automation_demo.js` is that the second argument to the function must be false
 * (as in `automation === false`).
 *
 * OUTPUT FILE: ~/examples/manuel_demo/manual_demo.svg
 */
const { draw } = require("../../dist/memory_models_rough.js");

const m = draw(
    (objects = "./manual_demo.json"),
    (automation = false),
    (configuration = {})
);

m.save("manual_demo.svg");
