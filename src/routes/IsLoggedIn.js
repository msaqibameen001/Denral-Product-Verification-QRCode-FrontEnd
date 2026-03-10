export const isLoggedIn = () => {
  return !!sessionStorage.getItem('token');
};
