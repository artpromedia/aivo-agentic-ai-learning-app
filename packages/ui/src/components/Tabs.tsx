import { ReactNode, createContext, useContext } from 'react';

interface TabsContextValue {
  activeValue: string;
  onChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

interface TabsProps {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  className?: string;
}

export function Tabs({ value, onChange, children, className = '' }: TabsProps) {
  return (
    <TabsContext.Provider value={{ activeValue: value, onChange }}>
      <div className={className}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

interface TabProps {
  value: string;
  label: string;
  count?: number;
  children: ReactNode;
}

export function Tab({ value, label, count, children }: TabProps) {
  const context = useContext(TabsContext);
  
  if (!context) {
    throw new Error('Tab must be used within Tabs');
  }

  const { activeValue, onChange } = context;
  const isActive = activeValue === value;

  return (
    <div>
      <button
        onClick={() => onChange(value)}
        className={`
          px-4 py-2 font-medium text-sm rounded-t-lg transition-colors
          ${isActive 
            ? 'bg-white text-blue-600 border-b-2 border-blue-600' 
            : 'text-neutral-600 hover:text-neutral-900'
          }
        `}
        data-testid={`tab-${value}`}
      >
        {label}
        {count !== undefined && (
          <span className={`
            ml-2 px-2 py-0.5 rounded-full text-xs
            ${isActive ? 'bg-blue-100 text-blue-600' : 'bg-neutral-100 text-neutral-600'}
          `}>
            {count}
          </span>
        )}
      </button>
      {isActive && (
        <div className="mt-4">
          {children}
        </div>
      )}
    </div>
  );
}

interface TabsListProps {
  children: ReactNode;
  className?: string;
}

export function TabsList({ children, className = '' }: TabsListProps) {
  return (
    <div className={`flex gap-2 border-b border-neutral-200 ${className}`}>
      {children}
    </div>
  );
}
