import { toast } from 'sonner';
import axiosInstance from '../../axiosInstance';
const API_ENDPOINT = import.meta.env.VITE_APP_API_URL;

export const Fetch_Suppliers = (ptid) => async (dispatch) => {
  dispatch({ type: 'FETCH_SUPPLIERS_REQUEST' });
  try {
    const response = await axiosInstance.get(`${API_ENDPOINT}Party/bytype/${ptid}`); // 2 = Supplier
    if (response.data.success) {
      dispatch({
        type: 'FETCH_SUPPLIERS_SUCCESS',
        payload: response.data.data
      });
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch suppliers';
    dispatch({ type: 'FETCH_SUPPLIERS_FAILURE', payload: errorMessage });
    toast.error(errorMessage);
  }
};
export const Add_Supplier = (data) => async (dispatch) => {
  dispatch({ type: 'ADD_SUPPLIER_REQUEST' });
  try {
    const supplierData = {
      ...data,
      partyTypeId: 2 // Supplier
    };
    const response = await axiosInstance.post(`${API_ENDPOINT}Party`, supplierData);
    if (response.data.success) {
      dispatch({
        type: 'ADD_SUPPLIER_SUCCESS',
        payload: response.data.data
      });
      toast.success(response.data.message || 'Supplier added successfully');
      return true;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to add supplier';
    dispatch({ type: 'ADD_SUPPLIER_FAILURE', payload: errorMessage });
    toast.error(errorMessage);
    return false;
  }
};
export const Update_Supplier = (id, data) => async (dispatch) => {
  dispatch({ type: 'UPDATE_SUPPLIER_REQUEST' });
  try {
    const supplierData = {
      ...data,
      partyTypeId: 2
    };
    const response = await axiosInstance.put(`${API_ENDPOINT}Party/${id}`, supplierData);
    if (response.data.success) {
      dispatch({
        type: 'UPDATE_SUPPLIER_SUCCESS',
        payload: response.data.data
      });
      toast.success(response.data.message || 'Supplier updated successfully');
      return true;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to update supplier';
    dispatch({ type: 'UPDATE_SUPPLIER_FAILURE', payload: errorMessage });
    toast.error(errorMessage);
    return false;
  }
};
export const Delete_Supplier = (id) => async (dispatch) => {
  dispatch({ type: 'DELETE_SUPPLIER_REQUEST' });
  try {
    const response = await axiosInstance.delete(`${API_ENDPOINT}Party/${id}`);
    if (response.data.success) {
      dispatch({
        type: 'DELETE_SUPPLIER_SUCCESS',
        payload: id
      });
      toast.success(response.data.message || 'Supplier deleted successfully');
      return true;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to delete supplier';
    dispatch({ type: 'DELETE_SUPPLIER_FAILURE', payload: errorMessage });
    toast.error(errorMessage);
    return false;
  }
};
