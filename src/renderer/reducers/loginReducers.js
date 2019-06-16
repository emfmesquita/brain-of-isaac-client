import { handleActions } from 'redux-actions';
import actions from '../actions/loginActions';

export default handleActions(
  {
    [actions.setLoginStatus]: (state, action) => state.isLoggedIn === action.payload.isLoggedIn ? state : { ...state, ...action.payload }
  },
  {},
);
