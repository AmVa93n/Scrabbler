import axios, { AxiosInstance } from 'axios';
import { Board, TileBag } from '../types';

class AccountService {
  api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_DEV_SERVER_URL || import.meta.env.VITE_SERVER_URL
    });

    // Automatically set JWT token in the headers for every request
    this.api.interceptors.request.use((config) => {
      // Retrieve the JWT token from the local storage
      const storedToken = localStorage.getItem("authToken");

      if (storedToken) {
        config.headers.set("Authorization", `Bearer ${storedToken}`);
      }

      return config;
    });
  }

  async getProfile() {
    const response = await this.api.get('/account/profile');
    return response.data.user
  }

  async updateProfile(requestBody: FormData) {
    return this.api.put(`/account/profile`, requestBody);
  }

  async deleteAccount() {
    return this.api.delete(`/account/profile`);
  }

  async getRooms() {
    const response = await this.api.get(`/account/rooms`);
    return response.data.rooms
  }

  async getRoom(roomId: string) {
    const response = await this.api.get(`/account/room/${roomId}`);
    return response.data.room
  }

  async createRoom(requestBody: FormData) {
    const response = await this.api.post('/account/room', requestBody);
    return response.data.room
  }

  async updateRoom(roomId: string, requestBody: FormData) {
    const response = await this.api.put(`/account/room/${roomId}`, requestBody);
    return response.data.room
  }

  async deleteRoom(roomId: string) {
    return this.api.delete(`/account/room/${roomId}`);
  }

  async getBoards() {
    const response = await this.api.get(`/account/boards`);
    return response.data.boards
  }

  async createBoard(requestBody: Omit<Board, '_id'>) {
    const response = await this.api.post('/account/board', requestBody);
    return response.data.board
  }

  async updateBoard(requestBody: Board) {
    const response = await this.api.put(`/account/board`, requestBody);
    return response.data.board
  }

  async deleteBoard(boardId: string) {
    return this.api.delete(`/account/board/${boardId}`);
  }

  async getTileBags() {
    const response = await this.api.get(`/account/tilebags`);
    return response.data.tileBags
  }

  async createTileBag(requestBody: Omit<TileBag, '_id'>) {
    const response = await this.api.post('/account/tilebag', requestBody);
    return response.data.tilebag
  }

  async updateTileBag(requestBody: TileBag) {
    const response = await this.api.put(`/account/tilebag`, requestBody);
    return response.data.tilebag
  }

  async deleteTileBag(tilebagId: string) {
    return this.api.delete(`/account/tilebag/${tilebagId}`);
  }

  async getGames() {
    const response = await this.api.get(`/account/games`);
    return response.data.games
  }
}

// Create one instance of the service
const accountService = new AccountService();

export default accountService;