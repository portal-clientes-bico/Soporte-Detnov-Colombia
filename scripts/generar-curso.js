const fs = require("fs");
const path = require("path");
const { crearDocumento, portada, h1, h2, p, nota, bullets, ficha, tabla, pregunta, hojaRespuestas, finalizar } = require("./pdf-helpers");

const OUT_CONTENIDO = path.join(__dirname, "..", "data", "curso-series2", "contenido");
const OUT_QUIZ = path.join(__dirname, "..", "data", "curso-series2", "quizzes");
fs.mkdirSync(OUT_CONTENIDO, { recursive: true });
fs.mkdirSync(OUT_QUIZ, { recursive: true });

const CURSO = "Curso introductorio — Portafolio Series 2 de Maple Armor";
const PUBLICO = "Dirigido a ingenieros que necesitan conocer el alcance técnico y comercial del portafolio, para efectos de especificación, diseño de sistemas y soporte técnico. No sustituye los manuales de instalación ni las hojas de datos oficiales, que siguen siendo la fuente de referencia obligatoria para diseño de detalle y puesta en marcha.";

// ---------------------------------------------------------------------------
// MODULO 1
// ---------------------------------------------------------------------------
const modulo1 = {
  num: 1,
  slug: "01-introduccion-plataforma-series2",
  titulo: "Introducción a la plataforma Series 2",
  resumen: "Origen del fabricante, evolución de producto y arquitectura general del sistema direccionable.",
  contenido(doc) {
    portada(doc, {
      kicker: "Módulo 1",
      titulo: "Introducción a la plataforma Series 2",
      subtitulo: CURSO,
      notas: PUBLICO,
    });

    h1(doc, "1.1 — ¿Qué es Maple Armor / FireWatcher / Series 2?");
    p(
      doc,
      "Maple Armor Fire Alarm Device Co., Ltd. es un fabricante de sistemas de detección y alarma de incendio con sede en Oakville, Ontario (Canadá), y forma parte del grupo empresarial Jade Bird Fire, con manufactura en China. La marca comercial histórica del sistema es “FireWatcher”, nombre que el fabricante sigue usando en casos de estudio y documentación aunque la generación de producto vigente se identifique internamente como “Series 2”."
    );
    p(
      doc,
      "“Series 2” no es una marca comercial separada: es la generación de arquitectura de hardware y firmware actualmente vigente, que reemplazó una generación anterior (a veces referida como “MA Gen 2”) y a la línea original FireWatcher (paneles FW105, FW106, FW106S, FW109 y dispositivos de campo FW5xx/FW7xx/FW8xx/FW9xx). Todavía existen instalaciones activas con equipos de la línea legacy, por lo que un ingeniero de soporte debe poder reconocer ambas generaciones."
    );

    h2(doc, "Regla de trabajo importante: un listado de certificación no indica vigencia");
    nota(
      doc,
      "Durante la construcción de esta base de conocimiento se identificó un error metodológico común: asumir que una referencia listada en un expediente de UL Product iQ está descontinuada solo por convivir ahí con modelos antiguos. Los expedientes UL acumulan histórico de certificación, vigente y descontinuado, bajo un mismo número de expediente. Ejemplos confirmados: FW434/FW435 y la familia FW721/722/723/751/752 aparecían en expedientes UL de “cajas no codificadas” y en realidad tienen ficha vigente y descargable en el catálogo público del fabricante. La regla operativa es: el estado real de un producto (activo, nuevo, pendiente o descontinuado) se determina por evidencia directa del catálogo o del manual, nunca solo por su presencia en un expediente UL."
    );

    h1(doc, "1.2 — Arquitectura de un sistema direccionable Series 2");
    p(
      doc,
      "A diferencia de un sistema convencional (donde cada zona se cablea como un circuito separado), Series 2 es una plataforma direccionable: todos los dispositivos de campo (detectores, módulos, estaciones manuales, bases) se conectan sobre un mismo par de cables llamado lazo de señal o SLC (Signal Line Circuit), y cada dispositivo tiene una dirección electrónica propia que el panel reconoce individualmente."
    );
    bullets(doc, [
      { titulo: "Capacidad por lazo", detalle: "hasta 252 dispositivos/puntos direccionables por SLC, según la ficha oficial del panel FW2105." },
      { titulo: "Lazos por panel", detalle: "el FW2105 admite 1 SLC estándar, ampliable hasta 9 SLC — es decir, hasta 2.268 puntos direccionables en un solo panel." },
      { titulo: "Clase de cableado", detalle: "Class A (con retorno, tolerante a una falla) o Class B, según el diseño del sistema." },
      { titulo: "Direccionamiento", detalle: "automático en la mayoría de dispositivos (el panel detecta y asigna dirección), con soporte del programador de mano FW2411 para asignación manual cuando se requiere." },
      { titulo: "Redes de paneles", detalle: "varios paneles Series 2 pueden operar en red, mostrando su estado en anunciadores remotos y de red comunes (ver Módulo 2)." },
    ]);

    h1(doc, "1.3 — Mapa del portafolio: familias que cubre este curso");
    p(doc, "El portafolio vigente de Series 2, según la evidencia primaria recopilada (sitios del fabricante en Canadá y China, UL Product iQ, y manuales oficiales recibidos directamente del fabricante), se organiza en las siguientes familias funcionales, que se estudian una por módulo:");
    tabla(
      doc,
      ["Módulo", "Familia", "Contenido principal"],
      [
        ["2", "Paneles y anunciadores", "FW2105, FW2107/M/C, redes de paneles, anunciadores LCD/LED/gráficos"],
        ["3", "Detección", "Detectores de humo/calor/combinado, bases, detección por aspiración, haz y video"],
        ["4", "Notificación", "Bocinas, estrobos, combinados, timbres, amplificador de circuito NAC"],
        ["5", "Estaciones manuales y liberación", "Pull stations direccionables y convencionales, sistema de releasing de agente extintor"],
        ["6", "Módulos de interfaz", "Entradas, salidas, relés, zonas convencionales, aisladores, conversores de protocolo"],
        ["7", "Accesorios, software y alcance comercial", "Programador de mano, software de programación, fuentes, cajas, telefonía de emergencia, certificaciones"],
      ],
      [0.1, 0.32, 0.58]
    );

    h1(doc, "1.4 — Cómo leer la documentación técnica de este portafolio");
    p(doc, "Cada referencia de producto en la base de conocimiento de soporte técnico tiene dos atributos que un ingeniero debe revisar antes de especificarla:");
    bullets(doc, [
      { titulo: "Estado del producto", detalle: "ACTIVO (vigente, con documentación primaria), NUEVO (incorporación reciente al portafolio), PENDIENTE (referencia identificada pero sin documentación primaria suficiente todavía), DESCONTINUADO (fuera de fabricación, se conserva por trazabilidad) o RENOMBRADO (reemplazada por otra referencia)." },
      { titulo: "Confianza del documento", detalle: "CONFIRMADO (recuperado y verificado contra fuente primaria — fabricante, UL o manual oficial), PROBABLE (existencia confirmada pero contenido sin verificar completamente) o PENDIENTE (referenciado en la investigación, falta recuperar el archivo)." },
    ]);
    nota(
      doc,
      "Regla de no equivalencia: referencias con nombres parecidos (por ejemplo FW2512 vs. FW2512-2, o FW2129 vs. FW2129-H1) no deben tratarse como el mismo producto ni como simples variantes de nombre comercial hasta que exista documentación primaria que lo confirme. Este curso respeta esa regla y señala explícitamente los casos abiertos."
    );

    h1(doc, "1.5 — Objetivo de este curso");
    p(
      doc,
      "Al finalizar los siete módulos, el participante debe poder: (1) reconocer las familias de producto que componen el portafolio Series 2 y su función dentro de un sistema de detección y alarma; (2) identificar qué documentación oficial respalda cada referencia y su nivel de confianza; (3) distinguir productos vigentes de productos legacy o aún en verificación; y (4) ubicar el software y las herramientas de puesta en marcha (S2 Configurator, programador de mano FW2411) dentro del flujo de un proyecto. Este curso no reemplaza los manuales de instalación ni las hojas de datos: es un mapa de alcance para orientar la especificación y el soporte técnico de primer nivel."
    );
  },
  preguntas: [
    {
      enunciado: "¿Cuál es la relación correcta entre “FireWatcher” y “Series 2”?",
      opciones: [
        "Son marcas comerciales completamente independientes de fabricantes distintos.",
        "FireWatcher es el nombre comercial histórico del sistema; Series 2 es la generación de arquitectura vigente.",
        "Series 2 es el nombre comercial y FireWatcher es únicamente el software de programación.",
        "FireWatcher es exclusivo del mercado chino y Series 2 exclusivo del mercado canadiense.",
      ],
      correcta: 1,
      justificacion: "Ver sección 1.1: FireWatcher es la marca comercial histórica; Series 2 es la generación de producto vigente.",
    },
    {
      enunciado: "Según la regla de trabajo aprendida durante la construcción de esta base de conocimiento, ¿qué implica que una referencia aparezca en un expediente de UL Product iQ junto con modelos antiguos?",
      opciones: [
        "Que el producto está garantizado como descontinuado.",
        "Que el producto es necesariamente una variante de color.",
        "Nada por sí solo: los expedientes UL acumulan histórico vigente y descontinuado; el estado real debe confirmarse con catálogo o manual.",
        "Que el producto pertenece a la generación FireWatcher legacy.",
      ],
      correcta: 2,
      justificacion: "Ver sección 1.1, caso FW434/FW435 y familia FW721-752.",
    },
    {
      enunciado: "¿Cuántos puntos direccionables admite un SLC (lazo de señal) según la ficha oficial del panel FW2105?",
      opciones: ["64", "128", "252", "512"],
      correcta: 2,
      justificacion: "Ver sección 1.2.",
    },
    {
      enunciado: "¿Cuál es la capacidad máxima de lazos (SLC) del panel FW2105?",
      opciones: ["1 SLC fijo, sin expansión", "hasta 4 SLC", "hasta 9 SLC", "hasta 16 SLC"],
      correcta: 2,
      justificacion: "Ver sección 1.2: 1 SLC estándar, ampliable hasta 9.",
    },
    {
      enunciado: "¿Qué significa que un documento tenga confianza “PROBABLE” en la base de conocimiento?",
      opciones: [
        "Que el documento fue verificado completamente contra la fuente primaria.",
        "Que el documento no existe y debe descartarse.",
        "Que su existencia está confirmada por una fuente pero su contenido no se ha verificado por completo.",
        "Que el documento corresponde a un producto descontinuado.",
      ],
      correcta: 2,
      justificacion: "Ver sección 1.4.",
    },
    {
      enunciado: "Un ingeniero encuentra dos referencias parecidas, FW2512 y FW2512-2, con descripciones distintas en dos fuentes. ¿Cuál es la acción correcta según la regla de no equivalencia?",
      opciones: [
        "Asumir que son el mismo producto porque el nombre es casi idéntico.",
        "Tratarlas como referencias distintas hasta que exista documentación primaria que confirme una equivalencia.",
        "Eliminar la que tenga menos información.",
        "Usar siempre la referencia con guion por ser más reciente.",
      ],
      correcta: 1,
      justificacion: "Ver sección 1.4, regla de no equivalencia.",
    },
  ],
};

