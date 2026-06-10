import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  PageBreak,
} from "docx";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = join(
  __dirname,
  "..",
  "..",
  "PROYECYO INTEGRADOR - VANT - Lautaro Sarmiento - Entrega final.docx"
);

const P = (text, opts = {}) =>
  new Paragraph({
    spacing: { after: 120, line: 360 },
    alignment: opts.alignment ?? AlignmentType.JUSTIFIED,
    children: [new TextRun({ text, ...opts.run })],
  });

const H1 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 240 },
    children: [new TextRun({ text, bold: true, size: 32 })],
  });

const H2 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 200 },
    children: [new TextRun({ text, bold: true, size: 28 })],
  });

const H3 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 220, after: 160 },
    children: [new TextRun({ text, bold: true, size: 24 })],
  });

const LI = (text) =>
  new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 100, line: 360 },
    alignment: AlignmentType.JUSTIFIED,
    children: [new TextRun({ text })],
  });

const BR = () => new Paragraph({ children: [new PageBreak()] });

const portada = [
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 1200, after: 200 },
    children: [new TextRun({ text: "PROYECTO INTEGRADOR", bold: true, size: 44 })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [new TextRun({ text: "Sistema Integral de Gestión de Operativos VANT", bold: true, size: 36 })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 800 },
    children: [new TextRun({ text: "(Vehículos Aéreos No Tripulados)", italics: true, size: 28 })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [new TextRun({ text: "Entrega Final — Estado Consolidado", bold: true, size: 28 })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 600 },
    children: [new TextRun({ text: "Junio de 2026", size: 24 })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 100 },
    children: [new TextRun({ text: "Institución: IFTS N°24", size: 22 })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 100 },
    children: [new TextRun({ text: "Tecnicatura Superior en Desarrollo de Software", size: 22 })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 100 },
    children: [new TextRun({ text: "Materia: Proyecto Integrador 2026", size: 22 })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 400 },
    children: [new TextRun({ text: "Docente/Tutor: J.C. Leppen", size: 22 })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 100 },
    children: [new TextRun({ text: "Autor: Lautaro Sarmiento", bold: true, size: 24 })],
  }),
  BR(),
];

const agradecimientos = [
  H1("Agradecimientos"),
  P(
    "Reconocimiento a las personas, instituciones o entidades que han contribuido de manera significativa al desarrollo del proyecto."
  ),
  LI("Puede incluir a los supervisores, asesores, colegas, familiares, amigos u otras personas que brindaron apoyo durante el proceso de investigación y desarrollo tecnológico."),
  BR(),
];

const resumen = [
  H1("Resumen"),
  P(
    "El presente proyecto integrador describe el diseño, la arquitectura y la implementación del Sistema de Gestión de Vehículos Aéreos No Tripulados (Sistema VANT) en su estado final consolidado. Tras las dos entregas previas, la plataforma evolucionó desde una API REST inicial con gestión básica de flotas hacia un ecosistema modular que incorpora la trazabilidad completa del ciclo de vida operativo de cada equipo, incluyendo el registro formal de vuelos, la acumulación automática de horas de vuelo sobre los drones, el conteo progresivo de ciclos de carga sobre las baterías, y la aplicación de borrado lógico (soft delete) como política uniforme de auditoría en todas las entidades."
  ),
  P(
    "La arquitectura de software se sostiene sobre el patrón Router-Controller-Model, implementado en Node.js con el framework Express 5, persistencia relacional en MySQL mediante mysql2/promise, autenticación stateless basada en JSON Web Tokens, encriptación de credenciales con Bcrypt, y un módulo de carga de imágenes (Multer) limitado a 5 MB. La nueva capa transaccional introducida en la Etapa 2 garantiza que el alta, la modificación y la baja lógica de un vuelo operen como una unidad atómica: registrar un vuelo implica, en una sola transacción, insertar el movimiento, incrementar el campo horas_vuelo_acum del dron afectado, y aumentar el contador de ciclos de la batería consumida."
  ),
  P(
    "El sistema se complementa con un conjunto de utilitarios de línea de comandos (src/scripts/) para diagnóstico, migración idempotente del esquema relacional, siembra de datos de prueba, generación de credenciales JWT para smoke tests y selección de identificadores de entidades, lo cual reduce la fricción operativa durante el ciclo de desarrollo. Los resultados obtenidos demuestran que la evolución modular del código no compromete la estabilidad de los cimientos originales: las primitivas de seguridad, autorización y auditoría incorporadas en la primera iteración se preservan íntegramente, y la nueva lógica de vuelos se integra respetando los contratos de token, los roles Administrador/Usuario y la política de soft delete."
  ),
  P(
    "Las conclusiones indican que la solución técnica adoptada es altamente escalable y satisface los requerimientos exigidos para la correcta gobernanza de equipos VANT, dejando sentadas las bases para futuras extensiones tales como notificaciones automatizadas, aplicación móvil o exportación analítica de la telemetría histórica."
  ),
  H1("Abstract"),
  P(
    "This integrative project describes the design, architecture, and implementation of the Unmanned Aerial Vehicle Management System (VANT System) in its final consolidated state. After two previous deliveries, the platform evolved from an initial REST API with basic fleet management into a modular ecosystem that incorporates full operational lifecycle traceability, including formal flight logging, automatic accumulation of flight hours on drones, progressive charge cycle counting on batteries, and the application of soft delete as a uniform audit policy across all entities."
  ),
  P(
    "The software architecture is built upon the Router-Controller-Model pattern, implemented in Node.js with the Express 5 framework, relational persistence in MySQL through mysql2/promise, stateless authentication based on JSON Web Tokens, credential encryption with Bcrypt, and an image upload module (Multer) capped at 5 MB. The new transactional layer introduced in Stage 2 guarantees that the creation, modification, and logical deletion of a flight operate as an atomic unit: registering a flight implies, in a single transaction, inserting the movement, incrementing the horas_vuelo_acum field of the affected drone, and increasing the cycle counter of the consumed battery."
  ),
  P(
    "The system is complemented by a set of command-line utilities (src/scripts/) for diagnosis, idempotent relational schema migration, test data seeding, generation of JWT credentials for smoke tests, and selection of entity identifiers, reducing operational friction during the development cycle. The results obtained demonstrate that the modular evolution of the code does not compromise the stability of the original foundations: the security, authorization, and audit primitives incorporated in the first iteration are fully preserved, and the new flight logic integrates by respecting the token contracts, the Administrator/Usuario roles, and the soft delete policy."
  ),
  P(
    "The conclusions indicate that the adopted technical solution is highly scalable and meets the requirements demanded for the proper governance of VANT equipment, laying the groundwork for future extensions such as automated notifications, a mobile application, or analytical export of historical telemetry."
  ),
  BR(),
];

