import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { createMemoryHistory } from 'history';
import routes from './routes';
import configureStore from './store';
import statusActions from "./actions/statusActions";
import transformationActions from "brain-of-isaac-commons/actions/transformationActions";
import C from "brain-of-isaac-commons/constants/transformationConstants";
import loginActions from './actions/loginActions';

const { ipcRenderer } = window.require('electron');

const syncHistoryWithStore = (store, history) => {
  const { router } = store.getState();
  if (router && router.location) {
    history.replace(router.location);
  }
};

const initialState = {
  transformations: {},
  status: {}
};
const routerHistory = createMemoryHistory();
const store = configureStore(initialState, routerHistory);
syncHistoryWithStore(store, routerHistory);

const rootElement = document.querySelector(document.currentScript.getAttribute('data-container'));

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={routerHistory}>{routes}</ConnectedRouter>
  </Provider>,
  rootElement,
);

const dispatchItemTrans = (name, data, action) => {
  if(!data[name]) {
    store.dispatch(action(0, [], []));
    return;
  }
  let { count, got, gone } = data[name];
  store.dispatch(action(count, got, gone));
}

ipcRenderer.on("loginstatus", (event, userData) => {
  const isLoggedIn = !!userData;
  userData = userData || {};
  store.dispatch(loginActions.setLoginStatus(isLoggedIn, userData));
});

ipcRenderer.on("update", (event, data) => {
  if(data.status) store.dispatch(statusActions.setStatus(data.status.ready, data.status.msg));
  if(!data.transformations) return;

  const trans = data.transformations;
  C.itemBasedTransformations.forEach(name => {
    dispatchItemTrans(name, trans, transformationActions.updateTransformation[name]);
  });

  store.dispatch(transformationActions.updateTransformation.adulthood(trans.adulthood.count, trans.adulthood.pillId));
  store.dispatch(transformationActions.updateTransformation.stompy(trans.stompy.count));
});
