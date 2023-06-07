// A library allowing interaction with the file system (e.g. creating new files)
import fs from "fs"
// The library allowing for the production of sketches that appear to be hand-drawn
import rough from "roughjs/bundled/rough.esm.js"

const { DOMImplementation, XMLSerializer } = require("@xmldom/xmldom")

/** The class representing the memory model diagram of the given block of code. */
class MemoryModel {
    /**
     * Create the memory model diagram.
     * @property {object} svg - An svg 'Element' object from the DOM (Document Object Model) module.
     *                          Scalable Vector Graphics (svg) is an image format based on geometry.
     * @property {object} rough_svg - Instantiating a RoughSVG object by passing the root svg node (this.svg) to the
     *                                'rough.svg()' method. As per the documentation of the 'rough' library,
     *                                "RoughSVG provides the main interface to work with this library".
     *
     * NOTE: Other properties of this class are a consequence of the constant 'config' object in the bottom of this file.
     *       These include 'id_colour', 'obj_min_width', and 'font_size'. The 'config' constant also contains default
     *       values for these properties.
     *       Moreover, the user can optionally set custom width and height for the canvas by passing them as attributes
     *       to the 'options' argument. To see this in practice, see ./examples/demo.js.
     *
     */
    constructor(options)    {
        options = options || {}
        if (options.browser) {
            this.document = document
        } else {
            this.document = new DOMImplementation().createDocument(
                "http://www.w3.org/1999/xhtml",
                "html",
                null
            )
        }

        this.svg = this.document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg"
        )

        // Defining 'this.width', 'this.height', and 'this.rough_svg'.
        this.svg.setAttribute("width", options.width || 800)
        this.svg.setAttribute("height", options.height || 800)
        this.rough_svg = rough.svg(this.svg)

