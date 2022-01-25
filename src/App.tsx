import { useMemo } from 'react'
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";
import { createTheme, CssBaseline, StyledEngineProvider, ThemeProvider } from '@mui/material';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react'
import './App.css';
import { RootComponent } from './RootComponent';
import { store, persistor } from './store';

import ReactGA from 'react-ga4'
ReactGA.initialize('G-S1JHBBM9T9')


function App() {

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: "dark",
        },
      }),
    [],
  );

  return (
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<RootComponent />} />
                <Route path="/:alwaysWord" element={<RootComponent />} />
              </Routes>
            </BrowserRouter>
          </ThemeProvider>
        </StyledEngineProvider>
      </PersistGate>
    </ReduxProvider>
  );
}

export default App;
