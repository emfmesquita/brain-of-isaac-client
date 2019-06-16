import "./top.css";

import React, { Component } from 'react';
const { ipcRenderer } = window.require('electron');

const login = () => ipcRenderer.send("login");
const logout = () => ipcRenderer.send("logout");

export default class TopBar extends Component {
  constructor(props){
    super(props);
    this.renderLogin = this.renderLogin.bind(this);
  }

  renderLogin(){
    if(this.props.login.isLoggedIn){
      return (
        <div>{`Hi ${this.props.login.userData.display_name}, `}<a href="javascript:void" onClick={logout}>logout</a></div>
      )
    }

    return <a href="javascript:void" onClick={login}>login</a>;
  }

  render() {
    return (
      <div className="top-bar">
        <div className="login">{this.renderLogin()}</div>
      </div>
    );
  }
}
