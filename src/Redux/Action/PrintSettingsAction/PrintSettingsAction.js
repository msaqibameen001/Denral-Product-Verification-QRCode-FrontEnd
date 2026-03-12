import axiosInstance from '../axiosInstance';
import { toast } from 'sonner';

// ── Fetch global print settings ──────────────────────────────────────────────
export const Fetch_Print_Settings = () => async (dispatch) => {
  try {
    dispatch({ type: 'FETCH_PRINT_SETTINGS_REQUEST' });
    const response = await axiosInstance.get('PrintSettings');
    dispatch({ type: 'FETCH_PRINT_SETTINGS_SUCCESS', payload: response?.data });
    return response?.data;
  } catch (error) {
    const msg = error.response?.data?.error || 'Failed to load print settings';
    dispatch({ type: 'FETCH_PRINT_SETTINGS_FAILURE', payload: msg });
    // Silent fail — defaults will be used
    return null;
  }
};

// ── Save global print settings ───────────────────────────────────────────────
export const Save_Print_Settings = (settings) => async (dispatch) => {
  try {
    dispatch({ type: 'SAVE_PRINT_SETTINGS_REQUEST' });
    const response = await axiosInstance.put('PrintSettings', settings);
    dispatch({ type: 'SAVE_PRINT_SETTINGS_SUCCESS', payload: response?.data });
    toast.success('Print settings saved');
    return response?.data;
  } catch (error) {
    const msg = error.response?.data?.error || 'Failed to save print settings';
    dispatch({ type: 'SAVE_PRINT_SETTINGS_FAILURE', payload: msg });
    toast.error(msg);
    throw error;
  }
};
