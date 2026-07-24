import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import DashboardLayout from "./components/dashboard/DashboardLayout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Upload from "./pages/Upload.jsx";
import Reports from "./pages/Reports.jsx";
import ReportDetail from "./pages/ReportDetail.jsx";
import Chat from "./pages/Chat.jsx";
import SettingsProfile from "./components/dashboard/settings/SettingsProfile.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/reports/:id" element={<ReportDetail />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/settings" element={<SettingsProfile />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
