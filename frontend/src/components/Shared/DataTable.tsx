import { type ReactNode } from 'react';

interface Column<T> {
 key: string;
 label: string;
 render?: (item: T) => ReactNode;
 className?: string;
}

interface DataTableProps<T> {
 columns: Column<T>[];
 data: T[];
 loading?: boolean;
 emptyMessage?: string;
 pagina: number;
 total: number;
 porPagina?: number;
 onPaginaChange: (pagina: number) => void;
 busqueda?: string;
 onBusquedaChange?: (valor: string) => void;
 busquedaPlaceholder?: string;
 rowClassName?: (item: T) => string;
 acciones?: ReactNode;
}

export default function DataTable<T extends { id: number }>({
 columns,
 data,
 loading = false,
 emptyMessage = 'No se encontraron registros',
 pagina,
 total,
 porPagina = 20,
 onPaginaChange,
 busqueda,
 onBusquedaChange,
 busquedaPlaceholder = 'Buscar...',
 rowClassName,
 acciones,
}: DataTableProps<T>) {
 const totalPaginas = Math.ceil(total / porPagina);

 return (
  <div>
   <div className="flex justify-between items-center mb-4">
    {onBusquedaChange && (
     <input
      type="text"
      placeholder={busquedaPlaceholder}
      value={busqueda || ''}
      onChange={e => onBusquedaChange(e.target.value)}
      className="edl-input max-w-xs"
     />
    )}
    {acciones && <div className="flex gap-2">{acciones}</div>}
   </div>

   {loading ? (
    <p className="text-inst-texto-claro text-sm">Cargando...</p>
   ) : data.length === 0 ? (
    <p className="text-inst-texto-claro text-sm">{emptyMessage}</p>
   ) : (
    <div className="overflow-x-auto">
     <table className="edl-table">
      <thead>
       <tr>
        {columns.map(col => (
         <th key={col.key} className={col.className}>{col.label}</th>
        ))}
       </tr>
      </thead>
      <tbody>
       {data.map(item => (
        <tr key={item.id} className={rowClassName ? rowClassName(item) : ''}>
         {columns.map(col => (
          <td key={col.key} className={col.className}>
           {col.render ? col.render(item) : (item as any)[col.key]}
          </td>
         ))}
        </tr>
       ))}
      </tbody>
     </table>
    </div>
   )}

   {totalPaginas > 1 && (
    <div className="flex justify-center gap-2 mt-4">
     <button
      onClick={() => onPaginaChange(Math.max(1, pagina - 1))}
      className="edl-btn-outline"
      disabled={pagina === 1}
     >
      Anterior
     </button>
     <span className="py-2 px-3 text-sm text-inst-texto-claro">
      Pagina {pagina} de {totalPaginas}
     </span>
     <button
      onClick={() => onPaginaChange(pagina + 1)}
      className="edl-btn-outline"
      disabled={pagina >= totalPaginas}
     >
      Siguiente
     </button>
    </div>
   )}
  </div>
 );
}
