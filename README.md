# Scrabbler

<br>

## Description

This is an app that organizes and manages backlog for different types of media. Mainly from streaming and other monthly services.

## User Stories

-  **404:** As an anon/user I can see a 404 page if I try to reach a page that does not exist so that I know it's my fault
-  **Dictionary** As an anon/user I can see the full list of valid words in Scrabble and search for words
-  **Rules** As an anon/user I can see the rules of how to play Scrabble
-  **404:** As an anon/user I can see a 404 page if I try to reach a page that does not exist so that I know it's my fault
-  **Signup:** As an anon I can sign up in the platform so that I can start playing
-  **Login:** As a user I can login to the platform so that I can start playing
-  **Logout:** As a user I can logout from the platform so no one else can modify my information
-  **Profile** As a user I can edit my profile information
-  **Rooms** As a user I can create, edit and delete rooms where I can play with whomever I choose to share the room link
-  **Game History** As a user I can view details about all past games I've participated in
-  **Board Editor** As a user I can create new boards with custom layouts of bonus squares
-  **Tile Bag Editor** As a user I can create new tile bags with custom letter distribution and scores

## Backlog

- Dictionary search bar
- Managing room banlist
- Sharing created content
- Public rooms

<br>

# Client / Frontend

## React Router Routes (React App)
| Path             | Component          | Permissions              | Behavior                                                      |
| ---------------- | -------------------| ------------------------ | ------------------------------------------------------------- |
| `/`              | HomePage           | public `<Route>`         | Home page                                    |
| `/dictionary`    | DictionaryPage     | public `<Route>`         | Shows all valid words in Scrabble            |
| `/rules`         | RulesPage          | public `<Route>`         | Explains how to play Scrabble                |
| `/signup`        | SignUpPage         | anon only `<IsAnon>`     | Signup form, link to login, navigate to homepage after signup |
| `/login`         | SignInPage         | anon only `<IsAnon>`     | Login form, link to signup, navigate to homepage after login  |
| `/profile`       | ProfilePage        | user only `<IsPrivate>`  | Shows profile info and allows editing           |
| `/rooms`         | RoomsPage          | user only `<IsPrivate>`  | Shows all user rooms and allow creating new rooms, editing and deleting |
| `/games`         | GameHistoryPage    | user only `<IsPrivate>`  | Shows data about all past games the user participated in |
| `/boardeditor`   | BoardEditorPage    | user only `<IsPrivate>`  | Allows creating, editing and deleting custom board layouts |
| `/tilebageditor` | TileBagEditorPage  | user only `<IsPrivate>`  | Allows creating, editing and deleting custom tile bags |
| `/rooms/:roomId` | RoomPage           | user only `<IsPrivate>`  | A private page where the Scrabble games take place |

## Components

- CallToAction
- CountrySelect
- FeaturesSection
- GoogleAuth
- HeroSection
- IsAnon
- IsPrivate
- NavBar
- NumberInput
- SearchBar
- Loading

- ChatInput
- CreateRoom
- EditRoom
- Reactions
- RoomBar
- RoomChat
- RulesModal
- UserList

- GameActions
- GameSettings
- AlertModal
- BlankModal
- InactiveModal
- PromptModal
- SwapModal
- Board
- Square
- Rack
- Tile
- Timer

## Services

- Auth Service
  - .login(requestBody)
  - .signup(requestBody)
  - .verify()
  - .google(requestBody)

- Account Service
  - .getProfile()
  - .updateProfile(requestBody)
  - .deleteAccount()
  - .getRooms()
  - .getRoom(roomId)
  - .createRoom(requestBody)
  - .updateRoom(roomId, requestBody)
  - .deleteRoom(roomId)
  - .getBoards()
  - .createBoard(requestBody)
  - .updateBoard(requestBody)
  - .deleteBoard(boardId)
  - .getTileBags()
  - .createTileBag(requestBody)
  - .updateTileBag(requestBody)
  - .deleteTileBag(tilebagId)
  - .getGames()

- App Service
  - .ping()
  - .getDictionary()

<br>

# Server / Backend

## Models

User model

```javascript
{
    email: {type: String, required: [true, "Email is required."], unique: true, lowercase: true, trim: true},
    password: {type: String},
    name: {type: String, required: [true, "Name is required."]},
    gender: {type: String},
    birthdate: {type: String},
    country: {type: String},
    profilePic: {type: String},
    googleId: {type: String},
}
```

Room model

```javascript
 {
    creator: { type: Schema.Types.ObjectId, ref: 'User'},
    name: { type: String, required: true },
    description: { type: String },
    image: { type: String },
    gameSession: { type: Schema.Types.ObjectId, ref: 'Game' },
    messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }],
    kickedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
 }
```

Game model

