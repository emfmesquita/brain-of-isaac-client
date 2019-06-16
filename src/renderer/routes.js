import React from 'react';
import { Switch, Route } from 'react-router';

import TransformationsPage from './containers/TransformationsPage';

export default (
  <Switch>
    <Route exact path="/" component={TransformationsPage} />
  </Switch>
);
