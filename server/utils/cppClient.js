import axios from "axios";

const CPP_HOST = process.env.CPP_HOST || "127.0.0.1";
const CPP_PORT = process.env.CPP_PORT || 18080;

const cppClient = axios.create({
  baseURL: `http://${CPP_HOST}:${CPP_PORT}`,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default cppClient;