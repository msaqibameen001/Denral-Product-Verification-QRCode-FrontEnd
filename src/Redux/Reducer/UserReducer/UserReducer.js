const initialState = {
  users: [],
  loading: false,
  error: null,
  actionLoading: false
};

const UserReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'FETCH_USERS_REQUEST':
      return { ...state, loading: true, error: null };
    case 'FETCH_USERS_SUCCESS':
      return { ...state, loading: false, users: action.payload, error: null };
    case 'FETCH_USERS_FAILURE':
      return { ...state, loading: false, error: action.payload };

    case 'ADD_USER_REQUEST':
    case 'UPDATE_USER_REQUEST':
    case 'DELETE_USER_REQUEST':
      return { ...state, actionLoading: true, error: null };

    case 'ADD_USER_SUCCESS':
      return {
        ...state,
        actionLoading: false,
        users: [...state.users, action.payload],
        error: null
      };

    case 'UPDATE_USER_SUCCESS':
      return {
        ...state,
        actionLoading: false,
        users: state.users.map((u) => (u.userId === action.payload.userId ? action.payload : u)),
        error: null
      };

    case 'DELETE_USER_SUCCESS':
      return {
        ...state,
        actionLoading: false,
        users: state.users.filter((u) => u.userId !== action.payload),
        error: null
      };

    case 'ADD_USER_FAILURE':
    case 'UPDATE_USER_FAILURE':
    case 'DELETE_USER_FAILURE':
      return { ...state, actionLoading: false, error: action.payload };

    default:
      return state;
  }
};

export default UserReducer;
