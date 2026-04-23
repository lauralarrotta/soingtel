import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Cliente, Factura, EstadoFacturacion } from '@/types/cliente';

interface MonthlyContextValue {
  selectedCliente: Cliente | null;
  selectedFactura: Factura | null;
  activeCardFilter: string;
  showOnlyMora: boolean;
  searchTerm: string;
  filterEstado: string;
  filterCorte: string;
  setSelectedCliente: (cliente: Cliente | null) => void;
  setSelectedFactura: (factura: Factura | null) => void;
  setActiveCardFilter: (filter: string) => void;
  setShowOnlyMora: (show: boolean) => void;
  setSearchTerm: (term: string) => void;
  setFilterEstado: (filter: string) => void;
  setFilterCorte: (filter: string) => void;
}

const MonthlyContext = createContext<MonthlyContextValue | null>(null);

interface MonthlyProviderProps {
  children: ReactNode;
}

export function MonthlyProvider({ children }: MonthlyProviderProps) {
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [selectedFactura, setSelectedFactura] = useState<Factura | null>(null);
  const [activeCardFilter, setActiveCardFilter] = useState('todos');
  const [showOnlyMora, setShowOnlyMora] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [filterCorte, setFilterCorte] = useState('todos');

  const value: MonthlyContextValue = {
    selectedCliente,
    selectedFactura,
    activeCardFilter,
    showOnlyMora,
    searchTerm,
    filterEstado,
    filterCorte,
    setSelectedCliente,
    setSelectedFactura,
    setActiveCardFilter,
    setShowOnlyMora,
    setSearchTerm,
    setFilterEstado,
    setFilterCorte,
  };

  return (
    <MonthlyContext.Provider value={value}>
      {children}
    </MonthlyContext.Provider>
  );
}

export function useMonthly() {
  const context = useContext(MonthlyContext);
  if (!context) {
    throw new Error('useMonthly must be used within MonthlyProvider');
  }
  return context;
}
