import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/public/Home.jsx";
import Login from "./pages/auth/login.jsx";
import Layout from "./components/admin/Layout.jsx";
import Dashboard from "./pages/admin/Dashboard.jsx";
import Cameras from "./pages/admin/Cameras.jsx"; 
import CameraDetail from "./pages/admin/CameraDetail.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />

      <Route path="/admin" element={<Layout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="cameras" element={<Cameras />} />
        <Route path="cameras/:id" element={<CameraDetail />} />
      </Route>
    </Routes>
  );
}

export default App;