// ---------------------------------------------------------------------------
// MODULO 2
// ---------------------------------------------------------------------------
const modulo2 = {
  num: 2,
  slug: "02-paneles-y-anunciadores",
  titulo: "Paneles de control y anunciadores",
  resumen: "Paneles FW2105 y FW2107/M/C, redes de paneles y toda la familia de anunciadores remotos.",
  contenido(doc) {
    portada(doc, { kicker: "Módulo 2", titulo: "Paneles de control y anunciadores", subtitulo: CURSO, notas: PUBLICO });

    h1(doc, "2.1 — Panel base: FW2105 (Addressable Fire Alarm Control Panel)");
    p(doc, "El FW2105 es el panel de control de alarma de incendio direccionable de referencia de la plataforma Series 2. Su ficha oficial declara explícitamente compatibilidad con Series 2, y es el panel que define las capacidades base de la plataforma descritas en el Módulo 1.");
    ficha(doc, {
      referencia: "FW2105",
      nombre: "Addressable Fire Alarm Control Panel",
      estado: "ACTIVO",
      texto: "Panel de control de alarma de incendio direccionable. Documentado con datasheet, manual de instalación (dos revisiones conservadas: Rev 1.0 de 2023-11-04 y Rev 1.7 vigente de 2025-09-08) y ficha china.",
      specs: [
        { nombre: "SLC estándar / máximo", valor: "1 / hasta 9" },
        { nombre: "Puntos por SLC", valor: "252" },
        { nombre: "Clase de cableado", valor: "Class A / Class B" },
        { nombre: "NAC", valor: "hasta 12" },
        { nombre: "Relés", valor: "4 Form C" },
        { nombre: "Display", valor: "LCD 7\" 800×480" },
        { nombre: "Fuente de alimentación", valor: "10 A" },
        { nombre: "Funciones", valor: "programación por PC o panel frontal, USB, anunciadores remotos, two-stage, PAS (Positive Alarm Sequence), registro de eventos, red de paneles" },
      ],
    });
    nota(doc, "El FW2105 se apoya en un conjunto de tarjetas y componentes internos (AMI, MFU, PSU, gabinete FW2191, tarjetas conectoras, ALU/Sub-ALU, ZIU) que forman parte de su arquitectura modular interna. No son dispositivos de campo, pero un ingeniero de soporte debe saber que existen al momento de leer una lista de materiales completa del panel.");
    p(doc, "Variante FW2105C: confirmada por manual de usuario propio en chino e inglés en el sitio del fabricante en China. Es una incorporación reciente al catálogo y su diferencia técnica exacta frente al FW2105 base todavía está en verificación — no debe asumirse equivalencia total.");

    h1(doc, "2.2 — Familia de liberación de agente: FW2107 / FW2107M / FW2107C");
    p(doc, "El FW2107 es el panel direccionable de detección y liberación de agente extintor (“releasing”) de la plataforma: combina las funciones de un panel de detección con la lógica de disparo controlado de sistemas de supresión (por ejemplo, agentes limpios o CO₂), coordinando estaciones de liberación, aborto y conmutación principal/reserva (ver Módulo 5).");
    bullets(doc, [
      { titulo: "FW2107", detalle: "panel base de detección y liberación. Documentado con datasheet propio y con el manual conjunto DOC-FW2107-UM (Rev 1.6, 73 páginas) que cubre las tres variantes." },
      { titulo: "FW2107M", detalle: "versión “Mini”, compacta, del mismo panel. Incorporación relativamente reciente al catálogo (datasheet Rev 0.0, 10/2025)." },
      { titulo: "FW2107C", detalle: "variante revelada por el manual oficial recibido directamente del fabricante; su diferencia funcional exacta frente al FW2107 base aún debe confirmarse con el fabricante o con documentación de ingeniería adicional." },
    ]);
    nota(doc, "La matriz completa de lógica de releasing (pre-descarga, aborto, desconexión, selección de cilindro principal/reserva) depende de los módulos y estaciones descritos en el Módulo 5 (FW2731-2734, FW2822); este módulo cubre únicamente el panel como plataforma de control.");

    h1(doc, "2.3 — Anunciadores remotos y de red");
    p(doc, "Los anunciadores permiten visualizar el estado del sistema (o de varios paneles en red) desde un punto remoto de fácil acceso, típicamente cerca de la entrada principal de la edificación.");
    tabla(
      doc,
      ["Referencia", "Función", "Estado"],
      [
        ["FW2110", "Network Annunciator — muestra el estado de múltiples paneles en red desde un solo punto.", "ACTIVO"],
        ["FW2121", "Remote LCD Annunciator — anunciador remoto con pantalla LCD.", "ACTIVO"],
        ["FW2129", "Remote LED Annunciator — anunciador remoto de LEDs por zona.", "ACTIVO"],
        ["FW2129-H1/H2/H3/H5", "Variantes de configuración de LEDs/zonas del FW2129, listadas individualmente por UL.", "PENDIENTE"],
        ["FW2261", "Local LED Annunciator — anunciador LED local (a diferencia del FW2129, que es remoto).", "ACTIVO"],
        ["FW2610", "Graphics Display System — visualización gráfica tipo mapa/planos con estado del sistema.", "ACTIVO"],
      ],
      [0.22, 0.63, 0.15]
    );
    nota(
      doc,
      "Las variantes FW2129-H1, -H2, -H3 y -H5 están confirmadas como referencias individuales en los expedientes UL del fabricante, pero su configuración exacta de zonas/LEDs todavía no tiene documentación primaria propia recuperada — no deben tratarse como simples nombres comerciales de un mismo producto sin esa confirmación."
    );

    h1(doc, "2.4 — Puntos clave para especificación");
    bullets(doc, [
      "El FW2105 es el panel a especificar para proyectos de detección y alarma convencional/direccionable sin liberación de agente.",
      "El FW2107 (o su variante M/C) se especifica cuando el proyecto requiere liberación controlada de agente extintor, además de detección.",
      "La elección de anunciador depende de si se necesita solo texto (FW2121), solo LEDs de zona (FW2129), un mapa gráfico del edificio (FW2610), o consolidación de varios paneles en red (FW2110).",
      "Todo proyecto con más de un panel debe considerarse como red de paneles desde la etapa de diseño, ya que el anunciador de red (FW2110) depende de esa arquitectura.",
    ]);
  },
  preguntas: [
    {
      enunciado: "¿Cuál panel es el punto de referencia base de la plataforma Series 2, con compatibilidad declarada explícitamente en su ficha oficial?",
      opciones: ["FW2107", "FW2105", "FW2107M", "FW2110"],
      correcta: 1,
      justificacion: "Sección 2.1.",
    },
    {
      enunciado: "¿Qué distingue principalmente a la familia FW2107 frente al FW2105?",
      opciones: [
        "El FW2107 no admite detectores direccionables.",
        "El FW2107 agrega la función de liberación controlada de agente extintor (releasing).",
        "El FW2107 solo funciona en redes de más de 9 paneles.",
        "El FW2107 es exclusivamente para telefonía de incendio.",
      ],
      correcta: 1,
      justificacion: "Sección 2.2.",
    },
    {
      enunciado: "Respecto al FW2107C, ¿cuál afirmación es correcta según la documentación disponible?",
      opciones: [
        "Su diferencia exacta frente al FW2107 base ya está completamente documentada y confirmada.",
        "Es una variante revelada por el manual oficial, pero su diferencia funcional exacta todavía está pendiente de confirmar.",
        "Es idéntico al FW2105C.",
        "Es un anunciador, no un panel.",
      ],
      correcta: 1,
      justificacion: "Sección 2.2.",
    },
    {
      enunciado: "¿Qué anunciador se debe especificar si el requisito del proyecto es mostrar el estado de varios paneles en red desde un solo punto?",
      opciones: ["FW2121", "FW2129", "FW2110", "FW2261"],
      correcta: 2,
      justificacion: "Sección 2.3, tabla de anunciadores.",
    },
    {
      enunciado: "¿Cuál es la diferencia funcional entre el FW2129 y el FW2261?",
      opciones: [
        "El FW2129 es un anunciador remoto de LEDs y el FW2261 es un anunciador LED local.",
        "Ambos son el mismo producto con nombres distintos.",
        "El FW2261 es exclusivamente para redes de paneles.",
        "El FW2129 ya está descontinuado.",
      ],
      correcta: 0,
      justificacion: "Sección 2.3.",
    },
    {
      enunciado: "¿Por qué no deben tratarse las variantes FW2129-H1, -H2, -H3 y -H5 como simples nombres comerciales de un mismo producto?",
      opciones: [
        "Porque están descontinuadas.",
        "Porque UL las lista individualmente y su configuración exacta de zonas/LEDs aún no tiene documentación primaria propia confirmada.",
        "Porque pertenecen a la generación FireWatcher legacy.",
        "Porque son parte del software S2 Configurator.",
      ],
      correcta: 1,
      justificacion: "Sección 2.3, nota.",
    },
  ],
};

