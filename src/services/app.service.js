import axios from "axios";

class AppService {
  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_DEV_SERVER_URL || process.env.REACT_APP_SERVER_URL,
    });

    // Automatically set JWT token on the request headers for every request
    this.api.interceptors.request.use((config) => {
      // Retrieve the JWT token from the local storage
      const storedToken = localStorage.getItem("authToken");

      if (storedToken) {
        config.headers = {
          ...config.headers, // Preserve existing headers
          Authorization: `Bearer ${storedToken}`
        };
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
