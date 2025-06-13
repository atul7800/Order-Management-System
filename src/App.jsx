import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import CreateOrderPage from "./pages/CreateOrderPage";
import OrdersPage from "./pages/OrdersPage";
import ToastProvider from "./context/ToastContext";
import SKUPage from "./pages/SKUs";
import "./App.css";

export default function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/skus" element={<SKUPage />} />
          <Route path="/create-order" element={<CreateOrderPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="*" element={<Navigate to="/orders" replace />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}
