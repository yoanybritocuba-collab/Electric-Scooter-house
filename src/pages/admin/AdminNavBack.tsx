import { Link } from 'react-router-dom';
import { ArrowLeft, LayoutDashboard, Home } from 'lucide-react';

interface AdminNavBackProps {
  title: string;
  description?: string;
}

const AdminNavBack = ({ title, description }: AdminNavBackProps) => {
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <Link
          to="/admin/dashboard"
          className="p-2 bg-black/50 border border-green-900/30 rounded-xl hover:bg-green-500/10 transition-colors group"
          title="Volver al panel principal"
        >
          <ArrowLeft size={20} className="text-gray-400 group-hover:text-green-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
            <LayoutDashboard size={24} className="text-green-500" />
            {title}
          </h1>
          {description && (
            <p className="text-gray-500 text-sm mt-1">{description}</p>
          )}
        </div>
      </div>

      <Link
        to="/"
        className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500/10 text-green-500 rounded-xl hover:bg-green-500/20 transition-all border border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.1)] hover:shadow-[0_0_15px_rgba(34,197,94,0.3)]"
        title="Ir a la tienda"
      >
        <Home size={18} />
        <span className="hidden sm:inline">Ver Tienda</span>
        <span className="sm:hidden">Tienda</span>
      </Link>
    </div>
  );
};

export default AdminNavBack;