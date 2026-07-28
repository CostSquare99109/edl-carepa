import { render, screen, fireEvent } from '@testing-library/react'
import { DataTable } from './DataTable'

describe('DataTable', () => {
  const columns = [
    { key: 'name', header: 'Name', render: (row: any) => row.name, sortable: true, sortKey: 'name' },
    { key: 'age', header: 'Age', render: (row: any) => row.age, align: 'center' as const },
    { key: 'actions', header: 'Actions', render: () => <button data-testid="action-btn">Edit</button> },
  ]

  const data = [
    { id: 1, name: 'John', age: 30 },
    { id: 2, name: 'Jane', age: 25 },
    { id: 3, name: 'Bob', age: 35 },
  ]

  it('renders table with headers and rows', () => {
    render(<DataTable columns={columns} data={data} rowKey={(r) => r.id} ariaLabel="Test table" />)
    
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Age')).toBeInTheDocument()
    expect(screen.getByText('Actions')).toBeInTheDocument()
    expect(screen.getByText('John')).toBeInTheDocument()
    expect(screen.getByText('Jane')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('shows empty state when no data', () => {
    render(<DataTable columns={columns} data={[]} rowKey={(r) => r.id} ariaLabel="Test table" emptyTitle="No users" />)
    expect(screen.getByText('No users')).toBeInTheDocument()
  })

  it('shows loading skeleton when loading', () => {
    render(<DataTable columns={columns} data={data} rowKey={(r) => r.id} ariaLabel="Test table" loading />)
    expect(screen.getByRole('table')).toHaveAttribute('aria-busy', 'true')
  })

  it('handles sorting when onSortChange provided', () => {
    const handleSort = vi.fn()
    render(
      <DataTable 
        columns={columns} 
        data={data} 
        rowKey={(r) => r.id} 
        ariaLabel="Test table"
        onSortChange={handleSort}
        sortKey="name"
        sortDirection="asc"
      />
    )
    
    const nameHeader = screen.getByRole('button', { name: /name/i })
    fireEvent.click(nameHeader)
    expect(handleSort).toHaveBeenCalledWith('name', 'desc')
  })

  it('handles row selection', () => {
    const handleSelection = vi.fn()
    render(
      <DataTable 
        columns={columns} 
        data={data} 
        rowKey={(r) => r.id} 
        ariaLabel="Test table"
        selectable
        selectedIds={[1]}
        onSelectionChange={handleSelection}
      />
    )
    
    // Click row 2 checkbox
    const checkbox = screen.getByRole('checkbox', { name: /seleccionar fila 2/i })
    fireEvent.click(checkbox)
    expect(handleSelection).toHaveBeenCalledWith([1, 2])
  })

  it('handles select all', () => {
    const handleSelection = vi.fn()
    render(
      <DataTable 
        columns={columns} 
        data={data} 
        rowKey={(r) => r.id} 
        ariaLabel="Test table"
        selectable
        selectedIds={[1]}
        onSelectionChange={handleSelection}
      />
    )
    
    const selectAll = screen.getByRole('checkbox', { name: /seleccionar todas las filas/i })
    fireEvent.click(selectAll)
    expect(handleSelection).toHaveBeenCalledWith([1, 2, 3])
  })

  it('applies custom className to columns', () => {
    const customColumns = [
      { key: 'name', header: 'Name', render: (row: any) => row.name, className: 'custom-col' },
    ]
    render(<DataTable columns={customColumns} data={data} rowKey={(r) => r.id} ariaLabel="Test table" />)
    // className is applied to the <td>, not the parent
    const cell = screen.getByText('John').closest('td')
    expect(cell).toHaveClass('custom-col')
  })
})