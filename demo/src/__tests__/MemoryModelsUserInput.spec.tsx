import React from "react";
import {
    fireEvent,
    render,
    screen,
    waitFor,
    within,
} from "@testing-library/react";
import MemoryModelsUserInput from "../MemoryModelsUserInput";

describe("MemoryModelsUserInput", () => {
    // submit button by default resets the form https://stackoverflow.com/a/62404526
    const onSubmitMock = jest.fn((e) => e.preventDefault());
    const setTextDataMock = jest.fn();
    const setFailureBannerMock = jest.fn();
    const configDataMock = {
        useAutomation: true,
        overallDrawConfig: {
            seed: 0,
        },
        individualDrawConfig: [],
    };
    const setConfigDataMock = jest.fn();
    const jsonResult = "";
    let textDataMock: string;

    beforeEach(() => {
        textDataMock = "";
    });

    it("renders Accordion for MemoryModelsConfigInput", () => {
        render(
            <MemoryModelsUserInput
                onTextDataSubmit={onSubmitMock}
                setTextData={setTextDataMock}
                textData={textDataMock}
                setFailureBanner={setFailureBannerMock}
                jsonResult={jsonResult}
                configData={configDataMock}
                setConfigData={setConfigDataMock}
            />
        );
        expect(
            screen.getByTestId("optional-styles-accordion").textContent
        ).toEqual("Optional Styling");
    });

    it("does not submit the form or enable the submit button with empty textData", () => {
        render(
            <MemoryModelsUserInput
                onTextDataSubmit={onSubmitMock}
                setTextData={setTextDataMock}
                textData={textDataMock}
                setFailureBanner={setFailureBannerMock}
                jsonResult={jsonResult}
                configData={configDataMock}
                setConfigData={setConfigDataMock}
            />
        );

        const button = screen.getByTestId("input-submit-button");
        expect(button).toHaveProperty("disabled", true);

        fireEvent.click(button);
        expect(onSubmitMock).not.toHaveBeenCalled();
    });

    it("accepts changes to formData", () => {
        render(
            <MemoryModelsUserInput
                onTextDataSubmit={onSubmitMock}
                setTextData={setTextDataMock}
                textData={textDataMock}
                setFailureBanner={setFailureBannerMock}
                jsonResult={jsonResult}
                configData={configDataMock}
                setConfigData={setConfigDataMock}
            />
        );

        const updateFormData = "Updated form data";
        const input = screen.getByLabelText("Enter memory model JSON here");
        fireEvent.change(input, { target: { value: updateFormData } });

        expect(setTextDataMock).toHaveBeenCalledWith(updateFormData);
    });

    describe("with non-empty formData", () => {
        beforeEach(() => {
            textDataMock = "Form data";
            render(
                <MemoryModelsUserInput
                    onTextDataSubmit={onSubmitMock}
                    setTextData={setTextDataMock}
                    textData={textDataMock}
                    setFailureBanner={setFailureBannerMock}
                    jsonResult={jsonResult}
                    configData={configDataMock}
                    setConfigData={setConfigDataMock}
                />
            );
        });

        it("renders an enabled submit button with correct text", async () => {
            const button = screen.getByTestId("input-submit-button");
            expect(button).toHaveProperty("disabled", false);
            expect(button.textContent).toEqual("Draw Diagram");
        });

        it("can submit the form", () => {
            const form = screen.getByTestId("input-form");
            fireEvent.submit(form);
            expect(onSubmitMock).toHaveBeenCalled();
        });
    });

    describe("MemoryModelsFileInput", () => {
        beforeEach(() => {
            render(
                <MemoryModelsUserInput
                    onTextDataSubmit={onSubmitMock}
                    setTextData={setTextDataMock}
                    textData={textDataMock}
                    setFailureBanner={setFailureBannerMock}
                    jsonResult={jsonResult}
                    configData={configDataMock}
                    setConfigData={setConfigDataMock}
                />
            );
        });

        afterEach(() => {
            // spies / mocks need to be manually restored to not fail subsequent tests
            jest.restoreAllMocks();
        });

        it("renders an enabled input and disabled reapply button", () => {
            const input: HTMLInputElement = screen.getByTestId("file-input");
            expect(input).toHaveProperty("disabled", false);

            const reapplyBtn = screen.getByTestId("file-input-reapply-button");
            expect(reapplyBtn).toHaveProperty("disabled", true);
        });

        it("calls console error and setTextData when file upload fails", async () => {
            const mockErrorMessage = "Mock error message";
            jest.spyOn(global, "FileReader").mockImplementationOnce(() => {
                throw new Error(mockErrorMessage);
            });
            const consoleErrorSpy = jest.spyOn(console, "error");

            const file = new File(
                [JSON.stringify({ id: 1, uuid: 2 })],
                "test.json",
                {
                    type: "application/json",
                }
            );
            const input: HTMLInputElement = screen.getByTestId("file-input");
            await waitFor(() => {
                // this needs to be awaited because of fileReader.onload being async
                fireEvent.change(input, { target: { files: [file] } });
            });

            expect(consoleErrorSpy).toHaveBeenNthCalledWith(
                1,
                `Error reading uploaded file as text. Please ensure it's in UTF-8 encoding: ${mockErrorMessage}`
            );
            expect(setTextDataMock).toHaveBeenNthCalledWith(1, null);
        });

        describe("when a file is uploaded", () => {
            const fileString = JSON.stringify({ id: 1, uuid: 2 });
            let input: HTMLInputElement;

            beforeEach(async () => {
                const file = new File([fileString], "test.json", {
                    type: "application/json",
                });
                input = screen.getByTestId("file-input");
                fireEvent.change(input, { target: { files: [file] } });
            });

            it("enables reapply Button", async () => {
                const reapplyBtn = screen.getByTestId(
                    "file-input-reapply-button"
                );
                await waitFor(() => {
                    expect(reapplyBtn).toHaveProperty("disabled", false);
                });
            });

            it("clicking reapply button calls setTextData", async () => {
                const reapplyBtn = screen.getByTestId(
                    "file-input-reapply-button"
                );

                await waitFor(() => {
                    // wait until the button is enabled to click
                    expect(reapplyBtn).toHaveProperty("disabled", false);
                    fireEvent.click(reapplyBtn);
                });

                await waitFor(() => {
                    // once from reapplyBtn onChange, once from MemoryModelsTextInput handleTextFieldChange
                    // if put within the same waitFor block as fireEvent.click(reapplyBtn), this test always passes
                    // even with the wrong expect
                    expect(setTextDataMock).toHaveBeenNthCalledWith(
                        2,
                        fileString
                    );
                });
            });
        });
    });

    describe("MemoryModelsConfigInput", () => {
        beforeEach(() => {
            render(
                <MemoryModelsUserInput
                    onTextDataSubmit={onSubmitMock}
                    setTextData={setTextDataMock}
                    textData={textDataMock}
                    setFailureBanner={setFailureBannerMock}
                    jsonResult={jsonResult}
                    configData={configDataMock}
                    setConfigData={setConfigDataMock}
                />
            );
        });

        it("renders a number input with correct props and checkbox that is checked by default", () => {
            const seedInput: HTMLInputElement =
                screen.getByTestId("config-seed");
            //TODO: get max and min values from backend config
            [
                ["max", (2 ** 31).toString()],
                ["min", "0"],
                ["type", "number"],
            ].forEach(([property, value]) => {
                expect(seedInput).toHaveProperty(property, value);
            });

            // According to https://mui.com/material-ui/react-checkbox/#accessibility, checkboxes should always
            // have labels, so testing with label text rather than data-testid here.
            const automationCheckbox: HTMLInputElement = screen.getByLabelText(
                "Generate with automation"
            );
            expect(automationCheckbox.checked).toBe(true);
        });

        it("handles seed change", () => {
            const seedInput: HTMLInputElement =
                screen.getByTestId("config-seed");
            const mockSeed = "123";
            fireEvent.change(seedInput, { target: { value: mockSeed } });
            expect(setConfigDataMock).toHaveBeenNthCalledWith(
                1,
                expect.objectContaining({
                    ...configDataMock,
                    overallDrawConfig: {
                        ...configDataMock.overallDrawConfig,
                        seed: Number("123"),
                    },
                })
            );
        });

        it("handles automation change", () => {
            const automationCheckbox: HTMLInputElement = screen.getByLabelText(
                "Generate with automation"
            );
            fireEvent.click(automationCheckbox);
            expect(setConfigDataMock).toHaveBeenNthCalledWith(
                1,
                expect.objectContaining({
                    ...configDataMock,
                    useAutomation: false,
                })
            );
        });
    });
});
