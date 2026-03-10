import { toast } from 'sonner';
const API_ENDPOINT = import.meta.env.VITE_APP_API_URL;
import axiosInstance from '../axiosInstance';

export const Fetch_Products = () => async (dispatch) => {
  dispatch({ type: 'FETCH_PRODUCTS_REQUEST' });
  try {
    const response = await axiosInstance.get(`${API_ENDPOINT}Products`);
      dispatch({
        type: 'FETCH_PRODUCTS_SUCCESS',
        payload: response.data
      });
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch Products';
    dispatch({ type: 'FETCH_PRODUCTS_FAILURE', payload: errorMessage });
    toast.error(errorMessage);
  }
};
export const Fetch_Product_By_Id = (id) => async (dispatch) => {
  dispatch({ type: 'FETCH_PRODUCT_BY_ID_REQUEST' });
  try {
    const response = await axiosInstance.get(`${API_ENDPOINT}Products/${id}`);
    if (response.data.success) {
      const dta = [response.data];
      dispatch({
        type: 'FETCH_PRODUCT_BY_ID_SUCCESS',
        payload: dta
      });
      return dta;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch Products';
    dispatch({ type: 'FETCH_PRODUCT_BY_ID_FAILURE', payload: errorMessage });
    toast.error(errorMessage);
    return null;
  }
};
export const Add_Product = (data) => async (dispatch) => {
  dispatch({ type: 'ADD_PRODUCT_REQUEST' });
  try {
    const response = await axiosInstance.post(`${API_ENDPOINT}Products`, data);
      dispatch({
        type: 'ADD_PRODUCT_SUCCESS',
        payload: response?.data
      });
      toast.success('Product added successfully');
      return true;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to add Product';
    dispatch({ type: 'ADD_PRODUCT_FAILURE', payload: errorMessage });
    toast.error(errorMessage);
    return false;
  }
};
export const Update_Product = (id, data) => async (dispatch) => {
  dispatch({ type: 'UPDATE_PRODUCT_REQUEST' });
  try {
    const response = await axiosInstance.put(`${API_ENDPOINT}Products/${id}`, data);
      dispatch({
        type: 'UPDATE_PRODUCT_SUCCESS',
        payload: response?.data
      });
      toast.success('Product updated successfully');
      return true;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to update Product';
    dispatch({ type: 'UPDATE_PRODUCT_FAILURE', payload: errorMessage });
    toast.error(errorMessage);
    return false;
  }
};
export const Delete_Product = (id) => async (dispatch) => {
  dispatch({ type: 'DELETE_PRODUCT_REQUEST' });
  try {
    const response = await axiosInstance.delete(`${API_ENDPOINT}Products/${id}`);
      dispatch({
        type: 'DELETE_PRODUCT_SUCCESS',
        payload: id
      });
      toast.success('Product deleted successfully');
      return true;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to delete Product';
    dispatch({ type: 'DELETE_PRODUCT_FAILURE', payload: errorMessage });
    toast.error(errorMessage);
    return false;
  }
};
