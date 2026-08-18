import { Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";

import Home from "./pages/public/Home.jsx";
import Login from "./pages/auth/login.jsx";
import Layout from "./components/admin/Layout.jsx";
import Dashboard from "./pages/admin/Dashboard.jsx";
import Cameras from "./pages/admin/Cameras.jsx"; 
import CameraDetail from "./pages/admin/CameraDetail.jsx";
import Technicians from "./pages/admin/Technicians.jsx";
import TechnicianDetail from "./pages/admin/TechnicianDetail.jsx";
import Incidents from "./pages/admin/Incidents.jsx";
import IncidentDetail from "./pages/admin/IncidentDetail.jsx";
import EventHistory from "./pages/admin/EventHistory.jsx";

import TechnicianLayout from "./components/technician/Layout.jsx";
import TechnicianDashboard from "./pages/technician/Dashboard.jsx";
import TechnicianCameraPreview from "./pages/technician/CameraPreview.jsx";



function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="cameras" element={<Cameras />} />
          <Route path="cameras/:id" element={<CameraDetail />} /> 
          <Route path="technicians" element={<Technicians />} />
          <Route path="technicians/:id" element={<TechnicianDetail />} />
          <Route path="incidents" element={<Incidents />} />
          <Route path="incidents/:id" element={<IncidentDetail />} />
          <Route path="event-history" element={<EventHistory />} />
        </Route>

        <Route
          path="/technician"
          element={
            <ProtectedRoute allowedRoles={["Technician"]}>
              <TechnicianLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<TechnicianDashboard />} />
          <Route path="cameras/:id" element={<TechnicianCameraPreview />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;