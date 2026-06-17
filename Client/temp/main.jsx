import React from "react";
import ReactDom from "react-dom/client";
import App from "./App";
import Home from "./Home";
import Login from "./Login";
import Signup from "./Signup";

import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

ReactDom.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>

      <Route
        path="/"
        element={<Home />}
      />

     

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/signup"
        element={<Signup />}
      />

      <Route
        path="/project/:roomId"
        element={<App />}
      />

    </Routes>
  </BrowserRouter>
);