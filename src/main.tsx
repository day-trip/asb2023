import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import Data from "./backend/Data";
import {createTheme, ThemeProvider} from "@mui/material";
import {DevSupport} from "@react-buddy/ide-toolbox";
import {ComponentPreviews, useInitial} from "./dev";

Data.init();

const theme = createTheme({
    palette: {
        primary: {
            main: "#f97316"
        },
        secondary: {
            main: "#7c2d12"
        }
    }
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <ThemeProvider theme={theme}>
        <DevSupport ComponentPreviews={ComponentPreviews}
                    useInitialHook={useInitial}
        >
            <App/>
        </DevSupport>
    </ThemeProvider>
)
