import { toast } from 'sonner';
import axiosInstance from '../axiosInstance';
const API_ENDPOINT = import.meta.env.VITE_APP_API_URL;

export const Fetch_Users = () => async (dispatch) => {
  dispatch({ type: 'FETCH_USERS_REQUEST' });
  try {
    const response = await axiosInstance.get(`${API_ENDPOINT}Users`);
    if (response.data.success) {
      dispatch({
        type: 'FETCH_USERS_SUCCESS',
        payload: response.data.data
      });
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch users';
    dispatch({ type: 'FETCH_USERS_FAILURE', payload: errorMessage });
    toast.error(errorMessage);
  }
};
export const Add_User = (data) => async (dispatch) => {
  dispatch({ type: 'ADD_USER_REQUEST' });
  try {
    const response = await axiosInstance.post(`${API_ENDPOINT}Users`, data);
    if (response.data.success) {
      dispatch({
        type: 'ADD_USER_SUCCESS',
        payload: response.data.data
      });
      toast.success(response.data.message || 'User added successfully');
      return true;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to add user';
    dispatch({ type: 'ADD_USER_FAILURE', payload: errorMessage });
    toast.error(errorMessage);
    return false;
  }
};
export const Update_User = (id, data) => async (dispatch) => {
  dispatch({ type: 'UPDATE_USER_REQUEST' });
  try {
    const response = await axiosInstance.put(`${API_ENDPOINT}Users/${id}`, data);
    if (response.data.success) {
      dispatch({
        type: 'UPDATE_USER_SUCCESS',
        payload: response.data.data
      });
      toast.success(response.data.message || 'User updated successfully');
      return true;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to update user';
    dispatch({ type: 'UPDATE_USER_FAILURE', payload: errorMessage });
    toast.error(errorMessage);
    return false;
  }
};
export const Delete_User = (id) => async (dispatch) => {
  dispatch({ type: 'DELETE_USER_REQUEST' });
  try {
    const response = await axiosInstance.delete(`${API_ENDPOINT}Users/${id}`);
    if (response.data.success) {
      dispatch({
        type: 'DELETE_USER_SUCCESS',
        payload: id
      });
      toast.success(response.data.message || 'User deleted successfully');
      return true;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to delete user';
    dispatch({ type: 'DELETE_USER_FAILURE', payload: errorMessage });
    toast.error(errorMessage);
    return false;
  }
};
