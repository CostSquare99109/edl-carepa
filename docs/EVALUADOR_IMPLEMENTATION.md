# Implementación Completa - Rol Evaluador

## Resumen de la Especificación (tarea_evaluador.md)

### Sidebar (Ya implementado en MenuController.php)
- Inicio
- Compromisos y Competencias
- Evidencias
- Compromisos de Mejoramiento
- Evaluar

---

## 1. PANTALLA DE EVALUAR (`/evaluar`)

### 1.1 Título y Selección de Período
- **Título**: "Periodo"
- **Select**: "Seleccione un periodo" → periodos anuales tipo "2026-2027"

### 1.2 Búsqueda de Evaluado
- Input para buscar por: Número de documento O Nombre del evaluado
- Botón "Buscar evaluado"
- Al buscar → habilita opciones "Evaluar" y "Ver evaluaciones"

### 1.3 Tabla "Evaluados del periodo"
Columnas:
| Columna | Campo BD |
|---------|----------|
| Documento | usuarios.documento |
| Evaluado | CONCAT(primer_nombre, ' ', primer_apellido) |
| Nivel | usuarios.nivel (directivo/asesor/profesional/tecnico/asistencial) |
| Denominación | usuarios.denominacion_empleo |
| Código | dependencias.codigo (o substring nombre) |
| Grado | usuarios.grado_empleo |
| Opciones | Botones: "Evaluar", "Ver evaluaciones" |

### 1.4 Flujo "Evaluar"
Al click en "Evaluar" → Select "Tipo de evaluación":
1. **Evaluación parcial eventual**
2. **Evaluación 1 semestre** (01-02 a 31-07)
3. **Evaluación 2 semestre** (01-08 a 31-01 año+1) ← Panel específico con validación
4. **Calificación extraordinaria**

### 1.5 Panel "Evaluación 2 Semestre"
- Título: "Evaluación 2 Semestre"
- Indicaciones:
  1. Debe tener evaluación para el primer semestre
  2. Fecha evaluación entre **01-08-Año** y **31-01-Año+1**
- Botón "Cerrar"

### 1.6 Compromisos Funcionales
Lista con:
- Peso (porcentual)
- Calificación: input numérico 0-100

### 1.7 Compromisos Comportamentales
Lista con botón "Evaluar" por compromiso.

Al click "Evaluar" → Modal con:
- **Título**: "Compromiso: [nombre] - [Decreto]"
- **Conductas asociadas** (5 conductas por competencia) con select:
  - Nunca (4 pts)
  - Algunas veces (7 pts)
  - Frecuentemente (10 pts)
  - Siempre (13 pts)
- **Pregunta 1**: "¿Estas conductas han aportado al logro de los compromisos laborales acordados?"
  - Select: Sí / Moderadamente / No
- **Pregunta 2**: "¿Estas conductas le han permitido al empleado aportar más de lo que tenía estipulado?"
  - Select: Sí / No
  - **Si Sí** → Input grande: "Ingrese la explicación del porqué excede" (mín 40 caracteres)
- Botones: "Guardar evaluación", "Cerrar"

### 1.8 Estado Visual
Después de guardar → columna "Compromisos comportamentales" muestra ✓ (check)

### 1.9 Jefe Inmediato
- Pregunta: "¿Es el jefe inmediato?"
- Checkbox: "Seleccione si NO es el jefe inmediato del evaluado"
- Si marca → habilita select motivo (retiro/impedimento/recusación)

### 1.10 Botones Finales
- Guardar evaluación
- Cerrar

---

## 2. BACKEND - ENDPOINTS NECESARIOS

