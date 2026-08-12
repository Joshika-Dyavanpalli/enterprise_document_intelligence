import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Chat from "./pages/Chat";
import Documents from "./pages/Documents";
import Chats from "./pages/Chats";
import Profile from "./pages/Profile";
import UserManagement from "./pages/UserManagement";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route path="/signup" element={<Signup />} />

      <Route path="/dashboard" element={<Dashboard />} />

      <Route path="/upload" element={<Upload />} />

      <Route path="/documents" element={<Documents />} />

      <Route path="/chat" element={<Chat />} />

      <Route path="/chat/:chatId" element={<Chat />} />

      <Route path="/chats" element={<Chats />} />

      <Route path="/profile" element={<Profile />} />

      <Route path="/users" element={<UserManagement />} />
    </Routes>
  );
}

export default App;