const indice = [
  H1("Índice"),
  P("Resumen .................................................................................................................. 2"),
  P("Abstract .................................................................................................................. 3"),
  P("Índice .................................................................................................................... 4"),
  P("Listado de Abreviaturas ...................................................................................... 5"),
  P("Introducción ........................................................................................................ 7"),
  P("Justificación ........................................................................................................ 7"),
  P("Objetivos del Proyecto ........................................................................................ 8"),
  P("Objetivo General .................................................................................................. 8"),
  P("Como objetivos específicos .................................................................................. 8"),
  P("Alcance y Restricciones ...................................................................................... 9"),
  P("Alcance del proyecto ........................................................................................... 9"),
  P("Restricciones del proyecto ................................................................................... 9"),
  P("Criterios de aceptación ..................................................................................... 10"),
  P("Descripción General del Sistema ...................................................................... 11"),
  P("Módulos del sistema .......................................................................................... 11"),
  P("Módulo de flota (Drones y Modelos) ................................................................. 11"),
  P("Módulo de mantenimiento .................................................................................. 12"),
  P("Módulo de pilotos y seguridad ........................................................................... 12"),
  P("Módulo de baterías y logística ........................................................................... 13"),
  P("Módulo de vuelos y trazabilidad operativa ......................................................... 13"),
  P("Requisitos del Sistema .................................................................................... 14"),
  P("Requerimientos Funcionales .............................................................................. 14"),
  P("Requerimientos No Funcionales ......................................................................... 15"),
  P("Ingeniería y Arquitectura del Sistema .............................................................. 16"),
  P("Arquitectura del Sistema: El Patrón Router-Controller-Model .......................... 16"),
  P("Detalle del Modelo de Datos y Consultas SQL .................................................. 17"),
  P("Estrategia de Seguridad, JWT y Bcrypt implementada en Middlewares ............ 18"),
  P("Política de Auditoría: Soft Delete ..................................................................... 19"),
  P("Capa Transaccional del Módulo de Vuelos ..................................................... 19"),
  P("Utilitarios de Operación (src/scripts/) ........................................................... 20"),
  BR(),
];

const abreviaturas = [
  H1("Listado de Abreviaturas"),
  P(
    "A continuación, se presenta un listado alfabético de los términos técnicos y especializados utilizados a lo largo del desarrollo del Sistema VANT, orientados a facilitar la comprensión del ecosistema tecnológico adoptado en su estado final consolidado:"
  ),
  P("API REST: Interfaz de Programación de Aplicaciones que sigue los principios arquitectónicos REST, permitiendo la comunicación entre el cliente y el servidor mediante solicitudes HTTP estándar.", { run: { bold: true } }),
  P("Bcrypt: Biblioteca de software utilizada para el hashing (encriptación) de contraseñas. En el sistema, se utiliza aplicando un algoritmo de generación de 'sal' (salt) de 10 rondas, lo que incrementa exponencialmente la seguridad de las claves de los pilotos frente a ataques de fuerza bruta.", { run: { bold: true } }),
  P("Connection Pool: Estrategia de gestión de conexiones a bases de datos que mantiene un conjunto reusable de canales abiertos, evitando la instanciación destructiva por cada consulta y mejorando la concurrencia del backend.", { run: { bold: true } }),
  P("Controlador (Controller): Componente de la arquitectura de software encargado de recibir las peticiones HTTP validadas por las rutas, procesar la lógica de negocio y dictaminar qué modelo de datos debe ejecutarse, para luego devolver una respuesta al cliente (ej. dron.controller.js).", { run: { bold: true } }),
  P("CORS (Cross-Origin Resource Sharing): Middleware implementado en la inicialización del servidor Express que permite y regula las solicitudes de recursos provenientes de dominios web distintos al dominio del servidor, facilitando la integración con aplicaciones frontend.", { run: { bold: true } }),
  P("Dotenv: Módulo de dependencia sin dependencias adicionales que carga variables de entorno desde un archivo .env al objeto process.env, protegiendo credenciales sensibles como contraseñas de bases de datos y firmas de tokens.", { run: { bold: true } }),
  P("Express.js: Framework minimalista, rápido y flexible para aplicaciones web basado en Node.js, utilizado como la estructura principal para levantar el servidor del Sistema VANT y gestionar sus rutas y middlewares.", { run: { bold: true } }),
  P("JSON (JavaScript Object Notation): Formato de texto ligero para el intercambio de datos. En este proyecto, toda la comunicación de entrada y salida entre el servidor y el cliente se serializa utilizando el middleware express.json().", { run: { bold: true } }),
  P("JWT (JSON Web Token): Estándar abierto utilizado para la transmisión segura de información entre partes. Se implementa para la autenticación sin estado, firmando un token que contiene el ID y el rol del usuario, con una validez predefinida de una hora.", { run: { bold: true } }),
  P("LEFT JOIN: Cláusula SQL utilizada en las consultas del sistema para obtener, en una sola petición, los datos de una entidad junto con la información desnormalizada de sus relaciones (fabricante, modelo, piloto titular), evitando round-trips adicionales a la base de datos.", { run: { bold: true } }),
  P("Middlewares: Funciones intermedias que tienen acceso al objeto de solicitud (req), al objeto de respuesta (res) y a la siguiente función en el ciclo de vida de la aplicación. Se utilizan para verificar permisos de administrador (verificarAdmin), procesar tokens (verificarToken) o gestionar carga de archivos.", { run: { bold: true } }),
  P("Modelo de Datos (Model): Capa de la arquitectura de software responsable de interactuar directamente con la base de datos, ejecutando sentencias SQL (INSERT, SELECT, UPDATE, DELETE) y retornando los datos en crudo a los controladores.", { run: { bold: true } }),
  P("Multer: Middleware de Node.js diseñado para el manejo de datos multipart/form-data, empleado específicamente para controlar la subida de imágenes de los drones al servidor, validando extensiones y limitando el tamaño a 5 Megabytes por seguridad.", { run: { bold: true } }),
  P("MySQL2: Cliente de base de datos MySQL para Node.js. En el proyecto se emplea su funcionalidad createPool basada en promesas, lo que permite manejar múltiples conexiones concurrentes a la base de datos de forma asíncrona y eficiente.", { run: { bold: true } }),
  P("Node.js: Entorno de ejecución de JavaScript de código abierto y multiplataforma, construido sobre el motor V8, que permite ejecutar el código del backend de forma asíncrona y no bloqueante.", { run: { bold: true } }),
  P("Nodemon: Herramienta de utilidad que monitorea los cambios en el código fuente y reinicia automáticamente el servidor de desarrollo, agilizando los tiempos de compilación durante la etapa de programación.", { run: { bold: true } }),
  P("PNPM: Administrador de paquetes para Node.js que optimiza el uso de disco mediante un almacén global direccionable por contenido. En el proyecto se adoptó como gestor estándar, reemplazando la instalación dispersa de node_modules tradicional.", { run: { bold: true } }),
  P("Rutas (Routers): Componentes encargados de definir los 'endpoints' (puntos de acceso) de la API. Asignan verbos HTTP (GET, POST, PUT, DELETE) a URIs específicas e invocan primero a los middlewares de seguridad y luego a los controladores correspondientes.", { run: { bold: true } }),
  P("Soft Delete: Política de auditoría consistente en marcar un registro como eliminado mediante la asignación de una marca temporal (deleted_at) en lugar de ejecutar una sentencia DELETE física. Garantiza la trazabilidad histórica y la posibilidad de restauración.", { run: { bold: true } }),
  P("Transacción SQL: Secuencia de operaciones sobre la base de datos que se ejecuta como una unidad atómica; o se completan todas las escrituras, o se revierte el conjunto. En el sistema, se aplica a las mutaciones de vuelos para asegurar la coherencia entre el vuelo, las horas del dron y los ciclos de la batería.", { run: { bold: true } }),
  BR(),
];

