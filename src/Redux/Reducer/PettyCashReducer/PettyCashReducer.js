const initialState = {
  pettyCashes: [],
  loading: false,
  error: null,
  actionLoading: false,
  selectedPettyCash: null
};

const PettyCashReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'FETCH_PETTY_CASHES_REQUEST':
      return { ...state, loading: true, error: null };
    case 'FETCH_PETTY_CASHES_SUCCESS':
      return { ...state, loading: false, pettyCashes: action.payload, error: null };
    case 'FETCH_PETTY_CASHES_FAILURE':
      return { ...state, loading: false, error: action.payload };

    case 'FETCH_PETTY_CASH_BY_ID_REQUEST':
      return { ...state, actionLoading: true, error: null };
    case 'FETCH_PETTY_CASH_BY_ID_SUCCESS':
      return { ...state, actionLoading: false, selectedPettyCash: action.payload, error: null };
    case 'FETCH_PETTY_CASH_BY_ID_FAILURE':
      return { ...state, actionLoading: false, error: action.payload };

    case 'ADD_PETTY_CASH_REQUEST':
    case 'UPDATE_PETTY_CASH_REQUEST':
    case 'DELETE_PETTY_CASH_REQUEST':
      return { ...state, actionLoading: true, error: null };

    case 'ADD_PETTY_CASH_SUCCESS':
      return {
        ...state,
        actionLoading: false,
        pettyCashes: [action.payload, ...state.pettyCashes],
        error: null
      };

    case 'UPDATE_PETTY_CASH_SUCCESS':
      return {
        ...state,
        actionLoading: false,
        // pettyCashes: state.pettyCashes.map((p) => (p.id === action.payload.id ? action.payload : p)),
        selectedPettyCash: action.payload,
        error: null
      };

    case 'DELETE_PETTY_CASH_SUCCESS':
      return {
        ...state,
        actionLoading: false,
        pettyCashes: state.pettyCashes.filter((p) => p.id !== action.payload),
        error: null
      };

    case 'ADD_PETTY_CASH_FAILURE':
    case 'UPDATE_PETTY_CASH_FAILURE':
    case 'DELETE_PETTY_CASH_FAILURE':
      return { ...state, actionLoading: false, error: action.payload };

    default:
      return state;
  }
};

export default PettyCashReducer;