// ---------------------------------------------------------------------------
// MODULO 3
// ---------------------------------------------------------------------------
const modulo3 = {
  num: 3,
  slug: "03-deteccion-de-incendio",
  titulo: "Detección de incendio",
  resumen: "Detectores puntuales, bases, y detección especializada: aspiración, haz y video.",
  contenido(doc) {
    portada(doc, { kicker: "Módulo 3", titulo: "Detección de incendio", subtitulo: CURSO, notas: PUBLICO });

    h1(doc, "3.1 — Detectores puntuales direccionables");
    ficha(doc, {
      referencia: "FW2511",
      nombre: "Addressable Photoelectric Smoke Detector",
      estado: "ACTIVO",
      texto: "Detector fotoeléctrico de humo direccionable. Es la referencia con la ficha técnica más completa y verificada del portafolio de detección.",
      specs: [
        { nombre: "Tensión nominal / rango", valor: "24 VDC / 15.3–28 VDC" },
        { nombre: "Corriente standby / alarma", valor: "0.16 mA / 0.65 mA" },
        { nombre: "Sensibilidad UL / ULC", valor: "1.34–2.45 %/ft / 1.63–3.11 %/ft" },
        { nombre: "Temperatura / humedad", valor: "0–49 °C / 0–93 % HR" },
        { nombre: "Diámetro", valor: "4\"" },
        { nombre: "Bases compatibles", valor: "FW2501, FW2502, FW2509" },
        { nombre: "Paneles compatibles", valor: "FW2105, FW2107" },
      ],
    });
    ficha(doc, {
      referencia: "FW2521",
      nombre: "Addressable Heat Detector",
      estado: "ACTIVO",
      texto: "Detector de calor direccionable. Cuenta con datasheet y manual de instalación oficiales; los parámetros exactos de temperatura fija / velocidad de aumento (rate-of-rise) deben confirmarse en el manual antes de diseño de detalle.",
    });
    ficha(doc, {
      referencia: "FW2531",
      nombre: "Addressable Combination Smoke/Heat Detector",
      estado: "PENDIENTE",
      texto: "Detector combinado humo/calor, confirmado en catálogo y en UL, pero aún sin ficha primaria completa recuperada — usar con precaución en especificaciones hasta confirmar parámetros exactos.",
    });
    ficha(doc, {
      referencia: "FW562",
      nombre: "Addressable Duct Smoke Detector",
      estado: "ACTIVO",
      texto: "Detector de humo de ducto direccionable, para instalación en conductos de aire acondicionado/ventilación. Se conecta a los paneles FW2105/FW2107 a través del módulo conversor de protocolo FW2845 (ver Módulo 6).",
    });

    h2(doc, "Discrepancias abiertas — no fusionar sin confirmar");
    nota(
      doc,
      "FW2512 y FW2522 aparecen descritos como detectores convencionales en fuentes secundarias, mientras que FW2512-2 y FW2522-2 aparecen en un registro de exportación como “Addressable smoke/heat detector — 24 VDC”. No hay documentación primaria que confirme si son la misma familia con distinta nomenclatura o productos distintos: se mantienen como referencias separadas hasta resolver la discrepancia."
    );

    h1(doc, "3.2 — Bases de detector");
    tabla(
      doc,
      ["Referencia", "Función", "Estado"],
      [
        ["FW2501", "Base estándar. Compatible con FW2511 y FW2521.", "ACTIVO"],
        ["FW2502", "Variante de base; función exacta (¿relé o aislada?) aún por confirmar.", "PENDIENTE"],
        ["FW2507", "Sounder base; diferencia exacta frente a FW2508/FW2509 (tono o volumen) por confirmar.", "NUEVO"],
        ["FW2508", "Sounder base de 520 Hz (baja frecuencia). Alimentación 24 VDC/NAC, 3 niveles de salida (80/76/72 dBA), sincronización, compatible con FW2105/FW2107.", "ACTIVO"],
        ["FW2509", "Sounder base estándar (frecuencia convencional).", "ACTIVO"],
      ],
      [0.15, 0.7, 0.15]
    );
    p(doc, "El indicador remoto FW2561-RI es compatible con el módulo mini de entrada FW2811M y con los detectores FW2511 y FW2521; se utiliza para señalizar activación de un detector desde un punto visible fuera del cuarto donde está instalado.");

    h1(doc, "3.3 — Detección especializada");
    h2(doc, "Detección por aspiración — línea PipeSense");
    ficha(doc, {
      referencia: "FW2601",
      nombre: "PipeSense Addressable Aspirating Smoke Detector",
      estado: "ACTIVO",
      texto: "Detector de humo por aspiración (ASD) direccionable. El datasheet oficial (código real DS-5034-1, recibido directamente del fabricante) confirma SKUs opcionales para 1, 2 o 4 tubos de muestreo, cada uno con cámara de detección independiente — relevante para dimensionar la cobertura de un cuarto de datos, cuarto frío u otra área de riesgo especial.",
    });
    ficha(doc, {
      referencia: "FW2601-P",
      nombre: "ASD Monitoring and Management System Suite",
      estado: "ACTIVO",
      texto: "Suite de monitoreo y gestión que complementa al detector FW2601. Es una referencia distinta de FW2601-P2(FM), esta última aún pendiente de documentación primaria — no debe asumirse que son el mismo producto.",
    });
    h2(doc, "Detección de área abierta y por video");
    bullets(doc, [
      { titulo: "OLAD-RC (Open Large Area Detection with Remote Control)", detalle: "detector de haz (beam detector) para áreas grandes y abiertas, con control remoto. Familia de producto “Beam Detectors” incorporada recientemente al portafolio." },
      { titulo: "VFD / SFH-MA-DG06 (Video Fire Detector)", detalle: "detección de incendio basada en análisis de video. Es una categoría de producto enteramente nueva dentro del portafolio, sin antecedente en generaciones anteriores." },
    ]);

    h1(doc, "3.4 — Puntos clave para especificación");
    bullets(doc, [
      "Para cuartos de datos, cuartos fríos o espacios con requerimiento de detección muy temprana, la línea PipeSense (FW2601 + FW2601-P) es la opción del portafolio, dimensionando el número de tubos según el área a cubrir.",
      "Para ductos de aire acondicionado, la referencia es el FW562, que requiere el módulo FW2845 como interfaz hacia el panel.",
      "Para áreas grandes y abiertas (bodegas, auditorios) donde el detector puntual no es práctico, la opción es el detector de haz OLAD-RC.",
      "El detector de video (VFD/SFH-MA-DG06) es tecnología emergente en el portafolio: confirmar alcance y disponibilidad comercial en el proyecto específico antes de especificarlo, dado que es la incorporación más reciente y con menos documentación acumulada.",
    ]);
  },
  preguntas: [
    {
      enunciado: "¿Qué bases están confirmadas como compatibles con el detector FW2511?",
      opciones: ["FW2501, FW2502, FW2509", "Solo FW2508", "FW2601, FW2601-P", "FW2721, FW2722"],
      correcta: 0,
      justificacion: "Sección 3.1, ficha FW2511.",
    },
    {
      enunciado: "¿Cómo se conecta el detector de ducto FW562 al panel FW2105 o FW2107?",
      opciones: [
        "Se conecta directamente al SLC sin ningún módulo adicional.",
        "A través del módulo conversor de protocolo FW2845.",
        "Únicamente por medio del software S2 Configurator.",
        "No es compatible con ningún panel Series 2.",
      ],
      correcta: 1,
      justificacion: "Sección 3.1.",
    },
    {
      enunciado: "Según el datasheet oficial DS-5034-1, ¿qué opciones de configuración tiene el detector por aspiración FW2601?",
      opciones: [
        "Solo una configuración fija de un tubo.",
        "SKUs opcionales de 1, 2 o 4 tubos con cámara de detección independiente por tubo.",
        "Únicamente configuración inalámbrica.",
        "Solo aplica para detección de calor, no de humo.",
      ],
      correcta: 1,
      justificacion: "Sección 3.3.",
    },
    {
      enunciado: "¿Cuál es la relación correcta entre FW2601-P y FW2601-P2(FM)?",
      opciones: [
        "Son exactamente el mismo producto con nombre comercial distinto.",
        "FW2601-P2(FM) es una versión anterior descontinuada de FW2601-P.",
        "Son referencias distintas; FW2601-P2(FM) aún no tiene documentación primaria que confirme su relación exacta con FW2601-P.",
        "FW2601-P2(FM) es un accesorio de montaje del FW2601-P.",
      ],
      correcta: 2,
      justificacion: "Sección 3.3.",
    },
    {
      enunciado: "¿Qué tecnología de detección se usaría para cubrir un área grande y abierta como una bodega, donde un detector puntual no es práctico?",
      opciones: ["FW2521 (calor)", "OLAD-RC (detector de haz)", "FW2508 (base sonora)", "FW2731 (estación de liberación)"],
      correcta: 1,
      justificacion: "Sección 3.3 y 3.4.",
    },
    {
      enunciado: "¿Por qué se recomienda precaución antes de fusionar FW2512 con FW2512-2 en una especificación?",
      opciones: [
        "Porque uno es un panel y el otro un detector.",
        "Porque no hay documentación primaria que confirme si son la misma familia o productos distintos.",
        "Porque FW2512-2 está oficialmente descontinuado.",
        "Porque pertenecen a familias de notificación distintas.",
      ],
      correcta: 1,
      justificacion: "Sección 3.1, discrepancias abiertas.",
    },
  ],
};

