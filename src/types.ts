export interface User {
    _id: string;
    name: string;
    email: string;
    gender: string;
    birthdate: string;
    country: string;
    profilePic: string;
}

export interface Room {
    _id: string;
    name: string;
    description: string;
    image: string;
    creator: string;
    messages: Message[];
    kickedUsers: string[];
    gameSession: GameSession | null;
}

export interface GameSession {
    settings: Pick<GameSettings, "rackSize" | "gameEnd">;
};

export interface Game {
    _id: string;
    room: Room;
    host: User;
    createdAt: string;
    players: Player[];
    settings: GameSettings;
    state: GameState;
}

export interface GameSettings {
    board: Board;
    tileBag: TileBag;
    turnDuration: number;
    rackSize: number;
    gameEnd: string;
}

export interface GameState {
    turnPlayer: Player;
    turnEndTime: Date;
    turnNumber: number;
    board: GameBoard;
    leftInBag: number;
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
    id: number;
    letter: string;
    points: number;
    isBlank: boolean;
}

export interface TileOnBoard extends Tile {
    x: number;
    y: number;
}

export interface Player extends User {
    rack: Tile[];
    score: number;
    reactionScore: number,
}

export interface CountryType {
    code: string;
    label: string;
    phone: string;
    suggested?: boolean;
  }