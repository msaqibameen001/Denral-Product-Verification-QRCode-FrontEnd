const initialState = {
  partyTypes: [],
  loading: false,
  error: null
};

const PartyTypeReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'FETCH_PARTY_TYPES_REQUEST':
      return { ...state, loading: true, error: null };
    case 'FETCH_PARTY_TYPES_SUCCESS':
      return { ...state, loading: false, partyTypes: action.payload, error: null };
    case 'FETCH_PARTY_TYPES_FAILURE':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default PartyTypeReducer;