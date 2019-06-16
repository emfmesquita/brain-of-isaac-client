import { handleActions } from 'redux-actions';
import actions from '../actions/statusActions';

export default handleActions(
  {
    [actions.setStatus]: (state, action) => state.msg === action.payload.msg ? state : { ...state, ...action.payload }
  },
  {},
);
