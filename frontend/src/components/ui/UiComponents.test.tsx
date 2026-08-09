import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DataTable } from '@/components/ui/DataTable'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Card, Badge } from '@/components/ui/Card'

describe('UI Components', () => {
  describe('Button', () => {
    it('renders button with children', () => {
      render(<Button>Click me</Button>)
      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
    })

    it('applies variant classes', () => {
      render(<Button variant="primary">Primary</Button>)
      const btn = screen.getByRole('button')
      expect(btn).toHaveClass('bg-inst-azul')
    })

    it('applies size classes', () => {
      render(<Button size="sm">Small</Button>)
      expect(screen.getByRole('button')).toHaveClass('px-3')
    })

    it('calls onClick handler', () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Click</Button>)
      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('shows loading state', () => {
      render(<Button loading>Loading</Button>)
      expect(screen.getByRole('button')).toBeDisabled()
      expect(screen.getByText(/loading/i)).toBeInTheDocument()
    })
  })

  describe('Input', () => {
    it('renders input with label', () => {
      render(<Input label="Email" placeholder="Enter email" />)
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/enter email/i)).toBeInTheDocument()
    })

    it('shows error message', () => {
      render(<Input error="Invalid email" />)
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
    })

    it('calls onChange', () => {
      const handleChange = vi.fn()
      render(<Input onChange={handleChange} />)
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } })
      expect(handleChange).toHaveBeenCalled()
    })
  })

  describe('Modal', () => {
    it('does not render when closed', () => {
      render(<Modal open={false} onClose={vi.fn()} title="Test">Content</Modal>)
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('renders when open', () => {
      render(<Modal open={true} onClose={vi.fn()} title="Test Modal">Content</Modal>)
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText(/test modal/i)).toBeInTheDocument()
      expect(screen.getByText(/content/i)).toBeInTheDocument()
    })

    it('calls onClose when close button clicked', () => {
      const onClose = vi.fn()
      render(<Modal open={true} onClose={onClose} title="Test">Content</Modal>)
      fireEvent.click(screen.getByLabelText(/close/i))
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when overlay clicked', () => {
      const onClose = vi.fn()
      render(<Modal open={true} onClose={onClose} title="Test">Content</Modal>)
      fireEvent.click(screen.getByTestId('modal-overlay'))
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('Card', () => {
    it('renders card with children', () => {
      render(<Card>Card content</Card>)
      expect(screen.getByText(/card content/i)).toBeInTheDocument()
      expect(screen.getByTestId('card')).toHaveClass('bg-inst-surface')
    })
  })

  describe('Badge', () => {
    it('renders badge with tone', () => {
      render(<Badge tone="success">Success</Badge>)
      expect(screen.getByText(/success/i)).toHaveClass('bg-green-50')
    })

    it('applies different tones', () => {
      const { rerender } = render(<Badge tone="danger">Danger</Badge>)
      expect(screen.getByText(/danger/i)).toHaveClass('bg-red-50')
      
      rerender(<Badge tone="warning">Warning</Badge>)
      expect(screen.getByText(/warning/i)).toHaveClass('bg-amber-50')
    })
  })

  describe('DataTable', () => {
    const columns = [
      { key: 'name', header: 'Name', render: (row: any) => row.name },
      { key: 'age', header: 'Age', render: (row: any) => row.age, align: 'center' as const },
    ]
    const data = [
      { id: 1, name: 'John', age: 30 },
      { id: 2, name: 'Jane', age: 25 },
    ]

    it('renders table with headers', () => {
      render(<DataTable columns={columns} data={data} rowKey={(r) => r.id} aria-label="test" />)
      expect(screen.getByText(/name/i)).toBeInTheDocument()
      expect(screen.getByText(/age/i)).toBeInTheDocument()
    })

    it('renders data rows', () => {
      render(<DataTable columns={columns} data={data} rowKey={(r) => r.id} aria-label="test" />)
      expect(screen.getByText(/john/i)).toBeInTheDocument()
      expect(screen.getByText(/jane/i)).toBeInTheDocument()
      expect(screen.getByText(/30/i)).toBeInTheDocument()
      expect(screen.getByText(/25/i)).toBeInTheDocument()
    })

    it('shows empty state when no data', () => {
      render(<DataTable columns={columns} data={[]} rowKey={(r) => r.id} aria-label="test" emptyTitle="No data" />)
      expect(screen.getByText(/no data/i)).toBeInTheDocument()
    })

    it('shows loading skeleton', () => {
      render(<DataTable columns={columns} data={data} rowKey={(r) => r.id} aria-label="test" loading />)
      expect(screen.getByRole('table')).toHaveAttribute('aria-busy', 'true')
    })

    it('calls onSortChange when sortable header clicked', () => {
      const onSortChange = vi.fn()
      const sortableColumns = [
        { key: 'name', header: 'Name', render: (r: any) => r.name, sortable: true, sortKey: 'name' },
      ]
      render(
        <DataTable 
          columns={sortableColumns} 
          data={data} 
          rowKey={(r) => r.id} 
          aria-label="test" 
          onSortChange={onSortChange}
        />
      )
      fireEvent.click(screen.getByText(/name/i))
      expect(onSortChange).toHaveBeenCalledWith('name', 'asc')
    })

    it('handles row selection', () => {
      const onSelectionChange = vi.fn()
      render(
        <DataTable 
          columns={columns} 
          data={data} 
          rowKey={(r) => r.id} 
          aria-label="test"
          selectable
          selectedIds={[1]}
          onSelectionChange={onSelectionChange}
        />
      )
      // Click checkbox for row 2
      fireEvent.click(screen.getByLabelText(/seleccionar fila 2/i))
      expect(onSelectionChange).toHaveBeenCalledWith([1, 2])
    })
  })
})