// authActions.js
import axios from 'axios';
import { toast } from 'sonner';

const API_ENDPOINT = import.meta.env.VITE_APP_API_URL;

export const Login = (username, password) => async (dispatch) => {
  try {
    if (!username) {
      throw new Error('Please enter your username');
    }

    if (!password) {
      throw new Error('Please enter your password');
    }

    const loginResponse = await axios.post(
      `${API_ENDPOINT}Auth/login`,
      { emailOrUsername: username, password },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 seconds timeout
      }
    );

    const responseData = loginResponse?.data;

    if (!responseData) {
      throw new Error('Invalid server response');
    }

    const user = responseData;
    const isSuccess = loginResponse?.data?.token;
    const token = responseData?.token;

    if (isSuccess && token) {
      // Store tokens and user data in sessionStorage
      sessionStorage.setItem('token', token);

      if (user) {
        sessionStorage.setItem('user', JSON.stringify(user));
      }

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          token,
          user
        }
      });
      return true;
    } else {
      throw new Error('Invalid login credentials');
    }
  } catch (error) {
    let errorMessage = 'Login Failed';

    if (error.response) {
      errorMessage = error.response.data?.message || `Server error (${error.response.status})`;
    } else if (error.request) {
      errorMessage = 'Network error. Please check your connection and try again.';
    } else if (error.message) {
      errorMessage = error.message;
    }

    dispatch({
      type: 'LOGIN_FAILURE',
      payload: errorMessage
    });

    toast.error(errorMessage);
    return false;
  }
};