// ---------------------------------------------------------------------------
// MODULO 4
// ---------------------------------------------------------------------------
const modulo4 = {
  num: 4,
  slug: "04-notificacion-de-alarma",
  titulo: "Notificación de alarma",
  resumen: "Bocinas, estrobos, combinados, timbres y amplificación de circuitos de notificación.",
  contenido(doc) {
    portada(doc, { kicker: "Módulo 4", titulo: "Notificación de alarma", subtitulo: CURSO, notas: PUBLICO });

    h1(doc, "4.1 — Familia estándar: horn, strobe y horn/strobe");
    p(doc, "La familia FW2961/FW2971/FW2981 cubre los tres tipos básicos de dispositivo de notificación de un sistema de alarma contra incendio: combinado sonoro-visual, solo sonoro y solo visual.");
    tabla(
      doc,
      ["Referencia genérica", "Tipo", "Variantes de color confirmadas"],
      [
        ["FW2961", "Horn/Strobe (sonoro + visual)", "FW2961R (rojo), FW2961W (blanco)"],
        ["FW2971", "Horn (solo sonoro)", "FW2971R (rojo), FW2971W (blanco)"],
        ["FW2981", "Strobe (solo visual)", "FW2981R (rojo), FW2981W (blanco); FW2981R-WP (variante resistente al agua, convencional)"],
      ],
      [0.22, 0.35, 0.43]
    );
    nota(
      doc,
      "Las variantes de color (sufijos R/W) fueron reveladas por el manual oficial de instalación recibido directamente del fabricante (DOC-FW29X1-UM, Rev 1.4) y no estaban documentadas como SKU independientes antes de esa revisión — un ingeniero debe especificar el color exacto (R o W) al cotizar, no solo la referencia genérica."
    );

    h1(doc, "4.2 — Familia de baja frecuencia (520 Hz)");
    p(
      doc,
      "Las normas de notificación de incendio (por ejemplo, requisitos para áreas de descanso) exigen en ciertos casos una señal audible de baja frecuencia (520 Hz) para mejorar la efectividad de despertar. El portafolio cubre este requisito con una familia paralela a la estándar:"
    );
    tabla(
      doc,
      ["Referencia genérica", "Tipo", "Variantes de color confirmadas"],
      [
        ["FW2963", "Low Frequency Horn/Strobe (520 Hz)", "FW2963R (rojo), FW2963W (blanco)"],
        ["FW2973", "Low Frequency Horn (520 Hz)", "FW2973R (rojo), FW2973W (blanco)"],
      ],
      [0.22, 0.35, 0.43]
    );

    h1(doc, "4.3 — Mini horn y timbres");
    bullets(doc, [
      { titulo: "FW2972 (Mini Horn)", detalle: "bocina compacta, con variantes registradas individualmente: FW2972MW / FW2972MR (solo horn, blanco/rojo) y FW2972MSW / FW2972MSR (horn + strobe, blanco/rojo) — la designación exacta de cada sufijo debe confirmarse contra el datasheet DOC-12972 antes de especificar." },
      { titulo: "FW2921 (Series Bells, Vibrating)", detalle: "timbre de notificación de tipo vibratorio, confirmado en el catálogo del fabricante." },
    ]);

    h1(doc, "4.4 — Amplificación de circuitos de notificación");
    ficha(doc, {
      referencia: "FW131",
      nombre: "NAC Booster",
      estado: "ACTIVO",
      texto: "Amplificador de circuito de notificación (Notification Appliance Circuit). Se utiliza cuando la capacidad de corriente de los circuitos NAC del panel no es suficiente para la cantidad de dispositivos de notificación requeridos en una instalación grande, extendiendo la capacidad del sistema sin necesidad de paneles adicionales.",
    });

    h1(doc, "4.5 — Puntos clave para especificación");
    bullets(doc, [
      "Nunca especificar solo la referencia genérica (FW2961, FW2971, FW2981, FW2963, FW2973): siempre indicar el sufijo de color (R/W) confirmado en el manual oficial.",
      "Usar la familia de baja frecuencia (FW2963/FW2973) quando la norma aplicable al proyecto exija tono de 520 Hz, típicamente en áreas de descanso o dormitorios.",
      "El FW2981R-WP es la única variante resistente al agua confirmada de la línea de estrobos; es de tipo convencional, no direccionable — verificar esta distinción antes de integrarla en un lazo direccionable.",
      "Si el diseño supera la capacidad de corriente de los NAC del panel, evaluar el FW131 antes de recurrir a paneles adicionales.",
    ]);
  },
  preguntas: [
    {
      enunciado: "¿Qué combinación de referencia genérica y tipo de dispositivo es correcta?",
      opciones: ["FW2971 = Strobe (solo visual)", "FW2981 = Horn (solo sonoro)", "FW2961 = Horn/Strobe (sonoro + visual)", "FW2963 = Timbre vibratorio"],
      correcta: 2,
      justificacion: "Sección 4.1, tabla.",
    },
    {
      enunciado: "¿Qué reveló el manual oficial DOC-FW29X1-UM (Rev 1.4) sobre la familia FW2961/2971/2981?",
      opciones: [
        "Que la familia está descontinuada.",
        "Los SKU específicos por color (R=rojo, W=blanco), antes no documentados como variantes independientes.",
        "Que solo existe en color blanco.",
        "Que requieren el módulo FW2845 para funcionar.",
      ],
      correcta: 1,
      justificacion: "Sección 4.1, nota.",
    },
    {
      enunciado: "¿Cuándo se debe especificar la familia FW2963/FW2973 en lugar de FW2961/FW2971?",
      opciones: [
        "Cuando se requiere tono de baja frecuencia (520 Hz), por ejemplo en áreas de descanso.",
        "Cuando el panel es un FW2107 y no un FW2105.",
        "Cuando el proyecto no requiere notificación visual.",
        "Nunca; son la misma familia con nombre distinto.",
      ],
      correcta: 0,
      justificacion: "Sección 4.2.",
    },
    {
      enunciado: "¿Qué caracteriza al FW2981R-WP frente al resto de la familia de estrobos?",
      opciones: [
        "Es direccionable y forma parte del SLC.",
        "Es una variante convencional (no direccionable) resistente al agua.",
        "Es un timbre vibratorio.",
        "Es un amplificador de circuito NAC.",
      ],
      correcta: 1,
      justificacion: "Sección 4.1 y 4.5.",
    },
    {
      enunciado: "¿Para qué se utiliza el FW131 (NAC Booster)?",
      opciones: [
        "Para asignar direcciones a los dispositivos de campo.",
        "Para amplificar la capacidad de corriente de los circuitos de notificación cuando el panel no es suficiente.",
        "Para convertir el protocolo de un detector de ducto.",
        "Para programar el panel desde un computador.",
      ],
      correcta: 1,
      justificacion: "Sección 4.4.",
    },
    {
      enunciado: "¿Qué se debe verificar antes de especificar una unidad FW2972 (Mini Horn)?",
      opciones: [
        "Nada, todas las variantes son idénticas.",
        "El sufijo exacto (MW/MR/MSW/MSR) contra el datasheet DOC-12972, ya que indica combinación de horn/strobe y color.",
        "Que el panel sea un FW2107M.",
        "Que el proyecto no use la línea PipeSense.",
      ],
      correcta: 1,
      justificacion: "Sección 4.3.",
    },
  ],
};

