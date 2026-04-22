import { useCallback } from 'react';
import { useFusagasuga } from '../context/FusagasugaContext';
import { fusagasugaService } from '@/services/fusagasugaService';
import { alertasService } from '@/services/alertasService';
import { Cliente, Factura } from '@/types/cliente';
import { toast } from 'sonner';

interface UseFusagasugaActionsProps {
  reloadClientes: () => Promise<void>;
  setClientes: React.Dispatch<React.SetStateAction<Cliente[]>>;
  userType: string;
  contarFacturasVencidas: (cliente: Cliente) => number;
}

export function useFusagasugaActions({
  reloadClientes,
  setClientes,
  userType,
  contarFacturasVencidas,
}: UseFusagasugaActionsProps) {
  const { selectedCliente, setSelectedCliente, setSelectedFactura } = useFusagasuga();

  const handleVerDetalles = useCallback((cliente: Cliente) => {
    setSelectedCliente(cliente);
  }, [setSelectedCliente]);

  const handleVerHistorial = useCallback((cliente: Cliente) => {
    setSelectedCliente(cliente);
  }, [setSelectedCliente]);

  const handleAgregarFactura = useCallback((cliente: Cliente) => {
    setSelectedCliente(cliente);
  }, [setSelectedCliente]);

  const handleEditarObservacion = useCallback((cliente: Cliente) => {
    setSelectedCliente(cliente);
  }, [setSelectedCliente]);

  const handleEliminarCliente = useCallback((cliente: Cliente) => {
    setSelectedCliente(cliente);
  }, [setSelectedCliente]);

  const handleSuspenderCliente = useCallback(async (_kit: string, motivo: string) => {
    if (!selectedCliente) return;

    try {
      await alertasService.crearSuspension({
        kit: selectedCliente.kit,
        nombre: selectedCliente.nombrecliente,
        cuenta: selectedCliente.cuenta,
        email: selectedCliente.email,
        motivo,
        facturasVencidas: contarFacturasVencidas(selectedCliente),
        sede: 'fusagasuga',
      });
      await reloadClientes();
      toast.success('Cliente suspendido correctamente');
    } catch (error: any) {
      toast.error(error.message || 'No se pudo suspender el cliente');
    }
  }, [selectedCliente, reloadClientes, contarFacturasVencidas]);

  const handleReactivarCliente = useCallback(async (kit: string) => {
    if (!selectedCliente) return;

    try {
      await fusagasugaService.actualizarEstado(kit, 'confirmado');
      await reloadClientes();
      toast.success('Cliente reactivado correctamente');
    } catch (error: any) {
      toast.error(error.message);
    }
  }, [selectedCliente, reloadClientes]);

  const handleMarcarEnDano = useCallback(async (kit: string) => {
    try {
      await fusagasugaService.actualizarEstado(kit, 'en_dano');
      await reloadClientes();
      toast.success('Cliente marcado en daño');
    } catch (error: any) {
      toast.error(error.message);
    }
  }, [reloadClientes]);

  const handleMarcarEnGarantia = useCallback(async (kit: string) => {
    try {
      await fusagasugaService.actualizarEstado(kit, 'garantia');
      await reloadClientes();
      toast.success('Cliente marcado en garantía');
    } catch (error: any) {
      toast.error(error.message);
    }
  }, [reloadClientes]);

  const handleMarcarTransferido = useCallback(async (kit: string) => {
    try {
      await fusagasugaService.actualizarEstado(kit, 'transferida');
      await reloadClientes();
      toast.success('Cliente transferido');
    } catch (error: any) {
      toast.error(error.message);
    }
  }, [reloadClientes]);

  return {
    selectedCliente,
    setSelectedCliente,
    setSelectedFactura,
    handleVerDetalles,
    handleVerHistorial,
    handleAgregarFactura,
    handleEditarObservacion,
    handleEliminarCliente,
    handleSuspenderCliente,
    handleReactivarCliente,
    handleMarcarEnDano,
    handleMarcarEnGarantia,
    handleMarcarTransferido,
  };
}
