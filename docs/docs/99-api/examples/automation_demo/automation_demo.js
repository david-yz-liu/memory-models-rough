/**
 * This file demonstrates the capability of coordinate automation.
 * It uses 'draw' function from the 'user_interface.js' module; the only function the user will ever have to call.
 * Check the function's docstring for usage information.
 *
 *
 * OUTPUT FILES: ~/examples/automation_demo/automation_demo.svg
 *

 */
const { draw } = require("../../dist/memory_models_rough.js");

const configuration = {
    width: 1300,
    padding: 30,
    top_margin: 30,
    bottom_margin: 40,
    left_margin: 20,
    right_margin: 30,
    sort_by: "id",
};

const m = draw("./automation_demo.json", true, configuration);

m.save("automation_demo.svg");
