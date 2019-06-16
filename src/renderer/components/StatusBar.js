import React, { Component } from 'react';
import "./status.css";

export default class StatusBar extends Component {
  render() {
    let msg = this.props.status.msg;
    if(this.props.status.ready && !this.props.login.isLoggedIn) msg += " Login to send data to twitch extension.";
    return (
      <div className="status-bar">{msg}</div>
    );
  }
}
