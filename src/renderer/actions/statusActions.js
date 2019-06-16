import  { createActions } from 'redux-actions';

export default createActions({
  SET_STATUS: (ready = false, msg = "") => ({ ready, msg })
});
