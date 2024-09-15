import { Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import SignupPage from "./pages/SignupPage/SignUp";
import LoginPage from "./pages/LoginPage";
import RoomsPage from "./pages/RoomsPage";
import RoomPage from "./pages/RoomPage";
import Navbar from "./components/Navbar";
import IsPrivate from "./components/IsPrivate/IsPrivate";
import IsAnon from "./components/IsAnon/IsAnon";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import { RoomProvider } from "./context/room.context";
import { GameProvider } from './context/game.context';

function App() {
  return (
    <div className="App" style={{backgroundColor: 'lightblue', height: '100vh'}}>
      <Navbar />

      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route
          path="/profile"
          element={
            <IsPrivate>
              <ProfilePage />
            </IsPrivate>
          }
        />

        <Route
          path="/rooms"
          element={
            <IsPrivate>
              <RoomsPage />
            </IsPrivate>
          }
        />

        <Route
          path="/rooms/:roomId"
          element={
            <IsPrivate>
              <RoomProvider>
                <GameProvider>
                  <RoomPage />
                </GameProvider>
              </RoomProvider>
            </IsPrivate>
          }
        />

        <Route
          path="/signup"
          element={
            <IsAnon>
              <SignupPage />
            </IsAnon>
          }
        />
        <Route
          path="/login"
          element={
            <IsAnon>
              <LoginPage />
            </IsAnon>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
