import axios, { AxiosInstance } from "axios";

class AuthService {
  api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_DEV_SERVER_URL || import.meta.env.VITE_SERVER_URL,
    });

    // Automatically set JWT token on the request headers for every request
    this.api.interceptors.request.use((config) => {
      // Retrieve the JWT token from the local storage
      const storedToken = localStorage.getItem("authToken");

      if (storedToken) {
        config.headers.set("Authorization", `Bearer ${storedToken}`);
      }

      return config;
    });
  }

  login(requestBody: object) {
    return this.api.post("/auth/login", requestBody);
    // same as
    // return axios.post("http://localhost:5005/auth/login");
  };

  signup(requestBody: object) {
    return this.api.post("/auth/signup", requestBody);
    // same as
    // return axios.post("http://localhost:5005/auth/singup");
  };

  verify() {
    return this.api.get("/auth/verify");
    // same as
    // return axios.post("http://localhost:5005/auth/verify");
  };

  google(requestBody: object) {
    return this.api.post("/auth/google", requestBody);
  }
}

// Create one instance (object) of the service
const authService = new AuthService();

export default authService;
