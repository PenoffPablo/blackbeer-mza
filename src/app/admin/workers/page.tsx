"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, User, Shield, Briefcase, Trash2 } from "lucide-react";
import { showToast } from "@/components/ui/Toast";

interface Worker {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "ADMIN" | "RECEPTIONIST";
  isActive: boolean;
  createdAt: string;
}

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "RECEPTIONIST" as "ADMIN" | "RECEPTIONIST",
  });

  const fetchWorkers = async () => {
    try {
      const res = await fetch("/api/admin/workers");
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Error fetching workers: ${res.status}`);
      }
      const data = await res.json();
      setWorkers(data);
    } catch (err) {
      console.error(err);
      showToast({ message: "No se pudieron cargar los trabajadores", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/workers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error al crear trabajador");
      }

      showToast({ message: "Trabajador registrado exitosamente", type: "success" });
      setShowModal(false);
      setForm({ firstName: "", lastName: "", email: "", password: "", role: "RECEPTIONIST" });
      fetchWorkers();
    } catch (err: any) {
      showToast({ message: err.message, type: "error" });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--color-surface)] p-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
            <Briefcase size={24} className="text-[var(--color-primary)]" />
            Gestión de Personal
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">
            Da de alta y administra los accesos para recepcionistas y administradores.
          </p>
        </div>
        <Button
          variant="primary"
          className="shrink-0 flex items-center gap-2 border-2 border-black hover-neo text-black font-bold uppercase text-xs"
          onClick={() => setShowModal(true)}
        >
          <Plus size={16} />
          Nuevo Trabajador
        </Button>
      </div>

      {/* Table */}
      <div className="bg-[var(--color-surface)] rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] uppercase font-semibold border-b border-[var(--color-border)]">
              <tr>
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Rol</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-[var(--color-text-muted)]">
                    Cargando personal...
                  </td>
                </tr>
              ) : workers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-[var(--color-text-muted)]">
                    No hay trabajadores registrados.
                  </td>
                </tr>
              ) : (
                workers.map((worker) => (
                  <tr key={worker.id} className="hover:bg-[var(--color-surface-hover)] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center text-black font-bold uppercase">
                          {worker.firstName.charAt(0)}{worker.lastName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-[var(--color-text)]">
                            {worker.firstName} {worker.lastName}
                          </div>
                          <div className="text-xs text-[var(--color-text-muted)]">{worker.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        worker.role === "ADMIN" 
                          ? "bg-purple-100 text-purple-800 border border-purple-200" 
                          : "bg-blue-100 text-blue-800 border border-blue-200"
                      }`}>
                        {worker.role === "ADMIN" ? <Shield size={12} /> : <User size={12} />}
                        {worker.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        worker.isActive ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                      }`}>
                        {worker.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {/* For future implementation: suspend or delete */}
                      <button className="p-2 text-neutral-400 hover:text-red-500 transition-colors" title="Eliminar trabajador (próximamente)">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>      {/* Modal Alta de Trabajador */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-[var(--color-surface)] w-full max-w-md rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-neo-xl overflow-hidden animate-slide-up text-[var(--color-text)]">
            <div className="p-5 border-b border-[var(--color-border)] bg-[var(--color-surface)] flex justify-between items-center">
              <h2 className="font-black uppercase tracking-wider text-[var(--color-text)]">Alta de Personal</h2>
              <button 
                onClick={() => setShowModal(false)} 
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] p-1.5 rounded-md transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-[var(--color-surface)]">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Nombre"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  placeholder="Ej: Simón"
                  required
                />
                <Input
                  label="Apellido"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  placeholder="Ej: Aldevaran"
                  required
                />
              </div>
              
              <Input
                label="Correo Electrónico"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="ejemplo@blackbeer.com"
                required
              />
              
              <Input
                label="Contraseña"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
              />
 
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-[var(--color-text)]">
                  Rol del Trabajador
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as any })}
                  className="w-full px-3 py-2 text-sm bg-[var(--color-bg-secondary)] text-[var(--color-text)] border border-[var(--color-border)] rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] font-semibold cursor-pointer"
                >
                  <option value="RECEPTIONIST">Recepcionista (Toma Pedidos)</option>
                  <option value="ADMIN">Administrador (Acceso Total)</option>
                </select>
              </div>
 
              <div className="pt-4 flex justify-end gap-2.5">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowModal(false)} 
                  className="border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] font-bold text-xs uppercase cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="border border-black hover-neo bg-[var(--color-primary)] text-black font-black uppercase tracking-wider text-xs cursor-pointer"
                >
                  Crear Cuenta
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
