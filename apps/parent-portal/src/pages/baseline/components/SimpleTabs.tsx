/**
 * Simple accessible tabs component
 */
import { useState, ReactNode } from 'react';

interface Tab {
  value: string;
  label: string;
  content: ReactNode;
}

export function SimpleTabs({ tabs }: { tabs: Tab[] }) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.value || '');

  return (
    <div>
      {/* Tab list */}
      <div 
        className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6"
        role="tablist"
        aria-label="Subject areas"
      >
        {tabs.map((tab) => (
          <button
            key={tab.value}
            role="tab"
            aria-selected={activeTab === tab.value}
            aria-controls={`panel-${tab.value}`}
            id={`tab-${tab.value}`}
            onClick={() => setActiveTab(tab.value)}
            className={`
              px-4 py-3 rounded-lg font-medium transition-all text-center
              ${activeTab === tab.value
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      {tabs.map((tab) => (
        <div
          key={tab.value}
          role="tabpanel"
          id={`panel-${tab.value}`}
          aria-labelledby={`tab-${tab.value}`}
          hidden={activeTab !== tab.value}
          className="py-4"
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
