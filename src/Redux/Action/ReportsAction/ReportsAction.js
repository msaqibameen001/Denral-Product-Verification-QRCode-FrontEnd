import { toast } from 'sonner';
import axiosInstance from '../axiosInstance';
const API_ENDPOINT = import.meta.env.VITE_APP_API_URL;

// ==================== SALES REPORT ====================

export const Fetch_Sales_Report =
  (filters = {}) =>
  async (dispatch) => {
    dispatch({ type: 'FETCH_SALES_REPORT_REQUEST' });
    try {
      const response = await axiosInstance.post(`${API_ENDPOINT}Reports/sales`, filters);

      if (response.data.success) {
        dispatch({
          type: 'FETCH_SALES_REPORT_SUCCESS',
          payload: response.data.data
        });
        toast.success(response.data.message || 'Sales report generated successfully');
        return response.data.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch sales report';
      dispatch({ type: 'FETCH_SALES_REPORT_FAILURE', payload: errorMessage });
      toast.error(errorMessage);
      return null;
    }
  };

export const Clear_Sales_Report = () => (dispatch) => {
  dispatch({ type: 'CLEAR_SALES_REPORT' });
};

// ==================== PURCHASE REPORT ====================

export const Fetch_Purchase_Report =
  (filters = {}) =>
  async (dispatch) => {
    dispatch({ type: 'FETCH_PURCHASE_REPORT_REQUEST' });
    try {
      const response = await axiosInstance.post(`${API_ENDPOINT}Reports/purchase`, filters);

      if (response.data.success) {
        dispatch({
          type: 'FETCH_PURCHASE_REPORT_SUCCESS',
          payload: response.data.data
        });
        toast.success(response.data.message || 'Purchase report generated successfully');
        return response.data.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch purchase report';
      dispatch({ type: 'FETCH_PURCHASE_REPORT_FAILURE', payload: errorMessage });
      toast.error(errorMessage);
      return null;
    }
  };

export const Clear_Purchase_Report = () => (dispatch) => {
  dispatch({ type: 'CLEAR_PURCHASE_REPORT' });
};

// ==================== LEDGER REPORT ====================

export const Fetch_Ledger_Report = (filters) => async (dispatch) => {
  // Validate required partyId
  if (!filters || filters.partyId == null) {
    toast.error('Party ID is required for ledger report');
    return null;
  }

  dispatch({ type: 'FETCH_LEDGER_REPORT_REQUEST' });
  try {
    const response = await axiosInstance.post(`${API_ENDPOINT}Reports/ledger`, filters);

    if (response.data.success) {
      dispatch({
        type: 'FETCH_LEDGER_REPORT_SUCCESS',
        payload: response.data.data
      });
      toast.success(response.data.message || 'Ledger report generated successfully');
      return response.data.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch ledger report';
    dispatch({ type: 'FETCH_LEDGER_REPORT_FAILURE', payload: errorMessage });
    toast.error(errorMessage);
    return null;
  }
};

export const Clear_Ledger_Report = () => (dispatch) => {
  dispatch({ type: 'CLEAR_LEDGER_REPORT' });
};
