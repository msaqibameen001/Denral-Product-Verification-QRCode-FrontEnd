import { createRoot } from 'react-dom/client';

// style.scss
import './assets/style.css';

// scroll bar
import 'simplebar-react/dist/simplebar.min.css';

// apex-chart
import 'assets/third-party/apex-chart.css';
import 'assets/third-party/react-table.css';

import '@fontsource/public-sans/400.css';
import '@fontsource/public-sans/500.css';
import '@fontsource/public-sans/600.css';
import '@fontsource/public-sans/700.css';

import { Provider as ReduxProvider } from 'react-redux';

// project imports
import App from './App';
import { ConfigProvider } from 'contexts/ConfigContext';
import reportWebVitals from './reportWebVitals';
import { store } from './redux/store';
import { StrictMode } from 'react';
import { Toaster } from 'sonner';
import { ModuleRegistry } from 'ag-grid-community';
import { AllCommunityModule } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);
const container = document.getElementById('root');
const root = createRoot(container);

// ==============================|| MAIN - REACT DOM RENDER ||============================== //

root.render(
  <StrictMode>
    <ReduxProvider store={store}>
      <ConfigProvider>
        <App />
        <Toaster
          richColors
          position="top-right"
          toastOptions={{
            className: 'custom-toast-font'
          }}
        />
      </ConfigProvider>
    </ReduxProvider>
  </StrictMode>
);

reportWebVitals();
