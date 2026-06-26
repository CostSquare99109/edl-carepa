export const COLORES = {
  azul: '#0A2B5E',
  azulClaro: '#003366',
  azulOscuro: '#0A2B5E',
  rojo: '#C4282B',
  verde: '#1E5A3C',
} as const;

export const COLORES_TAILWIND = {
 azul: 'bg-[#0A2B5E]',
 azulText: 'text-[#0A2B5E]',
 azulBorder: 'border-[#0A2B5E]',
 azulClaro: 'bg-[#003366]',
 azulClaroText: 'text-[#003366]',
 azulClaroBorder: 'border-[#003366]',
 azulOscuro: 'bg-[#0A2B5E]',
 azulOscuroText: 'text-[#0A2B5E]',
 azulOscuroBorder: 'border-[#0A2B5E]',
 rojo: 'bg-[#C4282B]',
 rojoText: 'text-[#C4282B]',
 rojoBorder: 'border-[#C4282B]',
 verde: 'bg-[#1E5A3C]',
 verdeText: 'text-[#1E5A3C]',
 verdeBorder: 'border-[#1E5A3C]',
 verdeLight: 'bg-[#1E5A3C]/10',
 verdeLightText: 'text-[#1E5A3C]',
} as const;

export const ROLES_SISTEMA = [
 { codigo: 'jefe_dependencia', nombre: 'Jefe de Dependencia' },
 { codigo: 'admin_carepa', nombre: 'Administrador CAREPA' },
 { codigo: 'evaluador', nombre: 'Evaluador' },
 { codigo: 'evaluado', nombre: 'Evaluado' },
] as const;

export const ROLE_COLORS: Record<string, string> = {
 jefe_dependencia: 'bg-indigo-100 text-indigo-800 border-indigo-200',
 admin_carepa: 'bg-red-900 text-red-100 border-red-700',
 evaluador: 'bg-blue-100 text-blue-800 border-blue-200',
 evaluado: 'bg-sky-100 text-sky-800 border-sky-200',
 comision_evaluadora: 'bg-purple-100 text-purple-800 border-purple-200',
};
