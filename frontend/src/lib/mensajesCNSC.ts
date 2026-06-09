export const MENSAJES_CNSC = {
 concertacion: {
 creada: (nombre: string) =>
 `Se ha registrado el acta de concertación de compromisos y competencias para el funcionario ${nombre}, conforme a lo establecido en la Resolución 1760 de 2010.`,
 aprobada: (nombre: string) =>
 `La concertación de compromisos y competencias del funcionario ${nombre} ha sido aprobada. De acuerdo con el artículo 34 de la Resolución 1760 de 2010, el evaluado cuenta con tres (3) días hábiles para manifestar su no conformidad.`,
 rechazada: (nombre: string) =>
 `La concertación del funcionario ${nombre} ha sido rechazada. Se iniciará el proceso de fijación unilateral conforme al artículo 33 de la Resolución 1760 de 2010.`,
 noConformidad: (nombre: string) =>
 `El funcionario ${nombre} ha manifestado su no conformidad. La Comisión de Evaluación deberá resolver dentro de los cinco (5) días hábiles siguientes (Art. 34, Resolución 1760 de 2010).`,
 fijacionUnilateral: (nombre: string) =>
 `Se procede con la fijación unilateral de compromisos para el funcionario ${nombre}, conforme al artículo 33 de la Resolución 1760 de 2010.`,
 },
 evaluacion: {
 calificada: (nombre: string, calificacion: string, nivel: string) =>
 `Se ha calificado la evaluación del funcionario ${nombre}. Calificación definitiva: ${calificacion}%, nivel ${nivel}. Conforme al artículo 48 de la Resolución 1760 de 2010, el evaluado cuenta con tres (3) días hábiles para manifestar su disconformidad.`,
 aprobadaComision: (nombre: string, calificacion: string, nivel: string) =>
 `La Comisión de Evaluación ha aprobado la evaluación del funcionario ${nombre} con calificación ${calificacion}%, nivel ${nivel}.`,
 rechazadaComision: (nombre: string) =>
 `La Comisión de Evaluación ha rechazado la evaluación del funcionario ${nombre}. Se realizará una nueva evaluación conforme al artículo 51 de la Resolución 1760 de 2010.`,
 recurso: (nombre: string) =>
 `El funcionario ${nombre} ha interpuesto recurso de reposición. La Comisión dispone de diez (10) días hábiles para resolver (Art. 52, Resolución 1760 de 2010).`,
 },
 compromiso: {
 mejoramiento: (nombre: string, motivo: string) =>
 `Se ha registrado un compromiso de mejoramiento para el funcionario ${nombre}, con motivo: ${motivo}. Conforme al artículo 62 de la Resolución 1760 de 2010.`,
 incumplimiento: (nombre: string) =>
 `Se registra incumplimiento del compromiso de mejoramiento del funcionario ${nombre}. Conforme al artículo 64 de la Resolución 1760 de 2010, el incumplimiento reiterado podrá dar lugar a la desvinculación del cargo.`,
 },
 periodo: {
 apertura: (periodo: string) =>
 `Se ha abierto el período de evaluación ${periodo}. De acuerdo con la Resolución 1760 de 2010, todos los servidores públicos sujetos a evaluación deben participar en el proceso.`,
 cierre: (periodo: string) =>
 `Se ha cerrado el período de evaluación ${periodo}. Las evaluaciones pendientes serán calificadas con base en la información disponible.`,
 },
} as const
