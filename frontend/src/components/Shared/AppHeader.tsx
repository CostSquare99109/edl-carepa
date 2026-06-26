import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../../lib/api';
import { Button, Input, Tooltip } from '../ui';
import RoleSelector from './RoleSelector';

interface SearchResult {
  id: number | string;
  label: string;
  sublabel?: string;
  ruta: string;
}

export default function AppHeader() {
 const { usuario, logout } = useAuth();
 const navigate = useNavigate();
 const location = useLocation();

 const [busqueda, setBusqueda] = useState('');
 const [resultados, setResultados] = useState<SearchResult[]>([]);
 const [buscando, setBuscando] = useState(false);
 const [abierto, setAbierto] = useState(false);
 const [seleccion, setSeleccion] = useState(0);
 const searchRef = useRef<HTMLDivElement>(null);
 const inputRef = useRef<HTMLInputElement>(null);

 const [contadorNotif, setContadorNotif] = useState(0);

 useEffect(() => {
 let cancel = false;
 async function cargar() {
 try {
 const res = await api.get<{ notificaciones_no_leidas?: number }>('/dashboard/resumen');
 if (!cancel) setContadorNotif(res.notificaciones_no_leidas ?? 0);
 } catch {
 if (!cancel) setContadorNotif(0);
 }
 }
 cargar();
 const t = window.setInterval(cargar, 60_000);
 return () => {
 cancel = true;
 window.clearInterval(t);
 };
 }, [location.pathname]);

 useEffect(() => {
 if (!busqueda.trim() || busqueda.trim().length < 2) {
 setResultados([]);
 setAbierto(false);
 return;
 }
 let cancel = false;
 setBuscando(true);
 const t = window.setTimeout(async () => {
 try {
 const res = await api.get<{ data: SearchResult[] }>(
 `/usuarios/buscar-global?q=${encodeURIComponent(busqueda.trim())}&por_pagina=8`,
 );
 if (!cancel) {
 setResultados(Array.isArray(res.data) ? res.data : []);
 setAbierto(true);
 setSeleccion(0);
 }
 } catch {
 if (!cancel) {
 setResultados([]);
 setAbierto(true);
 }
 } finally {
 if (!cancel) setBuscando(false);
 }
 }, 250);
 return () => {
 cancel = true;
 window.clearTimeout(t);
 };
 }, [busqueda]);

 useEffect(() => {
 function handleClickOutside(e: MouseEvent) {
 if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
 setAbierto(false);
 }
 }
 document.addEventListener('mousedown', handleClickOutside);
 return () => document.removeEventListener('mousedown', handleClickOutside);
 }, []);

 function irAResultado(r: SearchResult) {
 setAbierto(false);
 setBusqueda('');
 navigate(r.ruta);
 }

 function onSearchKeyDown(e: KeyboardEvent<HTMLInputElement>) {
 if (e.key === 'ArrowDown') {
 e.preventDefault();
 setSeleccion((s) => Math.min(resultados.length - 1, s + 1));
 } else if (e.key === 'ArrowUp') {
 e.preventDefault();
 setSeleccion((s) => Math.max(0, s - 1));
 } else if (e.key === 'Enter' && resultados[seleccion]) {
 e.preventDefault();
 irAResultado(resultados[seleccion]);
 } else if (e.key === 'Escape') {
 setAbierto(false);
 }
 }

 useEffect(() => {
 function onSlash(e: globalThis.KeyboardEvent) {
 const tag = (e.target as HTMLElement)?.tagName;
 if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
 if (e.key === '/') {
 e.preventDefault();
 inputRef.current?.focus();
 }
 }
 window.addEventListener('keydown', onSlash);
 return () => window.removeEventListener('keydown', onSlash);
 }, []);

 const nombreCompleto = usuario
 ? `${usuario.primer_nombre || ''} ${usuario.primer_apellido || ''}`.trim() || usuario.nombre_completo || 'Usuario'
 : 'Usuario';

 return (
 <header className="bg-white sticky top-0 z-40 border-b border-inst-borde">
 <div className="flex items-center gap-3 px-4 lg:px-6 py-3">
 <div className="flex-shrink-0 flex items-center gap-3">
 <img
 src={`${import.meta.env.BASE_URL}escudo.png`}
 alt="Escudo Carepa"
 className="h-11 w-auto"
 onError={(e) => {
 (e.target as HTMLImageElement).style.display = 'none';
 const parent = (e.target as HTMLImageElement).parentElement;
 if (parent && !parent.querySelector('.escudo-fallback')) {
 const span = document.createElement('span');
 span.className = 'escudo-fallback text-2xl font-heading font-bold text-inst-azul-osc';
 span.textContent = 'CAREPA';
 parent.appendChild(span);
 }
 }}
 />
 <div className="hidden sm:block leading-tight">
 <h1 className="text-base lg:text-lg font-heading font-bold text-inst-azul-osc tracking-wide">
 Evaluación del Desempeño Laboral
 </h1>
 <p className="text-[11px] text-inst-texto-claro">
 Alcaldía de Carepa
 </p>
 </div>
 </div>

 <div ref={searchRef} className="flex-1 relative max-w-xl mx-auto">
 <Input
 ref={inputRef}
 type="search"
 placeholder="Buscar funcionario por nombre o documento..."
 value={busqueda}
 onChange={(e) => setBusqueda(e.target.value)}
 onKeyDown={onSearchKeyDown}
 onFocus={() => resultados.length > 0 && setAbierto(true)}
 aria-label="Búsqueda global"
 aria-autocomplete="list"
 aria-expanded={abierto}
 aria-controls="search-results"
 iconLeft={<span className="material-icons text-base">search</span>}
 iconRight={
 <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-inst-texto-claro bg-inst-gris-med border border-inst-borde rounded">
 /
 </kbd>
 }
 />

 {abierto ? (
 <div
 id="search-results"
 role="listbox"
 className="absolute left-0 right-0 top-full mt-1 bg-white border border-inst-borde rounded-lg shadow-lg max-h-80 overflow-y-auto z-50 animate-fadeIn"
 >
 {buscando ? (
 <div className="px-4 py-3 text-sm text-inst-texto-claro">Buscando…</div>
 ) : resultados.length === 0 ? (
 <div className="px-4 py-3 text-sm text-inst-texto-claro">
 Sin resultados para "{busqueda}"
 </div>
 ) : (
 <ul className="py-1">
 {resultados.map((r, i) => (
 <li key={r.id} role="option" aria-selected={i === seleccion}>
 <button
 type="button"
 onClick={() => irAResultado(r)}
 onMouseEnter={() => setSeleccion(i)}
 className={`w-full text-left px-4 py-2 text-sm ${
 i === seleccion ? 'bg-inst-azul-osc-light text-inst-azul-osc' : 'hover:bg-inst-gris-med'
 }`}
 >
 <div className="font-medium">{r.label}</div>
 {r.sublabel ? (
 <div className="text-xs text-inst-texto-claro">{r.sublabel}</div>
 ) : null}
 </button>
 </li>
 ))}
 </ul>
 )}
 </div>
 ) : null}
 </div>

 <Tooltip content="Notificaciones">
 <button
onClick={() => navigate('/dashboard/notificaciones')}
					className="relative p-2 rounded-md text-inst-texto-claro hover:bg-inst-gris-med hover:text-inst-azul-osc transition-colors"
					aria-label={`Notificaciones${contadorNotif > 0 ? ` (${contadorNotif} sin leer)` : ''}`}
 >
 <span className="material-icons text-xl">notifications</span>
 {contadorNotif > 0 ? (
 <span
 className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-inst-rojo text-white text-[10px] font-bold flex items-center justify-center"
 aria-hidden="true"
 >
 {contadorNotif > 9 ? '9+' : contadorNotif}
 </span>
 ) : null}
 </button>
 </Tooltip>

 <RoleSelector variant="header" />

 <div className="hidden md:flex items-center gap-3 flex-shrink-0">
 <div className="text-right leading-tight">
 <p className="text-sm font-medium text-inst-azul-osc">{nombreCompleto}</p>
 <p className="text-xs text-inst-texto-claro">{usuario?.cargo || ''}</p>
 </div>
 </div>

 <Button
 variant="outline"
 size="sm"
 iconLeft={<span className="material-icons text-base">logout</span>}
 onClick={logout}
 >
 <span className="hidden sm:inline">Cerrar sesión</span>
 <span className="sr-only sm:hidden">Salir</span>
 </Button>
 </div>
 </header>
 );
}
