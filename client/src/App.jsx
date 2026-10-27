import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import { AppearanceProvider, useAppearance } from './context/AppearanceContext';
import ProtectedRoute from './routes/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import InvoicesPage from './pages/InvoicesPage';
import ContactsPage from './pages/ContactsPage';

const ThemedApp = () => {
  const { muiTheme } = useAppearance();
  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/sign-in" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/sign-up" element={<SignupPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/invoices" replace />} />
            <Route path="invoices" element={<InvoicesPage />} />
            <Route path="contacts" element={<ContactsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/invoices" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

const App = () => (
  <AuthProvider>
    <AppearanceProvider>
      <ThemedApp />
    </AppearanceProvider>
  </AuthProvider>
);

export default App;
