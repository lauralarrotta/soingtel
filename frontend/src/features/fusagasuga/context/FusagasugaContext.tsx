import { createContext, useContext, useState, ReactNode } from 'react';
import { Cliente, Factura } from '@/types/cliente';

interface FusagasugaContextValue {
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

const FusagasugaContext = createContext<FusagasugaContextValue | null>(null);

interface FusagasugaProviderProps {
  children: ReactNode;
}

export function FusagasugaProvider({ children }: FusagasugaProviderProps) {
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [selectedFactura, setSelectedFactura] = useState<Factura | null>(null);
  const [activeCardFilter, setActiveCardFilter] = useState('todos');
  const [showOnlyMora, setShowOnlyMora] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [filterCorte, setFilterCorte] = useState('todos');

  const value: FusagasugaContextValue = {
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
    <FusagasugaContext.Provider value={value}>
      {children}
    </FusagasugaContext.Provider>
  );
}

export function useFusagasuga() {
  const context = useContext(FusagasugaContext);
  if (!context) {
    throw new Error('useFusagasuga must be used within FusagasugaProvider');
  }
  return context;
}