### 2.1 Evaluaciones
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/evaluaciones?evaluador=me&periodo_id=X` | Listar evaluaciones del evaluador |
| GET | `/evaluaciones/buscar-evaluado?documento=X&nombre=Y&periodo_id=Z` | Buscar evaluado por doc o nombre |
| GET | `/evaluaciones/{id {evaluacionId}/evaluaciones` | Ver evaluaciones previas del evaluado |
| GET | `/compromisos/evaluacion/{evaluacionId}` | Compromisos funcionales + comportamentales con conductas |
| PUT | `/compromisos/{id}/calificar` | Calificar compromiso (funcional 0-100, comportamental conductas) |
| PUT | `/evaluaciones/{id}/guardar` | Guardar evaluación completa |
| PUT | `/evaluaciones/{id}/finalizar` | Finalizar evaluación |

### 2.2 Validaciones Backend
- **2do semestre**: Validar fecha_inicio >= 01-08-AÑO y fecha_fin <= 31-01-(AÑO+1)
- **Compromisos funcionales**: Peso suma = 100%, calificación 0-100
- **Compromisos comportamentales**: Todas las conductas valoradas, preguntas respondidas
- **Justificación excede**: Mín 40 caracteres si impacto_excede = "si"
- **Jefe inmediato**: Si no es jefe → motivo requerido

---

## 3. BASE DE DATOS - Cambios Necesarios

### 3.1 Tabla `evaluaciones` (existente - verificar campos)
```sql
-- Campos ya existentes relevantes:
`tipo` enum('parcial_primer_semestre','parcial_segundo_semestre','parcial_eventual','calificacion_definitiva','calificacion_extraordinaria')
`fecha_inicio` date
`fecha_fin` date
`evaluador_no_jefe` tinyint(1)
`motivo_no_jefe` enum('retiro_empleado_responsable','impedimento','recusacion')
`motivo_parcial_eventual` enum('cambio_evaluador','lapso_ultima_evaluacion','periodo_prueba_otro_empleo','separacion_temporal_mas_30_dias','cambio_empleo_traslado')
```

### 3.2 Tabla `compromisos` (existente - verificar campos)
```sql
-- Campos ya existentes relevantes:
`tipo` enum('funcional','comportamental')
`peso` decimal(5,2)
`calificacion` decimal(5,2)  -- 0-100 funcionales, 4-15 comportamentales
`conductas_json` json  -- [{conducta_id, valoracion, impacto_aporta, impacto_excede, justificacion_excede}]
`frecuencia` enum('nunca','algunas_veces','frecuentemente','siempre')
`nivel_comportamental` enum('bajo','aceptable','alto','muy_alto')
`puntaje_comportamental` decimal(5,2)  -- Promedio 4-15
`impacto_aporta_compromisos` enum('si','moderadamente','no')
`impacto_excede_estipulado` enum('si','no')
`justificacion_excede` text
```

### 3.3 Tabla `conductas` (ya existe con seed)
```sql
-- 5 conductas por competencia (competencia_codigo, texto, orden)
```

### 3.4 Tabla `competencias` (ya existe)
```sql
-- Códigos: ORI_USU, CMP_ORG, TRB_EQP, ORI_RES, ADP_CAM, APR_CONT, APR_TEC
-- Decretos: 2539/2005, 815/2018
```

---

## 4. IMPLEMENTACIÓN FRONTEND - PanelEvaluador.tsx

### Estructura de Estados
```typescript
// Búsqueda
periodoId, busquedaDoc, busquedaNombre, evaluaciones[], evaluacionSel

// Configuración evaluación
tipoEvaluacion, motivoEvaluacion, razonEvaluacion, fechaInicio, fechaFin
noEsJefe, motivoNoJefe, evaluacionIniciada

// Compromisos
compromisos[], modalCompromiso, calificacion, conductasForm, obsCompromiso

// Preguntas cierre
cumplioCompromisos, aporteAdicional, descAporte, justificacion

// UI
loading, buscando, errorBusqueda, saving, guardandoCal, confirmModal
```

### Validaciones Clave
```typescript
// Fecha 2do semestre
const año = periodoId ? getAñoFromPeriodo(periodoId) : new Date().getFullYear();
const fechaMin = `${año}-08-01`;
const fechaMax = `${año + 1}-01-31`;

// Justificación excede
if (impactoExcede === 'si' && justificacion.length < 40) error

// Todas conductas valoradas
if (conductas.length > 0 && Object.keys(conductasForm).length < conductas.length) error
```

---

## 5. ARCHIVOS A MODIFICAR/CREAR

### Frontend
1. `frontend/src/pages/Evaluaciones/PanelEvaluador.tsx` - **Reescribir completamente**
2. `frontend/src/components/ui/Select.tsx` - Verificar soporte búsqueda
3. `frontend/src/components/ui/Input.tsx` - Verificar validación numérica
4. `frontend/src/components/ui/Modal.tsx` - Verificar tamaño LG/XL

### Backend
1. `backend/src/Controller/EvaluacionController.php` - Agregar métodos:
   - `buscarEvaluadoPorNombreODocumento()`
   - `verEvaluacionesPrevias(int $evaluacionId)`
2. `backend/src/Service/EvaluacionService.php` - Lógica de búsqueda y ver evaluaciones
3. `backend/src/Repository/EvaluacionRepository.php` - Queries de búsqueda
4. `backend/src/Router/Router.php` - Registrar nuevas rutas

### Database (Migraciones)
1. Verificar que `evaluaciones` tenga todos los campos necesarios
2. Verificar que `compromisos` soporte conductas_json completo
3. Seed de conductas por competencia (ya existe en migration_conductas.sql)

---

## 6. FLUJO DE DATOS COMPLETO

```
Usuario (Evaluador) → /evaluar
  ↓
Carga periodos (GET /periodos?por_pagina=50)
  ↓
Selecciona periodo → Carga evaluaciones asignadas (GET /evaluaciones?evaluador=me&periodo_id=X)
  ↓
Busca evaluado (GET /evaluaciones/buscar-evaluado?documento=X&nombre=Y&periodo_id=Z)
  ↓
Tabla evaluados → Click "Evaluar"
  ↓
Selecciona tipo evaluación → Si "2do semestre" valida fechas
  ↓
Carga compromisos (GET /compromisos/evaluacion/{id}) → Con conductas predefinidas
  ↓
Califica funcionales (PUT /compromisos/{id}/calificar {puntaje: 0-100})
  ↓
Califica comportamentales (PUT /compromisos/{id}/calificar {conductas_json, impacto_aporta, impacto_excede, justificacion})
  ↓
Responde preguntas cierre + Jefe inmediato
  ↓
Guardar (PUT /evaluaciones/{id}/guardar {cumplio_compromisos, aporte_adicional, descripcion_aporte, justificacion, tipo_evaluacion, motivo, razon, fecha_inicio_eval, fecha_fin_eval, evaluador_no_jefe, motivo_no_jefe})
  ↓
Finalizar (PUT /evaluaciones/{id}/finalizar {mismos datos}) → Calcula nota definitiva
```

---

## 7. REGLAS DE NEGOCIO CNSC (De transcripciones)

### Pesos y Escalas
- **Funcionales**: 85% ponderación, calificación 0-100
- **Comportamentales**: 15% ponderación, escala 4-15 (promedio conductas)
  - Bajo: 4-6
  - Aceptable: 7-9
  - Alto: 10-12
  - Muy Alto: 13-15
- **Definitiva**: 85% func + 15% comp → Sobresaliente ≥90, Satisfactorio >65<90, No Satisfactorio ≤65

### Fechas Período Anual (Decreto 1083/2015)
- **Anual**: 01-02 a 31-01 siguiente
- **1er Semestre**: 01-02 a 31-07
- **2do Semestre**: 01-08 a 31-01 siguiente
- Evaluaciones parciales: dentro de 15 días hábiles post vencimiento

### Evaluaciones Parciales Eventuales (Motivos válidos)
1. Cambio de evaluador
2. Lapso última evaluación
3. Periodo prueba otro empleo
4. Separación temporal >30 días
5. Cambio empleo por traslado

### No es Jefe Inmediato (Motivos)
1. Retiro empleado responsable
2. Impedimento
3. Recusación

### Conductas por Competencia (5 cada una, Decretos 2539/2005 y 815/2018)
Ver `migration_conductas.sql` - 7 competencias × 5 conductas = 35 conductas

### Preguntas Obligatorias Comportamentales
1. ¿Aportan a logro compromisos? → Sí/Moderadamente/No
2. ¿Permiten aportar más de lo estipulado? → Sí/No
   - Si Sí → Justificación mín 40 chars (Acuerdo 617/2018)

---

## 8. CHECKLIST DE IMPLEMENTACIÓN

### Frontend ✓
- [ ] PanelEvaluador.tsx reescrito con especificación exacta
- [ ] Sidebar ya correcto (MenuController)
- [ ] Componentes UI: Select, Input, Modal, Button, Card, Table, Badge, Alert, Tooltip
- [ ] Validaciones frontend (fechas, numérico, longitud 40 chars)
- [ ] Estados visuales: loading, error, success, check ✓ cumplido

### Backend ✓
- [ ] EvaluacionController: buscarEvaluadoPorNombreODocumento, verEvaluacionesPrevias
- [ ] EvaluacionService: lógica búsqueda + ver evaluaciones
- [ ] EvaluacionRepository: queries optimizadas
- [ ] CompromisoController: calificar con conductas_json completo
- [ ] Validaciones backend: fechas 2do semestre, pesos, conductas, justificación 40 chars
- [ ] Router: rutas nuevas registradas

### Database ✓
- [ ] Schema evaluaciones completo
- [ ] Schema compromisos completo (conductas_json, impacto_aporta, impacto_excede, justificacion_excede)
- [ ] Tabla conductas con seed (35 conductas)
- [ ] Tabla competencias con seed (7 competencias)

### Testing ✓
- [ ] Flujo completo: buscar → evaluar funcionales → evaluar comportamentales → guardar → finalizar
- [ ] Validaciones: fechas 2do semestre, justificación 40 chars, todas conductas valoradas
- [ ] Visual: check ✓ en compromisos comportamentales evaluados
- [ ] Jefe inmediato: checkbox + motivo condicional