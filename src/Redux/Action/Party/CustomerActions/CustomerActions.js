import { toast } from 'sonner';
import axiosInstance from '../../axiosInstance';
const API_ENDPOINT = import.meta.env.VITE_APP_API_URL;

export const Fetch_Customers = (ptid) => async (dispatch) => {
  dispatch({ type: 'FETCH_CUSTOMERS_REQUEST' });
  try {
    const response = await axiosInstance.get(`${API_ENDPOINT}Party/bytype/${ptid}`); // 1 = Customer
    if (response.data.success) {
      dispatch({
        type: 'FETCH_CUSTOMERS_SUCCESS',
        payload: response.data.data
      });
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch customers';
    dispatch({ type: 'FETCH_CUSTOMERS_FAILURE', payload: errorMessage });
    toast.error(errorMessage);
  }
};
export const Add_Customer = (data) => async (dispatch) => {
  dispatch({ type: 'ADD_CUSTOMER_REQUEST' });
  try {
    const customerData = {
      ...data,
      partyTypeId: 1 // Customer
    };
    const response = await axiosInstance.post(`${API_ENDPOINT}Party`, customerData);
    if (response.data.success) {
      dispatch({
        type: 'ADD_CUSTOMER_SUCCESS',
        payload: response.data.data
      });
      toast.success(response.data.message || 'Customer added successfully');
      return true;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to add customer';
    dispatch({ type: 'ADD_CUSTOMER_FAILURE', payload: errorMessage });
    toast.error(errorMessage);
    return false;
  }
};
export const Update_Customer = (id, data) => async (dispatch) => {
  dispatch({ type: 'UPDATE_CUSTOMER_REQUEST' });
  try {
    const customerData = {
      ...data,
      partyTypeId: 1
    };
    const response = await axiosInstance.put(`${API_ENDPOINT}Party/${id}`, customerData);
    if (response.data.success) {
      dispatch({
        type: 'UPDATE_CUSTOMER_SUCCESS',
        payload: response.data.data
      });
      toast.success(response.data.message || 'Customer updated successfully');
      return true;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to update customer';
    dispatch({ type: 'UPDATE_CUSTOMER_FAILURE', payload: errorMessage });
    toast.error(errorMessage);
    return false;
  }
};
export const Delete_Customer = (id) => async (dispatch) => {
  dispatch({ type: 'DELETE_CUSTOMER_REQUEST' });
  try {
    const response = await axiosInstance.delete(`${API_ENDPOINT}Party/${id}`);
    if (response.data.success) {
      dispatch({
        type: 'DELETE_CUSTOMER_SUCCESS',
        payload: id
      });
      toast.success(response.data.message || 'Customer deleted successfully');
      return true;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to delete customer';
    dispatch({ type: 'DELETE_CUSTOMER_FAILURE', payload: errorMessage });
    toast.error(errorMessage);
    return false;
  }
};
