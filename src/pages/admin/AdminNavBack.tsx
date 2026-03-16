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
          className="p-2 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors group"
          title="Volver al panel principal"
        >
          <ArrowLeft size={20} className="text-slate-400 group-hover:text-primary" />
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
            <LayoutDashboard size={24} className="text-primary" />
            {title}
          </h1>
          {description && (
            <p className="text-slate-400 text-sm mt-1">{description}</p>
          )}
        </div>
      </div>

      <Link
        to="/"
        className="flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-colors"
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