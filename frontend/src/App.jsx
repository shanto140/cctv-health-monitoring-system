import { Routes, Route, Navigate } from 'react-router-dom';

import Home from "./pages/public/Home.jsx";
import Login from "./pages/auth/login.jsx";


function App() {
  return (
    <Routes>
       <Route path="/" element={<Home />} />
       <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default App;