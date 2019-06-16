import LoginService from "./LoginService";
import axios from "axios";

const CompressionService = require("brain-of-isaac-commons/services/CompressionService");
require("dotenv").config();

const ebsUrl = process.env.EBS_URL;

export default class EbsService {
  static async update(data) {
    const headers = LoginService.sessionHeaders();
    if (!headers) return;

    data = CompressionService.compress(data);

    try {
      await axios({
        method: "PUT",
        url: ebsUrl + "/update",
        headers,
        data
      });
    } catch (err) {
      console.error(err);
    }
  }
}
