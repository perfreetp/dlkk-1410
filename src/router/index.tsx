import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import DashboardPage from "@/pages/Dashboard";
import CatalogPage from "@/pages/Catalog";
import PermissionsPage from "@/pages/Permissions";
import MonitoringPage from "@/pages/Monitoring";
import ApprovalPage from "@/pages/Approval";
import AnalyticsPage from "@/pages/Analytics";
import RectificationPage from "@/pages/Rectification";
import AuditPage from "@/pages/Audit";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/permissions" element={<PermissionsPage />} />
          <Route path="/monitoring" element={<MonitoringPage />} />
          <Route path="/approval" element={<ApprovalPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/rectification" element={<RectificationPage />} />
          <Route path="/audit" element={<AuditPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
