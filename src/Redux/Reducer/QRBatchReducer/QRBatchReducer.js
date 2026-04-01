const initialState = {
  batches: [],
  previewData: null,
  selectedBatch: null,
  serialDetails: null,
  loading: false,
  actionLoading: false,
  previewLoading: false,
  error: null
};

const QRBatchReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'GENERATE_QR_PREVIEW_REQUEST':
      return { ...state, previewLoading: true, error: null };
    case 'GENERATE_QR_PREVIEW_SUCCESS':
      return { ...state, previewLoading: false, previewData: action.payload, error: null };
    case 'GENERATE_QR_PREVIEW_FAILURE':
      return { ...state, previewLoading: false, error: action.payload };

    case 'CONFIRM_BATCH_REQUEST':
      return { ...state, actionLoading: true, error: null };
    case 'CONFIRM_BATCH_SUCCESS':
      return {
        ...state,
        actionLoading: false,
        batches: [action.payload, ...state.batches],
        // previewData: null,
        error: null
      };
    case 'CONFIRM_BATCH_FAILURE':
      return { ...state, actionLoading: false, error: action.payload };

    case 'FETCH_BATCHES_REQUEST':
      return { ...state, loading: true, error: null };
    case 'FETCH_BATCHES_SUCCESS':
      return { ...state, loading: false, batches: action.payload, error: null };
    case 'FETCH_BATCHES_FAILURE':
      return { ...state, loading: false, error: action.payload };

    case 'GET_BATCH_DETAILS_REQUEST':
      return { ...state, actionLoading: true, error: null };
    case 'GET_BATCH_DETAILS_SUCCESS':
      return { ...state, actionLoading: false, selectedBatch: action.payload, error: null };
    case 'GET_BATCH_DETAILS_FAILURE':
      return { ...state, actionLoading: false, error: action.payload };

    case 'GET_SERIAL_DETAILS_REQUEST':
      return { ...state, actionLoading: true, serialDetails: null, error: null };
    case 'GET_SERIAL_DETAILS_SUCCESS':
      return { ...state, actionLoading: false, serialDetails: action.payload, error: null };
    case 'GET_SERIAL_DETAILS_FAILURE':
      return { ...state, actionLoading: false, error: action.payload };

    case 'GENERATE_SERIALS_REQUEST':
      return { ...state, actionLoading: true, error: null };
    case 'GENERATE_SERIALS_SUCCESS':
      return { ...state, actionLoading: false, error: null };
    case 'GENERATE_SERIALS_FAILURE':
      return { ...state, actionLoading: false, error: action.payload };

    case 'CLEAR_QR_PREVIEW':
      return { ...state, previewData: null };

    default:
      return state;
  }
};

export default QRBatchReducer;