// ---------------------------------------------------------------------------
// MODULO 5
// ---------------------------------------------------------------------------
const modulo5 = {
  num: 5,
  slug: "05-estaciones-manuales-y-liberacion",
  titulo: "Estaciones manuales y liberación de agente extintor",
  resumen: "Pull stations direccionables y convencionales, y el sistema de releasing para supresión de incendio.",
  contenido(doc) {
    portada(doc, { kicker: "Módulo 5", titulo: "Estaciones manuales y liberación de agente extintor", subtitulo: CURSO, notas: PUBLICO });

    h1(doc, "5.1 — Estaciones manuales direccionables: serie FW272X");
    p(
      doc,
      "La serie FW2721/2722/2723 son estaciones manuales de alarma direccionables, cada una con una dirección propia en el SLC. El manual oficial de instalación (DOC-FW272X-UM, Rev 1.2) reveló tres referencias hermanas adicionales, agrupadas por pares:"
    );
    tabla(
      doc,
      ["Par confirmado", "Estado del segundo elemento"],
      [
        ["FW2721 / FW2724", "FW2724 es una incorporación nueva revelada por el manual oficial"],
        ["FW2722 / FW2725", "FW2725 es una incorporación nueva revelada por el manual oficial"],
        ["FW2723 / FW2726", "FW2726 es una incorporación nueva revelada por el manual oficial"],
      ],
      [0.55, 0.45]
    );
    nota(doc, "La diferencia técnica exacta entre cada elemento del par (posible variante de tipo de contacto o de color) todavía debe confirmarse; no se debe asumir que son intercambiables sin verificarlo en el manual o con el fabricante.");

    h1(doc, "5.2 — Estaciones manuales convencionales: series FW72X y FW75X");
    p(
      doc,
      "Además de la serie direccionable FW272X, el portafolio mantiene una línea de estaciones manuales convencionales (contacto simple, sin dirección propia en el lazo), pensada para usarse junto con un módulo de zona convencional como el FW2841 (ver Módulo 6)."
    );
    tabla(
      doc,
      ["Referencia", "Descripción", "Estado"],
      [
        ["FW722 / FW722C", "Addressable Manual Station, ADA compliant. FW722 = contacto normalmente abierto; FW722C = normalmente cerrado (“FW722 NC”). Listada según UL 38 y ULC-S528.", "ACTIVO"],
        ["FW721 / FW721C", "Estación manual convencional, hermana de FW722/722C.", "ACTIVO"],
        ["FW723", "Estación manual convencional, mismo grupo que FW722.", "ACTIVO"],
        ["FW752 / FW752C", "Non-Addressable Manual Pull Station — versión convencional de la familia FW72X, para usar con módulo de zona convencional.", "ACTIVO"],
        ["FW751 / FW751C", "Estación manual no direccionable, hermana de FW752/752C.", "ACTIVO"],
      ],
      [0.2, 0.65, 0.15]
    );
    nota(
      doc,
      "Esta familia estuvo clasificada erróneamente como “legacy” en una primera revisión de la investigación, por aparecer en un expediente UL de “cajas no codificadas”. Se confirmó vigente en el catálogo público del fabricante — ver la regla de trabajo del Módulo 1 sobre listados UL."
    );

    h1(doc, "5.3 — Sistema de liberación de agente extintor (releasing)");
    p(
      doc,
      "Cuando el panel es un FW2107 (o su variante M/C), el sistema puede controlar la liberación de un agente extintor (por ejemplo agentes limpios o CO₂) mediante una secuencia de estaciones y módulos dedicados:"
    );
    ficha(doc, {
      referencia: "FW2731",
      nombre: "Manual Release Station",
      estado: "ACTIVO",
      texto: "Estación manual de liberación de agente, para paneles FW2107/FW2107M.",
      specs: [
        { nombre: "Direccionable", valor: "sí, 1 dirección en el SLC" },
        { nombre: "Contacto", valor: "Form C (N/O y N/C)" },
        { nombre: "Acción", valor: "single action" },
        { nombre: "Certificaciones", valor: "UL 38, ULC-S528" },
        { nombre: "Paneles compatibles", valor: "FW2107, FW2107M" },
      ],
    });
    bullets(doc, [
      { titulo: "FW2732 — Abort Switch", detalle: "interrumpe temporalmente la secuencia de descarga (lógica de aborto / pre-descarga)." },
      { titulo: "FW2733 — Disconnect Switch", detalle: "deshabilita la liberación de agente de forma controlada (disable release), con indicación de supervisión/falla." },
      { titulo: "FW2734 — Main/Reserve Switch", detalle: "selecciona el cilindro principal o de reserva del sistema de agente extintor." },
      { titulo: "FW2822 — Releasing Module", detalle: "módulo direccionable que ejecuta la lógica de disparo del sistema de releasing; es la pieza clave de interfaz entre el panel y los dispositivos de descarga (se profundiza en el Módulo 6)." },
    ]);
    nota(
      doc,
      "Los detalles finos de la lógica de secuencia (tiempos de pre-descarga, comportamiento exacto de aborto y aviso de supervisión) deben verificarse contra el manual de ingeniería específico del proyecto: este curso identifica los componentes del sistema, no reemplaza el diseño de detalle de un sistema de supresión."
    );

    h1(doc, "5.4 — Puntos clave para especificación");
    bullets(doc, [
      "Usar la serie FW272X (direccionable) cuando el proyecto requiere identificación individual de cada estación manual en el lazo.",
      "Usar la serie FW72X/FW75X (convencional) cuando las estaciones se integran a una zona convencional a través del módulo FW2841.",
      "Todo proyecto con liberación de agente extintor requiere, como mínimo, panel FW2107/M/C, estación(es) FW2731, y el módulo FW2822; la inclusión de FW2732/2733/2734 depende de si el diseño exige aborto, desconexión y/o selección principal/reserva.",
      "Confirmar siempre el contacto (N/O vs. N/C) y el sufijo de color/contacto en las series convencionales (FW721C, FW722C, FW751C, FW752C) antes de cotizar.",
    ]);
  },
  preguntas: [
    {
      enunciado: "¿Qué reveló el manual oficial DOC-FW272X-UM sobre la serie FW2721/2722/2723?",
      opciones: [
        "Que están descontinuadas.",
        "Tres referencias hermanas adicionales (FW2724, FW2725, FW2726), agrupadas en pares.",
        "Que requieren el panel FW2107 obligatoriamente.",
        "Que son estaciones de liberación de agente, no estaciones manuales de alarma.",
      ],
      correcta: 1,
      justificacion: "Sección 5.1.",
    },
    {
      enunciado: "¿Cuál es la diferencia principal entre la serie FW272X y la serie FW72X/FW75X?",
      opciones: [
        "FW272X es direccionable; FW72X/FW75X es convencional, para usar con un módulo de zona convencional.",
        "FW272X es para exteriores y FW72X/FW75X para interiores.",
        "No hay diferencia, son la misma serie con dos nombres.",
        "FW72X/FW75X solo se usa en paneles FW2107.",
      ],
      correcta: 0,
      justificacion: "Sección 5.1 y 5.2.",
    },
    {
      enunciado: "¿Por qué se corrigió la clasificación de la familia FW721/722/723/751/752 de “legacy” a “activa”?",
      opciones: [
        "Porque el fabricante lanzó una nueva versión.",
        "Porque aparecer en un expediente UL de “cajas no codificadas” no implica descontinuación, y se confirmó vigente en el catálogo público.",
        "Porque se fusionó con la serie FW272X.",
        "Porque UL retiró el expediente.",
      ],
      correcta: 1,
      justificacion: "Sección 5.2, nota; y regla del Módulo 1.",
    },
    {
      enunciado: "¿Qué función cumple el FW2732 (Abort Switch) dentro del sistema de releasing?",
      opciones: [
        "Selecciona el cilindro principal o de reserva.",
        "Interrumpe temporalmente la secuencia de descarga.",
        "Asigna direcciones SLC a los dispositivos.",
        "Amplifica el circuito de notificación.",
      ],
      correcta: 1,
      justificacion: "Sección 5.3.",
    },
    {
      enunciado: "¿Cuáles son los componentes mínimos para un proyecto con liberación de agente extintor, según este curso?",
      opciones: [
        "Panel FW2105, FW2508 y FW131.",
        "Panel FW2107/M/C, estación FW2731 y el módulo FW2822.",
        "Solo el software S2 Configurator.",
        "Panel FW2105 y el detector FW2601.",
      ],
      correcta: 1,
      justificacion: "Sección 5.4.",
    },
    {
      enunciado: "¿Qué certificaciones respaldan al FW2731 (Manual Release Station)?",
      opciones: ["UL 38 y ULC-S528", "ISO 9001 únicamente", "NFPA 70 y CE", "No cuenta con certificaciones documentadas"],
      correcta: 0,
      justificacion: "Sección 5.3, ficha FW2731.",
    },
  ],
};

