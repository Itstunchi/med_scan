import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import DashboardLayout from './components/dashboard/DashboardLayout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Upload from './pages/Upload.jsx'
import Reports from './pages/Reports.jsx'
import ReportDetail from './pages/ReportDetail.jsx'
import Chat from './pages/Chat.jsx'
import Bottom from './components/dashboard//settings/Bottom.jsx'
import SettingsPage from './pages/settings.jsx'
import Home from './pages/home.jsx'
import Services from "./pages/Services.jsx";

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
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        <Route path="/dashboard" element={<Navigate to="/dashboard" replace />} />
        <Route path="/" element={<Home/> }/>
        <Route path="/Services" element={<Services/> }/>
      </Routes>
    </BrowserRouter>
  );
}
