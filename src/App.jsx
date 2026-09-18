import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PortfolioProvider } from './context/PortfolioContext';
import PublicPortfolio from './pages/public/PublicPortfolio';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

// Cargados bajo demanda: la mayoría de visitantes solo ve la vista pública,
// así que ni el admin (Supabase CRUD) ni Recharts (Economic Explainer)
// deberían ir en el bundle inicial.
const EconomicExplainer = lazy(() => import('./pages/public/EconomicExplainer'));
const Login = lazy(() => import('./pages/admin/Login'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <PortfolioProvider>
          <Suspense fallback={null}>
            <Routes>
              {/* Ruta pública */}
              <Route path="/" element={<PublicPortfolio />} />
              <Route path="/proyectos/explicador-economico" element={<EconomicExplainer />} />

              {/* Rutas de administración */}
              <Route path="/admin" element={<Login />} />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* Redireccionar cualquier otra ruta */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </PortfolioProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
