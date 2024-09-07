import { Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage/HomePage";
import ProfilePage from "./pages/ProfilePage";
import SignupPage from "./pages/SignupPage/SignUp";
import LoginPage from "./pages/LoginPage";
import RoomsPage from "./pages/RoomsPage";
import CreateRoomPage from "./pages/CreateRoomPage";
import RoomPage from "./pages/RoomPage";
import Navbar from "./components/Navbar";
import IsPrivate from "./components/IsPrivate/IsPrivate";
import IsAnon from "./components/IsAnon/IsAnon";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

function App() {
  return (
    <div className="App">
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
          path="/rooms/create"
          element={
            <IsPrivate>
              <CreateRoomPage />
            </IsPrivate>
          }
        />

        <Route
          path="/rooms/edit"
          element={
            <IsPrivate>
              <CreateRoomPage />
            </IsPrivate>
          }
        />

        <Route
          path="/rooms/:roomId"
          element={
            <IsPrivate>
              <RoomPage />
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
