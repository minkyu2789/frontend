import { Navigation } from './navigation';
import { AuthProvider } from './auth';
import { LocaleProvider } from "./locale";

export default function App() {
  return (
    <AuthProvider>
      <LocaleProvider>
        <Navigation />
      </LocaleProvider>
    </AuthProvider>
  );
}
