import { AppRouter } from './router/AppRouter';
import { AuthProvider } from './context/AuthContext';
import { NotificationsProvider } from './context/NotificationsContext';
import { PerfilProvider } from './context/PerfilContext';

function App() {
  return (
    <AuthProvider>
      <PerfilProvider>
        <NotificationsProvider>
          <AppRouter />
        </NotificationsProvider>
      </PerfilProvider>
    </AuthProvider>
  );
}

export default App;