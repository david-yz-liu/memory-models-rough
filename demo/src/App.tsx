import React, { useState } from "react";
import SvgDisplay from "./SvgDisplay";
import MemoryModelsUserInput from "./MemoryModelsUserInput";
import { ErrorBoundary } from "react-error-boundary";
import DownloadSVGButton from "./DownloadSVGButton";
import { Alert } from "@mui/material";
import { configDataPropTypes } from "./MemoryModelsUserInput";

export default function App() {
    const [textData, setTextData] = useState("");
    const [configData, setConfigData] = useState<configDataPropTypes>({
        useAutomation: true,
        overallDrawConfig: {
            seed: 0,
        },
        individualDrawConfig: [],
    });
    const [jsonResult, setJsonResult] = useState(null);
    const [svgResult, setSvgResult] = useState(null);
    const [failureBanner, setFailureBanner] = useState("");

    const onSubmit = (event, data) => {
        event.preventDefault();
        try {
            setJsonResult(JSON.parse(data));
            setFailureBanner("");
        } catch (error) {
            const errorMessage = `Error parsing inputted JSON: ${error.message}`;
            console.error(errorMessage);
            setFailureBanner(errorMessage);
            setJsonResult(null);
        }
    };
    const onTextDataSubmit = (event) => {
        onSubmit(event, textData);
    };

    return (
        <>
            {failureBanner && (
                <Alert severity="error" data-testid="json-parse-alert">
                    {failureBanner}
                </Alert>
            )}
            <MemoryModelsUserInput
                textData={textData}
                setTextData={setTextData}
                configData={configData}
                setConfigData={setConfigData}
                onTextDataSubmit={onTextDataSubmit}
                setFailureBanner={setFailureBanner}
                jsonResult={jsonResult}
            />
            <section>
                <h2>Output</h2>
                <DownloadSVGButton svgResult={svgResult} />
                <ErrorBoundary
                    fallback={
                        <p data-testid="svg-display-error-boundary">
                            This is valid JSON but not valid Memory Models JSON.
                            Please refer to the repo for more details.
                        </p>
                    }
                    key={jsonResult}
                >
                    <SvgDisplay
                        jsonResult={jsonResult}
                        configData={configData}
                        setSvgResult={setSvgResult}
                    />
                </ErrorBoundary>
            </section>
        </>
    );
}
