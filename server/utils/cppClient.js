import axios from "axios";

const cppClient = axios.create({
  baseURL: "http://localhost:18080",
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default cppClient;