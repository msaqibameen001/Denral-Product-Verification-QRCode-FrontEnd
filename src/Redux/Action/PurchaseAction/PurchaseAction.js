import { toast } from 'sonner';
import axiosInstance from '../axiosInstance';
const API_ENDPOINT = import.meta.env.VITE_APP_API_URL;

export const Fetch_Purchases = () => async (dispatch) => {
  dispatch({ type: 'FETCH_PURCHASES_REQUEST' });
  try {
    const response = await axiosInstance.get(`${API_ENDPOINT}Purchase`);
    if (response.data.success) {
      dispatch({
        type: 'FETCH_PURCHASES_SUCCESS',
        payload: response.data.data
      });
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch purchases';
    dispatch({ type: 'FETCH_PURCHASES_FAILURE', payload: errorMessage });
    toast.error(errorMessage);
  }
};
export const Fetch_Purchase_By_Id = (id) => async (dispatch) => {
  dispatch({ type: 'FETCH_PURCHASE_BY_ID_REQUEST' });
  try {
    const response = await axiosInstance.get(`${API_ENDPOINT}Purchase/${id}`);
    if (response.data.success) {
      dispatch({
        type: 'FETCH_PURCHASE_BY_ID_SUCCESS',
        payload: response.data.data
      });
      return response.data.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch purchase';
    dispatch({ type: 'FETCH_PURCHASE_BY_ID_FAILURE', payload: errorMessage });
    toast.error(errorMessage);
    return null;
  }
};
export const Add_Purchase = (data) => async (dispatch) => {
  dispatch({ type: 'ADD_PURCHASE_REQUEST' });
  try {
    const purchaseData = {
      supplierId: data.supplierId,
      trDate: data.trDate,
      price: data.price,
      qty: data.qty,
      gatePassNo: data.gatePassNo
    };

    const response = await axiosInstance.post(`${API_ENDPOINT}Purchase`, purchaseData);
    if (response.data.success) {
      dispatch({
        type: 'ADD_PURCHASE_SUCCESS',
        payload: response.data.data
      });
      toast.success(response.data.message || 'Purchase added successfully');
      return true;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to add purchase';
    dispatch({ type: 'ADD_PURCHASE_FAILURE', payload: errorMessage });
    toast.error(errorMessage);
    return false;
  }
};
export const Update_Purchase = (id, data) => async (dispatch) => {
  dispatch({ type: 'UPDATE_PURCHASE_REQUEST' });
  try {
    const purchaseData = {
      supplierId: data.supplierId,
      trDate: data.trDate,
      price: data.price,
      qty: data.qty,
      gatePassNo: data.gatePassNo
    };

    const response = await axiosInstance.put(`${API_ENDPOINT}Purchase/${id}`, purchaseData);
    if (response.data.success) {
      dispatch({
        type: 'UPDATE_PURCHASE_SUCCESS',
        payload: response.data.data
      });
      toast.success(response.data.message || 'Purchase updated successfully');
      return true;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to update purchase';
    dispatch({ type: 'UPDATE_PURCHASE_FAILURE', payload: errorMessage });
    toast.error(errorMessage);
    return false;
  }
};
export const Delete_Purchase = (id) => async (dispatch) => {
  dispatch({ type: 'DELETE_PURCHASE_REQUEST' });
  try {
    const response = await axiosInstance.delete(`${API_ENDPOINT}Purchase/${id}`);
    if (response.data.success) {
      dispatch({
        type: 'DELETE_PURCHASE_SUCCESS',
        payload: id
      });
      toast.success(response.data.message || 'Purchase deleted successfully');
      return true;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to delete purchase';
    dispatch({ type: 'DELETE_PURCHASE_FAILURE', payload: errorMessage });
    toast.error(errorMessage);
    return false;
  }
};
