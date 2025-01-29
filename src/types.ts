export interface User {
    _id: string;
    name: string;
    profilePic: string;
}

export interface Room {
    _id: string;
    name: string;
    description: string;
    image: string;
}

export interface Game {
    _id: string;
    room: Room;
    host: User;
    createdAt: string;
    players: Player[];
    settings: GameSettings;
}

export interface GameSettings {
    board: Board;
    tileBag: TileBag;
    turnDuration: number;
    rackSize: number;
    gameEnd: string;
}

export interface Board {
    _id: string;
    creator: string;
    name: string;
    size: number;
    bonusSquares: {
        x: number;
        y: number;
        bonusType: string;
    }[];
}

export interface TileBag {
    _id: string;
    creator: string;
    name: string;
    letterData: TileData[];
}

export interface TileData {
    letter: string;
    count: number;
    points: number;
    originalIndex?: number;
}

export interface Message {
    _id: string;
    generated: boolean;
    generatedBy: string;
    reactions: {
        type: string;
        user: User;
    }[];
    sender: User;
    title: string;
    text: string;
    createdAt: string;
    minor?: boolean;
}

export type GameBoard = Square[][];

export interface Square {
    content: Tile | null;
    occupied: boolean;
    bonusType: string;
    x: number;
    y: number;
    fixed: boolean;
}

export interface Tile {
    x: number;
    y: number;
    id: number;
    letter: string;
    points: number;
    isBlank: boolean;
}

export interface Player extends User {
    score: number;
}