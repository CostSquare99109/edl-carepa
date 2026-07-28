import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SeccionColapsable from '@/components/SeccionColapsable'
import NaturalezaBadge from '@/components/NaturalezaBadge'
import PlantaBadge from '@/components/PlantaBadge'
import NivelBadge from '@/components/NivelBadge'

describe('SeccionColapsable', () => {
  it('renders title', () => {
    render(<SeccionColapsable titulo="Funciones Esenciales">Content</SeccionColapsable>)
    expect(screen.getByText('Funciones Esenciales')).toBeInTheDocument()
  })

  it('starts closed by default', () => {
    render(<SeccionColapsable titulo="Test">Hidden content</SeccionColapsable>)
    expect(screen.queryByText('Hidden content')).not.toBeInTheDocument()
  })

  it('starts open when defaultAbierto=true', () => {
    render(<SeccionColapsable titulo="Test" defaultAbierto>Visible content</SeccionColapsable>)
    expect(screen.getByText('Visible content')).toBeInTheDocument()
  })

  it('toggles open/close on click', () => {
    render(<SeccionColapsable titulo="Test">Toggle content</SeccionColapsable>)
    expect(screen.queryByText('Toggle content')).not.toBeInTheDocument()
    fireEvent.click(screen.getByText('Test'))
    expect(screen.getByText('Toggle content')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Test'))
    expect(screen.queryByText('Toggle content')).not.toBeInTheDocument()
  })

  it('sets aria-expanded', () => {
    render(<SeccionColapsable titulo="Test">Content</SeccionColapsable>)
    const btn = screen.getByRole('button')
    expect(btn).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(btn)
    expect(btn).toHaveAttribute('aria-expanded', 'true')
  })

  it('renders icon', () => {
    render(<SeccionColapsable titulo="Test" icono="checklist">Content</SeccionColapsable>)
    expect(screen.getByText('checklist')).toBeInTheDocument()
  })

  it('renders badge count when > 0', () => {
    render(<SeccionColapsable titulo="Test" badgeCount={5}>Content</SeccionColapsable>)
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('does not render badge count when 0', () => {
    render(<SeccionColapsable titulo="Test" badgeCount={0}>Content</SeccionColapsable>)
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('renders expand/collapse icon', () => {
    render(<SeccionColapsable titulo="Test">Content</SeccionColapsable>)
    expect(screen.getByText('expand_more')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Test'))
    expect(screen.getByText('expand_less')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<SeccionColapsable titulo="Test" className="my-custom">Content</SeccionColapsable>)
    expect(container.firstChild).toHaveClass('my-custom')
  })

  it('renders with custom badge color', () => {
    render(<SeccionColapsable titulo="Test" badgeCount={3} badgeColor="bg-red-100">Content</SeccionColapsable>)
    expect(screen.getByText('3')).toHaveClass('bg-red-100')
  })
})

describe('NaturalezaBadge', () => {
  it('renders label for carrera_administrativa', () => {
    render(<NaturalezaBadge naturaleza="carrera_administrativa" />)
    expect(screen.getByText('Carrera Admin.')).toBeInTheDocument()
  })

  it('renders label for libre_nombramiento', () => {
    render(<NaturalezaBadge naturaleza="libre_nombramiento" />)
    expect(screen.getByText('Libre Nombramiento')).toBeInTheDocument()
  })

  it('renders label for temporal', () => {
    render(<NaturalezaBadge naturaleza="temporal" />)
    expect(screen.getByText('Temporal')).toBeInTheDocument()
  })

  it('renders label for periodo_fijo', () => {
    render(<NaturalezaBadge naturaleza="periodo_fijo" />)
    expect(screen.getByText('Periodo Fijo')).toBeInTheDocument()
  })

  it('handles unknown naturaleza gracefully', () => {
    render(<NaturalezaBadge naturaleza="unknown_type" />)
    expect(screen.getByText('unknown_type')).toBeInTheDocument()
  })

  it('is case-insensitive', () => {
    render(<NaturalezaBadge naturaleza="CARRERA_ADMINISTRATIVA" />)
    expect(screen.getByText('Carrera Admin.')).toBeInTheDocument()
  })

  it('applies size classes', () => {
    render(<NaturalezaBadge naturaleza="temporal" size="xs" />)
    expect(screen.getByText('Temporal')).toHaveClass('text-[10px]')
  })

  it('applies custom className', () => {
    render(<NaturalezaBadge naturaleza="temporal" className="extra-class" />)
    expect(screen.getByText('Temporal')).toHaveClass('extra-class')
  })

  it('sets title attribute', () => {
    render(<NaturalezaBadge naturaleza="temporal" />)
    expect(screen.getByText('Temporal')).toHaveAttribute('title', 'Naturaleza: Temporal')
  })

  it('renders all 6 naturaleza types without error', () => {
    const tipos = [
      'carrera_administrativa',
      'libre_nombramiento',
      'libre_nombramiento_gerencia_publica',
      'libre_nombramiento_remocion',
      'periodo_fijo',
      'temporal',
    ]
    tipos.forEach(t => {
      const { container } = render(<NaturalezaBadge naturaleza={t} />)
      expect(container.firstChild).toBeInTheDocument()
    })
  })
})

describe('PlantaBadge', () => {
  it('renders Global', () => {
    render(<PlantaBadge planta="global" />)
    expect(screen.getByText('Global')).toBeInTheDocument()
  })

  it('renders Temporal', () => {
    render(<PlantaBadge planta="temporal" />)
    expect(screen.getByText('Temporal')).toBeInTheDocument()
  })

  it('handles unknown planta', () => {
    render(<PlantaBadge planta="unknown" />)
    expect(screen.getByText('unknown')).toBeInTheDocument()
  })

  it('is case-insensitive', () => {
    render(<PlantaBadge planta="GLOBAL" />)
    expect(screen.getByText('Global')).toBeInTheDocument()
  })

  it('applies size classes', () => {
    render(<PlantaBadge planta="global" size="md" />)
    expect(screen.getByText('Global')).toHaveClass('text-sm')
  })

  it('sets title attribute', () => {
    render(<PlantaBadge planta="temporal" />)
    expect(screen.getByText('Temporal')).toHaveAttribute('title', 'Planta: Temporal')
  })
})

describe('NivelBadge', () => {
  it('renders Directivo', () => {
    render(<NivelBadge nivel="directivo" />)
    expect(screen.getByText('Directivo')).toBeInTheDocument()
  })

  it('renders Asesor', () => {
    render(<NivelBadge nivel="asesor" />)
    expect(screen.getByText('Asesor')).toBeInTheDocument()
  })

  it('renders Profesional', () => {
    render(<NivelBadge nivel="profesional" />)
    expect(screen.getByText('Profesional')).toBeInTheDocument()
  })

  it('renders Tecnico', () => {
    render(<NivelBadge nivel="tecnico" />)
    expect(screen.getByText('Tecnico')).toBeInTheDocument()
  })

  it('renders Asistencial', () => {
    render(<NivelBadge nivel="asistencial" />)
    expect(screen.getByText('Asistencial')).toBeInTheDocument()
  })

  it('handles unknown nivel', () => {
    render(<NivelBadge nivel="unknown" />)
    expect(screen.getByText('unknown')).toBeInTheDocument()
  })

  it('is case-insensitive', () => {
    render(<NivelBadge nivel="PROFESIONAL" />)
    expect(screen.getByText('Profesional')).toBeInTheDocument()
  })

  it('applies size classes', () => {
    render(<NivelBadge nivel="directivo" size="xs" />)
    expect(screen.getByText('Directivo')).toHaveClass('text-[10px]')
  })

  it('sets title attribute', () => {
    render(<NivelBadge nivel="asistencial" />)
    expect(screen.getByText('Asistencial')).toHaveAttribute('title', 'Nivel: Asistencial')
  })

  it('renders all 5 niveles without error', () => {
    const niveles = ['directivo', 'asesor', 'profesional', 'tecnico', 'asistencial']
    niveles.forEach(n => {
      const { container } = render(<NivelBadge nivel={n} />)
      expect(container.firstChild).toBeInTheDocument()
    })
  })
})
