import { toast } from 'sonner';
import axiosInstance from '../axiosInstance';
const API_ENDPOINT = import.meta.env.VITE_APP_API_URL;

export const Fetch_Petty_Cashes = () => async (dispatch) => {
  dispatch({ type: 'FETCH_PETTY_CASHES_REQUEST' });
  try {
    const response = await axiosInstance.get(`${API_ENDPOINT}PettyCash`);
    if (response.data.success) {
      dispatch({
        type: 'FETCH_PETTY_CASHES_SUCCESS',
        payload: response.data.data
      });
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch petty cashes';
    dispatch({ type: 'FETCH_PETTY_CASHES_FAILURE', payload: errorMessage });
    toast.error(errorMessage);
  }
};
export const Fetch_Petty_Cash_By_Id = (id) => async (dispatch) => {
  dispatch({ type: 'FETCH_PETTY_CASH_BY_ID_REQUEST' });
  try {
    const response = await axiosInstance.get(`${API_ENDPOINT}PettyCash/${id}`);
    if (response.data.success) {
      const dta = [response.data.data];
      dispatch({
        type: 'FETCH_PETTY_CASH_BY_ID_SUCCESS',
        payload: dta
      });
      return dta;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch petty cash';
    dispatch({ type: 'FETCH_PETTY_CASH_BY_ID_FAILURE', payload: errorMessage });
    toast.error(errorMessage);
    return null;
  }
};
export const Add_Petty_Cash = (data) => async (dispatch) => {
  dispatch({ type: 'ADD_PETTY_CASH_REQUEST' });
  try {
    const response = await axiosInstance.post(`${API_ENDPOINT}PettyCash`, data);
    if (response.data.success) {
      dispatch({
        type: 'ADD_PETTY_CASH_SUCCESS',
        payload: response.data.data
      });
      toast.success(response.data.message || 'Petty cash added successfully');
      return true;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to add petty cash';
    dispatch({ type: 'ADD_PETTY_CASH_FAILURE', payload: errorMessage });
    toast.error(errorMessage);
    return false;
  }
};
export const Update_Petty_Cash = (id, data) => async (dispatch) => {
  dispatch({ type: 'UPDATE_PETTY_CASH_REQUEST' });
  try {
    const response = await axiosInstance.put(`${API_ENDPOINT}PettyCash/${id}`, data);
    if (response.data.success) {
      dispatch({
        type: 'UPDATE_PETTY_CASH_SUCCESS',
        payload: response.data.message
      });
      toast.success(response.data.message || 'Petty cash updated successfully');
      return true;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to update petty cash';
    dispatch({ type: 'UPDATE_PETTY_CASH_FAILURE', payload: errorMessage });
    toast.error(errorMessage);
    return false;
  }
};
export const Delete_Petty_Cash = (id) => async (dispatch) => {
  dispatch({ type: 'DELETE_PETTY_CASH_REQUEST' });
  try {
    const response = await axiosInstance.delete(`${API_ENDPOINT}PettyCash/${id}`);
    if (response.data.success) {
      dispatch({
        type: 'DELETE_PETTY_CASH_SUCCESS',
        payload: id
      });
      toast.success(response.data.message || 'Petty cash deleted successfully');
      return true;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to delete petty cash';
    dispatch({ type: 'DELETE_PETTY_CASH_FAILURE', payload: errorMessage });
    toast.error(errorMessage);
    return false;
  }
};
