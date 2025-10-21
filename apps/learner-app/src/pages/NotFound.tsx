import { useNavigate } from 'react-router-dom';
import { useTheme } from '@aivo/ui';
import { PageWrapper } from '../components/PageWrapper';

export function NotFound() {
  const navigate = useNavigate();
  const { themeConfig } = useTheme();

  return (
    <PageWrapper is404>
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          background: `linear-gradient(to bottom right, ${themeConfig.colors.primary}22, ${themeConfig.colors.secondary}22)`,
        }}
      >
        <div className="text-center max-w-md">
          <div className="text-9xl mb-4">😕</div>
          <h1 className="text-4xl font-bold mb-4" style={{ color: themeConfig.colors.primary }}>
            Oops! Page Not Found
          </h1>
          <p className="text-xl mb-8 text-gray-600">
            We couldn't find the page you're looking for.
          </p>
          
          <div className="flex flex-col gap-4">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 rounded-lg text-white font-bold transition-all"
              style={{
                backgroundColor: themeConfig.colors.primary,
              }}
            >
              🏠 Go Home
            </button>
            
            <button
              data-testid="nav-to-catalog"
              onClick={() => navigate('/dev/routes')}
              className="px-6 py-3 rounded-lg border-2 font-bold transition-all"
              style={{
                borderColor: themeConfig.colors.primary,
                color: themeConfig.colors.primary,
              }}
            >
              📋 View Route Catalog
            </button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
