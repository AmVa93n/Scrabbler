import axios from 'axios';

class AccountService {
  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_SERVER_URL || "http://localhost:5005"
    });

    // Automatically set JWT token in the headers for every request
    this.api.interceptors.request.use((config) => {
      // Retrieve the JWT token from the local storage
      const storedToken = localStorage.getItem("authToken");

      if (storedToken) {
        config.headers = { Authorization: `Bearer ${storedToken}` };
      }

      return config;
    });
  }

  async getProfile() {
    const response = await this.api.get('/account/profile');
    return response.data.user
  }

  async updateProfile(requestBody) {
    return this.api.put(`/account/profile`, requestBody);
  }

  async deleteAccount() {
    return this.api.delete(`/account/profile`);
  }

  async getRooms() {
    const response = await this.api.get(`/account/rooms`);
    return response.data.rooms
  }

  async getRoom(roomId) {
    const response = await this.api.get(`/account/room/${roomId}`);
    return response.data.room
  }

  async createRoom(requestBody) {
    return this.api.post('/account/room', requestBody);
  }

  async updateRoom(roomId, requestBody) {
    const response = await this.api.put(`/account/room/${roomId}`, requestBody);
    return response.data.room
  }

  async deleteRoom(roomId) {
    return this.api.delete(`/account/room/${roomId}`);
  }
}

// Create one instance of the service
const accountService = new AccountService();

export default accountService;