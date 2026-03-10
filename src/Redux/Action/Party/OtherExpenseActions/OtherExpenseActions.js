import { toast } from 'sonner';
import axiosInstance from '../../axiosInstance';
const API_ENDPOINT = import.meta.env.VITE_APP_API_URL;

export const Fetch_OtherExpenses = (ptid) => async (dispatch) => {
  dispatch({ type: 'FETCH_OTHER_EXPENSES_REQUEST' });
  try {
    const response = await axiosInstance.get(`${API_ENDPOINT}Party/bytype/${ptid}`); // 3 = Expenses
    if (response.data.success) {
      dispatch({
        type: 'FETCH_OTHER_EXPENSES_SUCCESS',
        payload: response.data.data
      });
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch expenses';
    dispatch({ type: 'FETCH_OTHER_EXPENSES_FAILURE', payload: errorMessage });
    toast.error(errorMessage);
  }
};
export const Add_OtherExpense = (data) => async (dispatch) => {
  dispatch({ type: 'ADD_OTHER_EXPENSE_REQUEST' });
  try {
    const expenseData = {
      ...data,
      partyTypeId: 3 // Expenses
    };
    const response = await axiosInstance.post(`${API_ENDPOINT}Party`, expenseData);
    if (response.data.success) {
      dispatch({
        type: 'ADD_OTHER_EXPENSE_SUCCESS',
        payload: response.data.data
      });
      toast.success(response.data.message || 'Expense added successfully');
      return true;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to add expense';
    dispatch({ type: 'ADD_OTHER_EXPENSE_FAILURE', payload: errorMessage });
    toast.error(errorMessage);
    return false;
  }
};
export const Update_OtherExpense = (id, data) => async (dispatch) => {
  dispatch({ type: 'UPDATE_OTHER_EXPENSE_REQUEST' });
  try {
    const expenseData = {
      ...data,
      partyTypeId: 3
    };
    const response = await axiosInstance.put(`${API_ENDPOINT}Party/${id}`, expenseData);
    if (response.data.success) {
      dispatch({
        type: 'UPDATE_OTHER_EXPENSE_SUCCESS',
        payload: response.data.data
      });
      toast.success(response.data.message || 'Expense updated successfully');
      return true;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to update expense';
    dispatch({ type: 'UPDATE_OTHER_EXPENSE_FAILURE', payload: errorMessage });
    toast.error(errorMessage);
    return false;
  }
};
export const Delete_OtherExpense = (id) => async (dispatch) => {
  dispatch({ type: 'DELETE_OTHER_EXPENSE_REQUEST' });
  try {
    const response = await axiosInstance.delete(`${API_ENDPOINT}Party/${id}`);
    if (response.data.success) {
      dispatch({
        type: 'DELETE_OTHER_EXPENSE_SUCCESS',
        payload: id
      });
      toast.success(response.data.message || 'Expense deleted successfully');
      return true;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to delete expense';
    dispatch({ type: 'DELETE_OTHER_EXPENSE_FAILURE', payload: errorMessage });
    toast.error(errorMessage);
    return false;
  }
};