        // 'config' is a constant object holding configuration information, defined in the bottom of this file.
        // In particular, 'config' contains all properties that a 'MemoryModel' object must have, ---as well as their
        // corresponding default values---. However, with the 'options' parameter, the user has the ability to override
        // these default values by passing in a custom object with the desired attribute values.
        // For instance, if the user runs
        //                      m = new MemoryModel({font_size: 17}),
        // then the default 'font_size' value of 20 will be overridden and 'm.font_size' will evaluate to 17.
        for (const key in config) {
            this[key] = options.hasOwnProperty(key) ? options[key] : config[key]
        }
    }

    /**
     * Save the current image to an SVG file at the given path.
     * If path is undefined, write the svg to stdout instead.
     * @param path: The repository (local location that the image
     * will be saved).
     */
    save(path) {
        const xmlSerializer = new XMLSerializer()
        let xml = xmlSerializer.serializeToString(this.svg)
        if (path === undefined) {
            console.log(xml)
        } else {
            fs.writeFile(path, xml, (err) => {
                if (err) {
                    console.error(err)
                }
            })
        }
    }

    /**
     * Render the image (show the output) SVG to a given canvas object.
     * @param canvas: the element that will be used to draw graphics
     */
    render(canvas) {
        const ctx = canvas.getContext("2d")
        let image = new Image()
        let data = "data:image/svg+xml;base64," + window.btoa(this.svg)
        image.src = data
        ctx.drawImage(image, 0, 0)
    }

    /**
     * Create a Memory Model given the path to a JSON file.
     * The JSON file must contain a list of objects, exactly like the input to the function 'drawAll' (see
     * the docstring of 'drawAll' for detailed information on the required format of this list of objects).
     * @param {string} path - the path to the JSON file.
     *
     */
    createFromJSON(path) {
        // Use of fs.readFileSync(<path>, <options>) which synchronously reads and returns a string of the data stored
        // in the file that corresponds to path. It blocks execution of any other code until the file is read.
        const json_string = fs.readFileSync(path, "utf-8");

        // Since fs.readFileSync returns a string, we then use JSON.parse in order to convert the return JSON string
        // into a valid JavaScript object (we assume that 'path' is the path to a valid JSON file).
        const listOfObjs = JSON.parse(json_string);

        // Since we now have our list of objects, we simply reuse the previously created 'drawAll' method.
        this.drawAll(listOfObjs); // reusing the 'drawAll' function
    }


    /**
     * Draw all the objects and/or classes in the given collection.
     * @param {object[]} items: A list of items (objects, classes and/or stack-frames) that will be drawn.
     *
     * Each object in 'items' must include  the following structure:
     *
     * @param {boolean} items[*].isClass:   Whether a user-defined class (or a stack-frame) or a built-in
     *                                      object will be drawn. Pass true to draw a class or a stack-frame,
     *                                      and false to draw any of the types found in the 'immutable'
     *                                      and 'collections' constants.
     * @param {number} items[*].x:  Value for x coordinate of top left corner.
     * @param {number} items[*].y:  Value for y coordinate of top left corner.
     * @param {string} items[*].name:   The data type of the object to draw. (if isClass===true, it represents
     *                                  the user-defined name of the corresponding class or stack frame).
     * @param {number} items[*].id: The id value of this object. If drawClass method will be used (to draw
     *                              a stack frame and/or a user-defined class), null must be passed.
     * @param {*} items[*].value:   The value of the object. Note that in such cases when it is required (when a
     *                              user defined class or a stack frame will be drawn)to draw a 'container' object
     *                              (an object that contains other objects), we pass a JS object where the keys are
     *                              the attributes/variables and the values are the id's of the corresponding objects
     *                              (not the objects themselves).
     * @param {boolean=} [items[*].stackFrame = null]:  Whether a stack frame will be drawn or not. NOTE that this is
     *                                                  only applicable is the item's isClass attribute is true
     *                                                  (since the MemoryModel.drawClass covers both classes and
     *                                                  stack frames). By default, stackFrame is set to null.
     * @param {boolean=} [items[*].showIndexes = false]:    Applicable for drawing tuples or lists (when drawSequence
     *                                                      method will be used.) Whether memory box of the underlying
     *                                                      sequence will include indices (for sequences) or not. This
     *                                                      has a default value of false, and it shall be manually set
     *                                                      only if the object corresponds to a sequence (list or
     *                                                      tuple).
     *
     */
    drawAll(items) {
        for (const item of items) {
            // showIndexes and stackFrame have default values as pointed out.
            item.showIndexes = item.showIndexes || false  // showIndexes has a false default value.
            item.stackFrame = item.stackFrame || null  // stackFrame has a null default value
            if (item.isClass) {  // In this case, drawClass method will be used.
                this.drawClass(item.x, item.y, item.name, item.id, item.value, item.stackFrame);
            } else {  // If item.isClass is false, drawObject method will be used.
                this.drawObject(item.x, item.y, item.name, item.id, item.value, item.showIndexes);
            }

        }
    }

    /**
     * Distribute the object drawing depending on type
     * @param {number} x: value for x coordinate of top left corner
     * @param {number} y: value for y coordinate of top left corner
     * @param {string} type: the data type (e.g. list, int) of the object we want draw
     * @param {number} id: the hypothetical memory address number
     * @param {*} value: can be passed as a list if type is a collection type
     * @param {boolean} show_indexes: whether to show list indices
     */
    drawObject(x, y, type, id, value, show_indexes) {
        if (collections.includes(type)) {  // If the given object is a collection
            if (type === "dict") {
                this.drawDict(x, y, id, value)
            } else if (type === "set") {
                this.drawSet(x, y, id, value)
            } else if (type === "list" || type === "tuple") {
                this.drawSequence(x, y, type, id, value, show_indexes)
            }
        } else {  // If the given object is a primitive data type
            this.drawPrimitive(x, y, type, id, value)
        }
    }


    /**
     * Draw a primitive object.
     * @param {number} x: value for x coordinate of top left corner
     * @param {number} y: value for y coordinate of top left corner
     * @param {string} type: the primitive data type (e.g. boolean, int) of the object we want draw
     * @param {number} id: the hypothetical memory address number
     * @param {*} value: the value of the primitive object
     */
    drawPrimitive(x, y, type, id, value) {
        // Adjust and draw object box (see 'config' object for the information on the attributes)
        let box_width = Math.max(
            this.obj_min_width,
            this.getTextLength(String(value)) + this.obj_x_padding
        )
        this.drawRect(x, y, box_width, this.obj_min_height)

        // For immutable types we need a double box, so we add another box that will contain the one we created.
        // Coordinate-wise, we utilize 'this.double_rec_sep' (see 'config' for more information).
        // It represents the space to leave between the inner box and the outer box.
        if (immutable.includes(type)) {
            this.drawRect(
                x - this.double_rect_sep,
                y - this.double_rect_sep,
                box_width + 2 * this.double_rect_sep,
                this.obj_min_height + 2 * this.double_rect_sep
            )
        }

        // Initializing the text that will be displayed, using the 'type' and 'value' arguments.
        let display_text
        if (type === "bool") {
            display_text = value ? "True" : "False"
        } else {
            display_text = JSON.stringify(value)
        }

        // Actually drawing the text to be displayed on our canvas by utilizing the helper 'drawText' instance method.
        // Note that if the value is null or undefined, nothing will be drawn
        if (value !== null && value !== undefined) {
            this.drawText(
                display_text,
                x + box_width / 2,
                y + (this.obj_min_height + this.prop_min_height) / 2,
                this.value_color
            )
        }

        // Draw type and id boxes
        this.drawProperties(id, type, x, y, box_width)
    }

    /**
     * Draw the id and type properties of an object with a given type and id.
     * @param {number} id: the hypothetical memory address number
     * @param {string} type: the data type of the given object
     * @param {number} x: value for x coordinate of top left corner
     * @param {number} y: value for y coordinate of top left corner
     * @param {number} width: The width of the given box (rectangle)
     */
    drawProperties(id, type, x, y, width) {

        // Adjust the id box by taking into account 'this.min_width'.
        let id_box = Math.max(
            this.prop_min_width,
            this.getTextLength(`id${id}`) + 10
        )

        // Adjust the id box by taking into account 'this.prop_min_width'.
        let type_box = Math.max(
            this.prop_min_width,
            this.getTextLength(type) + 10
        )

        // Draw the text inside the id box (insert the id of the given object to the id box)
        this.drawText(
            id === null ? "" : `id${id}`,
            x + id_box / 2,
            y + this.font_size * 1.5,
            this.id_color
        )

        // Draw the text inside the type box (insert the data type of the given object to the id box)
        this.drawText(
            type,
            x + width - type_box / 2,
            y + this.font_size * 1.5,
            this.value_color
        )

        // Draw boxes (specify the boxes for id and type)
        this.drawRect(x, y, id_box, this.prop_min_height)
        this.drawRect(x + width - type_box, y, type_box, this.prop_min_height)
    }

    /**
     * Draw a sequence object (must be either a list or a tuple).
     * @param {number} x: value for x coordinate of top left corner
     * @param {number} y: value for y coordinate of top left corner
     * @param {string} type: the data type of the given object (tuple or list)
     * @param {number} id: the hypothetical memory address number
     * @param {number[]} element_ids: the list of id's corresponding to the values stored in this set.
     *      NOTE:
     *          1. This argument MUST be an array, since the built-in 'forEach' method works only for
     *             (finite) ordered collections (i.e. with indexing). Sets are a type of unordered collection.
     *          2. The 'element_ids' argument must store the id's and not the actual value of the list elements.
     *             If the instructor wishes to showcase the corresponding values, it is their responsibility to create
     *             memory boxes for all elements (with id's that match the id's held in 'element_ids').
     *
     * @param {boolean} show_idx: whether to show the indexes of each list element
     *
     * Moreover, note that this program does not force that for every id in the element_ids argument there is
     * a corresponding object (and its memory box) in our canvas.
     */
    drawSequence(x, y, type, id, element_ids, show_idx) {
      
        // Object width
        let box_width = this.obj_x_padding * 2

        // For each element of 'element_ids', we increase 'box_width' as required, to make space for all values.
        element_ids.forEach((v) => {  // v represents one single value
            box_width += Math.max(
                this.item_min_width,
                this.getTextLength(v === null ? "" : `id${v}`) + 10
            )
        })

        // Final 'box_width' adjustment; ensuring the box is at least as wide as required by 'this.obj_min_width'.
        box_width = Math.max(this.obj_min_width, box_width)

        // Box height
        let box_height = this.obj_min_height
        if (show_idx) {
            box_height += this.list_index_sep
        }

        // Draw box
        this.drawRect(x, y, box_width, box_height)

        // As with all primitives, we are drawing a second enclosing box to highlight that this object is immutable
        if (immutable.includes(type)) {
            this.drawRect(
                x - this.double_rect_sep,
                y - this.double_rect_sep,
                box_width + 2 * this.double_rect_sep,
                box_height + 2 * this.double_rect_sep
            )
        }

        // Draw the boxes for each element
        let curr_x = x + this.item_min_width / 2
        let item_y =
            y +
            this.prop_min_height +
            (this.obj_min_height -
                this.prop_min_height -
                this.item_min_height) /
            2  // y coordinate of list items
        if (show_idx) {
            item_y += this.list_index_sep
        }
        element_ids.forEach((v, i) => {
            const idv = v === null ? "" : `id${v}`
            const item_length = Math.max(
                this.item_min_width,
                this.getTextLength(idv) + 10
            )
            this.drawRect(curr_x, item_y, item_length, this.item_min_height)
            this.drawText(
                idv,
                curr_x + item_length / 2,
                item_y + this.item_min_height / 2 + this.font_size / 4,
                this.id_color
            )
            if (show_idx) {
                this.drawText(
                    i,
                    curr_x + item_length / 2,
                    item_y - this.item_min_height / 4,
                    this.text_color
                )
            }

            curr_x += item_length
        })

        // Draw type and id boxes
        if (type === "list") {
            this.drawProperties(id, "list", x, y, box_width);
        }
        else {
            this.drawProperties(id, "tuple", x, y, box_width);
        }


    }

    /**
     * Draw a set object.
     * @param {number} x: value for x coordinate of top left corner
     * @param {number} y: value for y coordinate of top left corner
     * @param {number} id: the hypothetical memory address number
     * @param {number[]} element_ids: the list of id's corresponding to the values stored in this set.
     *      NOTE:
     *          1. This argument MUST be an array, since the built-in 'forEach' method works only for
     *             (finite) ordered collections (i.e. with indexing). Sets are a type of unordered collection.
     *          2. The 'element_ids' argument must store the id's and not the actual value of the list elements.
     *             If the instructor wishes to showcase the corresponding values, it is their responsibility to create
     *             memory boxes for all elements (with id's that match the id's held in 'element_ids').
     *
     * Moreover, note that this program does not force that for every id in the element_ids argument there is
     * a corresponding object (and its memory box) in our canvas.
     */
    drawSet(x, y, id, element_ids) {

        // Adjust the object width (the width of the box)
        let box_width = this.obj_x_padding * 2
        element_ids.forEach((v) => { // v represents each value in this collection
            box_width += Math.max(
                this.item_min_width,
                this.getTextLength(v === null ? "" : `id${v}`) + 10
            )
        })
        box_width = Math.max(this.obj_min_width, box_width)
        box_width += ((element_ids.length - 1) * this.item_min_width) / 4 // Space for separators

        // Draw box which represents the set object
        this.drawRect(x, y, box_width, this.obj_min_height)

        // Draw element boxes for each value in this collection
        let curr_x = x + this.item_min_width / 2
        let item_y =
            y +
            this.prop_min_height +
            (this.obj_min_height -
                this.prop_min_height -
                this.item_min_height) /
            2 // y coordinate of list items
        let item_text_y = item_y + this.item_min_height / 2 + this.font_size / 4

        element_ids.forEach((v, i) => {
            const idv = v === null ? "" : `id${v}`
            const item_length = Math.max(
                this.item_min_width,
                this.getTextLength(idv) + 10
            )
            this.drawRect(curr_x, item_y, item_length, this.item_min_height)
            this.drawText(
                idv,
                curr_x + item_length / 2,
                item_text_y,
                this.id_color
            )
            if (i > 0) {
                // Draw commas
                this.drawText(
                    ",",
                    curr_x - this.item_min_width / 8,
                    item_text_y,
                    this.text_color
                )
            }
            curr_x += item_length + this.item_min_height / 4
        })

        // Draw type and id boxes
        this.drawProperties(id, "set", x, y, box_width)
        // Draw set braces
        this.drawText(
            "{",
            x + this.item_min_width / 4,
            item_text_y,
            this.text_color
        )
        this.drawText(
            "}",
            x + box_width - this.item_min_width / 4,
            item_text_y,
            this.text_color
        )
    }

    /**
     * Draw a dictionary object
     * @param {number} x: value for x coordinate of top left corner
     * @param {number} y: value for y coordinate of top left corner
     * @param {number} id: the hypothetical memory address number
     * @param {object} obj: the object that will be drawn
     */
    drawDict(x, y, id, obj) {
        let box_width = this.obj_min_width
        let box_height = this.prop_min_height + this.item_min_height / 2

        // Draw element boxes
        let curr_y = y + this.prop_min_height + this.item_min_height / 2
        for (const k in obj) {
            let idk = k === null ? "" : `id${k}`
            let idv = k === null || obj[k] === null ? "" : `id${obj[k]}`

            let key_box = Math.max(
                this.item_min_width,
                this.getTextLength(idk + 5)
            )
            let value_box = Math.max(
                this.item_min_width,
                this.getTextLength(idv + 5)
            )

            // Draw the rectangles representing the keys
            this.drawRect(
                x + this.obj_x_padding,
                curr_y,
                key_box,
                this.item_min_height
            )

            // Draw the text inside the keys
            this.drawText(
                idk,
                x + this.item_min_width + 2,
                curr_y + this.item_min_height / 2 + +this.font_size / 4,
                this.id_color
            )

            curr_y += this.item_min_height * 1.5

            // Update dimensions
            box_width = Math.max(
                box_width,
                this.obj_x_padding * 2 +
                key_box +
                value_box +
                2 * this.font_size
            )
            box_height += 1.5 * this.item_min_height
        }

        // A second loop, so that we can position the colon and value boxes correctly
        curr_y = y + this.prop_min_height + this.item_min_height / 2
        for (const k in obj) {
            let idv = k === null || obj[k] === null ? "" : `id${obj[k]}`

            let value_box = Math.max(
                this.item_min_width,
                this.getTextLength(idv + 5)
            )

            // Draw colon
            this.drawText(
                ":",
                x + box_width / 2,
                curr_y + this.item_min_height / 2 + this.font_size / 4,
                this.value_color
            )

            // Draw the rectangle for values
            this.drawRect(
                x + box_width / 2 + this.font_size,
                curr_y,
                value_box,
                this.item_min_height
            )

            // Draw the text for the values
            this.drawText(
                idv,
                x + box_width / 2 + this.font_size + value_box / 2,
                curr_y + this.item_min_height / 2 + this.font_size / 4,
                this.id_color
            )

            curr_y += this.item_min_height * 1.5
        }

        // Draw outer box
        this.drawRect(x, y, box_width, box_height)

        // Draw type and id boxes
        this.drawProperties(id, "dict", x, y, box_width)
    }

    /**
     * Draw a custom class.
     * @param  {number} x: value for x coordinate of top left corner
     * @param {number} y: value for y coordinate of top left corner
     * @param {string} name: the name of the class
     * @param {string} id: the hypothetical memory address number
     * @param {object} attributes: the attributes of the given class
     * @param {boolean} stack_frame: set to true if you are drawing a stack frame
     */
    drawClass(x, y, name, id, attributes, stack_frame) {
        // Get object's width
        let box_width = this.obj_min_width
        let longest = 0
        for (const attribute in attributes) {
            longest = Math.max(longest, this.getTextLength(attribute))
        }
        if (longest > 0) {
            box_width = longest + this.item_min_width * 3
        }
        // Adjust for the class name
        box_width = Math.max(
            box_width,
            this.prop_min_width + this.getTextLength(name) + 10
        )

        // Get object's height
        let box_height = 0
        if (Object.keys(attributes).length > 0) {
            box_height =
                ((this.item_min_width * 3) / 2) *
                Object.keys(attributes).length +
                this.item_min_width / 2 +
                this.prop_min_height
        } else {
            box_height = this.obj_min_height
        }
        this.drawRect(x, y, box_width, box_height)

        // Draw element boxes
        let curr_y = y + this.prop_min_height + this.item_min_height / 2 // y coordinate of list items
        for (const attribute in attributes) {
            const val = attributes[attribute]
            let idv = val === null ? "" : `id${val}`
            let attr_box = Math.max(
                this.item_min_width,
                this.getTextLength(idv) + 10
            )
            this.drawRect(
                x + box_width - this.item_min_width * 1.5,
                curr_y,
                attr_box,
                this.item_min_height
            )

            this.drawText(
                attribute,
                x + this.item_min_width / 2,
                curr_y + this.item_min_height / 2 + this.font_size / 4,
                this.text_color,
                "begin"
            )
            this.drawText(
                idv,
                x + box_width - this.item_min_width * 1.5 + attr_box / 2,
                curr_y + this.item_min_height / 2 + this.font_size / 4,
                this.id_color
            )
            curr_y += this.item_min_height * 1.5
        }

        // Draw type and id boxes
        if (stack_frame) {
            let text_length = this.getTextLength(name)
            this.drawRect(x, y, text_length + 10, this.prop_min_height)
            this.drawText(
                name,
                x + text_length / 2 + 5,
                y + this.prop_min_height * 0.6,
                this.text_color
            )
        } else {
            this.drawProperties(id, name, x, y, box_width)
        }
    }

    /**
     * Draw a rectangle that will be used to represent the objects.
     * @param {number} x: value for x coordinate of top left corner
     * @param {number} y: value for y coordinate of top left corner
     * @param {number} width: the width of the rectangle
     * @param {number} height: the height of the rectangle
     * @param {object | undefined} style: if specified an object with style properties for a Rough.js object, as per the
     *                        Rough.js API. For instance, {fill: 'blue', stroke: 'red'}.
     */
    drawRect(x, y, width, height, style) {
        if (style === undefined) {
            style = this.rect_style
        }
        this.svg.appendChild(
            this.rough_svg.rectangle(x, y, width, height, style)
        )
    }

    /**
     * Draw given text
     * @param {string} text: The text message that will be displayed
     * @param {number} x: value for x coordinate of top left corner
     * @param {number} y: value for y coordinate of top left corner
     * @param {string} colour: The colour of the text that will be displayed. Must be in the form "rgb(..., ..., ...)".
     * @param {string} align: The text anchor; one of "start", "middle" or "end".
     *                        (As per the SVG documentation from developer.mozilla.org)
     *                        The default value if nothing is supplied (null or undefined) is "middle"
     */

    drawText(text, x, y, colour, align) {
        colour = colour || this.text_color
        align = align || "middle"
        const newElement = this.document.createElementNS(
            "http://www.w3.org/2000/svg",
            "text"
        )
        newElement.setAttribute("x", x)
        newElement.setAttribute("y", y)
        newElement.setAttribute("fill", colour)
        newElement.setAttribute("text-anchor", align)
        newElement.setAttribute("font-family", "Consolas, Courier")
        newElement.setAttribute("font-size", `${this.font_size}px`)
        newElement.appendChild(this.document.createTextNode(text))
        this.svg.appendChild(newElement)
    }

    /**
     * Return the length of this text.
     * @param {string} s: The given text.
     */
    getTextLength(s) {
        return s.length * 12
    }


    /**
     * Create a MemoryModel given a list of JS objects.
     *
     * @param {object[]} objects: the list of objects (including stackframes) to be drawn.
     * Each object in 'objects' must include  the following structure:
     * @param {boolean} objects[*].isClass: Whether a user-defined class (or a stack-frame) or a built-in
     *                                      object will be drawn. Pass true to draw a class or a stack-frame,
     *                                      and false to draw any of the types found in the 'immutable'
     *                                      and 'collections' constants.
     * @param {number} objects[*].x: Value for x coordinate of top left corner
     * @param {number} objects[*].y: Value for y coordinate of top left corner
     * @param {string} objects[*].name: The type of the object to draw (if isClass===true, then this is the name of the
     *                                  corresdponding class or stackframe).
     * @param {number} objects[*].id: The id value of this object. If we are to draw a StackFrame, then this MUST be 'null'.
     * @param {*} objects[*].value: The value of the object. This could be anything, from an empty string to a JS object,
     *                          which would be passed for the purpose of drawing a user-defined class object, a
     *                          stackframe, or a dictionary. Note that in such cases where we want do draw a 'container'
     *                          object (an object that contains other objects), we pass a JS object where the keys are the
     *                          attributes/variables and the values are the id's of the corresopnding objects (not the
     *                          objects themselves).
     * @param {boolean=} [objects[*].stack_frame = null]: Whether a stack frame will be drawn or not. NOTE that this is only
     *                                            applicable if the object's 'isClass' attribute is true (since the
     *                                            'MemoryModel.drawClass' covers both classes and stackframes). By default,
     *                                            'stack_frame' is set to null.
     * @param {boolean=} [objects[*].show_indexes = false]:Applicable only for drawing tuples or lists (when drawSequence
     *                                                     method will be used).
     *                                                     Whether the memory box of the underlying
     *                                                     sequence will include indices (for sequences) or not. This
     *                                                     has a default value of false, and it shall be manually set
     *                                                     only if the object corresponds to a sequence (list or
     *                                                     tuple).
     *
     *
     *
     * Preconditions:
     *      - 'objects' is a valid object with the correct properties, as outlined above.
     */
    drawAll(objects) {
        for (const i in objects) { // i takes the values of 0 to n-1, where n is the length of the inputted list
            let item = objects[i];  // Variable 'item' represents a single object in 'objects'.
            if (item.isClass) {  // The 'drawClass' method will be used to draw a class (or a stack-frame)
                this.drawClass(item.x, item.y, item.name, item.id, item.value, item.stack_frame);
            }
            else {  // The 'drawObject' method will be used to draw an object of a built-in type.
                this.drawObject(item.x, item.y, item.name, item.id, item.value, item.show_indexes);
            }
        }
    }

    /**
     * Create a MemoryModel given the path to a JSON file.
     * The JSON file must contain a list of objects, exactly like the input to the function 'drawAll' (see
     * the dosctring of 'drawAll' for detailed information on the requured format of this list of objects).
     *
     * @param {string} path - the path to the JSON file.
     *
     */
    createFromJSON(path) {
        // Use of fs.readFileSync(<path>, <options>) which synchronously reads and returns a string of the data stored
        // in the file that corresponds to path. It blocks execution of any other code until the file is read.
        const json_string = fs.readFileSync(path, "utf-8");

        // Since fs.readFileSync returns a string, we then use JSON.parse in order to convert the return JSON string
        // into a valid JavaScript object (we assume that 'path' is the path to a valid JSON file).
        const listOfObjs = JSON.parse(json_string);

        // Since we now have our list of objects, we simply reuse the previously created 'drawAll' method.
        this.drawAll(listOfObjs); // reusing the 'drawAll' function
    }
}


// Default configurations we are using
const config = {
    rect_style: {stroke: "rgb(0, 0, 0)"},
    text_color: "rgb(0, 0, 0)", // Default text color
    value_color: "rgb(27, 14, 139)", // Text color for primitive values
    id_color: "rgb(150, 100, 28)", // Text color for object ids
    item_min_width: 50, // Minimum width of an item box in a collection
    item_min_height: 50, // Minimum height of an item box in a collection
    obj_min_width: 200, // Minimum width of object rectangle
    obj_min_height: 130, // Minimum height of object rectangle
    prop_min_width: 60, // Minimum width of type and id boxes
    prop_min_height: 50, // Minimum height of type and id boxes
    obj_x_padding: 25, // Minimum horizontal padding of object rectangle
    double_rect_sep: 6, // Separation between double boxes around immutable objects
    list_index_sep: 20, // Vertical offset for list index labels
    font_size: 20, // Font size, in px
    browser: false, // Whether this library is being used in a browser context
}

// Built-in data types
const immutable = ["int", "str", "tuple", "None", "bool", "float", "date"]
const collections = ["list", "set", "tuple", "dict"]

export default { MemoryModel, config }
