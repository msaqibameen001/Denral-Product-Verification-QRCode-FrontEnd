import axiosInstance from '../axiosInstance';
import { toast } from 'sonner';

export const Generate_QR_Preview = (previewData) => async (dispatch) => {
  try {
    dispatch({ type: 'GENERATE_QR_PREVIEW_REQUEST' });

    const response = await axiosInstance.post('QRBatch/preview', previewData);

    dispatch({
      type: 'GENERATE_QR_PREVIEW_SUCCESS',
      payload: response?.data || null
    });

    toast.success('QR Preview generated successfully');
    return response?.data;
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Failed to generate preview';
    dispatch({ type: 'GENERATE_QR_PREVIEW_FAILURE', payload: errorMessage });
    toast.error(errorMessage);
    throw error;
  }
};

export const Confirm_And_Save_Batch = (batchData) => async (dispatch) => {
  try {
    dispatch({ type: 'CONFIRM_BATCH_REQUEST' });

    const response = await axiosInstance.post('QRBatch/confirm', batchData);

    dispatch({
      type: 'CONFIRM_BATCH_SUCCESS',
      payload: response?.data
    });

    toast.success('Batch saved successfully');
    return response?.data;
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Failed to save batch';
    dispatch({ type: 'CONFIRM_BATCH_FAILURE', payload: errorMessage });
    toast.error(errorMessage);
    throw error;
  }
};

export const Fetch_All_Batches = () => async (dispatch) => {
  try {
    dispatch({ type: 'FETCH_BATCHES_REQUEST' });

    const response = await axiosInstance.get('QRBatch');

    dispatch({
      type: 'FETCH_BATCHES_SUCCESS',
      payload: response?.data || []
    });

    return response?.data || [];
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Failed to fetch batches';
    dispatch({ type: 'FETCH_BATCHES_FAILURE', payload: errorMessage });
    toast.error(errorMessage);
    return [];
  }
};

export const Get_Batch_Details = (batchId) => async (dispatch) => {
  try {
    dispatch({ type: 'GET_BATCH_DETAILS_REQUEST' });

    const response = await axiosInstance.get(`QRBatch/${batchId}`);

    dispatch({
      type: 'GET_BATCH_DETAILS_SUCCESS',
      payload: response?.data
    });

    return response?.data;
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Failed to fetch batch details';
    dispatch({ type: 'GET_BATCH_DETAILS_FAILURE', payload: errorMessage });
    toast.error(errorMessage);
    return null;
  }
};

export const Get_Serial_Details = (serialNo) => async (dispatch) => {
  try {
    dispatch({ type: 'GET_SERIAL_DETAILS_REQUEST' });

    const response = await axiosInstance.get(`QRBatch/serial/${serialNo}`);

    dispatch({
      type: 'GET_SERIAL_DETAILS_SUCCESS',
      payload: response?.data
    });

    return response?.data;
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Serial number not found';
    dispatch({ type: 'GET_SERIAL_DETAILS_FAILURE', payload: errorMessage });
    // toast.error(errorMessage);
    return null;
  }
};

export const Generate_Serial_Numbers = (count) => async (dispatch) => {
  try {
    dispatch({ type: 'GENERATE_SERIALS_REQUEST' });

    const response = await axiosInstance.get(`SerialGenerator/generate/${count}`);

    dispatch({
      type: 'GENERATE_SERIALS_SUCCESS',
      payload: response?.data?.serials || []
    });

    return response?.data?.serials || [];
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Failed to generate serial numbers';
    dispatch({ type: 'GENERATE_SERIALS_FAILURE', payload: errorMessage });
    toast.error(errorMessage);
    return [];
  }
};

export const Clear_QR_Preview = () => (dispatch) => {
  dispatch({ type: 'CLEAR_QR_PREVIEW' });
};
