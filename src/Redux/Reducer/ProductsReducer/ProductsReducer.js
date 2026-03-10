const initialState = {
  products: [],
  loading: false,
  error: null,
  actionLoading: false,
  selectedProduct: null
};

const ProductsReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'FETCH_PRODUCTS_REQUEST':
      return { ...state, loading: true, error: null };
    case 'FETCH_PRODUCTS_SUCCESS':
      return { ...state, loading: false, products: action.payload, error: null };
    case 'FETCH_PRODUCTS_FAILURE':
      return { ...state, loading: false, error: action.payload };

    case 'FETCH_PRODUCT_BY_ID_REQUEST':
      return { ...state, actionLoading: true, error: null };
    case 'FETCH_PRODUCT_BY_ID_SUCCESS':
      return { ...state, actionLoading: false, selectedProduct: action.payload, error: null };
    case 'FETCH_PRODUCT_BY_ID_FAILURE':
      return { ...state, actionLoading: false, error: action.payload };

    case 'ADD_PRODUCT_REQUEST':
    case 'UPDATE_PRODUCT_REQUEST':
    case 'DELETE_PRODUCT_REQUEST':
      return { ...state, actionLoading: true, error: null };

    case 'ADD_PRODUCT_SUCCESS':
      return {
        ...state,
        actionLoading: false,
        products: [action.payload, ...state.products],
        error: null
      };

    case 'UPDATE_PRODUCT_SUCCESS':
      return {
        ...state,
        actionLoading: false,
        products: state.products.map((p) => (p.id === action.payload.id ? action.payload : p)),
        selectedProduct: action.payload,
        error: null
      };

    case 'DELETE_PRODUCT_SUCCESS':
      return {
        ...state,
        actionLoading: false,
        products: state.products.filter((p) => p.id !== action.payload),
        error: null
      };

    case 'ADD_PRODUCT_FAILURE':
    case 'UPDATE_PRODUCT_FAILURE':
    case 'DELETE_PRODUCT_FAILURE':
      return { ...state, actionLoading: false, error: action.payload };

    default:
      return state;
  }
};

export default ProductsReducer;
