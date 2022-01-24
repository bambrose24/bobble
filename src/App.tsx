import { useMemo } from 'react'
import { createTheme, CssBaseline, StyledEngineProvider, ThemeProvider } from '@mui/material';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react'
import './App.css';
import { RootComponent } from './RootComponent';
import { store, persistor } from './store';


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
            <RootComponent />
          </ThemeProvider>
        </StyledEngineProvider>
      </PersistGate>
    </ReduxProvider>
  );
}

export default App;
