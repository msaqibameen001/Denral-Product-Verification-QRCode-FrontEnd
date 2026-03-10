const initialState = {
  items: [],
  loading: false,
  error: null,
  actionLoading: false,
  selectedItem: null
};

const ItemReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'FETCH_ITEMS_REQUEST':
      return { ...state, loading: true, error: null };
    case 'FETCH_ITEMS_SUCCESS':
      return { ...state, loading: false, items: action.payload, error: null };
    case 'FETCH_ITEMS_FAILURE':
      return { ...state, loading: false, error: action.payload };

    case 'FETCH_ITEM_BY_ID_REQUEST':
      return { ...state, actionLoading: true, error: null };
    case 'FETCH_ITEM_BY_ID_SUCCESS':
      return { ...state, actionLoading: false, selectedItem: action.payload, error: null };
    case 'FETCH_ITEM_BY_ID_FAILURE':
      return { ...state, actionLoading: false, error: action.payload };

    case 'ADD_ITEM_REQUEST':
    case 'UPDATE_ITEM_REQUEST':
    case 'DELETE_ITEM_REQUEST':
      return { ...state, actionLoading: true, error: null };

    case 'ADD_ITEM_SUCCESS':
      return {
        ...state,
        actionLoading: false,
        items: [action.payload, ...state.items],
        error: null
      };

    case 'UPDATE_ITEM_SUCCESS':
      return {
        ...state,
        actionLoading: false,
        items: state.items.map((p) => (p.itemId === action.payload.itemId ? action.payload : p)),
        selectedItem: action.payload,
        error: null
      };

    case 'DELETE_ITEM_SUCCESS':
      return {
        ...state,
        actionLoading: false,
        items: state.items.filter((p) => p.itemId !== action.payload),
        error: null
      };

    case 'ADD_ITEM_FAILURE':
    case 'UPDATE_ITEM_FAILURE':
    case 'DELETE_ITEM_FAILURE':
      return { ...state, actionLoading: false, error: action.payload };

    default:
      return state;
  }
};

export default ItemReducer;
