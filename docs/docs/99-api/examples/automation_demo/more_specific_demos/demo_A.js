/**
 * This file demonstrates the use of the 'drawAutomatedOtherItems' function from the 'automate.js' module. This function
 * is used as a helper function for the "container" 'drawAutomated' function.
 *
 * OUTPUT FILES:
 *      - ~/examples/automation_demo/more_specific_demos/other_objects.svg"
 */

const {
    MemoryModel,
    drawAutomatedOtherItems,
} = require("../../../dist/memory_models_rough.js");

const fs = require("fs");

const WIDTH = 1300;

const listOfObjs = [
    {
        isClass: true,
        name: "Person",
        id: 99,
        value: { age: 12, name: 17 },
        stack_frame: false,
    },
    { isClass: false, name: "list", id: 82, value: [19, 43, 28, 49] },
    { isClass: false, name: "int", id: 19, value: 1969 },
];

const { objs, canvas_height, canvas_width } = drawAutomatedOtherItems(
    listOfObjs,
    WIDTH,
    (sort_by = "height"),
    (config_aut = {}),
    (sf_endpoint = 150) // This is the "separator", dividing the stack-frame space from the object space.
);

const m = new MemoryModel({ width: canvas_width, height: canvas_height });

m.drawAll(objs);
m.save("other_objects.svg");