const introduccion = [
  H1("Introducción"),
  P(
    "El exponencial crecimiento en el uso de Vehículos Aéreos No Tripulados (VANT), comúnmente conocidos como drones, en operaciones comerciales, industriales y de seguridad, demanda soluciones informáticas precisas para su administración operativa y logística. El propósito de esta investigación y desarrollo es presentar un sistema unificado capaz de orquestar flotas completas, centralizando la información crítica que asegura tanto el retorno de inversión como la integridad de los equipos."
  ),
  P(
    "El contexto problemático actual evidencia que la gestión descentralizada de historiales de mantenimiento, asignación de pilotos y trazabilidad de baterías reduce la vida útil operativa de los dispositivos y fomenta riesgos de seguridad. Para mitigar estas problemáticas, el Sistema VANT aborda la creación de una arquitectura backend basada en Node.js, donde la información fluye desde un modelo relacional estricto hacia controladores lógicos que dictaminan, entre otras acciones, cuándo un equipo debe ser retirado de servicio automáticamente al reportarse una falla técnica, y cómo se acumula la evidencia histórica de operación en tablas pivotantes que registran cada vuelo efectivamente realizado."
  ),
  P(
    "La estructura general del trabajo detalla el ciclo de desarrollo desde los requisitos fundacionales y la lógica estructural, avanzando hacia las resoluciones de ingeniería, las capas de seguridad criptográfica y la persistencia relacional en bases de datos, para luego incorporar la capa transaccional del módulo de vuelos y la política de borrado lógico que unifica la auditoría de todas las entidades del dominio."
  ),
  H1("Justificación"),
  P(
    "El desarrollo de esta plataforma se sustenta en la necesidad técnica de brindar escalabilidad, inmediatez y seguridad a nivel empresarial. La elección del ecosistema Node.js y el framework Express responde al porqué de requerir un servidor con manejo de entrada/salida no bloqueante, vital para registrar telemetría y múltiples transacciones simultáneas de los usuarios. Asimismo, el uso del motor de base de datos MySQL es una decisión fundamentada en el requisito ineludible de mantener la 'integridad referencial'; es decir, garantizar que una batería defectuosa o un mantenimiento específico estén siempre ligados indudablemente al registro inmutable de un dron y un modelo exactos, y que un vuelo se encuentre siempre anclado al trinomio dron-batería-piloto que intervino en la operación."
  ),
  P(
    "Finalmente, se justifica la estricta implementación de seguridad mediante JWT y Bcrypt para asegurar que ninguna manipulación en la flota —como modificar permisos, eliminar registros de vuelo o alterar la trazabilidad de horas acumuladas— pueda realizarse por un actor malintencionado que intercepte las peticiones en la red o vulnere la base de datos. La elección de soft delete como política uniforme de auditoría se justifica por la necesidad de preservar la trazabilidad histórica incluso frente a borrados solicitados por usuarios administradores: el registro nunca desaparece físicamente, solo se lo marca con una fecha de baja lógica."
  ),
  BR(),
];

const objetivos = [
  H1("Objetivos del Proyecto"),
  P(
    "El desarrollo de esta plataforma establece metas precisas orientadas a solucionar la problemática logística y de seguridad en el ámbito de la aviación no tripulada, incorporando en su estado final consolidado los objetivos específicos que emergen de la evolución del sistema hacia la trazabilidad operativa de los vuelos."
  ),
  H2("Objetivo General"),
  P(
    "Es desarrollar un sistema web integral para la gestión de equipos VANT, con el propósito de optimizar los procesos administrativos y operativos, permitiendo reducir la carga manual y mejorar la eficiencia en el control de la flota, la trazabilidad de los vuelos efectivamente realizados y la acumulación automática de indicadores operativos sobre los activos."
  ),
  H2("Como objetivos específicos"),
  P(
    "El software busca, en primer lugar, centralizar la gestión de la información técnica relacionada con los drones, sus modelos, baterías, planificaciones de vuelo y la bitácora de vuelos efectivamente ejecutados. En segundo lugar, busca automatizar el ciclo de vida operativo de los equipos; por ejemplo, logrando el cambio de estado de un dron a 'En Mantenimiento' en la base de datos de manera inmediata y autónoma al registrar su ingreso al taller, o bien la acumulación de horas de vuelo y ciclos de batería de forma atómica al confirmar un vuelo. En tercer lugar, un objetivo primordial es garantizar la inexpugnabilidad de la infraestructura implementando un sistema robusto de autenticación basado en JSON Web Tokens (JWT) y el cifrado criptográfico de credenciales. Finalmente, el sistema busca preservar la trazabilidad histórica mediante una política uniforme de soft delete que nunca destruye físicamente los registros."
  ),
  BR(),
];

