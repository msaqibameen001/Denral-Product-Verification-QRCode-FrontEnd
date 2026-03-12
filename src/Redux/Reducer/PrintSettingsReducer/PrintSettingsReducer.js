const DEFAULT_SETTINGS = {
  columns: 4,
  showSerialNo: true,
  showProduct: true,
  showWarranty: true,
  showPurchase: true,
  showValidity: true,
  updatedAt: null
};

const initialState = {
  settings: DEFAULT_SETTINGS,
  loading: false,
  saving: false,
  error: null,
  initialized: false // true after first successful fetch
};

const PrintSettingsReducer = (state = initialState, action) => {
  switch (action.type) {
    // ── Fetch ──────────────────────────────────────────────────────────
    case 'FETCH_PRINT_SETTINGS_REQUEST':
      return { ...state, loading: true, error: null };

    case 'FETCH_PRINT_SETTINGS_SUCCESS':
      return {
        ...state,
        loading: false,
        initialized: true,
        settings: normalizeSettings(action.payload),
        error: null
      };

    case 'FETCH_PRINT_SETTINGS_FAILURE':
      return {
        ...state,
        loading: false,
        initialized: true, // use defaults
        error: action.payload
      };

    // ── Save ───────────────────────────────────────────────────────────
    case 'SAVE_PRINT_SETTINGS_REQUEST':
      return { ...state, saving: true, error: null };

    case 'SAVE_PRINT_SETTINGS_SUCCESS':
      return {
        ...state,
        saving: false,
        settings: normalizeSettings(action.payload),
        error: null
      };

    case 'SAVE_PRINT_SETTINGS_FAILURE':
      return { ...state, saving: false, error: action.payload };

    default:
      return state;
  }
};

// ── Normalize API response (camelCase) ────────────────────────────────────────
// Backend returns { columns, showSerialNo, showProduct, ... }
// which already matches our shape — just ensure all keys exist
function normalizeSettings(data) {
  if (!data) return DEFAULT_SETTINGS;
  return {
    columns: data.columns ?? 4,
    showSerialNo: data.showSerialNo ?? true,
    showProduct: data.showProduct ?? true,
    showWarranty: data.showWarranty ?? true,
    showPurchase: data.showPurchase ?? true,
    showValidity: data.showValidity ?? true,
    updatedAt: data.updatedAt ?? null
  };
}

export default PrintSettingsReducer;
