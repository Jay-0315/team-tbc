import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Success from "./pages/Success";
import Fail from "./pages/Fail";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/payments/success" element={<Success />} />
        <Route path="/payments/fail" element={<Fail />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
