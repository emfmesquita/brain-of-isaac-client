import fs from "fs";
import axios from "axios";
import fp from "find-free-port";
import Hapi from "@hapi/hapi";
import { shell } from "electron";
require("dotenv").config();

const sessionFile = "session";
const ebsUrl = process.env.EBS_URL;
const loginPage = ebsUrl + "/login";
const loginChannel = "loginstatus";
let userDataCache = null;

const rand = () => Math.floor(Math.random() * 100);
const send = (mainWindow, value) =>  mainWindow.webContents.send("loginstatus", value);
const readUserData = () => {
  if (!fs.existsSync(sessionFile)) {
    fs.appendFileSync(sessionFile, "");
  }
  const userDataStr = fs.readFileSync(sessionFile) + "";
  if(!userDataStr) return {};

  let userData;
  try {
    return JSON.parse(userDataStr);
  } catch (ex) {
    return null;
  }
}

export default class LoginService {
  static sessionHeaders(userData = Object.assign({}, userDataCache)) {
    return userData && userData.session_id ? { Cookie: `connect.sid=${userData.session_id};` } : null;
  }

  static async loadSession(mainWindow) {
    const userData = readUserData();
    if(!userData){
      send(mainWindow, null);
      return;
    }

    try {
      await axios.get(ebsUrl + "/isloggedin", {
        headers: LoginService.sessionHeaders(userData)
      });
      userDataCache = Object.assign({}, userData);
      send(mainWindow, userData);
    } catch (ex) {
      send(mainWindow, null);
    }
  }

  static async login(mainWindow) {
    const [freePort] = await fp(10900 + rand());
    await shell.openExternal(loginPage + `/${freePort}`);

    const server = Hapi.server({
      port: freePort,
      host: "localhost",
      routes: {
        cors: {
          origin: [ebsUrl]
        }
      }
    });
    await server.start();
    console.log("up - " + freePort);

    setTimeout(async () => {
      await server.stop();
      console.log("down - " + freePort);
    }, 600000);

    server.route({
      method: "POST",
      path: "/",
      handler: (request, h) => {
        const userDataStr = request.payload;
        const userData = JSON.parse(userDataStr);
        if (userData.session_id) {
          fs.writeFileSync(sessionFile, userDataStr);
          userDataCache = Object.assign({}, userData);
          send(mainWindow, userData);
        }
        return "";
      }
    });
  }

  static async logout(mainWindow) {
    fs.writeFileSync(sessionFile, "");
    if(!userDataCache || !userDataCache.session_id) {
      userDataCache = null;
      send(mainWindow, null);
      return;
    }

    try {
      await axios.get(ebsUrl + "/logout", {
        headers: {
          Cookie: `connect.sid=${userDataCache.session_id};`
        }
      });
    } catch (ex) {
      console.error(ex);
    } finally{
      userDataCache = null;
      send(mainWindow, null);
    }
  }
}