const alcance = [
  H1("Alcance y Restricciones"),
  H2("Alcance del proyecto"),
  P(
    "Los alcances de un desarrollo tecnológico refieren a los límites formales y la extensión de lo que se logrará, definiendo su enfoque y evitando la dispersión de los recursos de ingeniería. En el marco del Sistema VANT en su estado final consolidado, el alcance técnico contempla la creación de una arquitectura backend basada en una API RESTful que permite la administración integral de los recursos de la organización, sumando al conjunto de módulos de la entrega anterior el módulo de vuelos y trazabilidad operativa."
  ),
  P(
    "El sistema abarca la gestión de la flota de drones y la catalogación de sus modelos, posibilitando el almacenamiento concurrente de metadatos e imágenes representativas de cada unidad. Asimismo, el alcance incluye un módulo de control de talento humano (pilotos) donde se registran jerarquías, datos de contacto y el vencimiento crítico de sus certificaciones médicas aeronáuticas (CMA). A nivel logístico, el proyecto cubre el rastreo de componentes perecederos mediante el control de baterías, documentando su capacidad, voltaje y el historial de ciclos de carga. El sistema también contempla un orquestador de misiones (previstos) que documenta parámetros clave como las fechas de inicio y fin, la descripción del vuelo y el solicitante."
  ),
  P(
    "El alcance de la presente entrega incorpora, además, la gestión formal del módulo de Vuelos, en el cual cada operación aérea efectivamente realizada se registra con su duración, fecha de ejecución, dron interviniente, batería consumida y piloto responsable. El sistema ofrece, sobre este módulo, la capacidad de inserción, edición y baja lógica (soft delete) de vuelos, y propaga automáticamente las horas de vuelo acumuladas hacia el dron afectado y los ciclos de carga hacia la batería afectada, todo dentro de una transacción SQL atómica."
  ),
  P(
    "Quedan excluidas de este alcance final funciones como notificaciones automatizadas por correo electrónico, generación de reportes analíticos exportables o el desarrollo de una app móvil, características que se proyectan para futuras actualizaciones de la plataforma."
  ),
  H2("Restricciones del proyecto"),
  P(
    "Las restricciones representan las condiciones o límites ineludibles (técnicos, financieros o lógicos) que afectan el diseño y la ejecución del proyecto. Desde la arquitectura de este software, se han establecido severas restricciones de ciberseguridad en la gestión de recursos: el middleware multer implantado en el servidor restringe el peso máximo de cualquier fotografía entrante a exactamente 5 Megabytes (MB), limitando además los formatos aceptados a extensiones específicas (jpeg, jpg, png, gif) como medida de prevención contra la inyección de código malicioso."
  ),
  P(
    "Otra restricción estructural se encuentra en la persistencia de la información; el sistema carece de almacenamiento local y depende de la conectividad a un clúster de base de datos MySQL alojado remotamente en la infraestructura de Railway (maglev.proxy.rlwy.net), lo cual supedita el funcionamiento del backend a la latencia y disponibilidad de dicho proveedor. El entorno de autenticación presenta una restricción temporal configurada deliberadamente: las credenciales JWT emitidas por el servidor poseen un tiempo de expiración (expiresIn) estricto de una hora ('1h'), lo que obliga al personal a reautenticarse periódicamente y limita el tiempo de exposición frente a un posible secuestro de sesión."
  ),
  P(
    "La presente entrega introduce una nueva restricción de coherencia transaccional: las operaciones de alta y modificación del módulo de Vuelos deben ejecutarse íntegramente dentro de una transacción SQL, de modo tal que si la inserción del vuelo, el incremento de horas del dron o el incremento de ciclos de la batería fallan por cualquier motivo, el conjunto completo de escrituras sea revertido, preservando la invariancia de los contadores acumulados. Del mismo modo, el sistema impone la restricción de auditoría de soft delete: ninguna entidad del dominio puede ser eliminada físicamente; las bajas se materializan exclusivamente mediante la asignación de la marca temporal deleted_at, manteniéndose el registro en la base de datos para fines de trazabilidad."
  ),
  BR(),
];

const criterios = [
  H1("Criterios de Aceptación"),
  P(
    "Los criterios de aceptación definen las condiciones verificables y específicas que el software debe cumplir para que el producto entregable se considere completo y satisfactorio. Los criterios enumerados a continuación resultan de la consolidación de los criterios establecidos en entregas previas, sumados a los emergentes de la Etapa 2 del proyecto."
  ),
  P(
    "A nivel de cumplimiento de hitos, un criterio imperativo es que la aplicación web, especialmente en su componente de lógica de negocio (Backend), se encuentre finalizada y operando fluidamente en un servicio de hosting en la nube, o susceptible de ser desplegada en él a partir de la configuración local documentada en el archivo .env.example. En lo referente a las reglas de automatización, el sistema debe superar con éxito las pruebas de mutación de estados: al recibir una instrucción válida en el controlador de mantenimiento, el software no solo debe insertar el historial de reparación, sino que debe ejecutar correctamente una sentencia UPDATE que modifique el estado del dron a 'En Mantenimiento' sin intervención humana adicional."
  ),
  P(
    "En el ámbito de la seguridad perimetral, el criterio de aceptación dictamina que ningún usuario carente de rango administrativo pueda alterar la infraestructura; el sistema debe decodificar el token, leer la carga útil (req.user.rol), y rechazar invariablemente cualquier petición no autorizada emitiendo un estado HTTP 403 (Acceso denegado)."
  ),
  P(
    "La presente entrega fija criterios adicionales sobre la coherencia transaccional y la auditoría. Primero, el sistema debe demostrar que el alta o la modificación de un vuelo se ejecuta íntegramente dentro de una transacción SQL: si cualquiera de las escrituras secundarias (incremento de horas en dron, incremento de ciclos en batería) falla, el vuelo no debe quedar persistido de forma huérfana, y el conjunto debe ser revertido de manera atómica. Segundo, el sistema debe demostrar que la baja de un vuelo, al igual que la del resto de las entidades del dominio, se materializa exclusivamente como un soft delete (asignación de deleted_at), preservando el registro para auditoría. Tercero, los contadores horas_vuelo_acum del dron y los ciclos de la batería deben incrementarse únicamente ante inserciones y modificaciones de vuelos, pero nunca ante la baja lógica de un vuelo eliminado: la baja no resta horas acumuladas, dado que el vuelo ya fue efectivamente realizado."
  ),
  BR(),
];

