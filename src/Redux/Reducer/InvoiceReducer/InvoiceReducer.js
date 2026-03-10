const initialState = {
  invoices: [],
  selectedInvoice: null,
  loading: false,
  actionLoading: false,
  error: null
};

const InvoiceReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'FETCH_INVOICES_REQUEST':
      return { ...state, loading: true, error: null };
    case 'FETCH_INVOICES_SUCCESS':
      return { ...state, loading: false, invoices: action.payload, error: null };
    case 'FETCH_INVOICES_FAILURE':
      return { ...state, loading: false, error: action.payload };

    case 'FETCH_INVOICE_BY_ID_REQUEST':
      return { ...state, actionLoading: true, error: null };
    case 'FETCH_INVOICE_BY_ID_SUCCESS':
      return { ...state, actionLoading: false, selectedInvoice: action.payload, error: null };
    case 'FETCH_INVOICE_BY_ID_FAILURE':
      return { ...state, actionLoading: false, error: action.payload };

    case 'ADD_INVOICE_REQUEST':
    case 'UPDATE_INVOICE_REQUEST':
    case 'DELETE_INVOICE_REQUEST':
      return { ...state, actionLoading: true, error: null };

    case 'ADD_INVOICE_SUCCESS':
      return {
        ...state,
        actionLoading: false,
        invoices: [action.payload, ...state.invoices],
        error: null
      };

    case 'UPDATE_INVOICE_SUCCESS':
      return {
        ...state,
        actionLoading: false,
        invoices: state.invoices.map((inv) => (inv.id === action.payload.id ? action.payload : inv)),
        selectedInvoice: action.payload,
        error: null
      };

    case 'DELETE_INVOICE_SUCCESS':
      return {
        ...state,
        actionLoading: false,
        invoices: state.invoices.filter((inv) => inv.id !== action.payload),
        error: null
      };

    case 'ADD_INVOICE_FAILURE':
    case 'UPDATE_INVOICE_FAILURE':
    case 'DELETE_INVOICE_FAILURE':
      return { ...state, actionLoading: false, error: action.payload };

    case 'CLEAR_SELECTED_INVOICE':
      return { ...state, selectedInvoice: null };

    default:
      return state;
  }
};

export default InvoiceReducer;
