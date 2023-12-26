---
title: Automatic Layout
---

# Automatic Layout

## Discussion

How does the automation of `drawAutomatedOtherItems` and `drawAutomatedStackFrames`,
responsible for drawing all non-stackframe objects actually work? The algorithm
is outlined below.

Given a list of objects in the format described in `MemoryModel.drawAll`
but without `x` and `y` coordinates as properties (as the point of
`drawAutomatedOtherItems` and `drawAutomatedStackFrames` is to assign
coordinates to each object) we separate these given objects into to collections as _stack frames_ and _other items_
by using the `seperateObjects` function. We pass these two lists to the functions aforementioned above.

We equip the objects with their hypothetical
dimensions, we sort them by height, and then begin equipping
them with actual coordinates (of the top-left corner),
dynamically moving to a new row and continuing if necessary.

In particular, all stackframe object are passed to `drawAutomatedStackFrames`, which not only equips the objects
the coordinates, but importantly also returns the total width of the stack-frame "section" in the canvas, which
is then passed to `drawAutomatedOtherItems` as a way to tell it where the vertical division
between the two sections takes place (in this way, the divider between the stack-frame section
and the objects section is determined dynamically).

Below we thoroughly describe the steps for each of the two functions:
`drawAutomatedOtherItems` and `drawAutomatedStackFrames`.

## `drawAutomatedStackFrames`

1. First we make sure that no configuration options (padding etc.)
   remain undefined. To achieve this, we loop through the configurations
   attributes and check whether they have already been defined by the user. If not,
   we pass in the default configuration settings.

2. Then, we initialize the accumulators which helps us to track minimum required canvas height,
   required width for drawing all stack frames and a collection of stack frames that will be drawn.

3. Afterward, we iterate through the given stack-frames objects. Inside the loop,
   we first acquire the width and the height of the object. If the box is "BLANK", we obtain the height and width
   by accessing the attributes of the object. If not, we obtain the dimensions by using the `getSize` function. Refer
   to the function for details.

4. Moreover, we update the width accumulator, if the box width is greater than the size stored in the accumulator.

5. After that, we add the `x` and `y` attributes to the stack frames object (if it's not a BLANK box), and add the object
   the collection accumulator.

6. At the end, we update the min required height by adding the height of the box to the accumulator and return
   the object. After the loop, we update the accumulator in accordance with the `configuration.padding`.

7. At the end, we return a JS object that has the following format
   `{StackFrames: ..., requiredHeight: ..., requiredWidth: ...}`

## `drawAutomatedOtherItems`

1. Determine the size --width and height-- of the (outer) box of each object if it were to
   be drawn on canvas, and **equip the object with its calculated dimensions, by adding width and height properties**. This will tell us exactly how much space each
   object will require in the canvas. For this purpose I created the `getSize` function
   in the `automate.js` module, which accepts any object and returns the
   size it would have on canvas.\*

2. Sort the list of objects by descending height of the objects
   (the height and weight properties were added to each object in
   STEP 1). The purpose of this step is to economize on the height
   of the canvas; **all “tall” boxes ought to be together in the first
   (few) “rows” of the canvas, so not all “rows” need to have a
   large vertical value**. This sorting allows us to do this because
   once you place an object in a new row, you know all remaining objects
   will be shorter that this object.

3. Loop through the passed list of objects (which now is equipped
   with dimensions, and is sorted by descending height), and let the
   current object be denoted as `obj`:

-   If `obj` fits horizontally (which is determined by checking
    if the top-right coordinate of the last iteration's object,
    plus some padding, plus the width of `obj` is less than the
    width of the entire canvas), **equip `obj` with the (top-left)
    coordinates** it would take if it were drawn.
-   If `obj` does NOT fit horizontally, we move to a new row.
    The height of the new row will be the height of the current
    object that does not fit (plus some padding), `obj`, since (due to the sorting
    in step 2) `obj` is tallest amongst all remaining objects
    (so it just makes sense to the make this the height of
    the row itself).
    Again, **equip `obj` with the (top-left) coordinates** it
    would take if it were drawn (in this case, the x-coordinate
    would go back to the initial state since we moved to a new row,
    and the y-coordinate would increase by the height of the
    _previous_ row).

4. Return the mutated list of objects.

\*In case the object has `name="BLANK"`, it is assumed that the user has
also provided a width and a height attribute corresponding to the desired
width and height of the blank space. If such dimensions have not been provided,
a related warning is printed and the object is skipped (no blank space is
recorded).

## Summary

As a result, the caller of the function (may that be an actual user
or another function) has a list of objects equipped with coordinates,
and can use `drawAll` (assuming the existence of a MemoryModel object)
to actually draw them.

Thus, **the process of determining coordinates is now fully automated**.