const descripcion = [
  H1("Descripción General del Sistema"),
  P(
    "El Sistema VANT se concibe como una plataforma integral y centralizada, estructurada a través de una Interfaz de Programación de Aplicaciones (API REST) desarrollada en el entorno Node.js. Su propósito cardinal es digitalizar, asegurar y automatizar el flujo de información operativa de una organización que utiliza Vehículos Aéreos No Tripulados. A diferencia de las gestiones tradicionales basadas en registros físicos o descentralizados, este sistema divide la lógica de negocio en módulos interconectados que dialogan con una base de datos relacional MySQL. Esta arquitectura modular garantiza que cada aspecto del ciclo de vida de la flota —desde la matriculación inicial hasta el recambio de piezas, la asignación de misiones y la bitácora de vuelos efectivamente realizados— sea monitoreado bajo estrictos protocolos de validación de datos, transacciones atómicas y seguridad de accesos."
  ),
  H1("Módulos del sistema"),
  P(
    "La lógica operativa del backend se encuentra parcelada en controladores de dominio, lo cual permite una alta cohesión y un bajo acoplamiento arquitectónico. A continuación, se describen los pilares fundamentales que componen el sistema en su estado final consolidado."
  ),
  H2("Módulo de flota (Drones y Modelos)"),
  P(
    "Este módulo es el núcleo del inventario. La gestión de los equipos está gobernada por el archivo dron.controller.js, el cual orquesta las altas, bajas y modificaciones del parque aéreo. Técnicamente, la creación de un nuevo registro no se limita a la inserción de texto; exige la validación ineludible de la matrícula, el número de serie y el identificador de modelo. A nivel de infraestructura, el sistema incorpora el middleware multer para procesar peticiones HTTP de tipo multipart/form-data, lo que permite adjuntar evidencia fotográfica del equipo al momento de su registro, resguardando el nombre del archivo directamente en la persistencia de la base de datos. Asimismo, el módulo está fuertemente acoplado al catálogo de fabricantes (modelo_dron.controller.js), permitiendo que, a través de consultas SQL con cláusulas LEFT JOIN, el cliente obtenga no solo los datos en crudo del dron, sino la información comercial completa (fabricante y modelo) con una única petición al servidor, optimizando drásticamente los tiempos de respuesta de la red. En la presente entrega, la tabla dron se ve enriquecida con la columna horas_vuelo_acum, la cual mantiene el acumulado de horas de operación de la unidad y se incrementa de forma automática ante cada vuelo registrado."
  ),
  H2("Módulo de mantenimiento"),
  P(
    "La preservación de los activos físicos y la trazabilidad de las reparaciones se gestionan a través del módulo de mantenimiento. El diseño de este segmento en mantenimiento.controller.js destaca por la automatización de procesos para evitar el error humano. Cuando un operador registra el ingreso de una unidad al taller (indicando fecha, tipo de mantenimiento, descripción y costo), el controlador procesa la orden e inserta el historial de reparación. Inmediatamente y de forma autónoma, el sistema ejecuta una segunda transacción hacia la base de datos: una sentencia UPDATE que localiza el dron afectado y muta su estado operativo al valor 'En Mantenimiento'. Esta automatización refleja un requerimiento de negocio crítico, ya que bloquea lógicamente al equipo, impidiendo que sea asignado a misiones de vuelo mientras dure su estancia en el taller. Las bajas de mantenimiento se materializan exclusivamente como soft delete, preservando la trazabilidad histórica de las intervenciones."
  ),
  H2("Módulo de pilotos y seguridad"),
  P(
    "El control del personal humano recae en piloto.controller.js, complementado por el gestor de sesiones auth.controller.js. Este módulo administra la información sensible de los operadores, como su Documento Nacional de Identidad, número de contacto y, fundamentalmente, la fecha de vencimiento de su Certificación Médica Aeronáutica (CMA). Por motivos de seguridad cibernética, este módulo aplica la encriptación unidireccional de contraseñas mediante la librería Bcrypt. A nivel de usabilidad, el controlador posee un motor de búsqueda por aproximación que utiliza la sentencia SQL LIKE ?, posibilitando la localización inmediata de un empleado ingresando solo un fragmento de su nombre. Toda acción en este módulo está restringida: los inicios de sesión emiten un JSON Web Token (JWT) firmado criptográficamente, y cualquier mutación de datos (como la eliminación de un piloto) debe ser auditada por un middleware que verifique que la carga útil del token posea una jerarquía de administrador (rol === 'Admin')."
  ),
  H2("Módulo de baterías y logística"),
  P(
    "Debido a que las baterías de polímero de litio son los componentes más perecederos y críticos para la seguridad del vuelo, el sistema dedica un módulo exclusivo (bateria.controller.js) para su control. El controlador exige parámetros técnicos precisos como el número de serie único, el voltaje y la capacidad en miliamperios-hora (mAh). A nivel lógico, si durante la carga de datos el usuario omite establecer un estado operativo para el acumulador, el modelo SQL intercepta la falta de información y asigna autónomamente el valor 'DISPONIBLE', asegurando la integridad del inventario frente a campos nulos. Este módulo se complementa con la planificación logística (previstos.controller.js), encargada de orquestar el agendamiento de misiones futuras mediante la declaración de fechas de inicio, finalización, descripciones operativas y solicitantes, centralizando el despacho de la flota y el personal. En la presente entrega, el contador de ciclos de cada batería se incrementa de forma automática y atómica ante cada vuelo que la haya consumido."
  ),
  H2("Módulo de vuelos y trazabilidad operativa"),
  P(
    "El módulo de Vuelos, implementado en vuelo.controller.js, constituye la pieza angular de la presente entrega y materializa la trazabilidad operativa del sistema. Su responsabilidad es mantener un registro inmutable, mediante soft delete, de cada operación aérea efectivamente realizada, asociándola con el dron interviniente, la batería consumida y el piloto responsable. Técnicamente, el modelo subyacente (vuelo.model.js) materializa una relación de tipo entidad-asociación sobre cuatro tablas: la tabla vuelo, que custodia la fecha de ejecución, la duración y las observaciones, y las tres tablas pivotantes vuelo_dron, vuelo_bateria y vuelo_piloto, cuyas columnas reciben los nombres no estandarizados dron_id, bateria_id y piloto_id para evitar colisiones con los identificadores primarios de cada entidad."
  ),
  P(
    "El rasgo distintivo del módulo es que las operaciones POST y PUT no se reducen a una inserción o actualización aislada: se ejecutan íntegramente dentro de una transacción SQL. Esto significa que, ante el alta de un vuelo, el sistema no solo persiste el registro principal, sino que también ejecuta la consulta de vinculación en las tablas pivotantes y, en la misma unidad atómica, incrementa el campo horas_vuelo_acum del dron afectado y el contador de ciclos de la batería afectada. La modificación de un vuelo revierte los contadores del estado anterior y aplica los nuevos valores, manteniendo la coherencia de los acumulados. Ante cualquier fallo parcial, la transacción se revierte por completo y la base de datos no queda en un estado inconsistente. La baja lógica de un vuelo, en cambio, no resta horas ni ciclos, dado que la operación aérea fue efectivamente realizada: se preserva así la fidelidad del histórico operativo."
  ),
  BR(),
];

