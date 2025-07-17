import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/tailwind.css";
import "./styles/index.css";
import './i18n'; // ✅ فقط این خط را اضافه کن

const container = document.getElementById("root");
const root = createRoot(container);

root.render(<App />);
