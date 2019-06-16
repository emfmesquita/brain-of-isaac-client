import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import { connectRouter, routerMiddleware, push } from 'connected-react-router';
import persistState from 'redux-localstorage';
import thunk from 'redux-thunk';

import transformationsActions from 'brain-of-isaac-commons/actions/transformationActions';
import transformationReducers from 'brain-of-isaac-commons/reducers/transformationReducers';
import statusActions from "./actions/statusActions";
import statusReducers from "./reducers/statusReducers";
import loginActions from './actions/loginActions';
import loginReducers from './reducers/loginReducers';

export default function configureStore(initialState, routerHistory) {
  const router = routerMiddleware(routerHistory);

  const actionCreators = {
    ...transformationsActions,
    ...statusActions,
    ...loginActions,
    push,
  };

  const reducers = {
    router: connectRouter(routerHistory),
    transformations: transformationReducers,
    login: loginReducers,
    status: statusReducers
  };

  const middlewares = [thunk, router];

  const composeEnhancers = (() => {
    const compose_ = window && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
    if (process.env.NODE_ENV === 'development' && compose_) {
      return compose_({ actionCreators });
    }
    return compose;
  })();

  const enhancer = composeEnhancers(applyMiddleware(...middlewares), persistState());
  const rootReducer = combineReducers(reducers);

  return createStore(rootReducer, initialState, enhancer);
}
