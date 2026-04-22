import { useCallback } from 'react';
import { useMonthly } from '../context/MonthlyContext';
import { clientesService } from '@/services/clientesService';
import { alertasService } from '@/services/alertasService';
import { facturasService } from '@/services/facturasService';
import { Cliente, Factura } from '@/types/cliente';
import { toast } from 'sonner';

interface UseClienteActionsProps {
  reloadClientes: () => Promise<void>;
  setClientes: React.Dispatch<React.SetStateAction<Cliente[]>>;
  userType: string;
  contarFacturasVencidas: (cliente: Cliente) => number;
}

export function useClienteActions({
  reloadClientes,
  setClientes,
  userType,
  contarFacturasVencidas,
}: UseClienteActionsProps) {
  const { selectedCliente, setSelectedCliente, setSelectedFactura } = useMonthly();

  const handleVerDetalles = useCallback((cliente: Cliente) => {
    setSelectedCliente(cliente);
  }, [setSelectedCliente]);

  const handleVerHistorial = useCallback((cliente: Cliente) => {
    setSelectedCliente(cliente);
    // This would open historial modal - handled by parent
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
      });
      await reloadClientes();
      toast.success('Cliente suspendido correctamente y notificado a Soporte');
    } catch (error: any) {
      toast.error(error.message || 'No se pudo suspender el cliente');
    }
  }, [selectedCliente, reloadClientes, contarFacturasVencidas]);

  const handleReactivarCliente = useCallback(async (kit: string) => {
    if (!selectedCliente) return;

    try {
      await clientesService.actualizarEstado(kit, 'confirmado');
      await reloadClientes();
      toast.success('Cliente reactivado correctamente');
    } catch (error: any) {
      toast.error(error.message);
    }
  }, [selectedCliente, reloadClientes]);

  const handleMarcarEnDano = useCallback(async (kit: string) => {
    try {
      await clientesService.actualizarEstado(kit, 'en_dano');
      await reloadClientes();
      toast.success('Cliente marcado en daño');
    } catch (error: any) {
      toast.error(error.message);
    }
  }, [reloadClientes]);

  const handleMarcarEnGarantia = useCallback(async (kit: string) => {
    try {
      await clientesService.actualizarEstado(kit, 'garantia');
      await reloadClientes();
      toast.success('Cliente marcado en garantía');
    } catch (error: any) {
      toast.error(error.message);
    }
  }, [reloadClientes]);

  const handleMarcarTransferido = useCallback(async (kit: string) => {
    try {
      await clientesService.actualizarEstado(kit, 'transferida');
      await reloadClientes();
      toast.success('Cliente transferido');
    } catch (error: any) {
      toast.error(error.message);
    }
  }, [reloadClientes]);

  const handleActualizarEstadoFacturacion = useCallback(async (kit: string, estado: string | null) => {
    try {
      await clientesService.actualizarEstadoFacturacion(kit, estado);
      setClientes((prev) =>
        prev.map((c) =>
          c.kit === kit ? { ...c, estado_facturacion: estado as any } : c
        )
      );
    } catch (error: any) {
      toast.error('No se pudo actualizar estado');
    }
  }, [setClientes]);

  const handleSaveFactura = useCallback(async (kit: string, factura: Factura) => {
    try {
      const data = await facturasService.crear(kit, factura);
      setClientes((prev) =>
        prev.map((c) =>
          c.kit === kit
            ? {
                ...c,
                estado_facturacion: data.estado_facturacion ?? c.estado_facturacion,
                facturas: [...(c.facturas || []), data.factura],
              }
            : c
        )
      );
      toast.success('Factura agregada correctamente');
    } catch (error: any) {
      toast.error(error.message);
    }
  }, [setClientes]);

  const handleRegistrarPago = useCallback(async (kit: string, numero: string, metodoPago: string) => {
    try {
      const cliente = setClientes ? null : null;
      await reloadClientes();
      toast.success('Pago registrado');
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
    handleActualizarEstadoFacturacion,
    handleSaveFactura,
    handleRegistrarPago,
  };
}
