import axiosInstance from '../axiosInstance';
import { toast } from 'sonner';

// Fetch all product categories
export const Fetch_Categories = () => async (dispatch) => {
  try {
    dispatch({ type: 'FETCH_CATEGORIES_M_REQUEST' });

    const response = await axiosInstance.get('ProductCategories');

    dispatch({
      type: 'FETCH_CATEGORIES_M_SUCCESS',
      payload: response?.data || []
    });

    return response?.data?.data || [];
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to fetch categories';
    dispatch({ type: 'FETCH_CATEGORIES_M_FAILURE', payload: errorMessage });
    toast.error(errorMessage);
    return [];
  }
};

// Get category by ID
export const Get_Category_By_Id = (id) => async (dispatch) => {
  try {
    dispatch({ type: 'GET_CATEGORY_REQUEST' });

    const response = await axiosInstance.get(`ProductCategories/${id}`);

    dispatch({
      type: 'GET_CATEGORY_SUCCESS',
      payload: response?.data?.data
    });

    return response?.data?.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to fetch category';
    dispatch({ type: 'GET_CATEGORY_FAILURE', payload: errorMessage });
    toast.error(errorMessage);
    return null;
  }
};

// Create category
export const Create_Category = (categoryData) => async (dispatch) => {
  try {
    dispatch({ type: 'CREATE_CATEGORY_REQUEST' });

    const response = await axiosInstance.post('ProductCategories', categoryData);

    dispatch({
      type: 'CREATE_CATEGORY_SUCCESS',
      payload: response?.data
    });

    toast.success('Category created successfully');
    return response?.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to create category';
    dispatch({ type: 'CREATE_CATEGORY_FAILURE', payload: errorMessage });
    toast.error(errorMessage);
    throw error;
  }
};

// Update category
export const Update_Category = (id, categoryData) => async (dispatch) => {
  try {
    dispatch({ type: 'UPDATE_CATEGORY_REQUEST' });

    const response = await axiosInstance.put(`ProductCategories/${id}`, categoryData);

    dispatch({
      type: 'UPDATE_CATEGORY_SUCCESS',
      payload: response?.data
    });

    toast.success('Category updated successfully');
    return response?.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to update category';
    dispatch({ type: 'UPDATE_CATEGORY_FAILURE', payload: errorMessage });
    toast.error(errorMessage);
    throw error;
  }
};

// Delete category
export const Delete_Category = (id) => async (dispatch) => {
  try {
    dispatch({ type: 'DELETE_CATEGORY_REQUEST' });

    const response = await axiosInstance.delete(`ProductCategories/${id}`);

    dispatch({
      type: 'DELETE_CATEGORY_SUCCESS',
      payload: id
    });

    toast.success('Category deleted successfully');
    return true;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to delete category';
    dispatch({ type: 'DELETE_CATEGORY_FAILURE', payload: errorMessage });
    toast.error(errorMessage);
    return false;
  }
};
