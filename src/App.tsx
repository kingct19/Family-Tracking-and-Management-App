import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';

// Core providers and utilities
import { queryClient } from '@/lib/query-client';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingSpinner } from '@/components/LoadingSpinner';

// Lazy load pages for code splitting
const HomePage = lazy(() => import('@/features/auth/pages/HomePage'));
const TestPage = lazy(() => import('@/features/auth/pages/TestPage'));
const TestStylingPage = lazy(() => import('@/features/auth/pages/TestStylingPage'));
const SimpleTestPage = lazy(() => import('@/features/auth/pages/SimpleTestPage'));
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'));
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'));
const DebugDashboardPage = lazy(() => import('@/features/dashboard/pages/DebugDashboardPage'));
const LocationPage = lazy(() => import('@/features/location/pages/LocationPage'));
const TasksPage = lazy(() => import('@/features/tasks/pages/TasksPage'));
const MessagesPage = lazy(() => import('@/features/messages/pages/MessagesPage'));
const VaultPage = lazy(() => import('@/features/vault/pages/VaultPage'));
const SettingsPage = lazy(() => import('@/features/settings/pages/SettingsPage'));
const NotFoundPage = lazy(() => import('@/features/auth/pages/NotFoundPage'));

// Layout components
const AppLayout = lazy(() => import('@/components/AppLayout'));
const ProtectedRoute = lazy(() => import('@/components/ProtectedRoute'));

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <div className="App">
            <Suspense fallback={<LoadingSpinner size="large" />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/test" element={<TestPage />} />
                <Route path="/test-styling" element={<TestStylingPage />} />
                <Route path="/simple-test" element={<SimpleTestPage />} />
                <Route path="/debug-dashboard" element={<DebugDashboardPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected Routes */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }>
                  {/* Map is the main screen (Life360 style) */}
                  <Route index element={<LocationPage />} />
                  <Route path="map" element={<LocationPage />} />
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="tasks" element={<TasksPage />} />
                  <Route path="messages" element={<MessagesPage />} />
                  <Route path="vault" element={<VaultPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>

                {/* 404 Route */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>

            {/* Toast notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#4ade80',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </HelmetProvider>

        {/* React Query DevTools */}
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;