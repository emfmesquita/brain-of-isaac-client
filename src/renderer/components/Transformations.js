import React, { Component } from 'react';
import StatusBar from "./StatusBar";
import "./transformations.css";
import Transformation from "brain-of-isaac-commons/components/Transformation";
import TopBar from './TopBar';

export default class Transformations extends Component {
  constructor(props){
    super(props);
    this.renderTransformations = this.renderTransformations.bind(this);
  }

  renderTransformations() {
    if(!this.props.status || !this.props.status.ready || !this.props.transformations) return null;
    return Object.keys(this.props.transformations).filter(name => name !== "selected").map(name => {
      const CurrentTransformation = Transformation[name];
      return (
        <div className="boi-trans" key={name}>
          <CurrentTransformation {...this.props.transformations[name]} showCount/>
        </div>
      );
    });
  }

  render() {
    return (
      <div>
        <TopBar login={this.props.login}/>
        <div className="boi-trans-container">
          {this.renderTransformations()}
        </div>
        <StatusBar status={this.props.status} login={this.props.login}/>
      </div>
    );
  }
}