// ---------------------------------------------------------------------------
// MODULO 6
// ---------------------------------------------------------------------------
const modulo6 = {
  num: 6,
  slug: "06-modulos-de-interfaz",
  titulo: "Módulos de interfaz direccionable",
  resumen: "Entradas, salidas, relés, zonas convencionales, aisladores y conversión de protocolo.",
  contenido(doc) {
    portada(doc, { kicker: "Módulo 6", titulo: "Módulos de interfaz direccionable", subtitulo: CURSO, notas: PUBLICO });

    h1(doc, "6.1 — ¿Para qué sirven los módulos de interfaz?");
    p(
      doc,
      "Los módulos direccionables permiten integrar al lazo (SLC) dispositivos que no son detectores ni estaciones manuales nativas del sistema: contactos secos de equipos de terceros, zonas convencionales completas, relés de control para equipos externos, y detectores de otras familias que hablan un protocolo distinto. Cada módulo ocupa una o más direcciones en el SLC, igual que un detector."
    );

    h1(doc, "6.2 — Módulos de entrada");
    tabla(
      doc,
      ["Referencia", "Función", "Notas"],
      [
        ["FW2811", "Input Module — una entrada supervisada, direccionable.", "—"],
        ["FW2811M", "Mini Input Module — versión compacta.", "Compatible con el indicador remoto FW2561-RI."],
        ["FW2812", "Dual Input Module — dos entradas en un mismo módulo.", "Confirmar si cada entrada ocupa una dirección SLC propia o comparten una sola, según el manual de instalación."],
        ["FW2823", "Dual Input Relay Module — dos entradas Clase B (contacto seco) más dos salidas de relé de control.", "Confirmado por manual oficial recibido directamente del fabricante (2025-09-04)."],
      ],
      [0.18, 0.5, 0.32]
    );

    h1(doc, "6.3 — Módulos de salida y control");
    bullets(doc, [
      { titulo: "FW2821 — Supervised Output Module", detalle: "salida supervisada direccionable, para control de dispositivos externos con verificación de continuidad del circuito." },
      { titulo: "FW2822 — Releasing Module", detalle: "módulo clave para la matriz de liberación de agente extintor descrita en el Módulo 5; ejecuta la lógica de disparo del sistema de supresión." },
      { titulo: "FW2831 — Relay Module", detalle: "dos salidas de relé (contactos NO/NC) de operación simultánea, direccionable — para control on/off de equipos externos como ventilación o cortinas de humo." },
    ]);

    h1(doc, "6.4 — Integración con detección convencional y de terceros");
    ficha(doc, {
      referencia: "FW2841",
      nombre: "Conventional Zone Module",
      estado: "ACTIVO",
      texto: "Módulo que integra una zona convencional completa (con detectores o estaciones convencionales de cualquier fabricante) como un solo punto direccionable en el SLC. Es la pieza que hace posible usar las estaciones manuales convencionales FW72X/FW75X descritas en el Módulo 5, o detectores convencionales de terceros, dentro de un sistema Series 2.",
    });
    ficha(doc, {
      referencia: "FW2312",
      nombre: "ZIU (8 Zone Interface Unit)",
      estado: "ACTIVO",
      texto: "Interfaz de 8 zonas convencionales. A diferencia del FW2841 (una zona por módulo), el FW2312 concentra hasta 8 zonas convencionales en una sola unidad — relevante para proyectos de modernización con cableado de zona ya existente.",
    });
    ficha(doc, {
      referencia: "FW2845",
      nombre: "Protocol Converter Module",
      estado: "ACTIVO",
      texto: "Interfaz de comunicación que conecta el detector de ducto FW562 (Módulo 3) a los paneles Series 2 FW2105 y FW2107, traduciendo su protocolo nativo al del lazo Series 2.",
    });

    h1(doc, "6.5 — Aislamiento del lazo");
    ficha(doc, {
      referencia: "FW2851",
      nombre: "SLC Isolator",
      estado: "ACTIVO",
      texto: "Aislador de lazo de campo: en caso de un corto circuito en un segmento del SLC, aísla automáticamente ese segmento para que el resto del lazo siga operando. No ocupa una dirección propia en el lazo.",
    });
    nota(doc, "El FW2851 (aislador de campo) no debe confundirse con el FW2852, que es un componente interno del panel FW2105 y no un dispositivo de campo instalable en el lazo.");

    h1(doc, "6.6 — Puntos clave para especificación");
    bullets(doc, [
      "Todo contacto seco de un sistema de terceros (bomba contra incendio, válvula de supervisión, equipo mecánico) se integra mediante un módulo de entrada (FW2811/2811M/2812/2823), nunca directamente al SLC.",
      "Para modernizar una instalación convencional existente hacia Series 2 sin recablear zona por zona, evaluar el FW2312 (8 zonas por unidad) frente al FW2841 (1 zona por módulo) según el número de zonas a migrar.",
      "En lazos de gran longitud o con múltiples ramales, distribuir aisladores FW2851 en los puntos de mayor riesgo de corto circuito, según el diseño de Clase A/B.",
      "El detector de ducto FW562 requiere siempre el FW2845 como interfaz — no se conecta de forma nativa al lazo.",
    ]);
  },
  preguntas: [
    {
      enunciado: "¿Cuál es la función general de un módulo de interfaz direccionable?",
      opciones: [
        "Reemplazar al panel de control.",
        "Integrar al lazo dispositivos que no son detectores ni estaciones manuales nativas (contactos secos, zonas convencionales, relés de control, protocolos distintos).",
        "Sustituir al software S2 Configurator.",
        "Servir únicamente como fuente de alimentación.",
      ],
      correcta: 1,
      justificacion: "Sección 6.1.",
    },
    {
      enunciado: "¿Qué módulo se confirmó recientemente con manual oficial y ofrece dos entradas Clase B más dos salidas de relé?",
      opciones: ["FW2811", "FW2812", "FW2823", "FW2831"],
      correcta: 2,
      justificacion: "Sección 6.2.",
    },
    {
      enunciado: "¿Qué módulo permite integrar una zona convencional completa como un solo punto direccionable en el SLC?",
      opciones: ["FW2841 (Conventional Zone Module)", "FW2851 (SLC Isolator)", "FW2845 (Protocol Converter)", "FW2821 (Supervised Output)"],
      correcta: 0,
      justificacion: "Sección 6.4.",
    },
    {
      enunciado: "¿Qué diferencia al FW2312 (ZIU) del FW2841?",
      opciones: [
        "El FW2312 concentra hasta 8 zonas convencionales en una sola unidad; el FW2841 integra una zona por módulo.",
        "El FW2312 es un aislador y el FW2841 es un relé.",
        "No hay diferencia funcional.",
        "El FW2312 solo funciona con el panel FW2107.",
      ],
      correcta: 0,
      justificacion: "Sección 6.4.",
    },
    {
      enunciado: "¿Qué interfaz se requiere obligatoriamente para conectar el detector de ducto FW562 a un panel FW2105 o FW2107?",
      opciones: ["FW2851 (aislador)", "FW2845 (conversor de protocolo)", "FW2831 (relé)", "FW2411 (programador de mano)"],
      correcta: 1,
      justificacion: "Sección 6.4.",
    },
    {
      enunciado: "¿Cuál es la función del FW2851 (SLC Isolator) y qué NO debe confundirse con él?",
      opciones: [
        "Amplifica la señal del lazo; no debe confundirse con el FW131.",
        "Aísla automáticamente un segmento del lazo ante un corto circuito; no debe confundirse con el FW2852 (componente interno del panel).",
        "Asigna direcciones automáticas; no debe confundirse con el FW2411.",
        "Convierte protocolo; no debe confundirse con el FW2845.",
      ],
      correcta: 1,
      justificacion: "Sección 6.5.",
    },
  ],
};

