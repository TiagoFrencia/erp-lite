import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SalesPage from './pages/SalesPage';
import CreateSalePage from './pages/CreateSalePage';
import ProductsPage from './pages/ProductsPage';
import CustomersPage from './pages/CustomersPage';
import NotFoundPage from './pages/NotFoundPage';
import StockPage from './pages/StockPage'; // 👈 NUEVO
import Layout from './components/Layout';

// 👇 NUEVA PÁGINA
import CreateProductPage from './pages/CreateProductPage';

export default function App() {
  return (
    <Routes>
      {/* Pública */}
      <Route path="/login" element={<LoginPage />} />

      {/* Privadas */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/sales/new" element={<CreateSalePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/new" element={<CreateProductPage />} /> {/* 👈 NUEVA RUTA */}
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/stock" element={<StockPage />} /> {/* 👈 STOCK */}
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
