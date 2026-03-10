const authInitialState = {
  user: [],
  error: null
};

const AuthReducer = (state = authInitialState, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return { ...state, user: action.payload, error: null };
    case 'LOGIN_FAILURE':
      return { ...state, error: action.payload, user: null };
    default:
      return state;
  }
};

export default AuthReducer;
