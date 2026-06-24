import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, Mail, Phone, Calendar, MapPin, 
  CreditCard, Package, Download, Edit, 
  Trash2, Plus, Check, X, Home, Save,
  LogOut, Heart, ShoppingBag, Settings
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const PerfilPage = () => {
  const { user, logout } = useAuth();
  const { 
    profile, loading, updateProfile,
    direcciones, metodosPago,
    addDireccion, deleteDireccion, setDireccionPrincipal,
    addMetodoPago, deleteMetodoPago,
    getPedidos, getFactura
  } = useUserProfile();

  const [activeTab, setActiveTab] = useState('perfil');
  const [editMode, setEditMode] = useState(false);
  const [userPedidos, setUserPedidos] = useState<any[]>([]);
  const [loadingPedidos, setLoadingPedidos] = useState(false);
  
  // Estados para formularios
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    telefono: '',
    fechaNacimiento: '',
    newsletter: false
  });

  const [nuevaDireccion, setNuevaDireccion] = useState(false);
  const [direccionForm, setDireccionForm] = useState({
    nombre: '',
    apellidos: '',
    direccion: '',
    ciudad: '',
    codigoPostal: '',
    provincia: '',
    pais: 'España',
    telefono: '',
    principal: false
  });

  const [nuevoMetodo, setNuevoMetodo] = useState(false);
  const [metodoForm, setMetodoForm] = useState({
    tipo: 'tarjeta' as 'tarjeta' | 'paypal' | 'transferencia',
    titular: '',
    numero: '',
    expiracion: '',
    marca: 'visa' as 'visa' | 'mastercard' | 'amex' | 'paypal',
    principal: false
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        nombre: profile.nombre || '',
        apellidos: profile.apellidos || '',
        telefono: profile.telefono || '',
        fechaNacimiento: profile.fechaNacimiento ? new Date(profile.fechaNacimiento).toISOString().split('T')[0] : '',
        newsletter: profile.newsletter || false
      });
    }
  }, [profile]);

  useEffect(() => {
    if (activeTab === 'pedidos') {
      loadPedidos();
    }
  }, [activeTab]);

  const loadPedidos = async () => {
    setLoadingPedidos(true);
    const pedidos = await getPedidos();
    setUserPedidos(pedidos);
    setLoadingPedidos(false);
  };

  const handleLogout = async () => {
    await logout();
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente",
    });
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile(formData);
      setEditMode(false);
      toast({
        title: "Perfil actualizado",
        description: "Tus datos se han guardado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios",
        variant: "destructive",
      });
    }
  };

  const handleAddDireccion = async () => {
    try {
      await addDireccion(direccionForm);
      setNuevaDireccion(false);
      setDireccionForm({
        nombre: '', apellidos: '', direccion: '', ciudad: '',
        codigoPostal: '', provincia: '', pais: 'España', telefono: '', principal: false
      });
      toast({
        title: "Dirección añadida",
        description: "La dirección se ha guardado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo añadir la dirección",
        variant: "destructive",
      });
    }
  };

  const handleAddMetodoPago = async () => {
    try {
      const metodoToSave = {
        ...metodoForm,
        numero: metodoForm.numero.slice(-4)
      };
      await addMetodoPago(metodoToSave);
      setNuevoMetodo(false);
      setMetodoForm({
        tipo: 'tarjeta', titular: '', numero: '', expiracion: '',
        marca: 'visa', principal: false
      });
      toast({
        title: "Método de pago añadido",
        description: "La tarjeta se ha guardado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo añadir el método de pago",
        variant: "destructive",
      });
    }
  };

  const handleDescargarFactura = async (pedidoId: string) => {
    const url = await getFactura(pedidoId);
    if (url) {
      window.open(url, '_blank');
    } else {
      toast({
        title: "Factura no disponible",
        description: "La factura aún no está generada",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: 'perfil', label: 'Perfil', icon: User },
    { id: 'direcciones', label: 'Direcciones', icon: Home },
    { id: 'pagos', label: 'Métodos de Pago', icon: CreditCard },
    { id: 'pedidos', label: 'Mis Pedidos', icon: Package },
    { id: 'configuracion', label: 'Configuración', icon: Settings },
  ];

  const getEstadoColor = (estado: string) => {
    switch(estado) {
      case 'entregado': return 'bg-green-500/20 text-green-500';
      case 'enviado': return 'bg-blue-500/20 text-blue-500';
      case 'procesando': return 'bg-yellow-500/20 text-yellow-500';
      case 'cancelado': return 'bg-red-500/20 text-red-500';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-black">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        {/* Header del perfil */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Mi Perfil</h1>
            <p className="text-gray-400 text-sm mt-1">
              Gestiona tu información personal, direcciones y pedidos
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-all"
          >
            <LogOut size={16} />
            Cerrar Sesión
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar de pestañas */}
          <div className="lg:col-span-1">
            <div className="bg-[#0a0a0a] rounded-2xl border border-green-900/30 p-4 sticky top-24">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-2 ${
                      activeTab === tab.id
                        ? 'bg-green-500/20 text-green-500'
                        : 'text-gray-400 hover:bg-green-500/5 hover:text-white'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contenido de la pestaña activa */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0a0a0a] rounded-2xl border border-green-900/30 p-6"
            >
              {/* PESTAÑA PERFIL */}
              {activeTab === 'perfil' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-white">Información Personal</h2>
                    <button
                      onClick={() => setEditMode(!editMode)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-all"
                    >
                      <Edit size={16} />
                      {editMode ? 'Cancelar' : 'Editar'}
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Nombre</label>
                        <input
                          type="text"
                          value={formData.nombre}
                          onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                          disabled={!editMode}
                          className="w-full bg-black/50 border border-green-900/30 rounded-lg px-4 py-2 text-white disabled:opacity-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Apellidos</label>
                        <input
                          type="text"
                          value={formData.apellidos}
                          onChange={(e) => setFormData({...formData, apellidos: e.target.value})}
                          disabled={!editMode}
                          className="w-full bg-black/50 border border-green-900/30 rounded-lg px-4 py-2 text-white disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Email</label>
                      <div className="flex items-center gap-2 p-2 bg-black/30 rounded-lg border border-green-900/30">
                        <Mail size={16} className="text-gray-500" />
                        <span className="text-white">{user.email}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Teléfono</label>
                      <input
                        type="tel"
                        value={formData.telefono}
                        onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                        disabled={!editMode}
                        className="w-full bg-black/50 border border-green-900/30 rounded-lg px-4 py-2 text-white disabled:opacity-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Fecha de Nacimiento</label>
                      <input
                        type="date"
                        value={formData.fechaNacimiento}
                        onChange={(e) => setFormData({...formData, fechaNacimiento: e.target.value})}
                        disabled={!editMode}
                        className="w-full bg-black/50 border border-green-900/30 rounded-lg px-4 py-2 text-white disabled:opacity-50"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.newsletter}
                        onChange={(e) => setFormData({...formData, newsletter: e.target.checked})}
                        disabled={!editMode}
                        className="accent-green-500"
                      />
                      <span className="text-white text-sm">Recibir newsletter y ofertas exclusivas</span>
                    </div>

                    {editMode && (
                      <button
                        onClick={handleSaveProfile}
                        className="w-full bg-green-500 text-black font-medium py-3 rounded-lg hover:bg-green-400 transition-all mt-4"
                      >
                        Guardar Cambios
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* PESTAÑA DIRECCIONES */}
              {activeTab === 'direcciones' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-white">Mis Direcciones</h2>
                    <button
                      onClick={() => setNuevaDireccion(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-all"
                    >
                      <Plus size={16} />
                      Añadir Dirección
                    </button>
                  </div>

                  {nuevaDireccion && (
                    <div className="mb-6 p-4 bg-green-500/5 rounded-xl border border-green-500/30">
                      <h3 className="text-white font-medium mb-4">Nueva Dirección</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Nombre *"
                          value={direccionForm.nombre}
                          onChange={(e) => setDireccionForm({...direccionForm, nombre: e.target.value})}
                          className="bg-black/50 border border-green-900/30 rounded-lg px-4 py-2 text-white"
                        />
                        <input
                          type="text"
                          placeholder="Apellidos *"
                          value={direccionForm.apellidos}
                          onChange={(e) => setDireccionForm({...direccionForm, apellidos: e.target.value})}
                          className="bg-black/50 border border-green-900/30 rounded-lg px-4 py-2 text-white"
                        />
                        <input
                          type="text"
                          placeholder="Dirección *"
                          value={direccionForm.direccion}
                          onChange={(e) => setDireccionForm({...direccionForm, direccion: e.target.value})}
                          className="md:col-span-2 bg-black/50 border border-green-900/30 rounded-lg px-4 py-2 text-white"
                        />
                        <input
                          type="text"
                          placeholder="Ciudad *"
                          value={direccionForm.ciudad}
                          onChange={(e) => setDireccionForm({...direccionForm, ciudad: e.target.value})}
                          className="bg-black/50 border border-green-900/30 rounded-lg px-4 py-2 text-white"
                        />
                        <input
                          type="text"
                          placeholder="Código Postal *"
                          value={direccionForm.codigoPostal}
                          onChange={(e) => setDireccionForm({...direccionForm, codigoPostal: e.target.value})}
                          className="bg-black/50 border border-green-900/30 rounded-lg px-4 py-2 text-white"
                        />
                        <input
                          type="text"
                          placeholder="Provincia *"
                          value={direccionForm.provincia}
                          onChange={(e) => setDireccionForm({...direccionForm, provincia: e.target.value})}
                          className="bg-black/50 border border-green-900/30 rounded-lg px-4 py-2 text-white"
                        />
                        <select
                          value={direccionForm.pais}
                          onChange={(e) => setDireccionForm({...direccionForm, pais: e.target.value})}
                          className="bg-black/50 border border-green-900/30 rounded-lg px-4 py-2 text-white"
                        >
                          <option value="España">España</option>
                          <option value="Grecia">Grecia</option>
                        </select>
                        <input
                          type="tel"
                          placeholder="Teléfono *"
                          value={direccionForm.telefono}
                          onChange={(e) => setDireccionForm({...direccionForm, telefono: e.target.value})}
                          className="bg-black/50 border border-green-900/30 rounded-lg px-4 py-2 text-white"
                        />
                      </div>
                      <div className="flex items-center gap-2 mt-4">
                        <input
                          type="checkbox"
                          checked={direccionForm.principal}
                          onChange={(e) => setDireccionForm({...direccionForm, principal: e.target.checked})}
                          className="accent-green-500"
                        />
                        <span className="text-white text-sm">Establecer como dirección principal</span>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={handleAddDireccion}
                          className="px-4 py-2 bg-green-500 text-black rounded-lg hover:bg-green-400"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={() => setNuevaDireccion(false)}
                          className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {direcciones.length === 0 && !nuevaDireccion && (
                      <p className="text-gray-500 text-center py-8">
                        No tienes direcciones guardadas
                      </p>
                    )}
                    
                    {direcciones.map((dir) => (
                      <div
                        key={dir.id}
                        className={`p-4 rounded-xl border ${
                          dir.principal
                            ? 'border-green-500 bg-green-500/5'
                            : 'border-green-900/30 bg-black/30'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-white font-medium">
                              {dir.nombre} {dir.apellidos}
                              {dir.principal && (
                                <span className="ml-2 text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full">
                                  Principal
                                </span>
                              )}
                            </p>
                            <p className="text-gray-400 text-sm mt-1">{dir.direccion}</p>
                            <p className="text-gray-400 text-sm">
                              {dir.ciudad}, {dir.provincia} - {dir.codigoPostal}
                            </p>
                            <p className="text-gray-400 text-sm">{dir.pais}</p>
                            <p className="text-gray-400 text-sm mt-2">📞 {dir.telefono}</p>
                          </div>
                          <div className="flex gap-2">
                            {!dir.principal && (
                              <button
                                onClick={() => setDireccionPrincipal(dir.id)}
                                className="p-2 text-gray-400 hover:text-green-500"
                                title="Establecer como principal"
                              >
                                <Check size={16} />
                              </button>
                            )}
                            <button
                              onClick={() => deleteDireccion(dir.id)}
                              className="p-2 text-gray-400 hover:text-red-500"
                              title="Eliminar"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PESTAÑA MÉTODOS DE PAGO */}
              {activeTab === 'pagos' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-white">Métodos de Pago</h2>
                    <button
                      onClick={() => setNuevoMetodo(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-all"
                    >
                      <Plus size={16} />
                      Añadir Tarjeta
                    </button>
                  </div>

                  {nuevoMetodo && (
                    <div className="mb-6 p-4 bg-green-500/5 rounded-xl border border-green-500/30">
                      <h3 className="text-white font-medium mb-4">Nueva Tarjeta</h3>
                      <div className="space-y-4">
                        <select
                          value={metodoForm.tipo}
                          onChange={(e) => setMetodoForm({...metodoForm, tipo: e.target.value as any})}
                          className="w-full bg-black/50 border border-green-900/30 rounded-lg px-4 py-2 text-white"
                        >
                          <option value="tarjeta">Tarjeta de Crédito/Débito</option>
                          <option value="paypal">PayPal</option>
                          <option value="transferencia">Transferencia Bancaria</option>
                        </select>

                        {metodoForm.tipo === 'tarjeta' && (
                          <>
                            <input
                              type="text"
                              placeholder="Titular de la tarjeta"
                              value={metodoForm.titular}
                              onChange={(e) => setMetodoForm({...metodoForm, titular: e.target.value})}
                              className="w-full bg-black/50 border border-green-900/30 rounded-lg px-4 py-2 text-white"
                            />
                            <input
                              type="text"
                              placeholder="Número de tarjeta"
                              value={metodoForm.numero}
                              onChange={(e) => setMetodoForm({...metodoForm, numero: e.target.value})}
                              className="w-full bg-black/50 border border-green-900/30 rounded-lg px-4 py-2 text-white"
                            />
                            <div className="grid grid-cols-2 gap-4">
                              <input
                                type="text"
                                placeholder="MM/AA"
                                value={metodoForm.expiracion}
                                onChange={(e) => setMetodoForm({...metodoForm, expiracion: e.target.value})}
                                className="bg-black/50 border border-green-900/30 rounded-lg px-4 py-2 text-white"
                              />
                              <select
                                value={metodoForm.marca}
                                onChange={(e) => setMetodoForm({...metodoForm, marca: e.target.value as any})}
                                className="bg-black/50 border border-green-900/30 rounded-lg px-4 py-2 text-white"
                              >
                                <option value="visa">Visa</option>
                                <option value="mastercard">Mastercard</option>
                                <option value="amex">American Express</option>
                              </select>
                            </div>
                          </>
                        )}

                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={metodoForm.principal}
                            onChange={(e) => setMetodoForm({...metodoForm, principal: e.target.checked})}
                            className="accent-green-500"
                          />
                          <span className="text-white text-sm">Establecer como método principal</span>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={handleAddMetodoPago}
                            className="px-4 py-2 bg-green-500 text-black rounded-lg hover:bg-green-400"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={() => setNuevoMetodo(false)}
                            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {metodosPago.length === 0 && !nuevoMetodo && (
                      <p className="text-gray-500 text-center py-8">
                        No tienes métodos de pago guardados
                      </p>
                    )}
                    
                    {metodosPago.map((metodo) => (
                      <div
                        key={metodo.id}
                        className={`p-4 rounded-xl border ${
                          metodo.principal
                            ? 'border-green-500 bg-green-500/5'
                            : 'border-green-900/30 bg-black/30'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <CreditCard size={16} className="text-green-500" />
                              <span className="text-white font-medium">
                                {metodo.marca?.toUpperCase()} •••• {metodo.numero}
                              </span>
                              {metodo.principal && (
                                <span className="text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full">
                                  Principal
                                </span>
                              )}
                            </div>
                            <p className="text-gray-400 text-sm mt-1">
                              {metodo.titular} • Expira {metodo.expiracion}
                            </p>
                          </div>
                          <button
                            onClick={() => deleteMetodoPago(metodo.id)}
                            className="p-2 text-gray-400 hover:text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PESTAÑA PEDIDOS */}
              {activeTab === 'pedidos' && (
                <div>
                  <h2 className="text-xl font-semibold text-white mb-6">Historial de Pedidos</h2>
                  
                  {loadingPedidos ? (
                    <div className="flex justify-center py-8">
                      <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : userPedidos.length === 0 ? (
                    <div className="text-center py-12">
                      <Package size={48} className="mx-auto mb-4 text-gray-600" />
                      <p className="text-gray-500">No tienes pedidos realizados</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userPedidos.map((pedido) => (
                        <div
                          key={pedido.id}
                          className="p-4 bg-black/30 rounded-xl border border-green-900/30 hover:border-green-500/50 transition-all"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="text-white font-medium">Pedido #{pedido.id.slice(-8)}</p>
                              <p className="text-gray-400 text-sm">
                                {new Date(pedido.fecha).toLocaleDateString()}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs ${getEstadoColor(pedido.estado)}`}>
                              {pedido.estado}
                            </span>
                          </div>

                          <div className="space-y-2 mb-3">
                            {pedido.productos?.slice(0, 2).map((prod: any) => (
                              <div key={prod.id} className="flex items-center gap-2">
                                <img src={prod.imagen} alt={prod.nombre} className="w-8 h-8 object-cover rounded" />
                                <span className="text-sm text-gray-300">{prod.nombre} x{prod.cantidad}</span>
                              </div>
                            ))}
                            {pedido.productos?.length > 2 && (
                              <p className="text-xs text-gray-500">
                                +{pedido.productos.length - 2} productos más
                              </p>
                            )}
                          </div>

                          <div className="flex justify-between items-center pt-3 border-t border-green-900/30">
                            <p className="text-white font-bold">€{pedido.total?.toFixed(2)}</p>
                            <button
                              onClick={() => handleDescargarFactura(pedido.id)}
                              className="flex items-center gap-1 text-sm text-green-500 hover:text-green-400"
                            >
                              <Download size={14} />
                              Factura
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* PESTAÑA CONFIGURACIÓN */}
              {activeTab === 'configuracion' && (
                <div>
                  <h2 className="text-xl font-semibold text-white mb-6">Configuración de la Cuenta</h2>
                  
                  <div className="space-y-6">
                    <div className="p-4 bg-black/30 rounded-xl border border-green-900/30">
                      <h3 className="text-white font-medium mb-4">Cambiar Contraseña</h3>
                      <div className="space-y-3">
                        <input
                          type="password"
                          placeholder="Contraseña actual"
                          className="w-full bg-black/50 border border-green-900/30 rounded-lg px-4 py-2 text-white"
                        />
                        <input
                          type="password"
                          placeholder="Nueva contraseña"
                          className="w-full bg-black/50 border border-green-900/30 rounded-lg px-4 py-2 text-white"
                        />
                        <input
                          type="password"
                          placeholder="Confirmar nueva contraseña"
                          className="w-full bg-black/50 border border-green-900/30 rounded-lg px-4 py-2 text-white"
                        />
                        <button className="px-4 py-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-all">
                          Actualizar Contraseña
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-black/30 rounded-xl border border-green-900/30">
                      <h3 className="text-white font-medium mb-4">Preferencias</h3>
                      <div className="space-y-3">
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="accent-green-500" />
                          <span className="text-white text-sm">Recibir notificaciones por email</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="accent-green-500" />
                          <span className="text-white text-sm">Recibir ofertas personalizadas</span>
                        </label>
                      </div>
                    </div>

                    <div className="p-4 bg-red-500/5 rounded-xl border border-red-500/30">
                      <h3 className="text-white font-medium mb-2">Zona de peligro</h3>
                      <p className="text-gray-400 text-sm mb-4">
                        Una vez que elimines tu cuenta, no podrás recuperarla.
                      </p>
                      <button className="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-all">
                        Eliminar mi cuenta
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfilPage;