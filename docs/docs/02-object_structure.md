---
title: Inputs to the draw function
---

# Structure of `objects` argument in `draw` function

Arguably the most significant parameter the user has to specify for the `draw` function is `objects`, representing
the array of objects to be drawn.

To be successfully rendered, the array must contain objects that strictly follow a specific structure. Every object
must contain the following attributes:

-   `isClass` - `boolean`: denotes whether the object to be drawn is a user-defined class (or a stack-frame) or a built-in
    object. Pass true to draw a class or a stack-frame, and false to draw any built-in types.
-   `name` - `string`: denotes the type of the object to draw (if `isClass===true`, then this is the name of the
    corresponding class or stackframe).
-   If the user want to hardcode the coordinates (implying the `automation` parameter of `draw` is false), each object
    must include `x` and `y` attributes (for x-y coordinates).
-   `id` - `string`|`number`: denotes the id value of this object. If we are to draw a StackFrame, then this MUST be `null`.
-   `value` - `*`: denotes the value of the object. This could be anything, from an empty string to a JS object,
    which would be passed for the purpose of drawing a user-defined class object, a
    stackframe, or a dictionary.
    **Note that in such cases where we want to do draw a 'container'
    object (an object that contains other objects), we pass a _JS object_ where the keys are the
    attributes/variables and the values are the id's of the corresponding objects (not the
    objects themselves)**.
-   `stack_frame` - `boolean`: denotes whether a stack frame will be drawn or not. NOTE that this is only
    applicable if the object's `isClass` attribute is true (since the
    `MemoryModel.drawClass` covers both classes and stack-frames). By default,
    `stack_frame` is set to null (_which is false_).
-   `show_indexes` - `boolean`: This is applicable only when drawing tuples or lists (when drawSequence
    method will be used). It denotes whether the memory box of the underlying
    sequence will include indices (for sequences) or not. This
    has a default value of `false`, and it should be manually set to `true`
    only if the object corresponds to a sequence (list or
    tuple).
-   `style` - `object` | `array`: a JS object or array specifying the "style" of the object. See `style.md` for information
    on the required structure (also see `presets.md` for the full capabilities).

### Examples

```javascript
{"isClass": true, "name": "__main__", "id": null, "value": {"lst1": 82, "lst2": 84, "p": 99, "d": 10, "t": 11}, "stack_frame": true},
{"name": "BLANK", "width": 100, "height": 200, "stack_frame" : true},
{"isClass": true, "name": "func", "id": null, "value": {"age": 12, "name": 17}, "stack_frame": true},

{"name": "BLANK", "width": 100, "height": 200, "stack_frame" : true}

{"isClass": false, "name": "list", "id": 82, "value": [19, 43, 28, 49]}

{"isClass": false, "name": "list", "id": 84, "value": [32, 10, 90, 57], "show_indexes": true}

{"isClass": false, "name": "int", "id": 19, "value": 1969}

{"isClass": false, "name": "bool", "id": 32, "value": true}

{"name": "BLANK", "width": 200, "height": 100}

{"isClass": false, "name": "str", "id": 43, "value": "David is cool"}

{"isClass": false, "name": "tuple", "id": 11, "value": [82, 76]}

{"isClass": false, "name": "set", "id": 90, "value": [36, 49, 64]}

{"isClass": false, "name": "dict", "id": 10, "value": {"x": 81, "y": 100, "z": 121}}

{"isClass": false, "name": "None", "id": 13, "value": "None",
    "style": {
      "text_value" : {"font-style": "italic"},
      "box_id": {"fill": "red", "fillStyle": "dots"},
      "box_type": {"fill": "red", "fillStyle": "solid"},
      "box_container": {"fill":"black", "fillStyle": "solid"}}
}
```
