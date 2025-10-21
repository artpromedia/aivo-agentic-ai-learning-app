import { PageWrapper } from '../components/PageWrapper';

interface RouteDefinition {
  path: string;
  screen: string;
  title: string;
  category?: string;
  roles?: string[];
}

export function DevRoutes() {
  const routes = ((window as Window & { __ROUTES?: RouteDefinition[] }).__ROUTES || []);

  return (
    <PageWrapper>
      <div className="min-h-screen bg-gray-50 p-8" data-testid="page-dev-routes">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-gray-900">📋 Route Catalog</h1>
          <p className="text-gray-600 mb-6">
            Total routes registered: <strong>{routes.length}</strong>
          </p>
          
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Path</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Screen</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {routes.map((route, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <a 
                        href={`#${route.path}`}
                        className="text-blue-600 hover:text-blue-800 font-mono"
                      >
                        {route.path}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {route.screen}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {route.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        {route.category || 'general'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
