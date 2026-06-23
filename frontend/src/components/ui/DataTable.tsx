import { type ReactNode } from 'react';
import { EmptyState } from './EmptyState';

export interface DataTableColumn<Row> {
  key: string;
  header: ReactNode;
  render: (row: Row) => ReactNode;
  sortable?: boolean;
  sortKey?: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export interface DataTableProps<Row> {
  columns: DataTableColumn<Row>[];
  data: Row[];
  rowKey: (row: Row) => string | number;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  onSortChange?: (sortKey: string, direction: 'asc' | 'desc') => void;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  selectable?: boolean;
  selectedIds?: Array<string | number>;
  onSelectionChange?: (ids: Array<string | number>) => void;
  ariaLabel: string;
  caption?: string;
}

const alignClass: Record<NonNullable<DataTableColumn<unknown>['align']>, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

export function DataTable<Row>({
  columns,
  data,
  rowKey,
  loading = false,
  emptyTitle = 'Sin resultados',
  emptyDescription,
  emptyAction,
  onSortChange,
  sortKey,
  sortDirection,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  ariaLabel,
  caption,
}: DataTableProps<Row>) {
  const allSelected = selectable && data.length > 0 && data.every((r) => selectedIds.includes(rowKey(r)));
  const someSelected = selectable && data.some((r) => selectedIds.includes(rowKey(r))) && !allSelected;

  function toggleAll() {
    if (!onSelectionChange) return;
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(data.map((r) => rowKey(r)));
    }
  }

  function toggleRow(id: string | number) {
    if (!onSelectionChange) return;
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((x) => x !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  }

  function handleSort(col: DataTableColumn<Row>) {
    if (!col.sortable || !onSortChange || !col.sortKey) return;
    const newDir: 'asc' | 'desc' = sortKey === col.sortKey && sortDirection === 'asc' ? 'desc' : 'asc';
    onSortChange(col.sortKey, newDir);
  }

  if (loading) {
    return (
      <div className="overflow-x-auto -mx-2">
        <table className="edl-table" aria-label={ariaLabel} aria-busy="true">
          {caption ? <caption className="sr-only">{caption}</caption> : null}
          <thead>
            <tr>
              {selectable ? <th scope="col" className="w-10" /> : null}
              {columns.map((c) => (
                <th key={c.key} scope="col" className={c.className}>{c.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} aria-hidden="true">
                {selectable ? <td><div className="h-4 w-4 rounded bg-inst-gris-med animate-pulse" /></td> : null}
                {columns.map((c) => (
                  <td key={c.key}><div className="h-4 bg-inst-gris-med rounded animate-pulse" /></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />;
  }

  return (
    <div className="overflow-x-auto -mx-2">
      <table className="edl-table" aria-label={ariaLabel}>
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead>
          <tr>
            {selectable ? (
              <th scope="col" className="w-10">
                <input
                  type="checkbox"
                  aria-label="Seleccionar todas las filas"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={toggleAll}
                  className="rounded border-inst-borde text-inst-verde focus:ring-inst-verde"
                />
              </th>
            ) : null}
            {columns.map((c) => {
              const isSorted = sortKey === c.sortKey;
              const ariaSort = isSorted ? (sortDirection === 'asc' ? 'ascending' : 'descending') : c.sortable ? 'none' : undefined;
              return (
                <th
                  key={c.key}
                  scope="col"
                  aria-sort={ariaSort}
                  className={['whitespace-nowrap', c.className].join(' ')}
                  style={c.width ? { width: c.width } : undefined}
                >
                  {c.sortable && onSortChange && c.sortKey ? (
                    <button
                      type="button"
                      onClick={() => handleSort(c)}
                      className={[
                        'inline-flex items-center gap-1 font-semibold hover:text-inst-verde transition-colors',
                        alignClass[c.align ?? 'left'],
                      ].join(' ')}
                    >
                      {c.header}
                      <span aria-hidden="true" className="material-icons text-sm">
                        {isSorted ? (sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
                      </span>
                    </button>
                  ) : (
                    <span className={alignClass[c.align ?? 'left']}>{c.header}</span>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => {
            const id = rowKey(row);
            const isSelected = selectedIds.includes(id);
            return (
              <tr key={id} className={isSelected ? 'bg-inst-verde-light/40' : ''}>
                {selectable ? (
                  <td>
                    <input
                      type="checkbox"
                      aria-label={`Seleccionar fila ${id}`}
                      checked={isSelected}
                      onChange={() => toggleRow(id)}
                      className="rounded border-inst-borde text-inst-verde focus:ring-inst-verde"
                    />
                  </td>
                ) : null}
                {columns.map((c) => (
                  <td key={c.key} className={['whitespace-nowrap', alignClass[c.align ?? 'left'], c.className].join(' ')}>
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
