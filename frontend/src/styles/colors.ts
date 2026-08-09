export const COLORES = {
  azul: '#0A2B5E',
  azulClaro: '#E3EBF2',
  azulOscuro: '#0A2B5E',
  rojo: '#DC2626',
  verde: '#16A34A',
  amarillo: '#F9B233',
} as const;

export const COLORES_TAILWIND = {
  azul: 'bg-[#0A2B5E]',
  azulText: 'text-[#0A2B5E]',
  azulBorder: 'border-[#0A2B5E]',
  azulClaro: 'bg-[#E3EBF2]',
  azulClaroText: 'text-[#0A2B5E]',
  azulClaroBorder: 'border-[#E3EBF2]',
  azulOscuro: 'bg-[#0A2B5E]',
  azulOscuroText: 'text-[#0A2B5E]',
  azulOscuroBorder: 'border-[#0A2B5E]',
  rojo: 'bg-[#DC2626]',
  rojoText: 'text-[#DC2626]',
  rojoBorder: 'border-[#DC2626]',
  verde: 'bg-[#16A34A]',
  verdeText: 'text-[#16A34A]',
  verdeBorder: 'border-[#16A34A]',
  verdeLight: 'bg-[#16A34A]/10',
  verdeLightText: 'text-[#16A34A]',
  amarillo: 'bg-[#F9B233]',
  amarilloText: 'text-[#F9B233]',
  amarilloBorder: 'border-[#F9B233]',
} as const;

export const ROLES_SISTEMA = [
  { codigo: 'jefe_dependencia', nombre: 'Jefe de Dependencia' },
  { codigo: 'jefe_personal', nombre: 'Jefe de personal' },
  { codigo: 'evaluador', nombre: 'Evaluador' },
  { codigo: 'evaluado', nombre: 'Evaluado' },
] as const;

// Sin indigo/purple/sky — craft rule anti-AI-slop.
// Neutrales + accent institucional only.
export const ROLE_COLORS: Record<string, string> = {
  admin_carepa: 'bg-inst-azul text-white border-inst-azul',
  jefe_dependencia: 'bg-inst-azul-light text-inst-azul border-inst-borde',
  jefe_personal: 'bg-inst-gris-med text-inst-texto border-inst-borde',
  evaluador: 'bg-inst-amarillo-light text-amber-800 border-amber-200',
  evaluado: 'bg-inst-surface text-inst-texto-2 border-inst-borde',
  comision_evaluadora: 'bg-red-50 text-inst-rojo border-red-200',
};
