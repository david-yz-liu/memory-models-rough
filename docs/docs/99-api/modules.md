---
id: "modules"
title: "memory-models-rough"
sidebar_label: "Exports"
sidebar_position: 0.5
custom_edit_url: null
---

## Functions

### draw

▸ **draw**(`objects`, `automation`, `configuration`): `any`

Draw the given objects on the canvas.

The format of the array of objects must adhere to the description provided in MemoryModel.drawAll.

#### Parameters

| Name            | Type  | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| :-------------- | :---- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `objects`       | `any` | The array of objects to be drawn: this could be passed as an actual JavaScript array of objects, or as a JSON file containing the object array. This array of objects may also include the user-defined style configuration. See the demo files and style.md file for details.                                                                                                                                                                             |
| `automation`    | `any` | Whether the coordinates (of the objects on the canvas) should be automatically generated or manually inputted.                                                                                                                                                                                                                                                                                                                                             |
| `configuration` | `any` | The configuration (display settings) defined by the user. This is also the place to define `sort_by` ("height" or "id") for the object space. NOTE: In the case that automation == true, then the user must define configuration.width, as this will be used as the "max canvas width" for the automation process. If automation == false, then all configuration properties are optional, and the function will still operate even without defining them. |

#### Returns

`any`

the produced canvas

#### Defined in

[user_functions.ts:29](https://github.com/david-yz-liu/memory-models-rough/blob/e58844e/src/user_functions.ts#L29)
