import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Matches from './pages/Matches'
import Teams from './pages/Teams'
import Odds from './pages/Odds'
import ValueBets from './pages/ValueBets'
import Predictions from './pages/Predictions'
import Analytics from './pages/Analytics'
import Backtesting from './pages/Backtesting'
import Bankroll from './pages/Bankroll'
import Export from './pages/Export'
import Alerts from './pages/Alerts'
import Settings from './pages/Settings'

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/matches"
          element={
            <ProtectedRoute>
              <Layout>
                <Matches />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/teams"
          element={
            <ProtectedRoute>
              <Layout>
                <Teams />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/odds"
          element={
            <ProtectedRoute>
              <Layout>
                <Odds />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/value-bets"
          element={
            <ProtectedRoute>
              <Layout>
                <ValueBets />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/predictions"
          element={
            <ProtectedRoute>
              <Layout>
                <Predictions />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Layout>
                <Analytics />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/backtesting"
          element={
            <ProtectedRoute>
              <Layout>
                <Backtesting />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/bankroll"
          element={
            <ProtectedRoute>
              <Layout>
                <Bankroll />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/export"
          element={
            <ProtectedRoute>
              <Layout>
                <Export />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/alerts"
          element={
            <ProtectedRoute>
              <Layout>
                <Alerts />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  )
}

export default App