// ---------------------------------------------------------------------------
// MODULO 7
// ---------------------------------------------------------------------------
const modulo7 = {
  num: 7,
  slug: "07-accesorios-software-y-alcance-comercial",
  titulo: "Accesorios, software, telefonía de emergencia y buenas prácticas",
  resumen: "Puesta en marcha, infraestructura de montaje y alimentación, telefonía de emergencia, certificaciones y buenas prácticas de especificación.",
  contenido(doc) {
    portada(doc, { kicker: "Módulo 7", titulo: "Accesorios, software, telefonía de emergencia y buenas prácticas", subtitulo: CURSO, notas: PUBLICO });

    h1(doc, "7.1 — Herramientas de puesta en marcha");
    ficha(doc, {
      referencia: "FW2411",
      nombre: "Hand-held Programmer",
      estado: "ACTIVO",
      texto: "Programador de mano portátil para asignar direcciones a detectores y otros dispositivos de campo antes o durante la instalación, sin necesidad de un computador.",
    });
    ficha(doc, {
      referencia: "S2-CONFIGURATOR",
      nombre: "S2 Configurator",
      estado: "ACTIVO",
      texto: "Software de PC para programar paneles Series 2: carga y descarga de proyecto, mapeo de zonas y programación de lógica. Cuenta con manual de programación oficial propio (62 páginas). Es la herramienta central del flujo de puesta en marcha en oficina/campo, complementaria al programador de mano FW2411.",
    });

    h1(doc, "7.2 — Infraestructura de montaje y alimentación");
    tabla(
      doc,
      ["Referencia", "Función", "Notas"],
      [
        ["FW434", "Caja/gabinete para montaje de módulos direccionables en campo (UL/ULC).", "Admite hasta 16 módulos."],
        ["FW435", "Caja/gabinete para montaje de módulos direccionables en campo (UL/ULC).", "Admite hasta 8 módulos (la mitad que el FW434)."],
        ["BYF-PC20X", "Fuente de alimentación del sistema de alarma (Fire Alarm Power Supply).", "Ficha propia confirmada."],
        ["BYF-PC10X", "Fuente de alimentación, capacidad menor (hermana de BYF-PC20X).", "Se infiere menor capacidad por el mismo prefijo; sin ficha propia recuperada aún."],
      ],
      [0.18, 0.5, 0.32]
    );

    h1(doc, "7.3 — Supervisión de sistemas de rociadores (sprinklers)");
    bullets(doc, [
      { titulo: "MA-OSY-1 — OS&Y Supervisory Switch", detalle: "interruptor de supervisión para válvulas tipo OS&Y (Outside Screw and Yoke), que reporta al panel si la válvula está en posición abierta o cerrada." },
      { titulo: "MA-WFS / MA-WFS-CT — Waterflow Switch", detalle: "interruptor de flujo de agua para sistemas de rociadores; la variante CT probablemente corresponde a un tamaño de tubería distinto, por confirmar." },
    ]);
    nota(doc, "Estos tres accesorios permiten que un sistema Series 2 supervise también la parte hidráulica de la protección contra incendio (rociadores), integrándose típicamente a través de los módulos de entrada del Módulo 6.");

    h1(doc, "7.4 — Telefonía de incendio y comunicación de emergencia");
    p(doc, "El portafolio incluye una línea completa de comunicación de voz de emergencia, con dos familias paralelas: una direccionable (FW151) y una convencional (serie HY):");
    tabla(
      doc,
      ["Referencia", "Descripción"],
      [
        ["FW151", "Digital Voice Control Panel — panel de control de voz digital, con variantes de accesorio vistas en UL (FW151-PS, FW151-AP, FW151-MIC, FW151-DK, FW151-DB)."],
        ["FW151-FP", "BlazeCom Fire Phone System — sistema de teléfono de incendio direccionable basado en el panel FW151."],
        ["HY2711E", "Conventional Fire Phone Panel — panel de telefonía de incendio convencional."],
        ["HY2712D", "Conventional Fire Phone Extension — extensión del sistema convencional HY271X."],
        ["HY2713", "Portable Fire Telephone Extension — extensión portátil."],
        ["HY2714D", "Conventional Fire Phone Jack — toma del sistema convencional."],
        ["HY6355(EX)", "Explosion-Proof Fire Phone Extension — extensión a prueba de explosión, para zonas clasificadas (industria/petroquímica)."],
      ],
      [0.22, 0.78]
    );
    nota(doc, "La nomenclatura “HY” (en lugar de “FW”) identifica la línea convencional de telefonía; no debe confundirse con la nomenclatura numérica FW usada en el resto del portafolio.");

    h1(doc, "7.5 — Certificaciones de referencia");
    p(doc, "El portafolio Series 2 está respaldado por listados de UL Solutions (Product iQ) organizados por tipo de dispositivo, además de las normas UL 38 y ULC-S528 citadas en fichas específicas (estaciones de liberación):");
    bullets(doc, [
      "S35910 — Control Units System / Releasing Device.",
      "S35947 — Control Unit Accessories / Emergency Communication and Relocation Equipment.",
      "S35539 — Visual-signal Appliances.",
      "S35854 — Boxes, Noncoded.",
    ]);
    nota(doc, "Como se explicó en el Módulo 1, estos expedientes listan modelos vigentes y descontinuados mezclados: sirven para confirmar que una referencia tiene listado UL, pero no para determinar por sí solos si sigue vigente comercialmente.");

    h1(doc, "7.6 — Buenas prácticas de especificación (resumen del curso)");
    bullets(doc, [
      "Verificar siempre el estado del producto (ACTIVO/NUEVO frente a PENDIENTE/DESCONTINUADO) antes de incluir una referencia en una cotización o diseño.",
      "No asumir equivalencia entre referencias parecidas (sufijos, guiones, letras) sin confirmación documental directa.",
      "Confirmar variantes de color, contacto y capacidad (por ejemplo R/W en notificación, N/O–N/C en estaciones manuales, 1/2/4 tubos en PipeSense) como parte explícita de la especificación, no como detalle menor.",
      "Usar el manual de instalación y el datasheet oficial como fuente final de verdad para cualquier parámetro técnico de diseño de detalle; este curso es un mapa de alcance, no un sustituto de esa documentación.",
      "Apoyarse en el programador de mano FW2411 y en S2 Configurator como las dos herramientas centrales del flujo de puesta en marcha en campo y en oficina, respectivamente.",
    ]);

    h1(doc, "Cierre del curso");
    p(
      doc,
      "Con estos siete módulos, el participante cuenta con un mapa completo del alcance del portafolio Series 2: paneles y anunciadores, detección, notificación, estaciones manuales y liberación, módulos de interfaz, y el conjunto de accesorios, software y telefonía de emergencia que completan una instalación. El siguiente paso natural es la consulta directa de los manuales de instalación y datasheets de cada referencia según el proyecto específico, así como el uso de la herramienta interna de soporte técnico de BICO para verificar el estado y la confianza documental de cualquier referencia antes de especificarla."
    );
  },
  preguntas: [
    {
      enunciado: "¿Cuál es la diferencia de propósito entre el FW2411 y el S2 Configurator?",
      opciones: [
        "Son el mismo producto con dos nombres.",
        "El FW2411 es un programador de mano para asignar direcciones en campo; el S2 Configurator es el software de PC para programar el panel (proyecto, zonas, lógica).",
        "El FW2411 es un software y el S2 Configurator un dispositivo físico.",
        "Ambos son módulos de entrada.",
      ],
      correcta: 1,
      justificacion: "Sección 7.1.",
    },
    {
      enunciado: "¿Cuál es la diferencia de capacidad entre las cajas FW434 y FW435?",
      opciones: ["FW434 admite 16 módulos y FW435 admite 8", "Ambas admiten 16 módulos", "FW434 admite 8 módulos y FW435 admite 16", "Ninguna admite módulos, son solo cajas decorativas"],
      correcta: 0,
      justificacion: "Sección 7.2, confirmado por datasheet oficial DOC-FW434FW435-DS-R1.1.",
    },
    {
      enunciado: "¿Qué función cumple el MA-OSY-1 dentro de la supervisión de un sistema de rociadores?",
      opciones: [
        "Detecta humo en el cuarto de bombas.",
        "Supervisa la posición (abierta/cerrada) de una válvula tipo OS&Y.",
        "Amplifica el circuito de notificación.",
        "Convierte el protocolo del detector de ducto.",
      ],
      correcta: 1,
      justificacion: "Sección 7.3.",
    },
    {
      enunciado: "¿Cuál es la diferencia entre la familia FW151 y la familia HY en telefonía de emergencia?",
      opciones: [
        "FW151 es direccionable; la serie HY es la línea convencional.",
        "HY es direccionable; FW151 es convencional.",
        "No hay diferencia, ambas son la misma línea.",
        "FW151 es exclusiva para zonas clasificadas a prueba de explosión.",
      ],
      correcta: 0,
      justificacion: "Sección 7.4.",
    },
    {
      enunciado: "¿Qué extensión de telefonía de incendio está diseñada específicamente para zonas clasificadas (industria/petroquímica)?",
      opciones: ["HY2712D", "HY2713", "HY6355(EX)", "FW151-FP"],
      correcta: 2,
      justificacion: "Sección 7.4.",
    },
    {
      enunciado: "Según la buena práctica resumida en este curso, ¿qué se debe hacer antes de incluir una referencia en una cotización?",
      opciones: [
        "Nada adicional; basta con el nombre de la referencia.",
        "Verificar su estado (activo/nuevo frente a pendiente/descontinuado) y confirmar variantes relevantes (color, contacto, capacidad) contra el manual o datasheet oficial.",
        "Usar siempre la variante más económica sin verificar especificaciones.",
        "Confirmar únicamente que aparezca en algún expediente de UL Product iQ.",
      ],
      correcta: 1,
      justificacion: "Sección 7.6.",
    },
  ],
};

