import { Navigation } from './navigation';
import { AuthProvider } from './auth';

export default function App() {
  return (
    <AuthProvider>
      <Navigation />
    </AuthProvider>
  );
}
