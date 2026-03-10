const initialState = {
  customers: [],
  loading: false,
  error: null,
  actionLoading: false
};

const CustomerReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'FETCH_CUSTOMERS_REQUEST':
      return { ...state, loading: true, error: null };
    case 'FETCH_CUSTOMERS_SUCCESS':
      return { ...state, loading: false, customers: action.payload, error: null };
    case 'FETCH_CUSTOMERS_FAILURE':
      return { ...state, loading: false, error: action.payload };

    case 'ADD_CUSTOMER_REQUEST':
    case 'UPDATE_CUSTOMER_REQUEST':
    case 'DELETE_CUSTOMER_REQUEST':
      return { ...state, actionLoading: true, error: null };

    case 'ADD_CUSTOMER_SUCCESS':
      return {
        ...state,
        actionLoading: false,
        customers: [...state.customers, action.payload],
        error: null
      };

    case 'UPDATE_CUSTOMER_SUCCESS':
      return {
        ...state,
        actionLoading: false,
        customers: state.customers.map((c) => (c.id === action.payload.id ? action.payload : c)),
        error: null
      };

    case 'DELETE_CUSTOMER_SUCCESS':
      return {
        ...state,
        actionLoading: false,
        customers: state.customers.filter((c) => c.id !== action.payload),
        error: null
      };

    case 'ADD_CUSTOMER_FAILURE':
    case 'UPDATE_CUSTOMER_FAILURE':
    case 'DELETE_CUSTOMER_FAILURE':
      return { ...state, actionLoading: false, error: action.payload };

    default:
      return state;
  }
};

export default CustomerReducer;