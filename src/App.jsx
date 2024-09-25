import { Routes, Route, useLocation } from "react-router-dom";

import HomePage from "./pages/HomePage";
import DictionaryPage from "./pages/DictionaryPage";
import ProfilePage from "./pages/ProfilePage";
import SignupPage from "./pages/SignUpPage";
import LoginPage from "./pages/SignInPage";
import RoomsPage from "./pages/RoomsPage";
import BoardEditorPage from "./pages/BoardEditorPage";
import TileBagEditorPage from "./pages/TileBagEditorPage";
import RoomPage from "./pages/RoomPage";
import Navbar from "./components/Navbar";
import IsPrivate from "./components/IsPrivate";
import IsAnon from "./components/IsAnon";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import { RoomProvider } from "./context/room.context";
import { GameProvider } from './context/game.context';

function App() {
  const location = useLocation();
  const isInRoom = /\/rooms\/[a-zA-Z0-9]+/.test(location.pathname);

  return (
    <div className="App">
      {!isInRoom && <Navbar />}

      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="/dictionary" element={<DictionaryPage />} />

        <Route path="/profile" element={
            <IsPrivate>
              <ProfilePage />
            </IsPrivate>
          }/>

        <Route path="/rooms" element={
            <IsPrivate>
              <RoomsPage />
            </IsPrivate>
          }/>

        <Route path="/boardeditor" element={
            <IsPrivate>
              <BoardEditorPage />
            </IsPrivate>
          }/>

        <Route path="/tilebageditor" element={
            <IsPrivate>
              <TileBagEditorPage />
            </IsPrivate>
          }/>

        <Route path="/rooms/:roomId" element={
            <IsPrivate>
              <RoomProvider>
                <GameProvider>
                  <RoomPage />
                </GameProvider>
              </RoomProvider>
            </IsPrivate>
          }/>

        <Route path="/signup" element={
            <IsAnon>
              <SignupPage />
            </IsAnon>
          }/>

        <Route path="/login" element={
            <IsAnon>
              <LoginPage />
            </IsAnon>
          }/>
      </Routes>
    </div>
  );
}

export default App;
