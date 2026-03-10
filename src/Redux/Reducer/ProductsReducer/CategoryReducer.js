const initialState = {
  categories: [],
  selectedCategory: null,
  loading: false,
  actionLoading: false,
  error: null
};

const CategoryReducer = (state = initialState, action) => {
  switch (action.type) {
    // Fetch Categories
    case 'FETCH_CATEGORIES_M_REQUEST':
      return { ...state, loading: true, error: null };
    case 'FETCH_CATEGORIES_M_SUCCESS':
      return { ...state, loading: false, categories: action.payload, error: null };
    case 'FETCH_CATEGORIES_M_FAILURE':
      return { ...state, loading: false, error: action.payload };

    // Get Category by ID
    case 'GET_CATEGORY_REQUEST':
      return { ...state, actionLoading: true, error: null };
    case 'GET_CATEGORY_SUCCESS':
      return { ...state, actionLoading: false, selectedCategory: action.payload, error: null };
    case 'GET_CATEGORY_FAILURE':
      return { ...state, actionLoading: false, error: action.payload };

    // Create Category
    case 'CREATE_CATEGORY_REQUEST':
      return { ...state, actionLoading: true, error: null };
    case 'CREATE_CATEGORY_SUCCESS':
      return {
        ...state,
        actionLoading: false,
        categories: [action.payload, ...state.categories],
        error: null
      };
    case 'CREATE_CATEGORY_FAILURE':
      return { ...state, actionLoading: false, error: action.payload };

    // Update Category
    case 'UPDATE_CATEGORY_REQUEST':
      return { ...state, actionLoading: true, error: null };
    case 'UPDATE_CATEGORY_SUCCESS':
      return {
        ...state,
        actionLoading: false,
        categories: state.categories.map((c) => (c.id === action.payload.id ? action.payload : c)),
        selectedCategory: action.payload,
        error: null
      };
    case 'UPDATE_CATEGORY_FAILURE':
      return { ...state, actionLoading: false, error: action.payload };

    // Delete Category
    case 'DELETE_CATEGORY_REQUEST':
      return { ...state, actionLoading: true, error: null };
    case 'DELETE_CATEGORY_SUCCESS':
      return {
        ...state,
        actionLoading: false,
        categories: state.categories.filter((c) => c.id !== action.payload),
        error: null
      };
    case 'DELETE_CATEGORY_FAILURE':
      return { ...state, actionLoading: false, error: action.payload };

    default:
      return state;
  }
};

export default CategoryReducer;
