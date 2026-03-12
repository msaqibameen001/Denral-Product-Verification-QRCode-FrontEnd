import PropTypes from 'prop-types';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';

// material-ui
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { CircularProgress, Alert } from '@mui/material';
import { Login } from '../../Redux/Action/AuthAction/AuthAction';
import Snackbar from '@mui/material/Snackbar';

// third-party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project imports
import IconButton from 'components/@extended/IconButton';
import AnimateButton from 'components/@extended/AnimateButton';

// assets
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import EyeInvisibleOutlined from '@ant-design/icons/EyeInvisibleOutlined';

// ============================|| JWT - LOGIN ||============================ //

export default function AuthLogin({ isDemo = false }) {
  const [checked, setChecked] = React.useState(false);
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [alertState, setAlertState] = React.useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const redirectToDashboard = () => {
    window.location.href = '/qr-batch';
  };

  const handleCloseAlert = () => {
    setAlertState({
      ...alertState,
      open: false
    });
  };

  // Enhanced login submission handler with loading state
  const handleLoginSubmit = async (values, { setErrors, resetForm, setSubmitting }) => {
    setIsLoading(true);
    try {
      const { email, password } = values;

      if (!email) {
        throw new Error('Please enter your email address');
      }

      const success = await dispatch(Login(email, password));

      if (success) {
        // Show success message
        setAlertState({
          open: true,
          message: 'Login successful! Redirecting to dashboard...',
          severity: 'success'
        });

        // Reset form after successful login
        resetForm();

        setTimeout(() => {
          redirectToDashboard();
        }, 2000);
      }
    } catch (error) {
      console.error('Login error:', error);

      // Set form error
      setErrors({
        submit: error.message || 'Login failed. Please check your credentials.'
      });

      // Show error alert
      setAlertState({
        open: true,
        message: error.message || 'Login Failed! Please try again.',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <>
      <Snackbar
        open={alertState.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseAlert} severity={alertState.severity} sx={{ width: '100%', fontFamily: '"Sofia Sans", sans-serif' }}>
          {alertState.message}
        </Alert>
      </Snackbar>
      <Formik
        initialValues={{
          email: '',
          password: '',
          submit: null
        }}
        validationSchema={Yup.object().shape({
          email: Yup.string().required('Email or username is required'),
          password: Yup.string().required('Password is required')
        })}
        onSubmit={handleLoginSubmit}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values, resetForm }) => (
          <form noValidate onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid size={12}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel sx={{ fontFamily: '"Sofia Sans", sans-serif' }} htmlFor="email-login">Email or Username</InputLabel>
                  <OutlinedInput
                    id="email-login"
                    sx={{ fontFamily: '"Sofia Sans", sans-serif' }}
                    type="email"
                    value={values.email}
                    name="email"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    fullWidth
                    error={Boolean(touched.email && errors.email)}
                  />
                </Stack>
                {touched.email && errors.email && (
                  <FormHelperText sx={{ fontFamily: '"Sofia Sans", sans-serif' }} error id="standard-weight-helper-text-email-login">
                    {errors.email}
                  </FormHelperText>
                )}
              </Grid>
              <Grid size={12}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel sx={{ fontFamily: '"Sofia Sans", sans-serif' }} htmlFor="password-login">Password</InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.password && errors.password)}
                    id="-password-login"
                    type={showPassword ? 'text' : 'password'}
                    value={values.password}
                    sx={{ fontFamily: '"Sofia Sans", sans-serif' }}
                    name="password"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                          color="secondary"
                        >
                          {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                        </IconButton>
                      </InputAdornment>
                    }
                    placeholder="Enter password"
                  />
                </Stack>
                {touched.password && errors.password && (
                  <FormHelperText sx={{ fontFamily: '"Sofia Sans", sans-serif' }} error id="standard-weight-helper-text-password-login">
                    {errors.password}
                  </FormHelperText>
                )}
              </Grid>
              <Grid sx={{ mt: -1 }} size={12}>
                <Stack direction="row" sx={{ gap: 2, alignItems: 'baseline', justifyContent: 'space-between' }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={checked}
                        onChange={(event) => setChecked(event.target.checked)}
                        name="checked"
                        color="primary"
                        size="small"
                      />
                    }
                    label={<Typography sx={{ fontFamily: '"Sofia Sans", sans-serif' }} variant="h6">Keep me sign in</Typography>}
                  />
                  <Link sx={{ fontFamily: '"Sofia Sans", sans-serif' }} variant="h6" component={RouterLink} to="#" color="text.primary">
                    Forgot Password?
                  </Link>
                </Stack>
              </Grid>
              <Grid size={12}>
                <AnimateButton>
                  <Button sx={{ fontFamily: '"Sofia Sans", sans-serif' }} disableElevation disabled={isLoading} fullWidth size="large" type="submit" variant="contained" color="primary">
                    {isLoading ? (
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <CircularProgress size={20} color="inherit" />
                        <span>Logging in...</span>
                      </Stack>
                    ) : (
                      'Login'
                    )}
                  </Button>
                </AnimateButton>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>
    </>
  );
}

AuthLogin.propTypes = { isDemo: PropTypes.bool };
