
// third-party
import { configureStore } from '@reduxjs/toolkit';

// project import
import rootReducer from './reducer/rootReducer';

// ==============================|| REDUX TOOLKIT - MAIN STORE ||============================== //

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().filter((middleware) => middleware.name !== 'immutableStateInvariantMiddleware'),  // ImmutableStateInvariantMiddleware ko remove karna
});

// Extracting dispatch function from the store
const { dispatch } = store;

// Exporting the store and dispatch function
export { store, dispatch };