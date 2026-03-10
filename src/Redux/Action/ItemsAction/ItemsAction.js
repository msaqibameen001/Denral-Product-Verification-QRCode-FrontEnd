import { toast } from 'sonner';
import axiosInstance from '../axiosInstance';
const API_ENDPOINT = import.meta.env.VITE_APP_API_URL;

export const Fetch_Items = () => async (dispatch) => {
  dispatch({ type: 'FETCH_ITEMS_REQUEST' });
  try {
    const response = await axiosInstance.get(`${API_ENDPOINT}Item`);
    if (response.data.success) {
      dispatch({
        type: 'FETCH_ITEMS_SUCCESS',
        payload: response.data.data
      });
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch items';
    dispatch({ type: 'FETCH_ITEMS_FAILURE', payload: errorMessage });
    toast.error(errorMessage);
  }
};
export const Fetch_Item_By_Id = (id) => async (dispatch) => {
  dispatch({ type: 'FETCH_ITEM_BY_ID_REQUEST' });
  try {
    const response = await axiosInstance.get(`${API_ENDPOINT}Item/${id}`);
    if (response.data.success) {
      const dta = [response.data.data];
      dispatch({
        type: 'FETCH_ITEM_BY_ID_SUCCESS',
        payload: dta
      });
      return dta;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch item';
    dispatch({ type: 'FETCH_ITEM_BY_ID_FAILURE', payload: errorMessage });
    toast.error(errorMessage);
    return null;
  }
};
export const Add_Item = (data) => async (dispatch) => {
  dispatch({ type: 'ADD_ITEM_REQUEST' });
  try {
    const response = await axiosInstance.post(`${API_ENDPOINT}Item`, data);
    if (response.data.success) {
      dispatch({
        type: 'ADD_ITEM_SUCCESS',
        payload: response.data.data
      });
      toast.success(response.data.message || 'Item added successfully');
      return true;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to add item';
    dispatch({ type: 'ADD_ITEM_FAILURE', payload: errorMessage });
    toast.error(errorMessage);
    return false;
  }
};
export const Update_Item = (id, data) => async (dispatch) => {
  dispatch({ type: 'UPDATE_ITEM_REQUEST' });
  try {
    const response = await axiosInstance.put(`${API_ENDPOINT}Item/${id}`, data);
    if (response.data.success) {
      dispatch({
        type: 'UPDATE_ITEM_SUCCESS',
        payload: response.data.data
      });
      toast.success(response.data.message || 'Item updated successfully');
      return true;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to update item';
    dispatch({ type: 'UPDATE_ITEM_FAILURE', payload: errorMessage });
    toast.error(errorMessage);
    return false;
  }
};
export const Delete_Item = (id) => async (dispatch) => {
  dispatch({ type: 'DELETE_ITEM_REQUEST' });
  try {
    const response = await axiosInstance.delete(`${API_ENDPOINT}Item/${id}`);
    if (response.data.success) {
      dispatch({
        type: 'DELETE_ITEM_SUCCESS',
        payload: id
      });
      toast.success(response.data.message || 'Item deleted successfully');
      return true;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to delete item';
    dispatch({ type: 'DELETE_ITEM_FAILURE', payload: errorMessage });
    toast.error(errorMessage);
    return false;
  }
};
