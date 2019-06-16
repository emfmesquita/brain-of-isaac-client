import  { createActions } from 'redux-actions';

export default createActions({
  SET_LOGIN_STATUS: (isLoggedIn = false, userData = {}) => ({ isLoggedIn, userData })
});
