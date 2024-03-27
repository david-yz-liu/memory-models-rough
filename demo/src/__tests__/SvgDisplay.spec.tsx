import React from "react";
import { render, screen } from "@testing-library/react";
import SvgDisplay from "../SvgDisplay";
import mem from "../../../src/index";
const { draw } = mem;

const mockMemoryModels = {
    serializeSVG: jest.fn(),
    clear: jest.fn(),
    render: jest.fn(),
};

jest.mock("../../../src/index", () => ({
    draw: jest.fn(() => mockMemoryModels),
}));

describe("SvgDisplay", () => {
    const setSvgResultMock = jest.fn();
    const seedMock = 1234;
    const configDataMock = {
        useAutomation: true,
        overallDrawConfig: {
            seed: seedMock,
        },
        individualDrawConfig: [],
    };
    describe.each([
        ["valid JSON but not valid Memory Models JSON", [{}]],
        [
            "valid JSON and valid Memory Models JSON",
            [
                {
                    isClass: true,
                    name: "__main__",
                    id: null,
                    value: { lst1: 82, lst2: 84, p: 99, d: 10, t: 11 },
                    stack_frame: true,
                },
                {
                    isClass: false,
                    name: "str",
                    id: 19,
                    value: "David is cool!",
                    style: ["highlight"],
                },
                {
                    isClass: false,
                    name: "int",
                    id: 13,
                    value: 7,
                },
            ],
        ],
    ])("when jsonResult is not null and %s", (_, jsonResult) => {
        beforeEach(() => {
            render(
                <SvgDisplay
                    jsonResult={jsonResult}
                    setSvgResult={setSvgResultMock}
                    configData={configDataMock}
                />
            );
        });

        it("renders canvas element with specified dimensions", () => {
            const canvasElement = screen.getByTestId("memory-models-canvas");
            expect(canvasElement.getAttribute("width")).toEqual("1300");
            expect(canvasElement.getAttribute("height")).toEqual("1000");
        });

        it("calls functions with correct parameters", () => {
            expect(draw).toHaveBeenNthCalledWith(1, jsonResult, true, {
                seed: seedMock,
                width: 1300,
            });
            expect(setSvgResultMock).toHaveBeenNthCalledWith(
                1,
                mockMemoryModels.serializeSVG()
            );
            expect(mockMemoryModels.clear).toHaveBeenCalledTimes(1);
            expect(mockMemoryModels.render).toHaveBeenCalledTimes(1);
        });
    });

    it("does not render any diagrams when jsonResult is null", () => {
        render(
            <SvgDisplay
                jsonResult={null}
                setSvgResult={setSvgResultMock}
                configData={configDataMock}
            />
        );
        const canvasElement = screen.getByTestId("memory-models-canvas");
        expect(canvasElement.getAttribute("ref")).toBeNull();
    });
});
