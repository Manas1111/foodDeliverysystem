import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar           from './components/Navbar'
import ProtectedRoute   from './components/ProtectedRoute'
import Login            from './pages/Login'
import Register         from './pages/Register'
import Home             from './pages/Home'
import Restaurant       from './pages/Restaurant'
import Cart             from './pages/Cart'
import Orders           from './pages/Orders'
import AdminDashboard   from './pages/AdminDashboard'

export default function App() {
  return (
    <div className="min-h-screen bg-dark-950 text-white">
      <Navbar />
      <main>
        <Routes>
          {/* Public routes */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected customer routes */}
          <Route path="/" element={
            <ProtectedRoute><Home /></ProtectedRoute>
          } />
          <Route path="/restaurant/:id" element={
            <ProtectedRoute><Restaurant /></ProtectedRoute>
          } />
          <Route path="/cart" element={
            <ProtectedRoute><Cart /></ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute><Orders /></ProtectedRoute>
          } />

          {/* Admin-only route */}
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
