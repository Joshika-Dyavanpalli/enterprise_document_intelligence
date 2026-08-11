import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Chat from "./pages/Chat";
import Documents from "./pages/Documents";
import Chats from "./pages/Chats";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route path="/signup" element={<Signup />} />

      <Route path="/dashboard" element={<Dashboard />} />

      <Route path="/upload" element={<Upload />} />

      <Route path="/documents" element={<Documents />} />

      {/* Chat without a selected conversation */}
      <Route path="/chat" element={<Chat />} />

      {/* Specific conversation */}
      <Route path="/chat/:chatId" element={<Chat />} />
      <Route path="/chats" element={<Chats />} />
    </Routes>
  );
}

export default App;
