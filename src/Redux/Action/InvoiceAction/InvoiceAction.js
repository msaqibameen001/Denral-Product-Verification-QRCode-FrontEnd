import { toast } from 'sonner';
import axiosInstance from '../axiosInstance';

const API_ENDPOINT = import.meta.env.VITE_APP_API_URL;

export const Fetch_Invoices = () => async (dispatch) => {
  dispatch({ type: 'FETCH_INVOICES_REQUEST' });
  try {
    const response = await axiosInstance.get(`${API_ENDPOINT}Invoice`);
    if (response.data.success) {
      dispatch({
        type: 'FETCH_INVOICES_SUCCESS',
        payload: response.data.data
      });
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch invoices';
    dispatch({ type: 'FETCH_INVOICES_FAILURE', payload: errorMessage });
    toast.error(errorMessage);
  }
};
export const Fetch_Invoice_By_Id = (id) => async (dispatch) => {
  dispatch({ type: 'FETCH_INVOICE_BY_ID_REQUEST' });
  try {
    const response = await axiosInstance.get(`${API_ENDPOINT}Invoice/${id}`);
    if (response.data.success) {
      dispatch({
        type: 'FETCH_INVOICE_BY_ID_SUCCESS',
        payload: response.data.data
      });
      return response.data.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch invoice';
    dispatch({ type: 'FETCH_INVOICE_BY_ID_FAILURE', payload: errorMessage });
    toast.error(errorMessage);
    return null;
  }
};
export const Add_Invoice = (data) => async (dispatch) => {
  dispatch({ type: 'ADD_INVOICE_REQUEST' });
  try {
    const response = await axiosInstance.post(`${API_ENDPOINT}Invoice`, data);
    if (response.data.success) {
      dispatch({
        type: 'ADD_INVOICE_SUCCESS',
        payload: response.data.data
      });
      toast.success(response.data.message || 'Invoice created successfully');
      return { success: true, data: response.data.data };
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to create invoice';
    dispatch({ type: 'ADD_INVOICE_FAILURE', payload: errorMessage });
    toast.error(errorMessage);
    return { success: false, error: errorMessage };
  }
};
export const Update_Invoice = (id, data) => async (dispatch) => {
  dispatch({ type: 'UPDATE_INVOICE_REQUEST' });
  try {
    const response = await axiosInstance.put(`${API_ENDPOINT}Invoice/${id}`, data);
    if (response.data.success) {
      dispatch({
        type: 'UPDATE_INVOICE_SUCCESS',
        payload: response.data.data
      });
      toast.success(response.data.message || 'Invoice updated successfully');
      return { success: true, data: response.data.data };
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to update invoice';
    dispatch({ type: 'UPDATE_INVOICE_FAILURE', payload: errorMessage });
    toast.error(errorMessage);
    return { success: false, error: errorMessage };
  }
};
export const Delete_Invoice = (id) => async (dispatch) => {
  dispatch({ type: 'DELETE_INVOICE_REQUEST' });
  try {
    const response = await axiosInstance.delete(`${API_ENDPOINT}Invoice/${id}`);
    if (response.data.success) {
      dispatch({
        type: 'DELETE_INVOICE_SUCCESS',
        payload: id
      });
      toast.success(response.data.message || 'Invoice deleted successfully');
      return true;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to delete invoice';
    dispatch({ type: 'DELETE_INVOICE_FAILURE', payload: errorMessage });
    toast.error(errorMessage);
    return false;
  }
};
