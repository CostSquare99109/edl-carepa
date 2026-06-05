export const COLORES = {
 azul: '#0A2B5E',
 azulClaro: '#003366',
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
 rojo: 'bg-[#C4282B]',
 rojoText: 'text-[#C4282B]',
 rojoBorder: 'border-[#C4282B]',
 verde: 'bg-[#1E5A3C]',
 verdeText: 'text-[#1E5A3C]',
 verdeBorder: 'border-[#1E5A3C]',
} as const;

export const ROLES_SISTEMA = [
 { codigo: 'admin', nombre: 'Administrador' },
 { codigo: 'jefe_personal', nombre: 'Jefe de Personal' },
 { codigo: 'evaluador', nombre: 'Evaluador' },
 { codigo: 'evaluado', nombre: 'Evaluado' },
 { codigo: 'cargador', nombre: 'Cargador' },
 { codigo: 'comision_evaluadora', nombre: 'Comision Evaluadora' },
] as const;

export const ROLE_COLORS: Record<string, string> = {
 admin: 'bg-red-100 text-red-800 border-red-200',
 jefe_personal: 'bg-purple-100 text-purple-800 border-purple-200',
 evaluador: 'bg-green-100 text-green-800 border-green-200',
 evaluado: 'bg-blue-100 text-blue-800 border-blue-200',
 cargador: 'bg-yellow-100 text-yellow-800 border-yellow-200',
 comision_evaluadora: 'bg-indigo-100 text-indigo-800 border-indigo-200',
};
