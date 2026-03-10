const initialState = {
  otherExpenses: [],
  loading: false,
  error: null,
  actionLoading: false
};

const OtherExpenseReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'FETCH_OTHER_EXPENSES_REQUEST':
      return { ...state, loading: true, error: null };
    case 'FETCH_OTHER_EXPENSES_SUCCESS':
      return { ...state, loading: false, otherExpenses: action.payload, error: null };
    case 'FETCH_OTHER_EXPENSES_FAILURE':
      return { ...state, loading: false, error: action.payload };

    case 'ADD_OTHER_EXPENSE_REQUEST':
    case 'UPDATE_OTHER_EXPENSE_REQUEST':
    case 'DELETE_OTHER_EXPENSE_REQUEST':
      return { ...state, actionLoading: true, error: null };

    case 'ADD_OTHER_EXPENSE_SUCCESS':
      return {
        ...state,
        actionLoading: false,
        otherExpenses: [...state.otherExpenses, action.payload],
        error: null
      };

    case 'UPDATE_OTHER_EXPENSE_SUCCESS':
      return {
        ...state,
        actionLoading: false,
        otherExpenses: state.otherExpenses.map((e) => (e.id === action.payload.id ? action.payload : e)),
        error: null
      };

    case 'DELETE_OTHER_EXPENSE_SUCCESS':
      return {
        ...state,
        actionLoading: false,
        otherExpenses: state.otherExpenses.filter((e) => e.id !== action.payload),
        error: null
      };

    case 'ADD_OTHER_EXPENSE_FAILURE':
    case 'UPDATE_OTHER_EXPENSE_FAILURE':
    case 'DELETE_OTHER_EXPENSE_FAILURE':
      return { ...state, actionLoading: false, error: action.payload };

    default:
      return state;
  }
};

export default OtherExpenseReducer;