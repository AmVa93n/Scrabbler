import axios, { AxiosInstance } from "axios";

class AppService {
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

  ping() {
    return this.api.get(`/api/ping`); // this is just to keep the server from spinning down
  }

  async getDictionary() {
    const response = await this.api.get(`/api/dictionary`);
    return response.data.dictionary
  }

}

// Create one instance (object) of the service
const appService = new AppService();

export default appService;
