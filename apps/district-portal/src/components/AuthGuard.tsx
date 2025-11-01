import { ReactNode, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      console.warn('🔒 No auth token found - redirecting to login');
      // Save the current location so we can redirect back after login
      navigate('/login', { state: { from: location.pathname }, replace: true });
    }
  }, [navigate, location]);

  const token = localStorage.getItem('auth_token');
  
  if (!token) {
    return null; // Don't render anything while redirecting
  }

  return <>{children}</>;
}