const requisitos = [
  H1("Requisitos del Sistema"),
  H2("Requerimientos Funcionales"),
  P(
    "Basado en un análisis exhaustivo del código fuente y de los procesos orquestados en la capa de controladores, se extraen las condiciones específicas e ineludibles que definen la usabilidad técnica y operativa del sistema en su estado final consolidado."
  ),
  H3("Gestión Integral de Drones"),
  P(
    "El sistema debe permitir operaciones de tipo CRUD (Crear, Leer, Actualizar, Eliminar) sobre la flota de drones. Para las altas, el sistema debe obligar la asignación de una matrícula, un número de serie único y un modelo (id_modelo_dron). Además, el sistema debe validar duplicidades de matrícula o número de serie interceptando el error de MySQL ER_DUP_ENTRY."
  ),
  H3("Subida y Asignación de Recursos Multimedia"),
  P(
    "El software debe poseer un servicio para adjuntar un archivo de imagen en el registro de creación de un dron, asociando el nombre codificado del archivo dentro de la base de datos para su futura recuperación visual por el cliente."
  ),
  H3("Trazabilidad y Control de Pilotos"),
  P(
    "El sistema debe permitir listar, buscar por aproximación de nombre (LIKE ?), registrar, modificar y eliminar pilotos. El proceso de registro requiere obligatoriamente campos como email, contraseña, nombre y rol, gestionando los accesos."
  ),
  H3("Gestión Autónoma de Mantenimientos"),
  P(
    "El sistema debe permitir que un usuario autorizado registre el ingreso de una unidad al taller (id_mantenimiento, descripción). Crucialmente, al disparar el registro de un nuevo mantenimiento, el sistema debe actualizar de forma automática e inmediata el estado del dron asociado en la base de datos, mutándolo al valor estricto de 'En Mantenimiento'."
  ),
  H3("Administración del Ciclo de Vida de Baterías"),
  P(
    "El software debe llevar un registro pormenorizado de los acumuladores de energía, exigiendo el número de serie, voltaje y capacidad. Debe gestionar por defecto el estado de la batería como 'DISPONIBLE' si el usuario no especifica lo contrario en el ingreso de datos, e incrementar automáticamente su contador de ciclos ante cada vuelo que la consuma."
  ),
  H3("Sistema de Autenticación y Emisión de Credenciales"),
  P(
    "El sistema debe procesar el inicio de sesión (login) validando el email y la clave desencriptada, y en caso de ser exitoso, debe emitir una credencial de portador (Token JWT) incrustando la identidad y jerarquía (rol) del piloto de forma cifrada."
  ),
  H3("Gestión Transaccional de Vuelos"),
  P(
    "El sistema debe permitir registrar, modificar y dar de baja lógica (soft delete) vuelos efectivamente realizados. Las operaciones de alta y modificación deben ejecutarse dentro de una transacción SQL que, de manera atómica, inserte el vuelo, vincule el trinomio dron-batería-piloto en las tablas pivotantes, e incremente los contadores horas_vuelo_acum y ciclos en el dron y la batería afectados. Ante cualquier fallo, la transacción debe revertir el conjunto completo de escrituras."
  ),
  H3("Política Unificada de Soft Delete"),
  P(
    "El sistema debe aplicar de forma uniforme, sobre todas las entidades del dominio (pilotos, drones, baterías, mantenimientos, previstos y vuelos), la política de borrado lógico: ninguna eliminación debe materializarse mediante una sentencia DELETE física, sino mediante la asignación de una marca temporal deleted_at que preserve la trazabilidad histórica del registro."
  ),
  H2("Requerimientos No Funcionales"),
  H3("Seguridad de Contraseñas"),
  P(
    "El sistema debe almacenar las claves de acceso de los pilotos empleando exclusivamente encriptación de vía única a través de la librería Bcrypt, aplicando de forma estricta la generación de un salt algorítmico de nivel 10 antes de guardar cualquier registro en la base de datos."
  ),
  H3("Seguridad de Endpoints y Autorización Perimetral"),
  P(
    "El entorno backend debe bloquear el acceso a recursos privados validando los tokens en la cabecera HTTP (Authorization: Bearer <token>). Además, cualquier petición que suponga mutaciones en la infraestructura (POST, PUT, DELETE) debe requerir permisos de jerarquía administrativa validando la carga útil del token (req.user.rol === 'Admin')."
  ),
  H3("Regulaciones de Almacenamiento"),
  P(
    "El módulo receptor de archivos en el servidor (Multer) debe rechazar archivos que superen estrictamente los 5 Megabytes (MB) de peso. También, debe filtrar a nivel del servidor el tipo de extensión de archivos (MIME types), permitiendo única y exclusivamente la subida de recursos fotográficos (jpeg, jpg, png, gif)."
  ),
  H3("Rendimiento y Tolerancia a Fallos"),
  P(
    "La conexión a la base de datos debe realizarse a través de un esquema estructurado de Connection Pooling (Pool de conexiones). Esto garantiza que, frente a un elevado tráfico de peticiones, el servidor pueda reusar conexiones y evitar cuellos de botella por instanciación de recursos persistentes."
  ),
  H3("Idempotencia de Migraciones"),
  P(
    "Los utilitarios de mantenimiento de esquema (src/scripts/migrate-vuelo.js) deben ser idempotentes: aplicables de forma repetida sin alterar el estado del esquema, verificando la presencia o ausencia de las columnas y restricciones antes de ejecutar las sentencias ALTER. Esta propiedad garantiza que la operación pueda ser ejecutada manualmente en cualquier momento sin riesgo de duplicación."
  ),
  H3("Trazabilidad y Coherencia Transaccional"),
  P(
    "El sistema debe garantizar que, ante operaciones de escritura que afecten múltiples tablas (caso del módulo de Vuelos), la integridad de los contadores acumulados en entidades relacionadas (dron, batería) se preserve estrictamente. La elección del borrado lógico como política de auditoría y de la transacción SQL como unidad de escritura constituye el mecanismo de defensa frente a la corrupción de los acumulados y la pérdida de historial."
  ),
  BR(),
];

