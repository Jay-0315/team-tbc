import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import TopupPage from "./pages/TopupPage";
import JoinMeetupPage from "./pages/JoinMeetupPage";
import Success from "./pages/Success";
import Fail from "./pages/Fail";
import MonitoringUi from "./pages/MonitoringUi";
import WalletPage from "./pages/WalletPage";
import MyPage from "./pages/MyPage";
import ProfileEditPage from "./pages/ProfileEditPage";
import PaymentHistoryPage from "./pages/PaymentHistoryPage";
import SettingsPage from "./pages/SettingsPage";
import EventsPage from "./pages/EventsPage";
import EventDetailPage from "./pages/EventDetailPage";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const qc = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<EventsPage />} />
            <Route path="events" element={<EventsPage />} />
            <Route path="event/:id" element={<EventDetailPage />} />
            <Route path="topup" element={<TopupPage />} />
            <Route path="join" element={<JoinMeetupPage />} />
            <Route path="wallet" element={<WalletPage />} />
            <Route path="mypage" element={<MyPage />} />
            <Route path="profile/edit" element={<ProfileEditPage />} />
            <Route path="payments/history" element={<PaymentHistoryPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="payments/success" element={<Success />} />
            <Route path="payments/fail" element={<Fail />} />
            <Route path="monitoring" element={<MonitoringUi />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);