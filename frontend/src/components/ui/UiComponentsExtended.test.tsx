import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Select } from './Select'
import { Skeleton, SkeletonText, SkeletonKpiGrid } from './Skeleton'
import { EmptyState } from './EmptyState'
import { Tabs, TabPanel } from './Tabs'
import { Tooltip } from './Tooltip'
import userEvent from '@testing-library/user-event'

describe('Select', () => {
  const options = [
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
    { value: '3', label: 'Option 3', disabled: true },
  ]

  it('renders with label and options', () => {
    render(<Select label="Choose" options={options} />)
    expect(screen.getByLabelText(/choose/i)).toBeInTheDocument()
    expect(screen.getAllByRole('option')).toHaveLength(3)
  })

  it('renders placeholder option', () => {
    render(<Select label="Test" options={options} placeholder="Select..." />)
    const placeholder = screen.getByText(/select\.\.\./i)
    expect(placeholder).toBeInTheDocument()
    expect(placeholder).toBeDisabled()
  })

  it('shows required asterisk', () => {
    render(<Select label="Required" options={options} required />)
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('shows error state', () => {
    render(<Select label="Test" options={options} error="This field is required" />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText(/this field is required/i)).toBeInTheDocument()
  })

  it('shows helper text when no error', () => {
    render(<Select label="Test" options={options} helperText="Select your option" />)
    expect(screen.getByText(/select your option/i)).toBeInTheDocument()
  })

  it('does not show helper text when error exists', () => {
    render(<Select label="Test" options={options} helperText="Help" error="Error!" />)
    expect(screen.queryByText(/help/i)).not.toBeInTheDocument()
    expect(screen.getByText(/error!/i)).toBeInTheDocument()
  })

  it('renders iconLeft', () => {
    render(<Select label="Test" options={options} iconLeft={<span data-testid="icon">🔍</span>} />)
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('calls onChange handler', async () => {
    const handleChange = vi.fn()
    render(<Select label="Test" options={options} onChange={handleChange} />)
    const select = screen.getByLabelText(/test/i)
    fireEvent.change(select, { target: { value: '2' } })
    expect(handleChange).toHaveBeenCalled()
  })

  it('disables disabled options', () => {
    render(<Select label="Test" options={options} />)
    const disabledOption = screen.getByText('Option 3')
    expect(disabledOption.closest('option')).toBeDisabled()
  })

  it('sets aria-invalid when error', () => {
    render(<Select label="Test" options={options} error="Error" />)
    expect(screen.getByLabelText(/test/i)).toHaveAttribute('aria-invalid', 'true')
  })

  it('applies custom className', () => {
    render(<Select label="Test" options={options} className="custom-class" />)
    expect(screen.getByLabelText(/test/i)).toHaveClass('custom-class')
  })
})

describe('Skeleton', () => {
  it('renders with default variant (text)', () => {
    render(<Skeleton />)
    const el = screen.getByRole('status')
    expect(el).toHaveAttribute('aria-label', 'Cargando')
    expect(el).toHaveClass('animate-pulse')
  })

  it('renders with circle variant', () => {
    render(<Skeleton variant="circle" width={40} height={40} />)
    const el = screen.getByRole('status')
    expect(el).toHaveClass('rounded-full')
    expect(el).toHaveStyle({ width: '40px', height: '40px' })
  })

  it('renders with string width/height', () => {
    render(<Skeleton width="50%" height="100px" />)
    const el = screen.getByRole('status')
    expect(el).toHaveStyle({ width: '50%', height: '100px' })
  })

  it('renders with custom className', () => {
    render(<Skeleton className="my-custom" />)
    expect(screen.getByRole('status')).toHaveClass('my-custom')
  })
})

describe('SkeletonText', () => {
  it('renders default 3 lines', () => {
    const { container } = render(<SkeletonText />)
    const skeletons = container.querySelectorAll('[role="status"]')
    expect(skeletons).toHaveLength(3)
    expect(skeletons[2]).toHaveStyle({ width: '70%' })
  })

  it('renders custom line count', () => {
    const { container } = render(<SkeletonText lines={5} />)
    expect(container.querySelectorAll('[role="status"]')).toHaveLength(5)
  })
})

describe('SkeletonKpiGrid', () => {
  it('renders default 4 cards', () => {
    const { container } = render(<SkeletonKpiGrid />)
    expect(container.querySelectorAll('[role="status"]')).toHaveLength(4)
  })

  it('renders custom count', () => {
    const { container } = render(<SkeletonKpiGrid count={2} />)
    expect(container.querySelectorAll('[role="status"]')).toHaveLength(2)
  })
})

describe('EmptyState', () => {
  it('renders title', () => {
    render(<EmptyState title="No data found" />)
    expect(screen.getByText(/no data found/i)).toBeInTheDocument()
  })

  it('renders description when provided', () => {
    render(<EmptyState title="Empty" description="There is nothing here yet" />)
    expect(screen.getByText(/there is nothing here yet/i)).toBeInTheDocument()
  })

  it('renders custom icon', () => {
    render(<EmptyState title="Empty" icon={<span data-testid="custom-icon">📦</span>} />)
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
  })

  it('renders action button', () => {
    render(<EmptyState title="Empty" action={<button>Create</button>} />)
    expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument()
  })

  it('renders default icon when no icon provided', () => {
    render(<EmptyState title="Empty" />)
    expect(screen.getByText('inbox')).toBeInTheDocument()
  })
})

describe('Tabs', () => {
  const items = [
    { key: 'tab1', label: 'Tab One' },
    { key: 'tab2', label: 'Tab Two', badge: <span data-testid="badge">3</span> },
    { key: 'tab3', label: 'Tab Three', disabled: true },
  ]

  it('renders all tabs', () => {
    render(<Tabs items={items} activeKey="tab1" onChange={vi.fn()} ariaLabel="Test tabs" />)
    expect(screen.getByRole('tab', { name: /tab one/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /tab two/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /tab three/i })).toBeInTheDocument()
  })

  it('marks active tab as selected', () => {
    render(<Tabs items={items} activeKey="tab2" onChange={vi.fn()} ariaLabel="Test tabs" />)
    expect(screen.getByRole('tab', { name: /tab two/i })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: /tab one/i })).toHaveAttribute('aria-selected', 'false')
  })

  it('disables tab with disabled prop', () => {
    render(<Tabs items={items} activeKey="tab1" onChange={vi.fn()} ariaLabel="Test tabs" />)
    expect(screen.getByRole('tab', { name: /tab three/i })).toBeDisabled()
  })

  it('calls onChange when clicking enabled tab', () => {
    const handleChange = vi.fn()
    render(<Tabs items={items} activeKey="tab1" onChange={handleChange} ariaLabel="Test tabs" />)
    fireEvent.click(screen.getByRole('tab', { name: /tab two/i }))
    expect(handleChange).toHaveBeenCalledWith('tab2')
  })

  it('does not call onChange when clicking disabled tab', () => {
    const handleChange = vi.fn()
    render(<Tabs items={items} activeKey="tab1" onChange={handleChange} ariaLabel="Test tabs" />)
    fireEvent.click(screen.getByRole('tab', { name: /tab three/i }))
    expect(handleChange).not.toHaveBeenCalled()
  })

  it('renders pills variant', () => {
    render(<Tabs items={items} activeKey="tab1" onChange={vi.fn()} variant="pills" ariaLabel="Test tabs" />)
    const tablist = screen.getByRole('tablist')
    expect(tablist).toHaveClass('inline-flex')
  })

  it('renders badge in tab', () => {
    render(<Tabs items={items} activeKey="tab1" onChange={vi.fn()} ariaLabel="Test tabs" />)
    expect(screen.getByTestId('badge')).toBeInTheDocument()
  })

  it('sets tablist aria-label', () => {
    render(<Tabs items={items} activeKey="tab1" onChange={vi.fn()} ariaLabel="Navigation tabs" />)
    expect(screen.getByRole('tablist')).toHaveAttribute('aria-label', 'Navigation tabs')
  })
})

describe('TabPanel', () => {
  it('renders content when active', () => {
    render(<TabPanel tabKey="tab1" activeKey="tab1">Content</TabPanel>)
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('hides content when not active', () => {
    render(<TabPanel tabKey="tab1" activeKey="tab2">Content</TabPanel>)
    expect(screen.queryByText('Content')).not.toBeInTheDocument()
  })

  it('has tabpanel role', () => {
    render(<TabPanel tabKey="tab1" activeKey="tab1">Content</TabPanel>)
    expect(screen.getByRole('tabpanel')).toBeInTheDocument()
  })
})

describe('Tooltip', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows tooltip on mouse enter after delay', () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    )
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    fireEvent.mouseEnter(screen.getByText('Hover me'))
    vi.advanceTimersByTime(200)
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
    expect(screen.getByText('Tooltip text')).toBeInTheDocument()
  })

  it('hides tooltip on mouse leave', () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    )
    fireEvent.mouseEnter(screen.getByText('Hover me'))
    vi.advanceTimersByTime(200)
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
    fireEvent.mouseLeave(screen.getByText('Hover me'))
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('shows tooltip on focus', () => {
    render(
      <Tooltip content="Focus tooltip">
        <button>Focus me</button>
      </Tooltip>
    )
    fireEvent.focus(screen.getByText('Focus me'))
    vi.advanceTimersByTime(200)
    expect(screen.getByText('Focus tooltip')).toBeInTheDocument()
  })

  it('hides tooltip on blur', () => {
    render(
      <Tooltip content="Blur tooltip">
        <button>Blur me</button>
      </Tooltip>
    )
    fireEvent.focus(screen.getByText('Blur me'))
    vi.advanceTimersByTime(200)
    expect(screen.getByText('Blur tooltip')).toBeInTheDocument()
    fireEvent.blur(screen.getByText('Blur me'))
    expect(screen.queryByText('Blur tooltip')).not.toBeInTheDocument()
  })

  it('renders on different sides', () => {
    render(
      <Tooltip content="Side tooltip" side="right">
        <button>Right</button>
      </Tooltip>
    )
    fireEvent.mouseEnter(screen.getByText('Right'))
    vi.advanceTimersByTime(200)
    const tooltip = screen.getByRole('tooltip')
    expect(tooltip).toHaveClass('left-full')
  })

  it('uses custom delay', () => {
    render(
      <Tooltip content="Slow tooltip" delay={500}>
        <button>Slow</button>
      </Tooltip>
    )
    fireEvent.mouseEnter(screen.getByText('Slow'))
    vi.advanceTimersByTime(200)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    vi.advanceTimersByTime(300)
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
  })
})
