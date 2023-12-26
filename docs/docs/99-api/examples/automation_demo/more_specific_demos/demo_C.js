/**
 * This file demonstrates the use of the 'drawAutomated' function from the 'automate.js' module (so both the stack-frames
 * and the object space is present). This function accepts a list of objects, the desired canvas width, and a
 * 'configuration' object meant to define specs like margins and padding.
 *
 * The actual list of objects is stored as JSON file (automated_json.json) and it is being parsed here to become an
 * actual JS array of objects.
 *
 * OUTPUT FILES:
 *      - ~/examples/automation_demo/more_specific_demos/draw_automated.svg
 */

const {
    drawAutomated,
    separateJSON,
    getSize,
    drawAutomatedOtherItems,
    MemoryModel,
} = require("../../../dist/memory_models_rough.js");
const fs = require("fs");

const WIDTH = 1300;

const json_string = fs.readFileSync("../automation_demo.json", "utf-8");
const objs = JSON.parse(json_string);

const m = drawAutomated(
    (objects = objs),
    (width = WIDTH),
    (configuration = {})
);

m.save("draw_automated.svg");