```javascript
 {
    room: { type: Schema.Types.ObjectId, ref: 'Room'},
    host: { type: Schema.Types.ObjectId, ref: 'User'},
    players: [{ 
        _id: String, 
        name: String, 
        profilePic: String,
        rack: [{
            id: { type: Number },
            letter: { type: String },
            points: { type: Number },
            isBlank: { type: Boolean },
        }],
        score: Number,
        inactiveTurns: Number,
        reactionScore: Number,
    }],
    settings: {
        board: { type: Schema.Types.ObjectId, ref: 'Board'},
        tileBag: { type: Schema.Types.ObjectId, ref: 'TileBag'},
        turnDuration: { type: Number },
        turnsUntilSkip: { type: Number },
        rackSize: { type: Number },
        gameEnd: { type: String },
    },
    state: {
        turnPlayerIndex: { type: Number },
        turnEndTime: { type: Date },
        turnNumber: { type: Number },
        board: [[{ 
            x: Number,
            y: Number,
            occupied: Boolean,
            content: {
                id: { type: Number },
                letter: { type: String },
                points: { type: Number },
                isBlank: { type: Boolean },
            },
            bonusType: String,
            fixed: Boolean,
        }]],
        leftInBag: { type: Number },
        passedTurns: { type: Number },
        isOnCooldown: { type: Boolean },
    },
 }
```

Board model

```javascript
 {
    creator: { type: Schema.Types.ObjectId, ref: 'User'},
    name: { type: String, required: true },
    size: { type: Number, default: 15 },
    bonusSquares: {
        type: [{ x: Number, y: Number, bonusType: String }],
        default: defaultBonusSquares,
    },
    default: { type: Boolean }
 }
```

TileBag model

```javascript
 {
    creator: { type: Schema.Types.ObjectId, ref: 'User'},
    name: { type: String, required: true },
    letterData: {
        type: [{ letter: String, count: Number, points: Number }],
        default: defaultLetterData, 
    },
    default: { type: Boolean }
 }
```

Message model

```javascript
 {
    sender: { type: Schema.Types.ObjectId, ref: 'User' },
    recipient: { type: Schema.Types.ObjectId, ref: 'User' },
    text: { type: String },
    timestamp: { type: Date, default: Date.now },
    title: { type: String },
    minor: { type: Boolean },
    generated: { type: Boolean },
    generatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    generatedFor: { type: Schema.Types.ObjectId, ref: 'Game' },
    targetReaction: { type: String },
    reactions: [{
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        type: { type: String },
    }]
 }
```

<br>


## API Endpoints (backend routes)

| HTTP Method | URL                 | Request Body                 | Success status | Error Status | Description              |
| ----------- | ------------------- | ---------------------------- | -------------- | ------------ | ------------------------ |
| POST        | `/auth/signup`      | {}                           | 200            | 400          |                          |
| POST        | `/auth/login`       | {}                           | 200            | 400          |                          |
| GET         | `/auth/verify`      |                              | 200            | 400          |                          |
| POST        | `/auth/google`      | {}                           | 200            | 400          |                          |
| GET         | `/account/profile`  |                              | 200            | 400          |                          |
| PUT         | `/account/profile`  | {}                           | 200            | 400          |                          |
| DELETE      | `/account/profile`  |                              | 200            | 400          |                          |
| GET         | `/account/games`    |                              | 200            | 400          |                          |
| GET         | `/account/rooms`              |                    | 200            | 400          |                          |
| GET         | `/account/room/:roomId`       |                    | 200            | 400          |                          |
| POST        | `/account/room`               | {}                 | 200            | 400          |                          |
| PUT         | `/account/room/:roomId`       | {}                 | 200            | 400          |                          |
| DELETE      | `/account/room/:roomId`       |                    | 200            | 400          |                          |
| GET         | `/account/boards`             |                    | 200            | 400          |                          |
| POST        | `/account/board`              | {}                 | 200            | 400          |                          |
| PUT         | `/account/board`              | {}                 | 200            | 400          |                          |
| DELETE      | `/account/board/:boardId`     |                    | 200            | 400          |                          |
| GET         | `/account/tilebags`           |                    | 200            | 400          |                          |
| POST        | `/account/tilebag`            | {}                 | 200            | 400          |                          |
| PUT         | `/account/tilebag`            | {}                 | 200            | 400          |                          |
| DELETE      | `/account/tilebag/:tilebagId` |                    | 200            | 400          |                          |
| GET         | `/api/ping`                   |                    | 200            | 400          |                          |
| GET         | `/api/dictionary`             |                    | 200            | 400          |                          |

<br>

## Links

### Git

[Client repository Link](https://github.com/AmVa93n/Scrabbler)

[Server repository Link](https://github.com/AmVa93n/Scrabbler-backend)

[Deployed App Link](https://scrabbler.netlify.app/)

### Slides

[Slides Link](https://slides.com/amirvaknin/scrabbler)