const ingenieria = [
  H1("Ingeniería y Arquitectura del Sistema"),
  H2("Arquitectura del Sistema: El Patrón Router-Controller-Model"),
  P(
    "El Sistema VANT ha sido estructurado empleando un patrón arquitectónico moderno que divide la responsabilidad del software en capas claramente limitadas, mejorando la legibilidad, escalabilidad y permitiendo una mantenibilidad altamente eficaz. El núcleo del servidor (app.js) actúa como el coordinador general, en el cual se instancia Express, se asimilan las variables de entorno para los puertos (desplegables en Railway o locales) y se configuran las protecciones de Cross-Origin Resource Sharing (CORS)."
  ),
  P(
    "El primer nivel de esta arquitectura recae en el sistema de enrutamiento (Router). Archivos como dron.routes.js o mantenimiento.routes.js son los delegados de definir el catálogo de las Interfaz de Programación de Aplicaciones (API). En esta capa perimetral, la aplicación no procesa datos, sino que evalúa el verbo HTTP entrante (GET, POST, PUT, DELETE) y la URL asignada, para luego inyectar 'Middlewares' restrictivos como verificarToken y verificarAdmin. Si la solicitud sortea la capa de seguridad en la ruta, el flujo se entrega a los Controladores (Controller)."
  ),
  P(
    "Un archivo como dron.controller.js contiene la lógica de negocio pura. En el controlador recae el 'porqué' funcional de la petición: verifica que los parámetros esenciales del cuerpo de la petición (req.body) existan, y dictamina las reglas de mutación. Un ejemplo claro de esta gestión avanzada se observa en el archivo mantenimiento.controller.js donde, tras ordenar registrar el mantenimiento de un equipo, el controlador inyecta una lógica adicional automática para buscar el dron específico y alterar su estatus a 'En Mantenimiento' sin necesidad de que el usuario lo solicite de manera separada. De manera análoga, vuelo.controller.js introduce la lógica transaccional: tras validar la entrada, delega al modelo la apertura de una transacción, la inserción del vuelo, el vínculo en las tablas pivotantes y la actualización de contadores en dron y batería, con manejo de rollback ante cualquier error."
  ),
  P(
    "Finalmente, la capa más profunda es el Modelo (Model). Los controladores jamás entablan comunicación directa con la base de datos; delegan esa responsabilidad a archivos como dron.model.js. El modelo provee abstracciones de las consultas a la persistencia utilizando el Pool de MySQL. El motivo técnico de delegar este paso es confinar el riesgo de las inyecciones SQL a un solo lugar y asegurar que los controladores operen de forma agnóstica al motor de bases de datos elegido. En el caso del modelo de vuelos, esta capa se complementa con la responsabilidad de gestionar la apertura y el cierre de transacciones, retornando al controlador un resultado que refleja el éxito o el rollback integral del conjunto de operaciones."
  ),
  H2("Detalle del Modelo de Datos y Consultas SQL"),
  P(
    "El modelo de datos se caracteriza por una naturaleza relacional fuertemente tipada que garantiza la máxima integridad de los activos de la organización. A nivel de las consultas SQL embebidas en los archivos *.model.js, se observa una exhaustiva normalización en el cruce de entidades. Por ejemplo, en el módulo dron.model.js, la función getAllDrones() emplea la sentencia LEFT JOIN para cruzar la tabla base dron con modelo_dron y con piloto. Esto significa que, con un solo impacto hacia la base de datos (y gracias al uso del pool de promesas asíncronas de mysql2), el controlador obtiene no solo las matrículas y los identificadores foráneos (FK), sino que ya dispone de los nombres de los fabricantes, el nombre comercial del modelo y los nombres y apellidos del piloto titular. Esta decisión arquitectónica evita la redundancia de datos, donde en vez de guardar 'fabricante' en la tabla del dron (lo que sería un grave error de diseño), sólo se relaciona por ID, ahorrando miles de bytes."
  ),
  P(
    "Otro ejemplo de la precisión del modelo se ve en el módulo de baterías (bateria.model.js), donde las consultas de tipo INSERT INTO están preparadas para manejar valores por defecto de resguardo (fallback logic). Si en el registro el usuario no declara un estado operativo, la consulta SQL asume autónomamente la inserción de 'DISPONIBLE' en la persistencia de la base, protegiendo las reglas de la compañía de sufrir campos huérfanos nulos (null). Para las búsquedas en piloto.model.js, se aplica una cláusula LIKE ? concatenada con porcentajes [%${termino}%] que permite búsquedas dinámicas relacionales por fragmentos del nombre en tiempo real."
  ),
  P(
    "La presente entrega introduce el submodelo de Vuelos, que articula cuatro entidades interrelacionadas. La tabla vuelo custodia los campos fecha_ejecucion, duracion_horas y observaciones, junto con su marca deleted_at para auditoría. Las tablas pivotantes vuelo_dron, vuelo_bateria y vuelo_piloto materializan la relación muchos-a-muchos entre un vuelo y sus entidades intervinientes, utilizando para sus columnas de referencia los nombres no estandarizados dron_id, bateria_id y piloto_id (no id_*), una convención adoptada deliberadamente para evitar colisiones con los identificadores primarios de cada tabla. La tabla dron, además, fue enriquecida con la columna horas_vuelo_acum, la cual mantiene el acumulado de horas operativas de la unidad y se incrementa de forma automática ante cada alta o modificación de vuelo."
  ),
  H2("Estrategia de Seguridad, JWT y Bcrypt implementada en Middlewares"),
  P(
    "El pilar crítico del Sistema VANT radica en la estrategia de confianza nula (Zero Trust) regida por los middlewares de protección perimetral ubicados en auth.middleware.js. La justificación central es que bajo ninguna circunstancia el backend confiará ciegamente en una solicitud entrante. Para solucionar la vulnerabilidad inherente al almacenamiento de datos en la nube, cuando el controlador recibe los parámetros de un alta nueva de personal (crearPiloto), se procede a interceptar la clave en texto plano. Mediante la librería Bcrypt se aplica un 'Salting', añadiendo secuencias criptográficas basura en 10 niveles de iteración de cifrado para que una contraseña robada sea matemáticamente irresoluble."
  ),
  P(
    "El inicio de sesión gestionado en auth.controller.js es el punto de emisión de certificados. Al confirmar la identidad en la base de datos usando bcrypt.compare, el sistema emplea la librería jsonwebtoken para compilar y encriptar un token JWT basado en la clave secreta JWT_SECRET (aislada en el archivo de entorno .env de Railway). Dicho token expira implacablemente a la hora (1h), mitigando la superficie de ataque frente a robos de sesión."
  ),
  P(
    "Una vez emitido, cada vez que un cliente envía solicitudes privadas (como eliminar un dron o registrar un vuelo), los enrutadores detienen la solicitud en los Middlewares. Primero evalúan verificarToken: se disecciona el encabezado HTTP y se divide usando .split(' ') para separar la palabra 'Bearer' del token legítimo. Si la validación es correcta, el sistema inserta el rol del usuario en la solicitud (req.user = decoded). La arquitectura aplica entonces su último filtro jerárquico llamando al middleware verificarAdmin. Si la carga útil analizada en la etapa previa dictamina que el usuario no tiene rango de 'Admin', el middleware emite inmediatamente un bloqueo 403 Forbidden informando que se requieren permisos elevados, anulando el procesamiento hacia la base de datos y brindando una robustez inquebrantable a las operaciones críticas del software. Esta cadena de seguridad se aplica de forma idéntica a los nuevos endpoints del módulo de Vuelos."
  ),
  H2("Política de Auditoría: Soft Delete"),
  P(
    "Una decisión arquitectónica de relevancia transversal en el estado final consolidado del sistema es la adopción uniforme del patrón de borrado lógico (soft delete) como política de auditoría. En lugar de ejecutar sentencias DELETE FROM que destruyan físicamente los registros, todos los modelos del sistema ejecutan, ante una solicitud de baja, una sentencia UPDATE ... SET deleted_at = NOW() que asigna una marca temporal al campo homónimo. Esto preserva el registro original en la base de datos, mantiene la integridad de las claves foráneas y de las tablas pivotantes, y permite que el sistema pueda, eventualmente, ofrecer mecanismos de restauración, auditoría forense o analítica histórica sobre el conjunto de entidades que alguna vez pertenecieron al dominio."
  ),
  P(
    "La política es de aplicación uniforme sobre todas las entidades del sistema, sin excepciones: pilotos, drones, modelos, baterías, mantenimientos, previstos y, a partir de la presente entrega, vuelos. La única operación que merece una salvedad operativa dentro de este marco es la baja lógica del módulo de Vuelos: dado que un vuelo fue efectivamente realizado, su eliminación mediante soft delete no revierte los contadores horas_vuelo_acum del dron ni los ciclos acumulados de la batería, preservando la fidelidad del histórico operativo. Las inserciones y modificaciones de vuelos, en cambio, sí propagan la actualización de contadores, dado que reflejan actividad aérea concreta."
  ),
  H2("Capa Transaccional del Módulo de Vuelos"),
  P(
    "La pieza de ingeniería más delicada de la presente entrega es la introducción de la capa transaccional aplicada al módulo de Vuelos. El problema técnico a resolver es el siguiente: el alta de un vuelo no consiste simplemente en una inserción aislada, sino en un conjunto coordinado de escrituras que involucra al menos cuatro tablas —el vuelo principal, las tres tablas pivotantes y, eventualmente, las actualizaciones de contadores en dron y batería—. Si cualquiera de estas escrituras falla por una violación de unicidad, por un error de conexión o por una inconsistencia lógica, la base de datos podría quedar en un estado corrupto: un vuelo registrado sin horas acumuladas, una batería con ciclos incrementados sin vuelo que los respalde, o un dron con horas acumuladas que no se corresponden con ningún vuelo en la bitácora."
  ),
  P(
    "La solución adoptada consiste en envolver el conjunto de operaciones en una transacción SQL. El controlador solicita al modelo la apertura de una conexión transaccional, ejecuta secuencialmente las inserciones y actualizaciones, y al final ejecuta la sentencia de confirmación (COMMIT) si todas las operaciones culminaron exitosamente. Si durante el proceso se emite una excepción, el modelo ejecuta la sentencia de reversión (ROLLBACK) y devuelve un error controlado al controlador, que lo traduce a una respuesta HTTP 4xx para el cliente. Este diseño garantiza la propiedad atómica del conjunto: o todas las escrituras se aplican, o ninguna se aplica, preservando la invariancia de los contadores y la coherencia referencial del sistema."
  ),
  P(
    "La misma propiedad transaccional se aplica a la operación de modificación (PUT) de un vuelo, ya que el cambio de duración, de dron o de batería exige revertir los contadores del estado anterior antes de aplicar los nuevos. La operación de baja lógica (DELETE), por su parte, se reduce a un UPDATE sobre el vuelo y sus vínculos pivotantes, sin afectar contadores, dado que la operación aérea fue efectivamente realizada."
  ),
  H2("Utilitarios de Operación (src/scripts/)"),
  P(
    "El sistema se complementa con un conjunto de utilitarios de línea de comandos ubicados en la carpeta src/scripts/, los cuales constituyen la caja de herramientas operativa del desarrollador. Cada utilitario responde a una necesidad concreta del ciclo de vida del software y se ejecuta de forma independiente al servidor Express, mediante la invocación 'node src/scripts/<archivo>.js'."
  ),
  P(
    "El script test-db.js ofrece un panorama general del estado de la base de datos: verifica la conectividad, lista las tablas presentes y vuelca un conjunto limitado de registros de cada una, junto con los conteos totales. Su propósito es servir como smoke test inmediato luego del despliegue, permitiendo detectar anomalías estructurales sin necesidad de herramientas externas. El script inspect-vuelo-schema.js realiza un diagnóstico fino de las cuatro tablas del módulo de Vuelos y verifica la presencia de la columna horas_vuelo_acum sobre la tabla dron, ofreciendo una señal inequívoca del estado de la migración transaccional."
  ),
  P(
    "El script migrate-vuelo.js aplica las sentencias ALTER requeridas por la Etapa 2, entre ellas la creación de la tabla vuelo y de las tres tablas pivotantes, la adición de la columna horas_vuelo_acum sobre dron, y la creación de los índices necesarios. Es idempotente: chequea la presencia o ausencia de cada elemento del esquema antes de aplicar la sentencia correspondiente, de modo tal que puede ejecutarse múltiples veces sin alterar el estado final de la base de datos. El script seed-vuelos.js crea un conjunto de cinco vuelos de prueba invocando la API del sistema (requiere el servidor en ejecución en el puerto 3000), y resulta especialmente útil para validar visualmente el comportamiento transaccional y la propagación de contadores."
  ),
  P(
    "Finalmente, los scripts gen-tokens.js y pick-test-data.js completan la caja de herramientas: el primero emite credenciales JWT válidas (con rol de Administrador y de Usuario) listas para smoke tests con Postman o curl, mientras que el segundo devuelve identificadores útiles para la construcción manual de pruebas (IDs de administradores, drones, baterías, pilotos y previstos). En conjunto, estos utilitarios reducen la fricción operativa del ciclo de desarrollo y dejan documentada, en el propio código, la lógica de uso intensivo del sistema."
  ),
];

const doc = new Document({
  creator: "Lautaro Sarmiento",
  title: "Sistema Integral de Gestión de Operativos VANT - Entrega Final",
  description: "Proyecto Integrador 2026 - IFTS N°24",
  sections: [
    {
      properties: {},
      children: [
        ...portada,
        ...agradecimientos,
        ...resumen,
        ...indice,
        ...abreviaturas,
        ...introduccion,
        ...objetivos,
        ...alcance,
        ...criterios,
        ...descripcion,
        ...requisitos,
        ...ingenieria,
      ],
    },
  ],
});

const buffer = await Packer.toBuffer(doc);
writeFileSync(outputPath, buffer);
console.log(`Generado: ${outputPath}`);
console.log(`Tamaño: ${buffer.length} bytes`);
