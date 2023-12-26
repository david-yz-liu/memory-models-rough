---
title: Style API
---

# Style API

A user is able to add custom styling to an object
(of the list of objects to be drawn on canvas) by
adding an attribute named `style` which maps to an object of the
following format:

```javascript
style : {
    "text_id" : {},
    "text_type" : {},
    "text_value" : {},
    "box_id" : {},
    "box_type" : {},
    "box_container" : {},
}
```

The object has up to six attributes (the ones observed above), each
corresponding to a particular component of an object with the potential
to be styled.

Also, the user can pass in an array for the style attribute. This array can be
a mixture of presents (name of the preset in the string data format) and a user-defined
Object. To better illustrate this, here is an example:

```javascript
["highlight", "hide_type", { text_id: { "font-style": "italic" } }];
```

Crucially, each of the attributes in the `style` object (if user passes in an Object)
refer themselves to another object:

-   Text-related attributes can contain any attribute specified in the
    documentation of the text element for svg graphics, found on
    https://developer.mozilla.org/en-US/docs/Web/SVG/Element/text.
-   Box-related attributes can contain any styling attributes specified in the
    documentation of the rough library, found on https://roughjs.com/ and
    https://github.com/rough-stuff/rough/wiki.

## Insights for the Implementation

The user specifies a desired style for each of the objects in the list.

### Merging

First, there is a default object that contains all key-value pairs of style attributes
that (be default) are common across objects of all types. This object is called `common_style`.

Then we use a list objects to represent some styling properties specific to certain type categories
(for instance, `text_value` for collections need to have the id color by default, which
is not true for primitive types). The `deepmerge` library is used to merge the common styles
mentioned above with these category-specific styles.

Finally, any user-supplied styling attributes are merged to the current style object.
This is the second and final merge.

### Cascade

The above "merging" procedure takes place inside the `drawAll` method (using the
`populateDefaultStyle` helper function).

Then, inside the `drawClass` and `drawObject` methods (which are called from within
`drawALl`), for every invocation of `drawText` and `drawRect` (responsible for drawing
text and boxes, respectively), the corresponding attribute of the object's style
object is passed (for instance, in the case where `drawText` is called to draw the id value
inside the id box, `style.text_id` is passed as an argument to `drawText`).

Finally, inside drawText and drawRect, we loop through all the attributes of the
passed style object, and apply each of those in the appropriate manner (
for drawRect, you simply pass the style when initializing a rectangle by doing
`this.rough_svg.rectangle(x, y, width, height, style)`, and with the text element you
use the DOM method `setAttribute` by doing `newElement.setAttribute(style_attribute, style[style_attribute])`
).

Thus, the style is cascaded down from user to drawText/drawRect as follows:

user-defined style --> drawAll --> drawClass/drawObject --> drawText/drawRect

## Examples

### Example 1

```
style:
        {"text_value" : {"font-style" : "italic"},
        'box_id': {fill: 'blue', fillStyle: "dots"}}
```

In this example, it is important to note that for box styles
(the ones which uses rough.js module), `fill` must be passed in if
fillStyle argument will be passed in by the user. Otherwise, the behavior of the style will be in the default format
(refer to the rough.js module for the default style). Also, it points outs that the user has the
flexibility for defining the styles related to both boxes and text drawn on the canvas.

### Example 2

```
style: {
        "box_container": {fill:"green", fillStyle: "zigzag"},
        "box_id": {fill: 'red', fillWeight: 3},
        "box_type": {bowing: 8, stroke: "green", strokeWidth: 3}}
```

This example illustrates that our implementation for box styles are defined on
three boxes: the container, the box that represents the id and the box that represents
the data type. Therefore, the user can utilize the rough.js module for these three boxes that
are drawn on the canvas (two for stack-frames, as they do not have ids associated with them)

### Example 3

```
style:{
      "text_id" : {fill : "yellow", stroke: "green"},
      "text_value": {"font-style" : "italic"},
      "text_type": {"font-size: "xx-large"}}
```

This example shows that for each container (for each data that is represented on the canvas)
there are the texts that the user can alter its style: the text representing the value and/or values,
the text representing the id number of the data type (if it's not a stack-frame) and the text representing
the type of the data. The user can pass in configurations based on the SVG documentation for modifying these texts
simultaneously.
