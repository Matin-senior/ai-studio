import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import Header from "components/ui/Header";
import AIChatInterface from "pages/ai-chat-interface";
import ModelManagementDashboard from "pages/model-management-dashboard";
import SettingsConfiguration from "pages/settings-configuration";
import ConnectionsManagement from "pages/connections-management";
import FileManagementWorkspace from "pages/file-management-workspace";

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <Header />
        <RouterRoutes>
          <Route path="/" element={<AIChatInterface />} />
          <Route path="/ai-chat-interface" element={<AIChatInterface />} />
          <Route path="/model-management-dashboard" element={<ModelManagementDashboard />} />
          <Route path="/settings-configuration" element={<SettingsConfiguration />} />
          <Route path="/connections-management" element={<ConnectionsManagement />} />
          <Route path="/file-management-workspace" element={<FileManagementWorkspace />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;