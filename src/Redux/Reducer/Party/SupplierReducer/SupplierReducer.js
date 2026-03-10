const initialState = {
  suppliers: [],
  loading: false,
  error: null,
  actionLoading: false
};

const SupplierReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'FETCH_SUPPLIERS_REQUEST':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUPPLIERS_SUCCESS':
      return { ...state, loading: false, suppliers: action.payload, error: null };
    case 'FETCH_SUPPLIERS_FAILURE':
      return { ...state, loading: false, error: action.payload };

    case 'ADD_SUPPLIER_REQUEST':
    case 'UPDATE_SUPPLIER_REQUEST':
    case 'DELETE_SUPPLIER_REQUEST':
      return { ...state, actionLoading: true, error: null };

    case 'ADD_SUPPLIER_SUCCESS':
      return {
        ...state,
        actionLoading: false,
        suppliers: [...state.suppliers, action.payload],
        error: null
      };

    case 'UPDATE_SUPPLIER_SUCCESS':
      return {
        ...state,
        actionLoading: false,
        suppliers: state.suppliers.map((s) => (s.id === action.payload.id ? action.payload : s)),
        error: null
      };

    case 'DELETE_SUPPLIER_SUCCESS':
      return {
        ...state,
        actionLoading: false,
        suppliers: state.suppliers.filter((s) => s.id !== action.payload),
        error: null
      };

    case 'ADD_SUPPLIER_FAILURE':
    case 'UPDATE_SUPPLIER_FAILURE':
    case 'DELETE_SUPPLIER_FAILURE':
      return { ...state, actionLoading: false, error: action.payload };

    default:
      return state;
  }
};

export default SupplierReducer;