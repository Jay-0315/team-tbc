import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";   // ✅ 반드시 필요

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);