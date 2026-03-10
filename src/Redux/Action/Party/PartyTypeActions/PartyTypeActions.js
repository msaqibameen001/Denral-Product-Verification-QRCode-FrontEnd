import { toast } from 'sonner';
import axiosInstance from '../../axiosInstance';

export const Fetch_Party_Types = () => async (dispatch) => {
  dispatch({ type: 'FETCH_PARTY_TYPES_REQUEST' });
  try {
    const response = await axiosInstance.get('PartyType');
    if (response.data.success) {
      dispatch({
        type: 'FETCH_PARTY_TYPES_SUCCESS',
        payload: response.data.data
      });
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch party types';
    dispatch({ type: 'FETCH_PARTY_TYPES_FAILURE', payload: errorMessage });
    toast.error(errorMessage);
  }
};
