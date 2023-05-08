import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import "./index.css";
import { NavContextProvider } from "./Components/NavContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router >
      <NavContextProvider>
      <App />
      </NavContextProvider>
    </Router>
   
  </React.StrictMode>
);
