// Mensajes literales del sistema, alineados con el Acuerdo 617 de 2018
// (Sistema Tipo de Evaluacion del Desempeno Laboral) y su Anexo Tecnico,
// publicado por la Comision Nacional del Servicio Civil (CNSC).
//
// Historial:
// - v1 (anterior): citaba Resolucion 1760 de 2010 (norma derogada).
// - v2 (actual): migrado a Acuerdo 617 de 2018 (vigente desde 2019-02-01).
//
// Los articulos del Acuerdo 617 referenciados:
// - Art. 3:  Concertacion de compromisos (plazos, fijacion unilateral).
// - Art. 4:  Bilateralidad. Aceptacion/rechazo por el evaluado.
// - Art. 5:  Compromisos de mejoramiento.
// - Art. 6:  Evaluacion parcial eventual.
// - Art. 7:  Calificacion definitiva y niveles (Sobresaliente/Satisfactorio/No Satisfactorio).
// - Art. 8:  Comision Evaluadora (aprobacion/rechazo).
// - Art. 9:  Periodos y etapas.
export const MENSAJES_CNSC = {
  concertacion: {
    creada: (nombre: string) =>
      `Se registro la concertacion de compromisos y competencias para el funcionario ${nombre}, conforme a lo establecido en el articulo 3 del Acuerdo 617 de 2018.`,
    aprobada: (nombre: string) =>
      `La concertacion de compromisos y competencias del funcionario ${nombre} ha sido aprobada. De acuerdo con el articulo 4 del Acuerdo 617 de 2018, el evaluado cuenta con tres (3) dias habiles para manifestar su no conformidad.`,
    rechazada: (nombre: string) =>
      `La concertacion del funcionario ${nombre} ha sido rechazada. Se iniciara el proceso de fijacion unilateral conforme al articulo 3 del Acuerdo 617 de 2018.`,
    noConformidad: (nombre: string) =>
      `El funcionario ${nombre} ha manifestado su no conformidad. La Comision de Personal debera resolver dentro de los cinco (5) dias habiles siguientes (Art. 4, Acuerdo 617 de 2018).`,
    fijacionUnilateral: (nombre: string) =>
      `Se procede con la fijacion unilateral de compromisos para el funcionario ${nombre}, conforme al articulo 3 del Acuerdo 617 de 2018.`,
  },
  evaluacion: {
    calificada: (nombre: string, calificacion: string, nivel: string) =>
      `Se ha calificado la evaluacion del funcionario ${nombre}. Calificacion definitiva: ${calificacion}%, nivel ${nivel}. Conforme al articulo 7 del Acuerdo 617 de 2018, el evaluado cuenta con cinco (5) dias habiles para presentar recurso de reposicion.`,
    aprobadaComision: (nombre: string, calificacion: string, nivel: string) =>
      `La Comision Evaluadora ha aprobado la evaluacion del funcionario ${nombre} con calificacion ${calificacion}%, nivel ${nivel}.`,
    rechazadaComision: (nombre: string) =>
      `La Comision Evaluadora ha rechazado la evaluacion del funcionario ${nombre}. Se realizara una nueva evaluacion conforme al articulo 8 del Acuerdo 617 de 2018.`,
    recurso: (nombre: string) =>
      `El funcionario ${nombre} ha interpuesto recurso de reposicion. La Comision dispone de cinco (5) dias habiles para resolver (Art. 7, Acuerdo 617 de 2018).`,
    aprobacionRequerida: (nombre: string) =>
      `La evaluacion del funcionario ${nombre} quedo registrada y requiere aprobacion de la Comision Evaluadora para quedar en firme (Art. 8, Acuerdo 617 de 2018).`,
  },
  compromiso: {
    mejoramiento: (nombre: string, motivo: string) =>
      `Se ha registrado un compromiso de mejoramiento para el funcionario ${nombre}, con motivo: ${motivo}. Conforme al articulo 5 del Acuerdo 617 de 2018.`,
    incumplimiento: (nombre: string) =>
      `Se registra incumplimiento del compromiso de mejoramiento del funcionario ${nombre}. Conforme al articulo 5 del Acuerdo 617 de 2018, el incumplimiento reiterado dara lugar a las consecuencias establecidas en la ley.`,
  },
  periodo: {
    apertura: (periodo: string) =>
      `Se ha abierto el periodo de evaluacion ${periodo}. De acuerdo con el Acuerdo 617 de 2018, todos los servidores publicos sujetos a evaluacion deben participar en el proceso.`,
    cierre: (periodo: string) =>
      `Se ha cerrado el periodo de evaluacion ${periodo}. Las evaluaciones pendientes seran calificadas conforme al Acuerdo 617 de 2018.`,
  },
  validacion: {
    pesoIncorrecto: () =>
      'El peso de los compromisos debe ser igual a 100.',
    rangosCompromisos: () =>
      'Para el periodo anual se deben ingresar minimo uno (1) y maximo cinco (5) compromisos funcionales. Para los compromisos comportamentales entre tres (3) y cinco (5).',
    ausentismoInvalido: () =>
      'La separacion temporal del cargo debe ser superior a 30 dias calendario para generar evaluacion parcial eventual (Art. 6, Acuerdo 617 de 2018).',
    periodoPruebaInvalido: () =>
      'La interrupcion del periodo de prueba es igual o superior a 20 dias continuos. El periodo de prueba se prolongara por el termino que dure la interrupcion.',
    dependenciaConUsuarios: () =>
      'No se puede inactivar la dependencia porque tiene usuarios activos asociados. Conforme al Anexo Tecnico del Acuerdo 617 de 2018, solo se permite inactivar dependencias sin usuarios asociados.',
  },
} as const;