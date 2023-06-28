/**
 * This file demonstrates the use of the 'drawAutomated' function from the 'automate.js' module (so both the stackframes
 * and the object space is present). This function accepts a list of objects, the desired canvas width, and a
 * 'configuration' object meant to define specs like margins and padding.
 *
 * The actual list of objects is stored as JSON file (automated_json.json) and it is being parsed here to become an
 * actual JS array of objects.
 *
 * OUTPUT FILES:
 *      - ~/docs/images/demo_4.svg"
 */

const { drawAutomated, separateJSON, getSize, drawAutomatedOtherItems, MemoryModel } =
    require("../dist/memory_models_rough.node.js");
const fs = require("fs");

const WIDTH = 1300;

// Reading list of objects from JSON file
const json_string = fs.readFileSync("../docs/automated_json.json", "utf-8");
const objs = JSON.parse(json_string);

const m = drawAutomated(
    objects = objs,
    width = WIDTH,
    configuration = {padding: 60, top_margin: 50, bottom_margin: 50, left_margin: 80, right_margin:80}
)

// Saving to SVG file
m.save("../docs/images/demo_4.svg")