const modulos = [modulo1, modulo2, modulo3, modulo4, modulo5, modulo6, modulo7];

function generarContenidoPdf(mod) {
  const ruta = path.join(OUT_CONTENIDO, `${mod.slug}.pdf`);
  const doc = crearDocumento(ruta, { pie: `${CURSO} — Módulo ${mod.num}: ${mod.titulo}` });
  mod.contenido(doc);
  finalizar(doc);
  return ruta;
}

function generarQuizPdf(mod) {
  const ruta = path.join(OUT_QUIZ, `${mod.slug}-quiz.pdf`);
  const doc = crearDocumento(ruta, { pie: `${CURSO} — Quiz Módulo ${mod.num}: ${mod.titulo}` });
  portada(doc, {
    kicker: `Quiz — Módulo ${mod.num}`,
    titulo: mod.titulo,
    subtitulo: "Evaluación de comprensión — selección múltiple, una respuesta correcta por pregunta.",
    notas: "Instrucciones: lea cada enunciado y marque la opción (A, B, C o D) que considere correcta según el contenido del módulo.",
  });
  mod.preguntas.forEach((item, i) => pregunta(doc, i + 1, item));
  hojaRespuestas(doc, `Módulo ${mod.num} — ${mod.titulo}`, mod.preguntas);
  finalizar(doc);
  return ruta;
}

const generados = [];
for (const mod of modulos) {
  generados.push(generarContenidoPdf(mod));
  generados.push(generarQuizPdf(mod));
}

console.log("PDFs generados:");
for (const g of generados) console.log(" -", path.relative(path.join(__dirname, ".."), g));
