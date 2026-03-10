const initialState = {
  purchases: [],
  loading: false,
  error: null,
  actionLoading: false,
  selectedPurchase: null
};

const PurchaseReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'FETCH_PURCHASES_REQUEST':
      return { ...state, loading: true, error: null };
    case 'FETCH_PURCHASES_SUCCESS':
      return { ...state, loading: false, purchases: action.payload, error: null };
    case 'FETCH_PURCHASES_FAILURE':
      return { ...state, loading: false, error: action.payload };

    case 'FETCH_PURCHASE_BY_ID_REQUEST':
      return { ...state, actionLoading: true, error: null };
    case 'FETCH_PURCHASE_BY_ID_SUCCESS':
      return { ...state, actionLoading: false, selectedPurchase: action.payload, error: null };
    case 'FETCH_PURCHASE_BY_ID_FAILURE':
      return { ...state, actionLoading: false, error: action.payload };

    case 'ADD_PURCHASE_REQUEST':
    case 'UPDATE_PURCHASE_REQUEST':
    case 'DELETE_PURCHASE_REQUEST':
      return { ...state, actionLoading: true, error: null };

    case 'ADD_PURCHASE_SUCCESS':
      return {
        ...state,
        actionLoading: false,
        purchases: [action.payload, ...state.purchases],
        error: null
      };

    case 'UPDATE_PURCHASE_SUCCESS':
      return {
        ...state,
        actionLoading: false,
        purchases: state.purchases.map((p) => 
          p.purchaseId === action.payload.purchaseId ? action.payload : p
        ),
        selectedPurchase: action.payload,
        error: null
      };

    case 'DELETE_PURCHASE_SUCCESS':
      return {
        ...state,
        actionLoading: false,
        purchases: state.purchases.filter((p) => p.purchaseId !== action.payload),
        error: null
      };

    case 'ADD_PURCHASE_FAILURE':
    case 'UPDATE_PURCHASE_FAILURE':
    case 'DELETE_PURCHASE_FAILURE':
      return { ...state, actionLoading: false, error: action.payload };

    default:
      return state;
  }
};

export default PurchaseReducer;