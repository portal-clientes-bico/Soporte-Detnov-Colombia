/**
 * Semilla de Maple Armor / FireWatcher / MA Gen 2 / Series 2, construida a partir del
 * "Documento maestro de investigacion tecnica y comercial" (corte: septiembre de 2026) y de
 * dos rondas de verificacion directa por navegador (2026-09-22): sitio de Maple Armor Canada,
 * Resource Center y catalogo publico "Products" de Maple Armor China, UL Product iQ y el
 * sitio corporativo de Jade Bird (jbufa.com).
 *
 * Criterios aplicados (ver tambien los hallazgos tipo REGLA):
 * - Ninguna referencia se omite por aparecer solo en documentos antiguos, UL o exportaciones.
 * - No se asumen equivalencias entre referencias parecidas; se registran como DISCREPANCIA.
 * - Cada revision de un documento es una fila distinta.
 * - Solo se registran URLs cuando la fuente es conocida con certeza; el resto queda en notas.
 * - Aparecer en un archivo UL no implica que un producto este descontinuado (ver hallazgo
 *   hall-ul-no-implica-legado): la categoria describe el tipo de producto, no su vigencia.
 */
import type { SemillaMarca } from "@/lib/semilla";
import type { Especificacion } from "@/lib/db";

function e(grupo: string, nombre: string, valor: string): Especificacion {
  return { grupo, nombre, valor };
}

const F_CANADA = "Maple Armor Canada";
const F_CHINA = "Maple Armor China";
const F_CHINA_PRODUCTS = "Maple Armor China - catalogo Products (publico)";
const F_UL = "UL Solutions (Product iQ)";
const F_JADE = "Jade Bird Fire (Baike / repositorio interno)";
const F_JADE_CORP = "Jade Bird corporativo (jbufa.com)";
const F_REGULATORIO = "Documentos regulatorios";
const F_ADUANAS = "Exportaciones y aduanas (52wmb)";
const F_DISTRIBUIDORES = "Distribuidores";
const F_MARKETPLACES = "Fabricantes y marketplaces secundarios";
const F_DETNOV = "Detnov Security S.L.";
const F_INTERNO = "Investigacion interna BICO";
const F_RECIBIDO = "Información recibida (Google Drive interno BICO)";
const F_PRECIOS = "Maple Armor - Lista de precios de distribucion BICO";

const SERIES2 = "Series 2";
const LEGACY = "FireWatcher (legacy)";
const CHINA = "China";

export const MAPLE_ARMOR_SEMILLA: SemillaMarca = {
  slug: "maple-armor",
  nombre: "Maple Armor",
  descripcion:
    "Deteccion y alarma de incendio direccionable: plataforma Series 2 (FW2xxx), antecedentes FireWatcher legacy y MA Gen 2. Fabricante canadiense del grupo Jade Bird Fire con planta en China. Objetivo BICO: introducir la Series 2 en Colombia con una base tecnica propia de soporte y capacitacion.",

  fuentes: [
    {
      nombre: F_CANADA,
      tipo: "FABRICANTE",
      prioridad: 1,
      url: "https://www.maplearmor.com",
      descripcion:
        "Fuente primaria, verificada por navegacion directa (2026-09-22). products.html publica 25 datasheets reales y descargables sin cuenta (usar el subdominio www., el dominio pelado da 404). No existe una seccion publica 'Engineer Corner' ni biblioteca de manuales/presentaciones/videos: solo hay 'Partner Sign In', probablemente donde vive el resto de los 80+ datasheets / 60+ manuales que la marca afirma tener. case-studies.html confirma que el sistema se sigue llamando comercialmente 'FireWatcher' y que aun se instalan paneles legacy (ej. FW106S).",
    },
    {
      nombre: F_CHINA,
      tipo: "FABRICANTE",
      prioridad: 2,
      url: "https://www.maplearmor.cn",
      descripcion:
        "Resource Center verificado en https://www.maplearmor.cn/resource/25.html: existen realmente las 6 categorias (Certificates, Datasheets, Catalog, Manuals, Solutions, Case Studies) repartidas en 6 paginas de listado. El propio sitio avisa: hay que contactarlos para obtener un 'codigo de canje' (兑换码) antes de poder descargar cualquier PDF; los botones de descarga ejecutan JavaScript, no enlazan directo. La pagina de productos clasifica: fire alarm controllers, fire display panels, detectors, manual alarm buttons, modules, audible/visual alarms, conventional products, aspirating smoke detection. Muestra FW2610, FW2501, FW2110 y FW2601-P. No asumir que todo lo que vende Maple Armor China es Series 2 canadiense.",
    },
    {
      nombre: F_CHINA_PRODUCTS,
      tipo: "FABRICANTE",
      prioridad: 2,
      url: "https://www.maplearmor.cn/product.html",
      descripcion:
        "IMPORTANTE 2026-09-22: distinta del Resource Center (fuente 'Maple Armor China' de arriba). Es la seccion de catalogo de producto (menu 'Products'/'产品介绍', URLs bajo /portal/tailorism/ y /product/), NO la de descargas ('资源中心'). Cada ficha de producto individual tiene un boton 'View Datasheet' que enlaza directo a un PDF alojado en /upload/default/... , sin login ni codigo de canje: se verifico que el archivo descarga de verdad. Es la via real para acceder a documentacion tecnica china sin pedir el codigo de canje. Cubre 10 categorias (Control Panels, Annunciators, Detectors, Modules, Notification, Pull Stations, ASD, Waterflow detector, Beam Detectors, Voice Alarm & Fire Phone) con mas de 50 fichas de producto.",
    },
    {
      nombre: F_UL,
      tipo: "CERTIFICADOR",
      prioridad: 3,
      url: "https://productiq.ulprospector.com",
      descripcion:
        "Archivos UL de MAPLE ARMOR FIRE ALARM DEVICE CO LTD verificados por busqueda directa (2026-09-22): S35910 (4 documentos: Control Units System, version Canada, Releasing Device, version Canada), S35947 (5 documentos: Control Unit Accessories x2, Accessories Releasing Device x2, Emergency Communication and Relocation Equipment) y ademas S35539 (Visual-signal Appliances) y S35854 (Boxes, Noncoded) que NO estaban en el documento maestro original. Cada pagina de expediente muestra una lista de modelos parcial ('... More'): la lista completa y el certificado en PDF requieren cuenta gratuita de Product iQ.",
    },
    {
      nombre: F_JADE,
      tipo: "GRUPO_EMPRESARIAL",
      prioridad: 4,
      descripcion:
        "Casa matriz (Jade Bird Fire). Su Baike contiene documentos internos de Maple Armor/Jade Bird identificados como material de departamento interno: MA Gen 2 Catalog, brochure UL a 3C, guia de aplicacion FireWatcher, catalogo 2019, casos Canada, dimensiones/pesos de embalaje UL y listas de precios (incluido el precio estandar de liquidacion 2022). URL por confirmar.",
    },
    {
      nombre: F_JADE_CORP,
      tipo: "GRUPO_EMPRESARIAL",
      prioridad: 4,
      url: "https://www.jbufa.com/news/info.html?id=133",
      descripcion:
        "Sitio corporativo oficial de Jade Bird (verificado por navegacion directa, 2026-09-22). Su articulo 'Maple Armor (美安) | Fire Watcher系列智能火灾自动报警控制系统' confirma que Maple Armor Fire Alarm Device Co., Ltd. (Quebec) es el despliegue de Jade Bird en Norteamerica, y describe el sistema FireWatcher basado en el panel FW109 (armario, LCD 7 pulgadas), la tarjeta de lazo FW327 (252 puntos, hasta 16 tarjetas = 4032 puntos) y el panel multilinea FW241 (8 circuitos, hasta 8 tarjetas = 64 circuitos). Version 2020-12-01: describe la generacion previa a Series 2.",
    },
    {
      nombre: F_REGULATORIO,
      tipo: "REGULATORIO",
      prioridad: 5,
      descripcion: "Normas y documentos regulatorios citados por las fichas (UL 38, ULC-S528, NFPA 72, etc.).",
    },
    {
      nombre: F_ADUANAS,
      tipo: "ADUANAS",
      prioridad: 6,
      url: "https://www.52wmb.com",
      descripcion:
        "Registros de exportacion Maple Armor China. Advertencia: el campo Amount no equivale a precio unitario; recuperar cantidad, unidad, moneda, valor total, peso, descripcion y HS code antes de interpretar.",
    },
    {
      nombre: F_DISTRIBUIDORES,
      tipo: "DISTRIBUIDOR",
      prioridad: 7,
      descripcion:
        "Distribuidores en Canada, EE.UU., Vietnam y otros mercados. Confirmados por navegacion directa: Walker Safety (aloja 'Maple-Armor-General-Catalogue.pdf', catalogo general >10MB) y SI Alarms Ltd (Winnipeg, pagina de marca sin documentos propios).",
    },
    {
      nombre: F_MARKETPLACES,
      tipo: "MARKETPLACE",
      prioridad: 8,
      descripcion:
        "Fuentes secundarias (marketplaces, fabricantes OEM). Baja prioridad; solo para pistas, nunca para confirmar especificaciones. Incluye documentos subidos por terceros sin autoria verificable (ej. 'Maple Armor Fire Alarm Solutions', 44 paginas, subido a Scribd por un usuario externo).",
    },
    {
      nombre: F_DETNOV,
      tipo: "GRUPO_EMPRESARIAL",
      prioridad: 9,
      descripcion:
        "Filial europea del grupo Jade Bird. Investigar precios de transferencia, facturas, operaciones intragrupo, importaciones, ventas, cuentas por pagar y documentacion aduanera (Jade Bird -> Maple Armor -> Detnov; Maple Armor China -> Detnov; Jade Bird Fire -> Detnov). No usar cifras contables de inversion como precio de producto.",
    },
    { nombre: F_INTERNO, tipo: "INTERNO", prioridad: 10, descripcion: "Documentos, aprendizajes y material producido por BICO." },
    {
      nombre: F_RECIBIDO,
      tipo: "FABRICANTE",
      prioridad: 1,
      descripcion:
        "Documentacion oficial de Maple Armor (manuales de instalacion, datasheets, material de entrenamiento, software y catalogo) recibida directamente por BICO y guardada en el Drive compartido del equipo (H:\\Mi unidad\\Compartido Faro Bico\\Maple Armor\\Documentacion Tecnica). Se verifico por contenido (hash SHA-256, no por nombre de archivo) contra los 67 documentos ya cargados: 22 resultaron ser copias identicas de archivos que ya teniamos y no se duplicaron; 42 tenian contenido nuevo y se incorporaron aqui. Maxima prioridad: es la fuente mas directa posible, sin intermediarios de scraping web.",
    },
    {
      nombre: F_PRECIOS,
      tipo: "FABRICANTE",
      prioridad: 1,
      descripcion:
        "Lista de precios de distribucion negociada entre Maple Armor y BICO, recibida directamente del fabricante (no es un precio de lista publico). Se recibe periodicamente en Excel; cada version se conserva como documento propio con su fecha (Regla 3). El precio de cada referencia se guarda como especificacion del grupo COMERCIAL directamente sobre el producto (no en esta semilla, para no duplicar datos comerciales que cambian con frecuencia); el archivo fuente y su fecha quedan en el documento tipo LISTA_PRECIOS asociado.",
    },
  ],

  productos: [
    // ---------------------------------------------------------------- Paneles
    {
      referencia: "FW2105",
      nombre: "Addressable Fire Alarm Control Panel",
      familia: "PANELES",
      generacion: SERIES2,
      estado: "ACTIVO",
      descripcion: "Panel de control de alarma de incendio direccionable, plataforma Series 2. La ficha oficial declara explicitamente compatibilidad con Series 2.",
      notas: "Documentacion: DOC-12105 Rev 0.2 (06/2025), manual 2023, documentacion china y UL. Sus componentes internos (FW2201, FW2301, FW2390, FW2191, FW2371-FW2374, FW2312, FW2321, FW2321-1, FW2331, FW2361, FW2365, FW2852) deben entrar en la BOM aunque no sean dispositivos de campo. Entregable pendiente: BOM completa del FW2105.",
      especificaciones: [
        e("COMUNICACION", "SLC estandar", "1"),
        e("COMUNICACION", "SLC maximo", "hasta 9"),
        e("COMUNICACION", "Dispositivos/puntos por SLC", "252"),
        e("COMUNICACION", "Clase de cableado", "Class A / Class B"),
        e("COMUNICACION", "Direccionamiento", "automatico"),
        e("COMUNICACION", "Red de paneles", "si"),
        e("FUNCIONAL", "NAC", "hasta 12"),
        e("FUNCIONAL", "Reles", "4 Form C"),
        e("FUNCIONAL", "Display", "LCD 7\" 800 x 480"),
        e("FUNCIONAL", "Programacion", "PC o panel frontal"),
        e("FUNCIONAL", "USB", "si"),
        e("FUNCIONAL", "Anunciadores remotos", "si"),
        e("FUNCIONAL", "Two-stage", "si"),
        e("FUNCIONAL", "PAS (Positive Alarm Sequence)", "si"),
        e("FUNCIONAL", "Registro de eventos", "si"),
        e("ELECTRICO", "Fuente de alimentacion", "10 A"),
        e("COMPATIBILIDAD", "Plataforma", "Series 2"),
      ],
    },
    {
      referencia: "FW2107",
      nombre: "Addressable Fire & Release Control Panel",
      familia: "PANELES",
      generacion: SERIES2,
      estado: "ACTIVO",
      descripcion: "Panel direccionable de deteccion y liberacion de agente extintor.",
      notas: "Investigar: arquitectura, loops, NAC, releasing, agent release, modulo FW2822, estaciones FW2731/2732/2733/2734, logica de pre-discharge, abort, main/reserve y programacion. Entregable pendiente: BOM completa del FW2107 y matriz de releasing.",
    },
    {
      referencia: "FW2107M",
      nombre: "Mini Fire & Release Control Panel",
      familia: "PANELES",
      generacion: SERIES2,
      estado: "NUEVO",
      descripcion: "Version compacta del panel de deteccion y liberacion.",
      notas: "Datasheet actual Rev 0.0 (10/2025): incorporacion relativamente reciente a la familia. Entregable pendiente: BOM completa del FW2107M.",
    },
    {
      referencia: "FW2107C",
      nombre: "Fire & Release Control Panel, variante C",
      familia: "PANELES",
      generacion: SERIES2,
      estado: "NUEVO",
      notas: "NUEVO 2026-09-23: revelado en el manual oficial DOC-FW2107-UM-R1.6 (73 paginas) junto a FW2107 y FW2107M. Determinar la diferencia exacta con el FW2107 base.",
    },
    {
      referencia: "FW2110",
      nombre: "Network Annunciator",
      familia: "ANUNCIADORES",
      generacion: SERIES2,
      estado: "ACTIVO",
      descripcion: "Anunciador de red (multiples paneles en red mostrados desde un solo punto).",
      notas: "CORREGIDO 2026-09-22: clasificado como 'Fire alarm controller, pendiente' en la version anterior. Confirmado como 'FW2110 Network Annunciator' con datasheet propio y descargable, sin restriccion, en el catalogo publico Products de Maple Armor China (categoria Annunciators).",
    },

    // ----------------------------------------------------------- Anunciadores
    {
      referencia: "FW2121",
      nombre: "Remote LCD Annunciator",
      familia: "ANUNCIADORES",
      generacion: SERIES2,
      estado: "ACTIVO",
      notas: "Datasheet DOC-12121 Rev 0.3 (09/2025). Investigar: comunicacion, maximo de unidades, alimentacion, direccionamiento, eventos, comandos, cableado, distancia y topologia. Aparece en la exportacion a Vietnam (09/07/2026).",
    },
    {
      referencia: "FW2121H",
      nombre: "Variante de anunciador LCD (funcion pendiente)",
      familia: "ANUNCIADORES",
      generacion: SERIES2,
      estado: "PENDIENTE",
      notas: "Referencia identificada; necesita investigacion primaria para confirmar funcion y diferencia con FW2121.",
    },
    {
      referencia: "FW2129",
      nombre: "Remote LED Annunciator",
      familia: "ANUNCIADORES",
      generacion: SERIES2,
      estado: "ACTIVO",
      notas: "Datasheet DOC-12129 Rev 0.2 (08/2025). Estudiar junto con FW2129-H1, -H2, -H3 y -H5: UL las lista individualmente, no asumir que son simples nombres comerciales.",
    },
    { referencia: "FW2129-H1", nombre: "Remote LED Annunciator, variante H1", familia: "ANUNCIADORES", generacion: SERIES2, estado: "PENDIENTE", notas: "Listada individualmente por UL. Aparece en la exportacion a Vietnam (09/07/2026). Determinar configuracion de LEDs/zonas." },
    { referencia: "FW2129-H2", nombre: "Remote LED Annunciator, variante H2", familia: "ANUNCIADORES", generacion: SERIES2, estado: "PENDIENTE", notas: "Listada individualmente por UL. Determinar configuracion." },
    { referencia: "FW2129-H3", nombre: "Remote LED Annunciator, variante H3", familia: "ANUNCIADORES", generacion: SERIES2, estado: "PENDIENTE", notas: "Listada individualmente por UL. Determinar configuracion." },
    { referencia: "FW2129-H5", nombre: "Remote LED Annunciator, variante H5", familia: "ANUNCIADORES", generacion: SERIES2, estado: "PENDIENTE", notas: "Listada individualmente por UL. Determinar configuracion." },

    // ------------------------------------------------------------- Detectores
    {
      referencia: "FW2511",
      nombre: "Addressable Photoelectric Smoke Detector",
      familia: "DETECTORES",
      generacion: SERIES2,
      estado: "ACTIVO",
      descripcion: "Detector fotoelectrico de humo direccionable.",
      notas: "Datasheet DOC-12511 Rev 0.2 (06/2025). Datos confirmados en ficha oficial.",
      especificaciones: [
        e("ELECTRICO", "Tension nominal", "24 VDC"),
        e("ELECTRICO", "Rango de tension", "15.3 - 28 VDC"),
        e("ELECTRICO", "Standby current", "0.16 mA"),
        e("ELECTRICO", "Alarm current", "0.65 mA"),
        e("FUNCIONAL", "Sensibilidad UL", "1.34 - 2.45 %/ft"),
        e("FUNCIONAL", "Sensibilidad ULC", "1.63 - 3.11 %/ft"),
        e("MECANICO", "Temperatura", "0 - 49 C"),
        e("MECANICO", "Humedad", "0 - 93 % RH"),
        e("MECANICO", "Diametro", "4\""),
        e("COMPATIBILIDAD", "Bases", "FW2501, FW2502, FW2509"),
        e("COMPATIBILIDAD", "Paneles", "FW2105, FW2107"),
      ],
    },
    {
      referencia: "FW2521",
      nombre: "Addressable Heat Detector",
      familia: "DETECTORES",
      generacion: SERIES2,
      estado: "ACTIVO",
      notas: "Investigar: fixed temperature, rate-of-rise, temperatura de actuacion, corrientes, Class A/B, bases, indicadores remotos y certificaciones.",
    },
    {
      referencia: "FW2531",
      nombre: "Addressable Combination Smoke/Heat Detector",
      familia: "DETECTORES",
      generacion: SERIES2,
      estado: "PENDIENTE",
      notas: "Confirmado en UL y catalogo; falta recuperar la ficha primaria completa.",
    },
    {
      referencia: "FW2512",
      nombre: "Smoke detector (fuentes secundarias: convencional)",
      familia: "DETECTORES",
      generacion: SERIES2,
      estado: "PENDIENTE",
      notas: "Aparece como detector convencional en algunas fuentes secundarias. No fusionar con FW2512-2 hasta recuperar documentacion primaria.",
    },
    {
      referencia: "FW2512-2",
      nombre: "Addressable smoke detector 24 VDC (segun exportacion)",
      familia: "DETECTORES",
      generacion: SERIES2,
      estado: "PENDIENTE",
      notas: "Exportacion 2026 a Vietnam lo describe como 'Addressable smoke detector - 24 VDC'. Discrepancia con FW2512 (convencional en fuentes secundarias). Recuperar documentacion primaria.",
    },
    {
      referencia: "FW2522",
      nombre: "Heat detector (fuentes secundarias: convencional)",
      familia: "DETECTORES",
      generacion: SERIES2,
      estado: "PENDIENTE",
      notas: "Aparece como convencional en algunas fuentes secundarias. No fusionar con FW2522-2.",
    },
    {
      referencia: "FW2522-2",
      nombre: "Addressable heat detector 24 VDC (segun exportacion)",
      familia: "DETECTORES",
      generacion: SERIES2,
      estado: "PENDIENTE",
      notas: "Exportacion 2026 a Vietnam lo describe como 'Addressable heat detector - 24 VDC'. Misma situacion que FW2512-2.",
    },
    {
      referencia: "FW2601-P",
      nombre: "ASD Monitoring and Management System Suite",
      familia: "ASPIRACION",
      generacion: SERIES2,
      estado: "ACTIVO",
      descripcion: "Suite de monitoreo y gestion para la linea PipeSense (deteccion por aspiracion), complementaria al detector FW2601.",
      notas: "CORREGIDO 2026-09-22: se tenia como 'Detector, pendiente de clasificar'. Confirmado como 'FW2601-P ASD Monitoring and Management System Suite' con datasheet propio y descargable, sin restriccion, en el catalogo publico Products de Maple Armor China (categoria ASD).",
    },
    {
      referencia: "FW2601-P2(FM)",
      nombre: "Detector, variante P2 (FM)",
      familia: "DETECTORES",
      generacion: CHINA,
      estado: "PENDIENTE",
      notas: "Aparece en la exportacion a Vietnam (09/07/2026) con el mayor Amount de la lista (4287.50). Investigar funcion, certificacion FM y relacion con FW2601-P.",
    },
    {
      referencia: "FW2610",
      nombre: "Graphics Display System",
      familia: "ANUNCIADORES",
      generacion: SERIES2,
      estado: "ACTIVO",
      descripcion: "Sistema de visualizacion grafica (mapa/planos del edificio con estado del sistema).",
      notas: "CORREGIDO 2026-09-22: se tenia como 'funcion pendiente'. Confirmado como 'FW2610 Graphics Display System' con datasheet propio y descargable, sin restriccion, en el catalogo publico Products de Maple Armor China (categoria Annunciators).",
    },

    // ------------------------------------------------------------------ Bases
    {
      referencia: "FW2501",
      nombre: "Detector Base",
      familia: "BASES",
      generacion: SERIES2,
      estado: "ACTIVO",
      descripcion: "Base estandar de detector. Compatible con FW2511 y FW2521.",
      notas: "Tambien mostrada en la pagina de Maple Armor China.",
    },
    {
      referencia: "FW2502",
      nombre: "Detector Base (variante)",
      familia: "BASES",
      generacion: SERIES2,
      estado: "PENDIENTE",
      notas: "Investigar variantes (relay/aislada?) y compatibilidad exacta.",
    },
    {
      referencia: "FW2508",
      nombre: "520 Hz Sounder Base",
      familia: "BASES",
      generacion: SERIES2,
      estado: "ACTIVO",
      descripcion: "Base sonora de baja frecuencia (520 Hz) para detectores Series 2.",
      notas: "Datasheet DOC-12508 Rev 0.1 (08/2025).",
      especificaciones: [
        e("COMUNICACION", "Direccion", "misma address que el detector; programacion conjunta"),
        e("ELECTRICO", "Alimentacion", "24 VDC / NAC"),
        e("FUNCIONAL", "Frecuencia", "520 Hz"),
        e("FUNCIONAL", "Niveles de salida", "tres: 80 / 76 / 72 dBA segun configuracion"),
        e("FUNCIONAL", "Sincronizacion", "si"),
        e("COMPATIBILIDAD", "Paneles", "FW2105, FW2107"),
      ],
    },
    {
      referencia: "FW2509",
      nombre: "Sounder Base",
      familia: "BASES",
      generacion: SERIES2,
      estado: "ACTIVO",
      notas: "Investigar: tonos, volumen, corriente, cableado, alimentacion y compatibilidad exacta.",
    },
    {
      referencia: "FW2507",
      nombre: "Sounder Base",
      familia: "BASES",
      generacion: SERIES2,
      estado: "NUEVO",
      notas: "NUEVO 2026-09-22, no estaba en el documento maestro original. Confirmado con datasheet propio y descargable, sin restriccion, en el catalogo publico Products de Maple Armor China. Determinar la diferencia exacta con FW2508 (520 Hz) y FW2509 (estandar): posiblemente una tercera variante de tono o volumen.",
    },

    // ------------------------------------------------------------ Indicadores
    {
      referencia: "FW2561-RI",
      nombre: "Remote Indicator",
      familia: "INDICADORES",
      generacion: SERIES2,
      estado: "ACTIVO",
      notas: "Confirmado por Maple Armor China y UL. Compatible con FW2811M, FW2511 y FW2521. Investigar: corriente, distancia, cableado, polaridad y montaje.",
    },

    // ---------------------------------------------------- Estaciones manuales
    {
      referencia: "FW2721",
      nombre: "Addressable Manual Station",
      familia: "ESTACIONES_MANUALES",
      generacion: SERIES2,
      estado: "ACTIVO",
      notas: "Datasheet conjunto DOC-12721 Rev 0.2 (06/2025). Investigar diferencias exactas entre FW2721/2722/2723: single/dual action, single/two-stage, direccionamiento, contacto, LED, corriente, reset y caja.",
    },
    { referencia: "FW2722", nombre: "Addressable Manual Station (variante)", familia: "ESTACIONES_MANUALES", generacion: SERIES2, estado: "ACTIVO", notas: "Ver DOC-12721. Determinar si es dual action o two-stage." },
    { referencia: "FW2723", nombre: "Addressable Manual Station (variante)", familia: "ESTACIONES_MANUALES", generacion: SERIES2, estado: "ACTIVO", notas: "Ver DOC-12721. Determinar si es dual action o two-stage." },

    // ------------------------------------------------------------- Liberacion
    {
      referencia: "FW2731",
      nombre: "Manual Release Station",
      familia: "LIBERACION",
      generacion: SERIES2,
      estado: "ACTIVO",
      descripcion: "Estacion manual de liberacion de agente para paneles FW2107 / FW2107M.",
      notas: "Datasheet DOC-12731 Rev 0.1 (08/2025). Aparece en la exportacion a Vietnam (09/07/2026).",
      especificaciones: [
        e("COMUNICACION", "Direccionable", "si, 1 address en el SLC"),
        e("FUNCIONAL", "Contacto", "Form C (N/O y N/C)"),
        e("FUNCIONAL", "Accion", "single action"),
        e("CERTIFICACIONES", "UL", "UL 38"),
        e("CERTIFICACIONES", "ULC", "ULC-S528"),
        e("COMPATIBILIDAD", "Paneles", "FW2107, FW2107M"),
      ],
    },
    { referencia: "FW2732", nombre: "Abort Switch", familia: "LIBERACION", generacion: SERIES2, estado: "ACTIVO", notas: "Investigar: logica de abort, pre-discharge, timer, wiring, resistencia y supervision." },
    { referencia: "FW2733", nombre: "Disconnect Switch", familia: "LIBERACION", generacion: SERIES2, estado: "ACTIVO", notas: "Investigar: disable release, llave, LED, supervisory/trouble." },
    { referencia: "FW2734", nombre: "Main/Reserve Switch", familia: "LIBERACION", generacion: SERIES2, estado: "ACTIVO", notas: "Investigar: seleccion de cilindro principal/reserva, logica de transferencia, cableado y supervision." },

    // ---------------------------------------------------------------- Modulos
    { referencia: "FW2811", nombre: "Input Module", familia: "MODULOS", generacion: SERIES2, estado: "ACTIVO", notas: "Datasheet DOC-12811 Rev 0.2 (06/2025). Aparece en la exportacion a Vietnam (09/07/2026)." },
    { referencia: "FW2811M", nombre: "Mini Input Module", familia: "MODULOS", generacion: SERIES2, estado: "ACTIVO", notas: "Compatible con el indicador remoto FW2561-RI." },
    { referencia: "FW2812", nombre: "Dual Input Module", familia: "MODULOS", generacion: SERIES2, estado: "ACTIVO", notas: "Importante: documentar el comportamiento de las dos entradas respecto a las direcciones SLC (una o dos addresses)." },
    { referencia: "FW2821", nombre: "Supervised Output Module", familia: "MODULOS", generacion: SERIES2, estado: "ACTIVO" },
    { referencia: "FW2822", nombre: "Releasing Module", familia: "MODULOS", generacion: SERIES2, estado: "ACTIVO", notas: "Clave para la matriz de releasing del FW2107." },
    { referencia: "FW2823", nombre: "Dual Input Relay Module", familia: "MODULOS", generacion: SERIES2, estado: "ACTIVO", descripcion: "Modulo direccionable con dos circuitos de entrada Clase B (contacto seco) y dos salidas de rele de control.", notas: "CORREGIDO 2026-09-23: confirmado con manual oficial de instalacion (DOC-FW2823-UM-R1.0, 2025-09-04) recibido directamente de Maple Armor. Antes estaba como 'modulo, funcion pendiente'." },
    {
      referencia: "FW2831",
      nombre: "Relay Module",
      familia: "MODULOS",
      generacion: SERIES2,
      estado: "ACTIVO",
      especificaciones: [
        e("FUNCIONAL", "Salidas de rele", "2, contactos NO/NC"),
        e("FUNCIONAL", "Operacion", "simultanea"),
        e("COMUNICACION", "Direccionable", "si"),
      ],
    },
    { referencia: "FW2841", nombre: "Conventional Zone Module", familia: "MODULOS", generacion: SERIES2, estado: "ACTIVO", notas: "Muy importante para estudiar compatibilidad con detectores convencionales de terceros." },
    { referencia: "FW2845", nombre: "Protocol Converter Module", familia: "MODULOS", generacion: SERIES2, estado: "ACTIVO", descripcion: "Interfaz de comunicacion que conecta el detector de ducto FW562 a los paneles Series 2 FW2105 y FW2107.", notas: "CORREGIDO 2026-09-23: confirmado con manual oficial de instalacion (DOC-FW2845-UM-R1.0) recibido directamente de Maple Armor. Antes estaba como 'Zone Protocol Converter, pendiente'." },
    {
      referencia: "FW2851",
      nombre: "SLC Isolator",
      familia: "MODULOS",
      generacion: SERIES2,
      estado: "ACTIVO",
      notas: "Aislador de lazo de campo. NO confundir con FW2852 (unidad interna del panel).",
      especificaciones: [e("COMUNICACION", "Direccion", "no ocupa direccion")],
    },
    { referencia: "FW2881H", nombre: "Modulo (funcion pendiente)", familia: "MODULOS", generacion: SERIES2, estado: "PENDIENTE", notas: "Confirmado en UL; funcion pendiente." },
    { referencia: "FW2411", nombre: "Hand-held Programmer", familia: "ACCESORIOS", generacion: SERIES2, estado: "ACTIVO", descripcion: "Programador de mano para asignar direcciones a detectores y otros dispositivos de campo Maple Armor.", notas: "CORREGIDO 2026-09-23: confirmado con manual oficial de instalacion (DOC-FW2411-UM-R1.0, 2025-04-17) recibido directamente de Maple Armor. Antes estaba como 'referencia en exportacion, funcion pendiente, sin clasificar'." },

    // ---------------------------------------------- Componentes internos FW2105
    { referencia: "FW2201", nombre: "AMI (Advanced Machine Interface)", familia: "COMPONENTES_INTERNOS", generacion: SERIES2, estado: "INTERNO", notas: "Componente interno del FW2105. Incluir en la BOM. Nombre completo confirmado 2026-09-22 por el Resource Center de Maple Armor China ('FW2201 ADVANCED MACHINE INTERFACE (AMI)')." },
    { referencia: "FW2301", nombre: "MFU (Multiple Function Unit)", familia: "COMPONENTES_INTERNOS", generacion: SERIES2, estado: "INTERNO", notas: "Componente interno del FW2105. Incluir en la BOM. Nombre completo confirmado 2026-09-22 por el Resource Center de Maple Armor China." },
    { referencia: "FW2390", nombre: "PSU (Power Supply Unit)", familia: "COMPONENTES_INTERNOS", generacion: SERIES2, estado: "INTERNO", notas: "Fuente de alimentacion interna del FW2105 (10 A segun ficha del panel). Nombre completo confirmado 2026-09-22 por el Resource Center de Maple Armor China." },
    { referencia: "FW2191", nombre: "FACP Enclosure", familia: "COMPONENTES_INTERNOS", generacion: SERIES2, estado: "INTERNO", notas: "CORREGIDO 2026-09-22: nombre real confirmado por el Resource Center de Maple Armor China ('FW2191 FACP Enclosure'), reemplaza la hipotesis previa 'CPE'. Es el gabinete del panel. Variante FW2191-06 aparece en el expediente UL SYZV.S35910." },
    { referencia: "FW2371", nombre: "Connector board", familia: "COMPONENTES_INTERNOS", generacion: SERIES2, estado: "INTERNO", notas: "Tarjeta de conexion interna (familia FW2371-FW2374). La variante FW2371-4 aparece confirmada con datasheet propio en el Resource Center de Maple Armor China (2026-09-22)." },
    { referencia: "FW2372", nombre: "Connector board", familia: "COMPONENTES_INTERNOS", generacion: SERIES2, estado: "INTERNO" },
    { referencia: "FW2373", nombre: "Connector board", familia: "COMPONENTES_INTERNOS", generacion: SERIES2, estado: "INTERNO" },
    { referencia: "FW2374", nombre: "Connector board", familia: "COMPONENTES_INTERNOS", generacion: SERIES2, estado: "INTERNO" },
    { referencia: "FW2312", nombre: "ZIU (8 Zone Interface Unit)", familia: "MODULOS", generacion: SERIES2, estado: "ACTIVO", notas: "CORREGIDO 2026-09-22: confirmado por el Resource Center de Maple Armor China como 'FW2312 ZIU (8 ZONE INTERFACE UNIT)' -- interfaz de 8 zonas convencionales, no un componente puramente interno del FW2105. Aparece en la exportacion a Vietnam (09/07/2026)." },
    { referencia: "FW2321", nombre: "ALU (Addressable Loop Unit)", familia: "COMPONENTES_INTERNOS", generacion: SERIES2, estado: "INTERNO", notas: "Tarjeta de lazo SLC. Aparece en la exportacion a Vietnam (09/07/2026)." },
    { referencia: "FW2321-1", nombre: "Sub-ALU (Sub Addressable Loop Unit)", familia: "COMPONENTES_INTERNOS", generacion: SERIES2, estado: "INTERNO", notas: "CONFIRMADO 2026-09-22 por el Resource Center de Maple Armor China: datasheet propio 'FW2321 / FW2321-1 ADDRESSABLE LOOP UNIT (ALU) / SUB ALU'. Tambien aparece en la exportacion a Vietnam (09/07/2026)." },
    { referencia: "FW2327-1", nombre: "Referencia sin confirmar (posible error de transcripcion)", familia: "COMPONENTES_INTERNOS", generacion: SERIES2, estado: "PENDIENTE", notas: "Revision 2026-09-22: no aparece en Maple Armor Canada, Maple Armor China ni UL Product iQ. Es probable que sea un error de transcripcion por FW2321-1 (unico similar confirmado en tres fuentes primarias). No eliminar por la Regla 1, pero no seguir tratandola como referencia real hasta encontrar una fuente que la mencione." },
    { referencia: "FW2331", nombre: "NOU (Notification Output Unit)", familia: "COMPONENTES_INTERNOS", generacion: SERIES2, estado: "INTERNO", notas: "Confirmado 2026-09-22 por el Resource Center de Maple Armor China." },
    { referencia: "FW2361", nombre: "ANU (Annunciator Network Unit)", familia: "COMPONENTES_INTERNOS", generacion: SERIES2, estado: "INTERNO", notas: "Confirmado 2026-09-22 por el Resource Center de Maple Armor China." },
    { referencia: "FW2365", nombre: "DACT (Digital Alarm Communicator Transmitter)", familia: "COMPONENTES_INTERNOS", generacion: SERIES2, estado: "INTERNO" },
    {
      referencia: "FW2852",
      nombre: "ISU - Panel internal isolator",
      familia: "COMPONENTES_INTERNOS",
      generacion: SERIES2,
      estado: "INTERNO",
      notas: "Unidad aisladora INTERNA del FW2105. Documentar como 'Panel internal isolator / ISU' y no como modulo de campo equivalente al FW2851. Aparece en la exportacion a Vietnam (09/07/2026).",
    },
    {
      referencia: "FW2261",
      nombre: "Local LED Annunciator",
      familia: "ANUNCIADORES",
      generacion: SERIES2,
      estado: "ACTIVO",
      descripcion: "Anunciador LED local (a diferencia del FW2129, que es remoto). Confirmado por Maple Armor China (Resource Center) y por UL en el expediente SYZV.S35910 (Control Units, Releasing Device).",
      notas: "CORREGIDO 2026-09-22: el documento maestro original tenia esta referencia como 'FW2261L' con funcion pendiente; el nombre real, verificado en dos fuentes primarias, es FW2261 (sin sufijo L).",
    },
    { referencia: "PBA-FW262-THT", nombre: "Tarjeta (PBA) en exportacion", familia: "COMPONENTES_INTERNOS", generacion: SERIES2, estado: "PENDIENTE", notas: "Aparece en la exportacion a Vietnam (09/07/2026). PBA = printed board assembly; determinar a que equipo pertenece." },

    // ---------------------------------------------------- Arquitectura FW2252
    { referencia: "FW2252-CORE", nombre: "Nucleo de arquitectura de panel", familia: "ARQUITECTURA_PANEL", generacion: SERIES2, estado: "PENDIENTE", notas: "Familia FW2252: fundamental para entender la arquitectura modular de FW2105, FW2129, anunciacion, display y LEDs." },
    { referencia: "FW2252-8-RGY", nombre: "Modulo de 8 LEDs rojo/verde/amarillo", familia: "ARQUITECTURA_PANEL", generacion: SERIES2, estado: "PENDIENTE", notas: "Nombre inferido de la nomenclatura; confirmar con documentacion primaria." },
    { referencia: "FW2252-8-2RY", nombre: "Modulo de 8 x 2 LEDs rojo/amarillo", familia: "ARQUITECTURA_PANEL", generacion: SERIES2, estado: "PENDIENTE", notas: "Nombre inferido; confirmar." },
    { referencia: "FW2252-8-S2L", nombre: "Modulo de 8 switches con 2 LEDs", familia: "ARQUITECTURA_PANEL", generacion: SERIES2, estado: "PENDIENTE", notas: "Nombre inferido; confirmar." },
    { referencia: "FW2252-8-2S2L", nombre: "Modulo de 8 x 2 switches con 2 LEDs", familia: "ARQUITECTURA_PANEL", generacion: SERIES2, estado: "PENDIENTE", notas: "Nombre inferido; confirmar." },
    { referencia: "FW2252-4-3S3L", nombre: "Modulo de 4 x 3 switches con 3 LEDs", familia: "ARQUITECTURA_PANEL", generacion: SERIES2, estado: "PENDIENTE", notas: "Nombre inferido; confirmar." },
    { referencia: "FW2252-4S4L", nombre: "Modulo de 4 switches con 4 LEDs", familia: "ARQUITECTURA_PANEL", generacion: SERIES2, estado: "PENDIENTE", notas: "Nombre inferido; confirmar." },
    { referencia: "FW2252-DMMY", nombre: "Modulo dummy (tapa ciega)", familia: "ARQUITECTURA_PANEL", generacion: SERIES2, estado: "PENDIENTE", notas: "Nombre inferido; confirmar." },
    { referencia: "FW2204", nombre: "Elemento de arquitectura de panel", familia: "ARQUITECTURA_PANEL", generacion: SERIES2, estado: "PENDIENTE" },
    { referencia: "FW2204L", nombre: "Elemento de arquitectura de panel (variante L)", familia: "ARQUITECTURA_PANEL", generacion: SERIES2, estado: "PENDIENTE" },

    // ----------------------------------------------------------- Notificacion
    { referencia: "FW2961", nombre: "Horn/Strobe", familia: "NOTIFICACION", generacion: SERIES2, estado: "ACTIVO", notas: "Dos generaciones documentales: DS3112-1 (internacional anterior) y DOC-12961 Rev 0.2 (06/2025). Hacer diff tecnico entre ambas." },
    { referencia: "FW2971", nombre: "Horn", familia: "NOTIFICACION", generacion: SERIES2, estado: "ACTIVO", notas: "Ver DS3112-1 y DOC-12961. Discrepancia pendiente frente a FW2962/FW2965." },
    { referencia: "FW2981", nombre: "Strobe", familia: "NOTIFICACION", generacion: SERIES2, estado: "ACTIVO", notas: "Ver DS3112-1 y DOC-12961. Discrepancia pendiente frente a FW2962/FW2965." },
    { referencia: "FW2962", nombre: "Referencia pendiente (notificacion)", familia: "NOTIFICACION", generacion: SERIES2, estado: "PENDIENTE", notas: "No asumir equivalencia con FW2971/FW2981." },
    { referencia: "FW2965", nombre: "Referencia pendiente (notificacion)", familia: "NOTIFICACION", generacion: SERIES2, estado: "PENDIENTE", notas: "No asumir equivalencia con FW2971/FW2981." },
    { referencia: "FW2963", nombre: "Low Frequency Horn/Strobe (520 Hz)", familia: "NOTIFICACION", generacion: SERIES2, estado: "ACTIVO", notas: "DOC-12963 Rev 0.2 (2025). Investigar: 520 Hz, horn, strobe, candela, sincronizacion, direccionamiento y consumo." },
    { referencia: "FW2973", nombre: "Low Frequency Horn (520 Hz)", familia: "NOTIFICACION", generacion: SERIES2, estado: "ACTIVO", notas: "Ver DOC-12963." },
    { referencia: "FW2972", nombre: "Mini Horn", familia: "NOTIFICACION", generacion: SERIES2, estado: "ACTIVO", notas: "DOC-12972 Rev 0.1 (05/2025). Variantes registradas individualmente: FW2972MSW, FW2972MSR, FW2972MW, FW2972MR." },
    { referencia: "FW2972MSW", nombre: "Mini Horn, variante MSW", familia: "NOTIFICACION", generacion: SERIES2, estado: "ACTIVO", notas: "Probable: con strobe, color blanco. Confirmar en DOC-12972." },
    { referencia: "FW2972MSR", nombre: "Mini Horn, variante MSR", familia: "NOTIFICACION", generacion: SERIES2, estado: "ACTIVO", notas: "Probable: con strobe, color rojo. Confirmar en DOC-12972." },
    { referencia: "FW2972MW", nombre: "Mini Horn, variante MW", familia: "NOTIFICACION", generacion: SERIES2, estado: "ACTIVO", notas: "Probable: solo horn, color blanco. Confirmar en DOC-12972." },
    { referencia: "FW2972MR", nombre: "Mini Horn, variante MR", familia: "NOTIFICACION", generacion: SERIES2, estado: "ACTIVO", notas: "Probable: solo horn, color rojo. Confirmar en DOC-12972." },
    { referencia: "FW2951", nombre: "Referencia pendiente (notificacion)", familia: "NOTIFICACION", generacion: SERIES2, estado: "PENDIENTE", notas: "Identificada; necesita investigacion primaria." },

    // --------------------------------------------------------- Sin clasificar
    { referencia: "ZR-D25", nombre: "Referencia en exportacion (sin clasificar)", familia: "SIN_CLASIFICAR", estado: "PENDIENTE", notas: "Aparece en la exportacion a Vietnam (09/07/2026). No sigue la nomenclatura FW; determinar si es accesorio, repuesto o producto de otra linea." },
    {
      referencia: "BYF-PC10X",
      nombre: "Fire Alarm Power Supply (menor capacidad, hermano de BYF-PC20X)",
      familia: "ACCESORIOS",
      generacion: SERIES2,
      estado: "ACTIVO",
      notas: "CORREGIDO 2026-09-22: se tenia como referencia sin clasificar (aparece en la exportacion a Vietnam del 09/07/2026). El prefijo BYF-PC se confirmo como familia de fuentes de alimentacion para el sistema de alarma: BYF-PC20X tiene datasheet propio confirmado en el catalogo publico Products de Maple Armor China ('BYF-PC20X Fire Alarm Power Supply'). '10X' probablemente indica menor capacidad que '20X'; no se encontro ficha propia de la variante 10X, se infiere por el mismo prefijo.",
    },
    {
      referencia: "BYF-PC20X",
      nombre: "Fire Alarm Power Supply",
      familia: "ACCESORIOS",
      generacion: SERIES2,
      estado: "ACTIVO",
      notas: "NUEVO 2026-09-22: confirmado con datasheet propio y descargable, sin restriccion, en el catalogo publico Products de Maple Armor China (categoria ASD, aunque es una fuente de alimentacion general del sistema, no especifica de deteccion por aspiracion).",
    },

    // ------------------------------------------------------ FireWatcher legacy
    { referencia: "FW105", nombre: "Panel FireWatcher (legacy)", familia: "PANELES", generacion: LEGACY, estado: "DESCONTINUADO", notas: "Antecesor del FW2105. La pagina canadiense aun muestra fichas legacy con revisiones 2023-2024. Reconstruir la cadena FireWatcher legacy -> MA Gen 2 -> Series 2." },
    { referencia: "FW106", nombre: "Panel FireWatcher (legacy)", familia: "PANELES", generacion: LEGACY, estado: "DESCONTINUADO" },
    { referencia: "FW106S", nombre: "Panel FireWatcher (legacy, variante S)", familia: "PANELES", generacion: LEGACY, estado: "DESCONTINUADO" },
    {
      referencia: "FW109",
      nombre: "Panel FireWatcher (legacy)",
      familia: "PANELES",
      generacion: LEGACY,
      estado: "DESCONTINUADO",
      notas: "CONFIRMADO 2026-09-22 por el articulo corporativo de Jade Bird (jbufa.com): panel tipo armario, LCD color de 7 pulgadas, procesador embebido de 32 bits, hasta 99 nodos en red. Configuracion base: 1x tarjeta FW327 (252 puntos) + 1x panel FW241 (8 circuitos multilinea); expandible a 16x FW327 (4032 puntos) y 8x FW241 (64 circuitos). Tambien tiene manual propio en el Resource Center de Maple Armor China ('FW109 User Manual', 'FW109 使用说明书').",
    },
    {
      referencia: "FW131",
      nombre: "NAC Booster",
      familia: "MODULOS",
      generacion: SERIES2,
      estado: "ACTIVO",
      descripcion: "Amplificador de circuito de notificacion (Notification Appliance Circuit Booster).",
      notas: "CORREGIDO 2026-09-22: el documento maestro original lo listaba como referencia FireWatcher legacy sin funcion confirmada. Confirmado por el Resource Center de Maple Armor China (listado como 'FW131 NAC BOOSTER' en Datasheets).",
    },
    { referencia: "FW511", nombre: "Detector fotoelectrico (legacy)", familia: "DETECTORES", generacion: LEGACY, estado: "DESCONTINUADO", notas: "Antecesor probable del FW2511; no asumir equivalencia." },
    { referencia: "FW521", nombre: "Detector termico (legacy)", familia: "DETECTORES", generacion: LEGACY, estado: "DESCONTINUADO", notas: "Antecesor probable del FW2521; no asumir equivalencia." },
    {
      referencia: "FW562",
      nombre: "Addressable Duct Smoke Detector",
      familia: "DETECTORES",
      generacion: SERIES2,
      estado: "ACTIVO",
      descripcion: "Detector de humo de ducto direccionable (编址型风管探测器).",
      notas: "CORREGIDO 2026-09-22: el documento maestro original lo listaba como referencia FireWatcher legacy sin funcion confirmada, en familia INDICADORES. Confirmado por el Resource Center de Maple Armor China como detector de ducto direccionable vigente.",
    },
    { referencia: "FW821", nombre: "Modulo de salida (legacy)", familia: "MODULOS", generacion: LEGACY, estado: "DESCONTINUADO", notas: "Funcion pendiente de confirmar." },
    { referencia: "FW851", nombre: "Aislador SLC (legacy)", familia: "MODULOS", generacion: LEGACY, estado: "DESCONTINUADO", notas: "Antecesor probable del FW2851; no asumir equivalencia." },
    { referencia: "FW963", nombre: "Dispositivo de notificacion (legacy)", familia: "NOTIFICACION", generacion: LEGACY, estado: "DESCONTINUADO" },
    { referencia: "FW983", nombre: "Dispositivo de notificacion (legacy)", familia: "NOTIFICACION", generacion: LEGACY, estado: "DESCONTINUADO" },

    // ---------------------------------------------------------------------------------------
    // NUEVO 2026-09-22 — confirmado por navegacion directa (Maple Armor Canada, Maple Armor
    // China, UL Product iQ, Jade Bird corporativo). Ver hallazgo hall-2026-09-22-verificacion.
    // ---------------------------------------------------------------------------------------

    // Telefonia de incendio y comunicacion de emergencia (familia no identificada en el documento maestro original)
    {
      referencia: "FW151",
      nombre: "Digital Voice Control Panel",
      familia: "TELEFONIA_EMERGENCIA",
      generacion: SERIES2,
      estado: "ACTIVO",
      descripcion: "Panel de control de voz digital para telefonia de incendio / comunicacion de emergencia.",
      notas: "Confirmado en el Resource Center de Maple Armor China ('FW151 Digital Voice Control Panel') y en UL Product iQ, expediente UOQY.S35947 (Emergency Communication and Relocation Equipment). Variantes vistas en UL: FW151-PS, FW151-AP, FW151-MIC, FW151-DK, FW151-DB.",
    },
    {
      referencia: "FW151-FP",
      nombre: "BlazeCom Fire Phone System",
      familia: "TELEFONIA_EMERGENCIA",
      generacion: SERIES2,
      estado: "ACTIVO",
      descripcion: "Sistema de telefono de incendio (Fire Phone) basado en el panel FW151. Nombre comercial confirmado 2026-09-22: 'BlazeCom'.",
      notas: "Confirmado con datasheet propio en el Resource Center de Maple Armor China ('FW151-FP Fire Telephone System', tambien listado como 'The FW151-FP DCP').",
    },
    { referencia: "FW451", nombre: "Accesorio de telefonia de incendio (funcion pendiente)", familia: "TELEFONIA_EMERGENCIA", generacion: SERIES2, estado: "PENDIENTE", notas: "Confirmado en UL Product iQ (UOQY.S35947) junto a la variante FW451-S. Funcion exacta pendiente de documentacion primaria." },
    { referencia: "FW863", nombre: "Accesorio de telefonia de incendio (funcion pendiente)", familia: "TELEFONIA_EMERGENCIA", generacion: SERIES2, estado: "PENDIENTE", notas: "Confirmado en UL Product iQ (UOQY.S35947) junto a la variante FW864A. Funcion exacta pendiente." },
    { referencia: "FW2423-3.9K", nombre: "Accesorio de telefonia de incendio (funcion pendiente)", familia: "TELEFONIA_EMERGENCIA", generacion: SERIES2, estado: "PENDIENTE", notas: "Confirmado en UL Product iQ (UOQY.S35947). El sufijo 3.9K sugiere una especificacion de resistencia (3.9 kOhm); confirmar con datasheet." },

    // Deteccion por aspiracion (PipeSense)
    {
      referencia: "FW2601",
      nombre: "PipeSense Addressable Aspirating Smoke Detector",
      familia: "ASPIRACION",
      generacion: SERIES2,
      estado: "ACTIVO",
      descripcion: "Detector de humo por aspiracion direccionable, linea PipeSense.",
      notas: "Confirmado con multiples documentos en el Resource Center de Maple Armor China: datasheet 'PipeSense Addressable Aspirating Smoke Detector', manual '美安 PipeSense 吸气式感烟探测器 FW2601 使用说明书' y solucion para cuartos de datos y cuartos frios. Distinto de FW2601-P / FW2601-P2(FM), que son referencias separadas sin confirmar su relacion exacta con este." },

    // Notificacion adicional
    { referencia: "FW2921", nombre: "Series Bells (Vibrating)", familia: "NOTIFICACION", generacion: SERIES2, estado: "ACTIVO", notas: "Confirmado en el Resource Center de Maple Armor China: 'FW2921 Series Bells (Vibrating) - FW2921 警铃（振动型）', timbre de notificacion de tipo vibratorio." },

    // FW2105C (variante de panel no listada en el documento maestro original)
    {
      referencia: "FW2105C",
      nombre: "Addressable Fire Alarm Control Panel, variante C",
      familia: "PANELES",
      generacion: SERIES2,
      estado: "NUEVO",
      notas: "Confirmado en el Resource Center de Maple Armor China: manual de usuario en ingles y chino ('FW2105C User Manual', 'FW2105C 火灾报警控制器-中文说明书'). No estaba en el documento maestro original; determinar la diferencia exacta con el FW2105 base.",
    },

    // Paneles legado listados por UL (S35910, expedientes UOJZ/UOJZ7) — no confundir con las
    // hipotesis FW105/106/106S/109 de mas arriba, que siguen sin confirmar en fuente primaria.
    // CAUTELA 2026-09-22: aparecer en un archivo UL no confirma que el producto este
    // descontinuado (ver hallazgo hall-ul-no-implica-legado); se baja a PENDIENTE.
    { referencia: "FW190", nombre: "Panel FireWatcher (generacion sin confirmar, confirmado UL)", familia: "PANELES", generacion: LEGACY, estado: "PENDIENTE", notas: "Confirmado en UL Product iQ S35910 (expedientes UOJZ/UOJZ7)." },
    { referencia: "FW201", nombre: "Panel FireWatcher (generacion sin confirmar, confirmado UL)", familia: "PANELES", generacion: LEGACY, estado: "PENDIENTE", notas: "Listado en UL Product iQ S35910. CORREGIDO 2026-09-22: bajado de DESCONTINUADO a PENDIENTE porque estar en un archivo UL no confirma que el producto este descontinuado (ver hallazgo hall-ul-no-implica-legado). Variantes UL: FW201B, FW201C, FW201S, FW201SC." },
    { referencia: "FW201B", nombre: "Panel FireWatcher (generacion sin confirmar, variante B)", familia: "PANELES", generacion: LEGACY, estado: "PENDIENTE", notas: "Listado en UL Product iQ S35910. CORREGIDO 2026-09-22: bajado de DESCONTINUADO a PENDIENTE porque estar en un archivo UL no confirma que el producto este descontinuado (ver hallazgo hall-ul-no-implica-legado)." },
    { referencia: "FW201C", nombre: "Panel FireWatcher (generacion sin confirmar, variante C)", familia: "PANELES", generacion: LEGACY, estado: "PENDIENTE", notas: "Listado en UL Product iQ S35910. CORREGIDO 2026-09-22: bajado de DESCONTINUADO a PENDIENTE porque estar en un archivo UL no confirma que el producto este descontinuado (ver hallazgo hall-ul-no-implica-legado)." },
    { referencia: "FW201S", nombre: "Panel FireWatcher (generacion sin confirmar, variante S)", familia: "PANELES", generacion: LEGACY, estado: "PENDIENTE", notas: "Listado en UL Product iQ S35910. CORREGIDO 2026-09-22: bajado de DESCONTINUADO a PENDIENTE porque estar en un archivo UL no confirma que el producto este descontinuado (ver hallazgo hall-ul-no-implica-legado)." },
    { referencia: "FW201SC", nombre: "Panel FireWatcher (generacion sin confirmar, variante SC)", familia: "PANELES", generacion: LEGACY, estado: "PENDIENTE", notas: "Listado en UL Product iQ S35910. CORREGIDO 2026-09-22: bajado de DESCONTINUADO a PENDIENTE porque estar en un archivo UL no confirma que el producto este descontinuado (ver hallazgo hall-ul-no-implica-legado)." },
    { referencia: "FW337", nombre: "Panel FireWatcher (generacion sin confirmar, confirmado UL)", familia: "PANELES", generacion: LEGACY, estado: "PENDIENTE", notas: "Listado en UL Product iQ S35910. CORREGIDO 2026-09-22: bajado de DESCONTINUADO a PENDIENTE porque estar en un archivo UL no confirma que el producto este descontinuado (ver hallazgo hall-ul-no-implica-legado). Posible relacion con el FW327 (tarjeta de lazo) descrito por Jade Bird; no asumir equivalencia." },
    { referencia: "FW397", nombre: "Panel FireWatcher (generacion sin confirmar, confirmado UL)", familia: "PANELES", generacion: LEGACY, estado: "PENDIENTE", notas: "Listado en UL Product iQ S35910. CORREGIDO 2026-09-22: bajado de DESCONTINUADO a PENDIENTE porque estar en un archivo UL no confirma que el producto este descontinuado (ver hallazgo hall-ul-no-implica-legado)." },
    { referencia: "FW327", nombre: "Tarjeta de lazo (ALU legacy) / posible panel", familia: "COMPONENTES_INTERNOS", generacion: LEGACY, estado: "DESCONTINUADO", notas: "Confirmado en UL Product iQ S35910 y descrito por Jade Bird (jbufa.com) como la tarjeta de salida de lazo del sistema FW109: 252 puntos por tarjeta, hasta 16 tarjetas = 4032 puntos. No asumir equivalencia directa con la referencia UL 'FW337'." },

    // Estaciones manuales — CORREGIDO 2026-09-22: no son legado. El catalogo publico "Products"
    // de Maple Armor China (distinto del Resource Center bloqueado) confirma FW722 y FW752 como
    // productos VIGENTES con datasheet propio y descargable. Se corrige toda la familia.
    {
      referencia: "FW721",
      nombre: "Estacion manual convencional, contacto N/A (hermano de FW722)",
      familia: "ESTACIONES_MANUALES",
      generacion: SERIES2,
      estado: "ACTIVO",
      notas: "CORREGIDO 2026-09-22: se habia clasificado como legado por aparecer en UL S35854 ('Boxes, Noncoded'); esa categoria NO implica descontinuado. FW722 (mismo grupo) tiene ficha vigente y descargable en maplearmor.cn/portal/tailorism. Variantes UL: FW721(NC), FW721C, FW721C(NC).",
    },
    { referencia: "FW721C", nombre: "Estacion manual convencional, variante C", familia: "ESTACIONES_MANUALES", generacion: SERIES2, estado: "ACTIVO", notas: "CORREGIDO 2026-09-22: ver nota de FW721." },
    {
      referencia: "FW722",
      nombre: "Addressable Manual Station",
      familia: "ESTACIONES_MANUALES",
      generacion: SERIES2,
      estado: "ACTIVO",
      descripcion: "Estacion manual direccionable, ADA compliant, contacto normalmente abierto (FW722 NC = normalmente cerrado). Listada segun UL 38 y ULC-S528.",
      notas: "CONFIRMADO 2026-09-22 con datasheet propio, descargable sin restriccion, en el catalogo publico Products de Maple Armor China (categoria Pull Stations). Distinta de la serie FW272X (mas nueva, un solo address en el ALU): FW722 es una estacion mas simple, tambien vigente.",
    },
    { referencia: "FW722C", nombre: "Addressable Manual Station, contacto normalmente cerrado", familia: "ESTACIONES_MANUALES", generacion: SERIES2, estado: "ACTIVO", notas: "CONFIRMADO 2026-09-22: mencionada en el datasheet de FW722 como 'FW722 NC'." },
    { referencia: "FW723", nombre: "Estacion manual convencional (hermano de FW722)", familia: "ESTACIONES_MANUALES", generacion: SERIES2, estado: "ACTIVO", notas: "CORREGIDO 2026-09-22: confirmado vigente en UL S35854 y en la pagina de productos de Maple Armor China ('FW723 手动火灾报警按钮'). Mismo grupo que FW722 (ver correccion)." },
    { referencia: "FW751", nombre: "Estacion manual no direccionable (hermano de FW752)", familia: "ESTACIONES_MANUALES", generacion: SERIES2, estado: "ACTIVO", notas: "CORREGIDO 2026-09-22: ver nota de FW752. Variante UL: FW751C." },
    { referencia: "FW751C", nombre: "Estacion manual no direccionable, variante C", familia: "ESTACIONES_MANUALES", generacion: SERIES2, estado: "ACTIVO", notas: "CORREGIDO 2026-09-22: ver nota de FW752." },
    {
      referencia: "FW752",
      nombre: "Non-Addressable Manual Pull Station",
      familia: "ESTACIONES_MANUALES",
      generacion: SERIES2,
      estado: "ACTIVO",
      descripcion: "Estacion manual NO direccionable (contacto simple), UL/ULC. Version convencional de la familia FW72X, para usarse con modulos de zona convencional (ej. FW2841) en vez de una direccion propia en el lazo.",
      notas: "CONFIRMADO 2026-09-22 con datasheet propio, descargable sin restriccion, en el catalogo publico Products de Maple Armor China. CORREGIDO: se habia clasificado como legado solo por aparecer en UL S35854 ('Boxes, Noncoded'); esa categoria describe el tipo de caja, no el estado de vigencia.",
    },
    { referencia: "FW752C", nombre: "Non-Addressable Manual Pull Station, variante C", familia: "ESTACIONES_MANUALES", generacion: SERIES2, estado: "ACTIVO", notas: "CORREGIDO 2026-09-22: ver nota de FW752." },

    // Notificacion visual listada por UL (S35539, 'Visual-signal Appliances'). Misma cautela.
    { referencia: "FW900R", nombre: "Dispositivo visual de notificacion (generacion sin confirmar, rojo)", familia: "NOTIFICACION", generacion: LEGACY, estado: "PENDIENTE", notas: "Listado en UL Product iQ S35539. CORREGIDO 2026-09-22: bajado de DESCONTINUADO a PENDIENTE (ver hallazgo hall-ul-no-implica-legado)." },
    { referencia: "FW900W", nombre: "Dispositivo visual de notificacion (generacion sin confirmar, blanco)", familia: "NOTIFICACION", generacion: LEGACY, estado: "PENDIENTE", notas: "Listado en UL Product iQ S35539. CORREGIDO 2026-09-22: bajado de DESCONTINUADO a PENDIENTE (ver hallazgo hall-ul-no-implica-legado)." },
    {
      referencia: "FW901R",
      nombre: "Horn/Strobe Base, variante rojo",
      familia: "BASES",
      generacion: SERIES2,
      estado: "ACTIVO",
      descripcion: "Base de montaje para dispositivos horn/strobe de notificacion, no el dispositivo de notificacion en si.",
      notas:
        "Listado en UL Product iQ S35539. CORREGIDO 2026-09-22: bajado de DESCONTINUADO a PENDIENTE (ver hallazgo hall-ul-no-implica-legado). CORREGIDO 2026-09-23: la lista de precios de distribucion BICO lo describe como 'HORN STROBE BASE' bajo categoria 'Base', no como el dispositivo visual de notificacion en si. Se reclasifica de NOTIFICACION/PENDIENTE a BASES/ACTIVO.",
    },
    {
      referencia: "FW901W",
      nombre: "Horn/Strobe Base, variante blanco",
      familia: "BASES",
      generacion: SERIES2,
      estado: "ACTIVO",
      descripcion: "Base de montaje para dispositivos horn/strobe de notificacion, no el dispositivo de notificacion en si.",
      notas:
        "Listado en UL Product iQ S35539. CORREGIDO 2026-09-22: bajado de DESCONTINUADO a PENDIENTE (ver hallazgo hall-ul-no-implica-legado). CORREGIDO 2026-09-23: la lista de precios de distribucion BICO lo describe como 'HORN STROBE BASE' bajo categoria 'Base', no como el dispositivo visual de notificacion en si. Se reclasifica de NOTIFICACION/PENDIENTE a BASES/ACTIVO.",
    },
    { referencia: "FW951", nombre: "Dispositivo visual de notificacion (generacion sin confirmar)", familia: "NOTIFICACION", generacion: LEGACY, estado: "PENDIENTE", notas: "Listado en UL Product iQ S35539. CORREGIDO 2026-09-22: bajado de DESCONTINUADO a PENDIENTE (ver hallazgo hall-ul-no-implica-legado)." },
    { referencia: "FW2900", nombre: "Serie de dispositivos visuales de notificacion", familia: "NOTIFICACION", generacion: SERIES2, estado: "PENDIENTE", notas: "UL Product iQ S35539 lista 'varios modelos de la serie FW2900' sin detallarlos todos (contenido truncado sin cuenta Product iQ). Posible solapamiento con la familia FW2961/2971/2981/2963/2973; no fusionar sin confirmar." },

    // Accesorios de control listados por UL (S35947, 'Control Unit Accessories'). CAUTELA
    // 2026-09-22: estar en este archivo UL NO implica que el producto este descontinuado (ver
    // hallazgo hall-ul-no-implica-legado). FW434/FW435 resultaron ser un producto VIGENTE.
    { referencia: "FW841", nombre: "Accesorio de panel (funcion pendiente, generacion sin confirmar)", familia: "MODULOS", generacion: LEGACY, estado: "PENDIENTE", notas: "Listado en UL Product iQ S35947 (UOXX.S35947, Control Unit Accessories, System). CORREGIDO 2026-09-22: se bajo de DESCONTINUADO a PENDIENTE porque estar en este archivo UL no confirma la era del producto (ver FW434/FW435, que resultaron vigentes)." },
    {
      referencia: "FW434",
      nombre: "Fire Alarm Module Box (par con FW435)",
      familia: "ACCESORIOS",
      generacion: SERIES2,
      estado: "ACTIVO",
      descripcion: "Caja/gabinete para montaje de modulos direccionables Series 2 en campo, UL/ULC.",
      notas: "CORREGIDO 2026-09-22: se habia clasificado como accesorio legado sin funcion confirmada. Confirmado vigente con datasheet propio y descargable en el catalogo publico Products de Maple Armor China: 'Fire Alarm Module Box - FW434/435 Fire Alarm Module Box, UL, ULC'.",
    },
    { referencia: "FW435", nombre: "Fire Alarm Module Box (par con FW434)", familia: "ACCESORIOS", generacion: SERIES2, estado: "ACTIVO", notas: "CORREGIDO 2026-09-22: ver nota de FW434. Misma ficha, mismo producto en dos referencias (probable variante de tamano o color)." },
    { referencia: "FW831", nombre: "Accesorio de panel (funcion pendiente, generacion sin confirmar)", familia: "MODULOS", generacion: LEGACY, estado: "PENDIENTE", notas: "Listado en UL Product iQ S35947. CORREGIDO 2026-09-22: bajado de DESCONTINUADO a PENDIENTE (ver hallazgo hall-ul-no-implica-legado)." },
    { referencia: "FW859", nombre: "Accesorio de panel (funcion pendiente, generacion sin confirmar)", familia: "MODULOS", generacion: LEGACY, estado: "PENDIENTE", notas: "Listado en UL Product iQ S35947. CORREGIDO 2026-09-22: bajado de DESCONTINUADO a PENDIENTE (ver hallazgo hall-ul-no-implica-legado)." },
    { referencia: "FW121", nombre: "Accesorio de panel (generacion sin confirmar, funcion pendiente)", familia: "MODULOS", generacion: LEGACY, estado: "PENDIENTE", notas: "Listado en UL Product iQ S35947. CORREGIDO 2026-09-22: bajado de DESCONTINUADO a PENDIENTE (ver hallazgo hall-ul-no-implica-legado). Variante UL: FW121C." },
    { referencia: "FW121C", nombre: "Accesorio de panel (generacion sin confirmar, variante C)", familia: "MODULOS", generacion: LEGACY, estado: "PENDIENTE", notas: "Listado en UL Product iQ S35947. CORREGIDO 2026-09-22: bajado de DESCONTINUADO a PENDIENTE (ver hallazgo hall-ul-no-implica-legado)." },
    { referencia: "FW122R", nombre: "Accesorio de panel (generacion sin confirmar, variante R)", familia: "MODULOS", generacion: LEGACY, estado: "PENDIENTE", notas: "Listado en UL Product iQ S35947. CORREGIDO 2026-09-22: bajado de DESCONTINUADO a PENDIENTE (ver hallazgo hall-ul-no-implica-legado). Variantes UL: FW122CR, FW122W, FW122CW." },
    { referencia: "FW122CR", nombre: "Accesorio de panel (generacion sin confirmar, variante CR)", familia: "MODULOS", generacion: LEGACY, estado: "PENDIENTE", notas: "Listado en UL Product iQ S35947. CORREGIDO 2026-09-22: bajado de DESCONTINUADO a PENDIENTE (ver hallazgo hall-ul-no-implica-legado)." },
    { referencia: "FW122W", nombre: "Accesorio de panel (generacion sin confirmar, variante W)", familia: "MODULOS", generacion: LEGACY, estado: "PENDIENTE", notas: "Listado en UL Product iQ S35947. CORREGIDO 2026-09-22: bajado de DESCONTINUADO a PENDIENTE (ver hallazgo hall-ul-no-implica-legado)." },
    { referencia: "FW122CW", nombre: "Accesorio de panel (generacion sin confirmar, variante CW)", familia: "MODULOS", generacion: LEGACY, estado: "PENDIENTE", notas: "Listado en UL Product iQ S35947. CORREGIDO 2026-09-22: bajado de DESCONTINUADO a PENDIENTE (ver hallazgo hall-ul-no-implica-legado)." },
    { referencia: "FW123", nombre: "Accesorio de panel (generacion sin confirmar, funcion pendiente)", familia: "MODULOS", generacion: LEGACY, estado: "PENDIENTE", notas: "Listado en UL Product iQ S35947. CORREGIDO 2026-09-22: bajado de DESCONTINUADO a PENDIENTE (ver hallazgo hall-ul-no-implica-legado). Variante UL: FW123C." },
    { referencia: "FW123C", nombre: "Accesorio de panel (generacion sin confirmar, variante C)", familia: "MODULOS", generacion: LEGACY, estado: "PENDIENTE", notas: "Listado en UL Product iQ S35947. CORREGIDO 2026-09-22: bajado de DESCONTINUADO a PENDIENTE (ver hallazgo hall-ul-no-implica-legado)." },

    // Referencia legado adicional citada por Jade Bird corporativo (arquitectura del sistema FW109)
    { referencia: "FW241", nombre: "Panel multilinea de control (legacy)", familia: "COMPONENTES_INTERNOS", generacion: LEGACY, estado: "DESCONTINUADO", notas: "Descrito por Jade Bird (jbufa.com) como el panel de control multilinea del sistema FW109: 8 circuitos por unidad, hasta 8 unidades = 64 circuitos." },

    // ---------------------------------------------------------------------------------------
    // NUEVO 2026-09-22 (segunda pasada) — descubierto en el catalogo publico "Products" de
    // Maple Armor China (maplearmor.cn/portal/tailorism, distinto del Resource Center bloqueado
    // por codigo de canje). Cada uno tiene datasheet propio confirmado y descargable sin
    // restriccion. Ver hallazgo hall-china-products-publico.
    // ---------------------------------------------------------------------------------------
    { referencia: "MA-WFS", nombre: "Waterflow Switch", familia: "ACCESORIOS", generacion: SERIES2, estado: "NUEVO", notas: "Interruptor de flujo de agua (waterflow), para sistemas de rociadores. Familia nueva no identificada en el documento maestro original." },
    { referencia: "MA-WFS-CT", nombre: "Waterflow Switch, variante CT", familia: "ACCESORIOS", generacion: SERIES2, estado: "NUEVO", notas: "Variante del MA-WFS; determinar diferencia exacta (posible tamano de tuberia)." },
    { referencia: "MA-OSY-1", nombre: "OS&Y Supervisory Switch", familia: "ACCESORIOS", generacion: SERIES2, estado: "NUEVO", notas: "Interruptor de supervision para valvulas tipo OS&Y (Outside Screw and Yoke) en sistemas de rociadores." },
    {
      referencia: "OLAD-RC",
      nombre: "Open Large Area Detection with Remote Control",
      familia: "DETECTORES",
      generacion: SERIES2,
      estado: "NUEVO",
      descripcion: "Detector de haz (beam detector) para areas grandes y abiertas, con control remoto.",
      notas: "Familia 'Beam Detectors' nueva, no identificada en el documento maestro original.",
    },
    {
      referencia: "VFD-SFH-MA-DG06",
      nombre: "Video Fire Detector",
      familia: "DETECTORES",
      generacion: SERIES2,
      estado: "NUEVO",
      descripcion: "Detector de incendio basado en analisis de video (VFD / SFH-MA-DG06).",
      notas: "Categoria de producto enteramente nueva, no identificada en el documento maestro original ni en ninguna otra fuente revisada.",
    },
    { referencia: "FW2981R-WP", nombre: "Conventional Waterproof Strobe", familia: "NOTIFICACION", generacion: SERIES2, estado: "NUEVO", notas: "Variante resistente al agua del strobe FW2981 (convencional, no direccionable). Confirmada con datasheet propio en el catalogo publico Products." },

    // Linea de telefonia de incendio convencional con nomenclatura HY (distinta de la familia
    // FW151/FW151-FP), bajo la misma categoria 'Voice Alarm & Fire Phone' del sitio chino.
    { referencia: "HY2711E", nombre: "Conventional Fire Phone Panel", familia: "TELEFONIA_EMERGENCIA", generacion: SERIES2, estado: "NUEVO", notas: "Nomenclatura HY (no FW), linea de telefono de incendio convencional. Confirmado con datasheet propio en el catalogo publico Products de Maple Armor China." },
    { referencia: "HY2712D", nombre: "Conventional Fire Phone Extension", familia: "TELEFONIA_EMERGENCIA", generacion: SERIES2, estado: "NUEVO", notas: "Extension del sistema de telefono de incendio convencional HY271X. Confirmado con datasheet propio." },
    { referencia: "HY2713", nombre: "Portable Fire Telephone Extension", familia: "TELEFONIA_EMERGENCIA", generacion: SERIES2, estado: "NUEVO", notas: "Extension portatil del sistema de telefono de incendio HY271X. Confirmado con datasheet propio." },
    { referencia: "HY2714D", nombre: "Conventional Fire Phone Jack", familia: "TELEFONIA_EMERGENCIA", generacion: SERIES2, estado: "NUEVO", notas: "Toma (jack) del sistema de telefono de incendio convencional HY271X. Confirmado con datasheet propio." },
    { referencia: "HY6355(EX)", nombre: "Explosion-Proof Fire Phone Extension", familia: "TELEFONIA_EMERGENCIA", generacion: SERIES2, estado: "NUEVO", notas: "Extension de telefono de incendio a prueba de explosion, para zonas clasificadas (industria/petroquimica). Listada en el catalogo publico Products, sin datasheet descargable visible." },

    // -- Nuevos SKU revelados por manuales oficiales recibidos directamente (2026-09-23) --
    { referencia: "FW2724", nombre: "Intelligent Manual Pull Station (hermano de FW2721)", familia: "ESTACIONES_MANUALES", generacion: SERIES2, estado: "NUEVO", notas: "NUEVO 2026-09-23: revelado en el manual oficial DOC-FW272X-UM-R1.2 junto a FW2721 (agrupados como FW2721/FW2724). Determinar diferencia exacta (posible variante de contacto o color)." },
    { referencia: "FW2725", nombre: "Intelligent Manual Pull Station (hermano de FW2722)", familia: "ESTACIONES_MANUALES", generacion: SERIES2, estado: "NUEVO", notas: "NUEVO 2026-09-23: revelado en el manual oficial DOC-FW272X-UM-R1.2 junto a FW2722 (agrupados como FW2722/FW2725). Determinar diferencia exacta (posible variante de contacto o color)." },
    { referencia: "FW2726", nombre: "Intelligent Manual Pull Station (hermano de FW2723)", familia: "ESTACIONES_MANUALES", generacion: SERIES2, estado: "NUEVO", notas: "NUEVO 2026-09-23: revelado en el manual oficial DOC-FW272X-UM-R1.2 junto a FW2723 (agrupados como FW2723/FW2726). Determinar diferencia exacta (posible variante de contacto o color)." },
    { referencia: "FW2963W", nombre: "Low Frequency Horn Strobe, variante blanco", familia: "NOTIFICACION", generacion: SERIES2, estado: "NUEVO", notas: "NUEVO 2026-09-23: SKU especifico revelado en el manual oficial DOC-FW29X3-UM-R1.0, variante de color (blanco) del generico FW2963." },
    { referencia: "FW2963R", nombre: "Low Frequency Horn Strobe, variante rojo", familia: "NOTIFICACION", generacion: SERIES2, estado: "NUEVO", notas: "NUEVO 2026-09-23: SKU especifico revelado en el manual oficial DOC-FW29X3-UM-R1.0, variante de color (rojo) del generico FW2963." },
    { referencia: "FW2973W", nombre: "Low Frequency Horn, variante blanco", familia: "NOTIFICACION", generacion: SERIES2, estado: "NUEVO", notas: "NUEVO 2026-09-23: SKU especifico revelado en el manual oficial DOC-FW29X3-UM-R1.0, variante de color (blanco) del generico FW2973." },
    { referencia: "FW2973R", nombre: "Low Frequency Horn, variante rojo", familia: "NOTIFICACION", generacion: SERIES2, estado: "NUEVO", notas: "NUEVO 2026-09-23: SKU especifico revelado en el manual oficial DOC-FW29X3-UM-R1.0, variante de color (rojo) del generico FW2973." },
    { referencia: "FW2961R", nombre: "Horn Strobe, variante rojo", familia: "NOTIFICACION", generacion: SERIES2, estado: "NUEVO", notas: "NUEVO 2026-09-23: SKU especifico revelado en el manual oficial DOC-FW29X1-UM-R1.4, variante de color (rojo) del generico FW2961." },
    { referencia: "FW2961W", nombre: "Horn Strobe, variante blanco", familia: "NOTIFICACION", generacion: SERIES2, estado: "NUEVO", notas: "NUEVO 2026-09-23: SKU especifico revelado en el manual oficial DOC-FW29X1-UM-R1.4, variante de color (blanco) del generico FW2961." },
    { referencia: "FW2971R", nombre: "Horn, variante rojo", familia: "NOTIFICACION", generacion: SERIES2, estado: "NUEVO", notas: "NUEVO 2026-09-23: SKU especifico revelado en el manual oficial DOC-FW29X1-UM-R1.4, variante de color (rojo) del generico FW2971." },
    { referencia: "FW2971W", nombre: "Horn, variante blanco", familia: "NOTIFICACION", generacion: SERIES2, estado: "NUEVO", notas: "NUEVO 2026-09-23: SKU especifico revelado en el manual oficial DOC-FW29X1-UM-R1.4, variante de color (blanco) del generico FW2971." },
    { referencia: "FW2981R", nombre: "Strobe, variante rojo", familia: "NOTIFICACION", generacion: SERIES2, estado: "NUEVO", notas: "NUEVO 2026-09-23: SKU especifico revelado en el manual oficial DOC-FW29X1-UM-R1.4, variante de color (rojo) del generico FW2981." },
    { referencia: "FW2981W", nombre: "Strobe, variante blanco", familia: "NOTIFICACION", generacion: SERIES2, estado: "NUEVO", notas: "NUEVO 2026-09-23: SKU especifico revelado en el manual oficial DOC-FW29X1-UM-R1.4, variante de color (blanco) del generico FW2981." },
    {
      referencia: "S2-CONFIGURATOR",
      nombre: "S2 Configurator (software de programacion)",
      familia: "ACCESORIOS",
      generacion: SERIES2,
      estado: "ACTIVO",
      descripcion: "Software de PC para programar paneles Series 2 (carga/descarga de proyecto, mapeo de zonas, logica).",
      notas: "NUEVO 2026-09-23: manual de programacion oficial (DOC-S2 Configurator-PM-R1.1, 62 paginas, 2026-02-01) y el instalador (.exe, 188MB, no copiado por tamano) recibidos directamente de Maple Armor.",
    },

    // -- Referencias reveladas por la lista de precios de distribucion BICO (2026-09-23) --
    {
      referencia: "FW2202",
      nombre: "Advanced Machine Interface (AMI), variante FW2202",
      familia: "COMPONENTES_INTERNOS",
      generacion: SERIES2,
      estado: "PENDIENTE",
      notas:
        "NUEVO 2026-09-23: aparece en la lista de precios de distribucion BICO como 'ADVANCED MACHINE INTERFACE (AMI)', la misma descripcion que el FW2201 ya confirmado. Regla 2 (no asumir equivalencias): se registra como referencia separada hasta confirmar con el fabricante si es un error de digitacion del proveedor o una variante real distinta de FW2201. Ver hallazgo de discrepancia.",
    },
    {
      referencia: "FW2371-4",
      nombre: "Connector Board, variante 4",
      familia: "COMPONENTES_INTERNOS",
      generacion: SERIES2,
      estado: "ACTIVO",
      notas:
        "NUEVO 2026-09-23 como producto propio (antes solo mencionada en notas de FW2371): confirmada con datasheet propio en el Resource Center de Maple Armor China y ahora tambien con precio propio en la lista de distribucion BICO.",
    },
    {
      referencia: "FW2701",
      nombre: "Surface Mount Box",
      familia: "BASES",
      generacion: SERIES2,
      estado: "NUEVO",
      notas: "NUEVO 2026-09-23: revelado por la lista de precios de distribucion BICO, categoria interna 'Base'. Falta confirmar para que dispositivo especifico es esta caja de montaje superficial.",
    },
    {
      referencia: "JBF 295K",
      nombre: "Optical Fiber Card",
      familia: "COMPONENTES_INTERNOS",
      generacion: SERIES2,
      estado: "NUEVO",
      notas:
        "NUEVO 2026-09-23: revelado por la lista de precios de distribucion BICO. Nomenclatura 'JBF' (Jade Bird Fire) en vez del prefijo 'FW' habitual de Series 2 -- tarjeta de fibra optica para red de paneles, funcion exacta y compatibilidad pendientes de confirmar con fuente primaria adicional.",
    },
    {
      referencia: "FW2131",
      nombre: "Battery Box (55AH)",
      familia: "ACCESORIOS",
      generacion: SERIES2,
      estado: "NUEVO",
      notas: "NUEVO 2026-09-23: revelado por la lista de precios de distribucion BICO. Caja de baterias externa, capacidad 55AH.",
    },
  ],
  compatibilidades: [
    { referencia: "FW2511", compatibles: ["FW2501", "FW2502", "FW2509", "FW2105", "FW2107"], nota: "Segun datasheet DOC-12511 Rev 0.2." },
    { referencia: "FW2521", compatibles: ["FW2501"], nota: "Segun ficha del FW2501." },
    { referencia: "FW2508", compatibles: ["FW2105", "FW2107"], nota: "Segun datasheet DOC-12508 Rev 0.1." },
    { referencia: "FW2561-RI", compatibles: ["FW2811M", "FW2511", "FW2521"], nota: "Segun Maple Armor China y UL." },
    { referencia: "FW2731", compatibles: ["FW2107", "FW2107M"], nota: "Segun datasheet DOC-12731 Rev 0.1." },
  ],
  documentos: [
    // Datasheets Series 2 (Maple Armor Canada) — verificados 2026-09-22, enlaces reales
    { clave: "ma-doc-12105-r0.2", tipo: "DATASHEET", titulo: "FW2105 Addressable Fire Alarm Control Panel - Datasheet", fuente: F_CANADA, codigo: "DOC-12105", revision: "Rev 0.2", fechaEmision: "06/2025", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "https://www.maplearmor.com/assets/docs/DOC-12105-Addressable-Fire-Alarm-Control-Panel.pdf", referencias: ["FW2105"], notas: "Declara explicitamente compatibilidad con Series 2. Enlace de descarga verificado 2026-09-22." },
    { clave: "ma-doc-12107-r-verif", tipo: "DATASHEET", titulo: "FW2107 Addressable Fire & Release Control Panel - Datasheet", fuente: F_CANADA, codigo: "DOC-12107", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "https://www.maplearmor.com/assets/docs/DOC-12107-Addressable-Fire-and-Release-Control-Panel.pdf", referencias: ["FW2107"], notas: "Enlace de descarga verificado 2026-09-22." },
    { clave: "ma-fw2105-manual-2023", tipo: "MANUAL_INSTALACION", titulo: "FW2105 - Manual (edicion 2023)", fuente: F_CANADA, fechaEmision: "2023", idioma: "EN", confianza: "PROBABLE", referencias: ["FW2105"], notas: "Manual 2023 identificado en la investigacion; no aparece en products.html (solo datasheets). Puede vivir detras de 'Partner Sign In'." },
    { clave: "ma-fw2105-china", tipo: "MANUAL_USUARIO", titulo: "FW2105 / FW2105C - Manuales de usuario y en chino", fuente: F_CHINA, idioma: "ZH", confianza: "PROBABLE", referencias: ["FW2105", "FW2105C"], notas: "Confirmado listado en el Resource Center de Maple Armor China. Descarga bloqueada por codigo de canje." },
    { clave: "ma-fw2107m-ds-r0.0", tipo: "DATASHEET", titulo: "FW2107M Mini Fire & Release Control Panel - Datasheet", fuente: F_CANADA, codigo: "DOC-12107M", revision: "Rev 0.0", fechaEmision: "10/2025", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "https://www.maplearmor.com/assets/docs/DOC-12107M-Addressable-Mini-Fire-and-Release-Control-Panel.pdf", referencias: ["FW2107M"], notas: "Enlace de descarga verificado 2026-09-22." },
    { clave: "ma-doc-12121-r0.3", tipo: "DATASHEET", titulo: "FW2121 Remote LCD Annunciator - Datasheet", fuente: F_CANADA, codigo: "DOC-12121", revision: "Rev 0.3", fechaEmision: "09/2025", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "https://www.maplearmor.com/assets/docs/DOC-12121-Remote-LCD-Annunciator.pdf", referencias: ["FW2121"], notas: "Enlace verificado 2026-09-22." },
    { clave: "ma-doc-12129-r0.2", tipo: "DATASHEET", titulo: "FW2129 Remote LED Annunciator - Datasheet", fuente: F_CANADA, codigo: "DOC-12129", revision: "Rev 0.2", fechaEmision: "08/2025", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "https://www.maplearmor.com/assets/docs/DOC-12129-Remote-LED-Annunciator.pdf", referencias: ["FW2129"], notas: "Enlace verificado 2026-09-22." },
    { clave: "ma-doc-12511-r0.2", tipo: "DATASHEET", titulo: "FW2511 Addressable Photoelectric Smoke Detector - Datasheet", fuente: F_CANADA, codigo: "DOC-12511", revision: "Rev 0.2", fechaEmision: "06/2025", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "https://www.maplearmor.com/assets/docs/DOC-12511-Photoelectric-Smoke-Detector.pdf", referencias: ["FW2511"], notas: "Enlace verificado 2026-09-22." },
    { clave: "ma-doc-12521-r-verif", tipo: "DATASHEET", titulo: "FW2521 Heat Detector - Datasheet", fuente: F_CANADA, codigo: "DOC-12521", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "https://www.maplearmor.com/assets/docs/DOC-12521-Heat-Detector.pdf", referencias: ["FW2521"], notas: "Enlace de descarga verificado 2026-09-22." },
    { clave: "ma-doc-12508-r0.1", tipo: "DATASHEET", titulo: "FW2508 520 Hz Sounder Base - Datasheet", fuente: F_CANADA, codigo: "DOC-12508", revision: "Rev 0.1", fechaEmision: "08/2025", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "https://www.maplearmor.com/assets/docs/DOC-12508-Sounder-Base-520Hz.pdf", referencias: ["FW2508"], notas: "Enlace verificado 2026-09-22." },
    { clave: "ma-doc-12509-r-verif", tipo: "DATASHEET", titulo: "FW2509 Sounder Base - Datasheet", fuente: F_CANADA, codigo: "DOC-12509", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "https://www.maplearmor.com/assets/docs/DOC-12509-Sounder-Base.pdf", referencias: ["FW2509"], notas: "Enlace de descarga verificado 2026-09-22." },
    { clave: "ma-doc-12721-r0.2", tipo: "DATASHEET", titulo: "FW2721 / FW2722 / FW2723 Addressable Manual Stations - Datasheet conjunto", fuente: F_CANADA, codigo: "DOC-12721", revision: "Rev 0.2", fechaEmision: "06/2025", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "https://www.maplearmor.com/assets/docs/DOC-12721-Manual-Stations.pdf", referencias: ["FW2721", "FW2722", "FW2723"], notas: "Enlace verificado 2026-09-22." },
    { clave: "ma-doc-12731-r0.1", tipo: "DATASHEET", titulo: "FW2731 Manual Release Station - Datasheet", fuente: F_CANADA, codigo: "DOC-12731", revision: "Rev 0.1", fechaEmision: "08/2025", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "https://www.maplearmor.com/assets/docs/DOC-12731-Manual-Release-Station.pdf", referencias: ["FW2731"], notas: "Confirma: direccionable, 1 address SLC, Form C N/O-N/C, single action, UL 38, ULC-S528. Enlace verificado 2026-09-22." },
    { clave: "ma-doc-12732-r-verif", tipo: "DATASHEET", titulo: "FW2732 Abort Switch - Datasheet", fuente: F_CANADA, codigo: "DOC-12732", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "https://www.maplearmor.com/assets/docs/DOC-12732-Abort-Switch.pdf", referencias: ["FW2732"], notas: "Enlace de descarga verificado 2026-09-22." },
    { clave: "ma-doc-12733-r-verif", tipo: "DATASHEET", titulo: "FW2733 Disconnect Switch - Datasheet", fuente: F_CANADA, codigo: "DOC-12733", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "https://www.maplearmor.com/assets/docs/DOC-12733-Disconnect-Switch.pdf", referencias: ["FW2733"], notas: "Enlace de descarga verificado 2026-09-22." },
    { clave: "ma-doc-12734-r-verif", tipo: "DATASHEET", titulo: "FW2734 Main/Reserve Switch - Datasheet", fuente: F_CANADA, codigo: "DOC-12734", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "https://www.maplearmor.com/assets/docs/DOC-12734-Main-Reserve-Switch.pdf", referencias: ["FW2734"], notas: "Enlace de descarga verificado 2026-09-22." },
    { clave: "ma-doc-12811-r0.2", tipo: "DATASHEET", titulo: "FW2811 Input Module - Datasheet", fuente: F_CANADA, codigo: "DOC-12811", revision: "Rev 0.2", fechaEmision: "06/2025", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "https://www.maplearmor.com/assets/docs/DOC-12811-Input-Module.pdf", referencias: ["FW2811"], notas: "Enlace verificado 2026-09-22." },
    { clave: "ma-doc-12811m-r-verif", tipo: "DATASHEET", titulo: "FW2811M Mini Input Module - Datasheet", fuente: F_CANADA, codigo: "DOC-12811M", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "https://www.maplearmor.com/assets/docs/DOC-12811M-Mini-Input-Module.pdf", referencias: ["FW2811M"], notas: "Enlace de descarga verificado 2026-09-22." },
    { clave: "ma-doc-12812-r-verif", tipo: "DATASHEET", titulo: "FW2812 Dual Input Module - Datasheet", fuente: F_CANADA, codigo: "DOC-12812", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "https://www.maplearmor.com/assets/docs/DOC-12812-Dual-Input-Module.pdf", referencias: ["FW2812"], notas: "Enlace de descarga verificado 2026-09-22." },
    { clave: "ma-doc-12821-r-verif", tipo: "DATASHEET", titulo: "FW2821 Supervised Output Module - Datasheet", fuente: F_CANADA, codigo: "DOC-12821", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "https://www.maplearmor.com/assets/docs/DOC-12821-Supervised-Output-Module.pdf", referencias: ["FW2821"], notas: "Enlace de descarga verificado 2026-09-22." },
    { clave: "ma-doc-12822-r-verif", tipo: "DATASHEET", titulo: "FW2822 Releasing Module - Datasheet", fuente: F_CANADA, codigo: "DOC-12822", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "https://www.maplearmor.com/assets/docs/DOC-12822-Releasing-Module.pdf", referencias: ["FW2822"], notas: "Enlace de descarga verificado 2026-09-22." },
    { clave: "ma-doc-12831-r-verif", tipo: "DATASHEET", titulo: "FW2831 Relay Module - Datasheet", fuente: F_CANADA, codigo: "DOC-12831", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "https://www.maplearmor.com/assets/docs/DOC-12831-Relay-Module.pdf", referencias: ["FW2831"], notas: "Enlace de descarga verificado 2026-09-22." },
    { clave: "ma-doc-12841-r-verif", tipo: "DATASHEET", titulo: "FW2841 Conventional Zone Module - Datasheet", fuente: F_CANADA, codigo: "DOC-12841", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "https://www.maplearmor.com/assets/docs/DOC-12841-Conventional-Zone-Module.pdf", referencias: ["FW2841"], notas: "Enlace de descarga verificado 2026-09-22." },
    { clave: "ma-doc-12851-r-verif", tipo: "DATASHEET", titulo: "FW2851 Isolator Module - Datasheet", fuente: F_CANADA, codigo: "DOC-12851", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "https://www.maplearmor.com/assets/docs/DOC-12851-Isolator-Module.pdf", referencias: ["FW2851"], notas: "Enlace de descarga verificado 2026-09-22." },
    { clave: "ma-ds3112-1", tipo: "DATASHEET", titulo: "FW2961 / FW2971 / FW2981 Horn, Strobe, Horn/Strobe - Datasheet internacional anterior", fuente: F_CANADA, codigo: "DS3112-1", idioma: "EN", confianza: "PROBABLE", referencias: ["FW2961", "FW2971", "FW2981"], notas: "Generacion documental anterior a DOC-12961; no encontrada en la web publica actual." },
    { clave: "ma-doc-12961-r0.2", tipo: "DATASHEET", titulo: "FW2961 Horn & Strobe Notification - Datasheet", fuente: F_CANADA, codigo: "DOC-12961", revision: "Rev 0.2", fechaEmision: "06/2025", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "https://www.maplearmor.com/assets/docs/DOC-12961-Notification-Appliances.pdf", referencias: ["FW2961", "FW2971", "FW2981"], notas: "Enlace verificado 2026-09-22." },
    { clave: "ma-doc-12963-r0.2", tipo: "DATASHEET", titulo: "FW2963 Low-Frequency Notification (520 Hz) - Datasheet", fuente: F_CANADA, codigo: "DOC-12963", revision: "Rev 0.2", fechaEmision: "2025", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "https://www.maplearmor.com/assets/docs/DOC-12963-Low-Frequency-Notification-Appliances.pdf", referencias: ["FW2963", "FW2973"], notas: "Enlace verificado 2026-09-22." },
    { clave: "ma-doc-12972-r0.1", tipo: "DATASHEET", titulo: "FW2972 Mini Horn - Datasheet", fuente: F_CANADA, codigo: "DOC-12972", revision: "Rev 0.1", fechaEmision: "05/2025", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "https://www.maplearmor.com/assets/docs/DOC-12972-Mini-Horn-Notification-Appliances.pdf", referencias: ["FW2972", "FW2972MSW", "FW2972MSR", "FW2972MW", "FW2972MR"], notas: "Enlace verificado 2026-09-22." },

    // UL (verificado por busqueda directa, 2026-09-22)
    { clave: "ul-s35910", tipo: "LISTADO_UL", titulo: "UL Product iQ - S35910, Control Units System / Releasing Device (Maple Armor)", fuente: F_UL, codigo: "S35910", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "https://productiq.ulprospector.com/en/profile/7444277/uojz.s35910", referencias: ["FW2331", "FW2201", "FW2361", "FW190", "FW201", "FW337", "FW397", "FW2321-1", "FW2261", "FW2191"], notas: "4 documentos bajo este numero. Lista de modelos truncada sin cuenta Product iQ." },
    { clave: "ul-s35947", tipo: "LISTADO_UL", titulo: "UL Product iQ - S35947, Control Unit Accessories / Emergency Communication (Maple Armor)", fuente: F_UL, codigo: "S35947", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "https://productiq.ulprospector.com/en/profile/8235239/uoqy.s35947", referencias: ["FW151", "FW451", "FW863"], notas: "5 documentos bajo este numero. Revelo la familia de telefonia de incendio." },
    { clave: "ul-s35539", tipo: "LISTADO_UL", titulo: "UL Product iQ - S35539, Visual-signal Appliances (Maple Armor)", fuente: F_UL, codigo: "S35539", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "https://productiq.ulprospector.com/en/profile/154934/uvav.s35539", referencias: ["FW900R", "FW951", "FW2900"], notas: "NUEVO 2026-09-22, no estaba en el documento maestro original." },
    { clave: "ul-s35854", tipo: "LISTADO_UL", titulo: "UL Product iQ - S35854, Boxes Noncoded (Maple Armor)", fuente: F_UL, codigo: "S35854", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "https://productiq.ulprospector.com/en/profile/236734/uniu.s35854", referencias: ["FW721", "FW723", "FW751"], notas: "NUEVO 2026-09-22, no estaba en el documento maestro original." },

    // Jade Bird - repositorio interno
    { clave: "jb-catalogo-2019", tipo: "CATALOGO", titulo: "Maple Armor Catalog 2019.10.22", fuente: F_JADE, fechaEmision: "2019-10-22", idioma: "EN", confianza: "PROBABLE", notas: "Catalogo historico." },
    { clave: "jb-catalogo-ma-gen2", tipo: "CATALOGO", titulo: "MA Gen 2 Catalog (美安产品手册-MA 二代 Catalog-最新版1)", fuente: F_JADE, idioma: "ZH", confianza: "PROBABLE", notas: "Catalogo de la segunda generacion Maple Armor." },
    { clave: "jb-manual-seleccion", tipo: "CATALOGO", titulo: "Manual de seleccion de productos Maple Armor, nueva version (美安产品选型手册（新版）)", fuente: F_JADE, idioma: "ZH", confianza: "PROBABLE" },
    { clave: "jb-guia-aplicacion-firewatcher", tipo: "GUIA_APLICACION", titulo: "FireWatcher - Guia de aplicacion y diseno (美安firewatcher-产品应用设计说明1)", fuente: F_JADE, idioma: "ZH", confianza: "PROBABLE" },
    { clave: "jb-brochure-ul-3c", tipo: "BROCHURE", titulo: "Brochure UL a 3C para distribuidores (美安产品介绍UL转3C画册-经销商)", fuente: F_JADE, idioma: "ZH", confianza: "PROBABLE" },
    { clave: "jb-casos-canada", tipo: "CASO_ESTUDIO", titulo: "Casos de proyectos en Canada, 3 casos (加拿大项目案例-3个案例)", fuente: F_JADE, idioma: "ZH", confianza: "PROBABLE" },
    { clave: "jb-embalaje-ul", tipo: "OTRO", titulo: "Dimensiones y pesos de embalaje de productos UL (UL产品包装尺寸及重量信息汇总(2).xlsx)", fuente: F_JADE, idioma: "ZH", confianza: "PROBABLE" },
    { clave: "jb-precios-pb31041-v4", tipo: "LISTA_PRECIOS", titulo: "PB31041 V4 - Precio estandar sistema de alarma de incendio Maple Armor (美安消防报警系统标准价格)", fuente: F_JADE, codigo: "PB31041 V4", idioma: "ZH", confianza: "PROBABLE" },
    { clave: "jb-precios-pb31041-v4-2024-07-31", tipo: "LISTA_PRECIOS", titulo: "PB31041 V4 - Precio estandar con descuento 0.0845 (2024.7.31)", fuente: F_JADE, codigo: "PB31041 V4", fechaEmision: "2024-07-31", idioma: "ZH", confianza: "PROBABLE" },
    { clave: "jb-precios-liquidacion-2022", tipo: "LISTA_PRECIOS", titulo: "Lista de precios serie EN Maple Armor / Jade Bird - precio estandar de liquidacion 2022 (美安-青鸟消防EN系列产品价格表 标准结算价 2022)", fuente: F_JADE, fechaEmision: "2022", idioma: "ZH", confianza: "PROBABLE", notas: "PRIORIDAD MAXIMA para estimar precios de fabrica." },

    // Jade Bird corporativo — verificado 2026-09-22
    { clave: "jbc-articulo-maple-armor", tipo: "OTRO", titulo: "Maple Armor（美安）| Fire Watcher系列智能火灾自动报警控制系统", fuente: F_JADE_CORP, fechaEmision: "2020-12-01", idioma: "ZH", confianza: "CONFIRMADO", urlOrigen: "https://www.jbufa.com/news/info.html?id=133", referencias: ["FW109", "FW327", "FW241"], notas: "Articulo corporativo oficial, leido integramente. Confirma la relacion Maple Armor <-> Jade Bird." },

    // Resource Center de Maple Armor China — items confirmados por titulo; descarga bloqueada por codigo de canje.
    { clave: "cn-ds-fw151-voz", tipo: "MANUAL_INSTALACION", titulo: "FW151 Digital Voice Control Panel Manual", fuente: F_CHINA, idioma: "EN", confianza: "PROBABLE", referencias: ["FW151"] },
    { clave: "cn-ds-fw151-fp", tipo: "DATASHEET", titulo: "FW151-FP Fire Telephone System", fuente: F_CHINA, idioma: "EN", confianza: "PROBABLE", referencias: ["FW151-FP"] },
    { clave: "cn-ds-fw131-nac", tipo: "DATASHEET", titulo: "FW131 NAC BOOSTER", fuente: F_CHINA, idioma: "EN", confianza: "PROBABLE", referencias: ["FW131"] },
    { clave: "cn-ds-pipesense", tipo: "DATASHEET", titulo: "PipeSense Addressable Aspirating Smoke Detector (FW2601)", fuente: F_CHINA, idioma: "EN", confianza: "PROBABLE", referencias: ["FW2601"] },
    { clave: "cn-ds-fw2921", tipo: "DATASHEET", titulo: "FW2921 Series Bells (Vibrating) - FW2921 警铃（振动型）", fuente: F_CHINA, idioma: "ZH", confianza: "PROBABLE", referencias: ["FW2921"] },
    { clave: "cn-ds-fw562-ducto", tipo: "DATASHEET", titulo: "FW562 编址型风管探测器 (detector de ducto direccionable)", fuente: F_CHINA, idioma: "ZH", confianza: "PROBABLE", referencias: ["FW562"] },
    { clave: "cn-ds-fw2312-ziu", tipo: "DATASHEET", titulo: "FW2312 ZIU (8 ZONE INTERFACE UNIT)", fuente: F_CHINA, idioma: "EN", confianza: "PROBABLE", referencias: ["FW2312"] },
    { clave: "cn-ds-fw2261-led", tipo: "DATASHEET", titulo: "FW2261 Local LED Annunciator", fuente: F_CHINA, idioma: "EN", confianza: "PROBABLE", referencias: ["FW2261"] },
    { clave: "cn-ds-fw2191-enclosure", tipo: "DATASHEET", titulo: "FW2191 FACP Enclosure", fuente: F_CHINA, idioma: "EN", confianza: "PROBABLE", referencias: ["FW2191"] },
    { clave: "cn-ds-fw2371-4", tipo: "DATASHEET", titulo: "FW2371-4 - Connector Board", fuente: F_CHINA, idioma: "EN", confianza: "PROBABLE", referencias: ["FW2371"] },
    { clave: "cn-ds-fw2331-nou", tipo: "DATASHEET", titulo: "FW2331 - NOU (Notification Output Unit)", fuente: F_CHINA, idioma: "EN", confianza: "PROBABLE", referencias: ["FW2331"] },
    { clave: "cn-ds-fw2321-alu", tipo: "DATASHEET", titulo: "FW2321 / FW2321-1 Addressable Loop Unit (ALU) / Sub ALU", fuente: F_CHINA, idioma: "EN", confianza: "PROBABLE", referencias: ["FW2321", "FW2321-1"] },
    { clave: "cn-ds-fw2361-anu", tipo: "DATASHEET", titulo: "FW2361 - ANU (Annunciator Network Unit)", fuente: F_CHINA, idioma: "EN", confianza: "PROBABLE", referencias: ["FW2361"] },
    { clave: "cn-ds-fw2852-isu", tipo: "DATASHEET", titulo: "FW2852 Isolator Unit (ISU)", fuente: F_CHINA, idioma: "EN", confianza: "PROBABLE", referencias: ["FW2852"] },
    { clave: "cn-ds-fw2301-mfu", tipo: "DATASHEET", titulo: "FW2301 MFU (Multiple Function Unit)", fuente: F_CHINA, idioma: "EN", confianza: "PROBABLE", referencias: ["FW2301"] },
    { clave: "cn-ds-fw2201-ami", tipo: "DATASHEET", titulo: "FW2201 Advanced Machine Interface (AMI)", fuente: F_CHINA, idioma: "EN", confianza: "PROBABLE", referencias: ["FW2201"] },
    { clave: "cn-ds-fw2390-psu", tipo: "DATASHEET", titulo: "FW2390 PSU (Power Supply Unit)", fuente: F_CHINA, idioma: "EN", confianza: "PROBABLE", referencias: ["FW2390"] },
    { clave: "cn-manual-fw109", tipo: "MANUAL_USUARIO", titulo: "FW109 User Manual / FW109 使用说明书", fuente: F_CHINA, idioma: "OTRO", confianza: "PROBABLE", referencias: ["FW109"] },
    { clave: "cn-manual-fw2107-oi", tipo: "MANUAL_USUARIO", titulo: "FW2107 Operation Instruction (OI) / User Manual", fuente: F_CHINA, idioma: "OTRO", confianza: "PROBABLE", referencias: ["FW2107"] },
    { clave: "cn-manual-fw2105c", tipo: "MANUAL_USUARIO", titulo: "FW2105C User Manual / 中文说明书", fuente: F_CHINA, idioma: "OTRO", confianza: "PROBABLE", referencias: ["FW2105C"] },
    { clave: "cn-manual-fw2601-pipesense", tipo: "MANUAL_USUARIO", titulo: "美安 PipeSense 吸气式感烟探测器 FW2601 使用说明书", fuente: F_CHINA, idioma: "ZH", confianza: "PROBABLE", referencias: ["FW2601"] },
    { clave: "cn-catalogo-general", tipo: "CATALOGO", titulo: "Maple Armor Product Catalog - 美安产品手册", fuente: F_CHINA, idioma: "OTRO", confianza: "PROBABLE" },
    { clave: "cn-certificados-ccc", tipo: "CERTIFICADO", titulo: "美安认证证书合集 (paquete de certificados 3C/CCC)", fuente: F_CHINA, idioma: "ZH", confianza: "PROBABLE" },
    { clave: "cn-certificados-ul", tipo: "CERTIFICADO", titulo: "美安 UL 证书合集 (paquete de certificados UL)", fuente: F_CHINA, idioma: "ZH", confianza: "PROBABLE" },

    // Distribuidores y fuentes secundarias
    { clave: "dist-walker-catalogo-general", tipo: "CATALOGO", titulo: "Maple Armor General Catalogue (re-alojado por Walker Safety)", fuente: F_DISTRIBUIDORES, fechaEmision: "2024-05", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "https://walkersafety.com/wp-content/uploads/2024/05/Maple-Armor-General-Catalogue.pdf", notas: "Confirmado que el archivo existe (mas de 10 MB)." },
    { clave: "mkt-scribd-maple-armor-solutions", tipo: "OTRO", titulo: "Maple Armor Fire Alarm Solutions (Scribd, 44 paginas)", fuente: F_MARKETPLACES, idioma: "EN", confianza: "PENDIENTE", urlOrigen: "https://www.scribd.com/document/737794392/Maple-Armor-Products", notas: "Subido por un tercero, autoria sin verificar. Usar solo como pista." },

    // Catalogo publico "Products" de Maple Armor China — verificado 2026-09-22, descargas reales
    { clave: "cnp-fw2105", tipo: "DATASHEET", titulo: "FW2105, Fire Alarm Control Panel", fuente: F_CHINA_PRODUCTS, fechaEmision: "2025-07-09", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "http://www.maplearmor.cn/upload/default/20250709/617870b4af4dda576b7fcede65c7fc35.pdf", referencias: ["FW2105"] },
    { clave: "cnp-fw2107", tipo: "DATASHEET", titulo: "FW2107 Agent Release & Fire Alarm Control Panel", fuente: F_CHINA_PRODUCTS, fechaEmision: "2025-09-23", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "http://www.maplearmor.cn/upload/default/20250923/aa7225fc275bee359f1e36736746a28a.pdf", referencias: ["FW2107"] },
    { clave: "cnp-ma-gen2-demo", tipo: "PRESENTACION", titulo: "MA Gen2 Demo Case", fuente: F_CHINA_PRODUCTS, fechaEmision: "2026-01-21", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "http://www.maplearmor.cn/upload/default/20260121/f20e28f82ba91b7c8298618226c5f7b4.pdf" },
    { clave: "cnp-fw2121", tipo: "DATASHEET", titulo: "LCD Annunciators (FW2121)", fuente: F_CHINA_PRODUCTS, fechaEmision: "2024-07-26", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "http://www.maplearmor.cn/upload/default/20240726/17408344c6a731d99bafed36573daf1b.pdf", referencias: ["FW2121"] },
    { clave: "cnp-fw2261", tipo: "DATASHEET", titulo: "Local LED Annunciator (FW2261)", fuente: F_CHINA_PRODUCTS, fechaEmision: "2024-07-26", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "http://www.maplearmor.cn/upload/default/20240726/410ec2319e0cb4322c3bdbc99987c219.pdf", referencias: ["FW2261"] },
    { clave: "cnp-fw2129", tipo: "DATASHEET", titulo: "Remote LED Annunciators (FW2129)", fuente: F_CHINA_PRODUCTS, fechaEmision: "2025-07-31", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "http://www.maplearmor.cn/upload/default/20250731/db5a87f36ded58f0bb8a36ea0a9240ee.pdf", referencias: ["FW2129"] },
    { clave: "cnp-fw2110", tipo: "DATASHEET", titulo: "FW2110 Network Annunciator", fuente: F_CHINA_PRODUCTS, fechaEmision: "2025-09-25", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "http://www.maplearmor.cn/upload/default/20250925/01ba4d57b7a86341384da71a17c22b7d.pdf", referencias: ["FW2110"] },
    { clave: "cnp-fw2610", tipo: "DATASHEET", titulo: "FW2610 Graphics Display System", fuente: F_CHINA_PRODUCTS, fechaEmision: "2026-03-11", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "http://www.maplearmor.cn/upload/default/20260311/bbf75f50d5e359cef7bbc0681f50d2f2.pdf", referencias: ["FW2610"] },
    { clave: "cnp-vfd", tipo: "DATASHEET", titulo: "Video Fire Detector VFD/SFH-MA-DG06", fuente: F_CHINA_PRODUCTS, fechaEmision: "2026-04-16", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "http://www.maplearmor.cn/upload/default/20260416/29e7472b66b78fd0a06c6174f7db220d.pdf", referencias: ["VFD-SFH-MA-DG06"] },
    { clave: "cnp-fw2507", tipo: "DATASHEET", titulo: "FW2507 Sounder Base", fuente: F_CHINA_PRODUCTS, fechaEmision: "2025-10-09", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "http://www.maplearmor.cn/upload/default/20251009/f43e602bfaaac8ef6ec2029beefa5672.pdf", referencias: ["FW2507"] },
    { clave: "cnp-fw2508", tipo: "DATASHEET", titulo: "FW2508 Low Frequency Sounder Base", fuente: F_CHINA_PRODUCTS, fechaEmision: "2025-11-12", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "http://www.maplearmor.cn/upload/default/20251112/73ec95acca3e28406ecc2b078d0faed7.pdf", referencias: ["FW2508"] },
    { clave: "cnp-fw2561-ri", tipo: "DATASHEET", titulo: "FW2561-RI Remote Indicator", fuente: F_CHINA_PRODUCTS, fechaEmision: "2025-07-31", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "http://www.maplearmor.cn/upload/default/20250731/844c3cdc54aaad75d5569c391755acb7.pdf", referencias: ["FW2561-RI"] },
    { clave: "cnp-fw562-ducto", tipo: "DATASHEET", titulo: "Duct Detector (FW562)", fuente: F_CHINA_PRODUCTS, fechaEmision: "2025-07-31", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "http://www.maplearmor.cn/upload/default/20250731/fb65d87d7ba764d20b9aa2987d788167.pdf", referencias: ["FW562"] },
    { clave: "cnp-fw2811", tipo: "DATASHEET", titulo: "Input module (FW2811)", fuente: F_CHINA_PRODUCTS, fechaEmision: "2025-07-23", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "http://www.maplearmor.cn/upload/default/20250723/eb58f337ace447c0d16f2ffb7f7d73b1.pdf", referencias: ["FW2811"] },
    { clave: "cnp-fw2811m", tipo: "DATASHEET", titulo: "Mini input module (FW2811M)", fuente: F_CHINA_PRODUCTS, fechaEmision: "2025-07-31", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "http://www.maplearmor.cn/upload/default/20250731/0384d510c2ace7394ce8c2b7b5eaef5e.pdf", referencias: ["FW2811M"] },
    { clave: "cnp-fw2821", tipo: "DATASHEET", titulo: "Input-Output module (FW2821)", fuente: F_CHINA_PRODUCTS, fechaEmision: "2025-07-31", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "http://www.maplearmor.cn/upload/default/20250731/6fb1e35eb1b4d428fcb4c2b784fbc6e6.pdf", referencias: ["FW2821"] },
    { clave: "cnp-fw2831", tipo: "DATASHEET", titulo: "Relay module (FW2831)", fuente: F_CHINA_PRODUCTS, fechaEmision: "2025-07-31", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "http://www.maplearmor.cn/upload/default/20250731/461812996c63bcf1b17b53bbfac91c96.pdf", referencias: ["FW2831"] },
    { clave: "cnp-fw2841", tipo: "DATASHEET", titulo: "Conventional Zone Module (FW2841)", fuente: F_CHINA_PRODUCTS, fechaEmision: "2025-07-23", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "http://www.maplearmor.cn/upload/default/20250723/c100095f7cad0a3a88a2e58c812b06be.pdf", referencias: ["FW2841"] },
    { clave: "cnp-fw2851", tipo: "DATASHEET", titulo: "Isolator Module (FW2851)", fuente: F_CHINA_PRODUCTS, fechaEmision: "2025-07-31", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "http://www.maplearmor.cn/upload/default/20250731/beffe4e41679f5025e3d48c72daedb2c.pdf", referencias: ["FW2851"] },
    { clave: "cnp-fw434-435", tipo: "DATASHEET", titulo: "Fire Alarm Module Box (FW434/435)", fuente: F_CHINA_PRODUCTS, fechaEmision: "2024-08-08", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "http://www.maplearmor.cn/upload/default/20240808/602fee210410ec34dd3c89b6a2ac4fd6.pdf", referencias: ["FW434", "FW435"], notas: "Prueba directa de que FW434/FW435 son un producto vigente, no legado." },
    { clave: "cnp-fw2961", tipo: "DATASHEET", titulo: "Horn Strobes / Horns / Strobes (FW2961, FW2971, FW2981)", fuente: F_CHINA_PRODUCTS, fechaEmision: "2025-09-18", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "http://www.maplearmor.cn/upload/default/20250918/8ed1bb6e1bcccd0ce3aa8bdff62b9a26.pdf", referencias: ["FW2961", "FW2971", "FW2981"], notas: "Confirma que FW2961, FW2971 y FW2981 son una sola familia documental." },
    { clave: "cnp-fw2963", tipo: "DATASHEET", titulo: "Low frequency Horn Strobe (FW2963, FW2973)", fuente: F_CHINA_PRODUCTS, fechaEmision: "2024-07-26", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "http://www.maplearmor.cn/upload/default/20240726/45878f291cab6a8b452f955bfd5ea7d2.pdf", referencias: ["FW2963", "FW2973"] },
    { clave: "cnp-fw2921", tipo: "DATASHEET", titulo: "Alarm Bells / Vibrating (FW2921)", fuente: F_CHINA_PRODUCTS, fechaEmision: "2024-05-15", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "http://www.maplearmor.cn/upload/default/20240515/f63acbcacf4dd3f515cfc889e663fb10.pdf", referencias: ["FW2921"] },
    { clave: "cnp-fw2981r-wp", tipo: "DATASHEET", titulo: "Conventional WaterProof Strobe FW2981R-WP", fuente: F_CHINA_PRODUCTS, fechaEmision: "2026-03-06", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "http://www.maplearmor.cn/upload/default/20260306/6139428db319ed21c3ebaa9ada3dc99f.pdf", referencias: ["FW2981R-WP"] },
    { clave: "cnp-fw272x", tipo: "DATASHEET", titulo: "The FW272X series - Addressable Manual Pull Stations", fuente: F_CHINA_PRODUCTS, fechaEmision: "2024-08-07", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "http://www.maplearmor.cn/upload/default/20240807/df7c403455b7f1244dd7169a83bfe2e5.pdf", referencias: ["FW2721", "FW2722", "FW2723"], notas: "Nombra explicitamente la 'serie FW272X'." },
    { clave: "cnp-fw722", tipo: "DATASHEET", titulo: "FW722 Addressable Manual Stations", fuente: F_CHINA_PRODUCTS, fechaEmision: "2024-08-08", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "http://www.maplearmor.cn/upload/default/20240808/39f908b643ade580461db731a4ba26a8.pdf", referencias: ["FW722"], notas: "UL 38 / ULC-S528, ADA compliant." },
    { clave: "cnp-fw2732", tipo: "DATASHEET", titulo: "Abort Switch (FW2732)", fuente: F_CHINA_PRODUCTS, fechaEmision: "2024-07-26", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "http://www.maplearmor.cn/upload/default/20240726/13cb9470aee507090c0ea5013fd478de.pdf", referencias: ["FW2732"] },
    { clave: "cnp-fw2731", tipo: "DATASHEET", titulo: "Manual Release (FW2731)", fuente: F_CHINA_PRODUCTS, fechaEmision: "2024-07-26", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "http://www.maplearmor.cn/upload/default/20240726/94be9eb91158d774383f0f6d72703496.pdf", referencias: ["FW2731"] },
    { clave: "cnp-fw2601", tipo: "DATASHEET", titulo: "FW2601 (PipeSense)", fuente: F_CHINA_PRODUCTS, fechaEmision: "2026-01-07", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "http://www.maplearmor.cn/upload/default/20260107/42b6385efe360d24efcd512b0373f319.pdf", referencias: ["FW2601"] },
    { clave: "cnp-fw2601-p", tipo: "DATASHEET", titulo: "FW2601-P ASD Monitoring and Management System Suite", fuente: F_CHINA_PRODUCTS, fechaEmision: "2025-11-25", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "http://www.maplearmor.cn/upload/default/20251125/d75dd15b14bc6d56a2e172cb4b553add.pdf", referencias: ["FW2601-P"] },
    { clave: "cnp-byf-pc20x", tipo: "DATASHEET", titulo: "BYF-PC20X Fire Alarm Power Supply", fuente: F_CHINA_PRODUCTS, fechaEmision: "2025-12-15", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "http://www.maplearmor.cn/upload/default/20251215/e218c9b94e74e1789dd46541c67ba4e2.pdf", referencias: ["BYF-PC20X"] },
    { clave: "cnp-ma-wfs", tipo: "DATASHEET", titulo: "MA-WFS Waterflow Switch", fuente: F_CHINA_PRODUCTS, fechaEmision: "2024-03-31", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "http://www.maplearmor.cn/upload/default/20240331/9d3168c578cd31df8b4f17916775e821.pdf", referencias: ["MA-WFS"] },
    { clave: "cnp-ma-wfs-ct", tipo: "DATASHEET", titulo: "MA-WFS-CT Waterflow Switch", fuente: F_CHINA_PRODUCTS, fechaEmision: "2024-03-31", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "http://www.maplearmor.cn/upload/default/20240331/b9dd0ef4746cda2395895471a36a3d6d.pdf", referencias: ["MA-WFS-CT"] },
    { clave: "cnp-ma-osy-1", tipo: "DATASHEET", titulo: "MA-OSY-1 Supervisory Switch", fuente: F_CHINA_PRODUCTS, fechaEmision: "2024-03-31", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "http://www.maplearmor.cn/upload/default/20240331/164a1e6a6c611baa1e50cf09f2c91bed.pdf", referencias: ["MA-OSY-1"] },
    { clave: "cnp-olad-rc", tipo: "DATASHEET", titulo: "OLAD-RC Open Large Area Detection with Remote Control", fuente: F_CHINA_PRODUCTS, fechaEmision: "2024-08-08", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "http://www.maplearmor.cn/upload/default/20240808/d5c1125a5d8f0445ed93f23b813e19f3.pdf", referencias: ["OLAD-RC"] },
    { clave: "cnp-fw151", tipo: "DATASHEET", titulo: "Digital Voice Control Panel FW151", fuente: F_CHINA_PRODUCTS, fechaEmision: "2025-07-31", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "http://www.maplearmor.cn/upload/default/20250731/a7a0f6456734db70d40d0bc43eb2a3d0.pdf", referencias: ["FW151"] },
    { clave: "cnp-fw151-fp", tipo: "DATASHEET", titulo: "BlazeCom Fire Phone System FW151-FP", fuente: F_CHINA_PRODUCTS, fechaEmision: "2024-10-28", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "http://www.maplearmor.cn/upload/default/20241028/5b552fba0bec7a3139a99617b2b0f4c6.pdf", referencias: ["FW151-FP"], notas: "Revela el nombre comercial 'BlazeCom'." },
    { clave: "cnp-hy2711e", tipo: "DATASHEET", titulo: "HY2711E Conventional Fire Phone Panel", fuente: F_CHINA_PRODUCTS, fechaEmision: "2024-10-28", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "http://www.maplearmor.cn/upload/default/20241028/539039f2a5ec48d0ae08785822212eea.pdf", referencias: ["HY2711E"] },
    { clave: "cnp-hy2712d", tipo: "DATASHEET", titulo: "Conventional Fire Phone Extension HY2712D", fuente: F_CHINA_PRODUCTS, fechaEmision: "2024-10-28", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "http://www.maplearmor.cn/upload/default/20241028/bf98657d065dfef6d815509112dea320.pdf", referencias: ["HY2712D"] },
    { clave: "cnp-hy2714d", tipo: "DATASHEET", titulo: "Conventional Fire Phone Jack HY2714D", fuente: F_CHINA_PRODUCTS, fechaEmision: "2024-10-28", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "http://www.maplearmor.cn/upload/default/20241028/1e95e30d45000a14f0994be1655e2cdd.pdf", referencias: ["HY2714D"] },
    { clave: "cnp-hy2713", tipo: "DATASHEET", titulo: "Portable Fire Telephone Extension HY2713", fuente: F_CHINA_PRODUCTS, fechaEmision: "2024-10-28", idioma: "EN", confianza: "CONFIRMADO", urlOrigen: "http://www.maplearmor.cn/upload/default/20241028/7d082a872f92805d07288dbf23c13c17.pdf", referencias: ["HY2713"] },

    // Exportaciones
    {
      clave: "exp-vietnam-2026-07-09",
      tipo: "REGISTRO_EXPORTACION",
      titulo: "Embarque Maple Armor China -> Tin Dat (Vietnam), B/L 108418787850",
      fuente: F_ADUANAS,
      codigo: "B/L 108418787850",
      fechaEmision: "2026-07-09",
      idioma: "EN",
      confianza: "PROBABLE",
      referencias: ["FW2512-2", "FW2522-2", "FW2601-P2(FM)", "BYF-PC10X", "FW2321", "FW2321-1", "FW2852", "FW2811", "FW2731", "FW2121", "FW2129-H1", "FW2411", "FW2312", "PBA-FW262-THT", "ZR-D25"],
      notas:
        "Referencias y campo Amount visibles en el registro: FW2512-2 = 3480; FW2522-2 = 2150; FW2601-P2(FM) = 4287.50; BYF-PC10X = 717.50; FW2321 = 693; FW2321-1 = 196; FW2852 = 87.50; FW2811 = 214.50; FW2731 = 141.70; FW2121 = 101.50; FW2129-H1 = 103.25; FW2411 = 143.60; FW2312 = 78.05; PBA-FW262-THT = 67.55; ZR-D25 = 41.56. ADVERTENCIA CRITICA: Amount no equivale a precio unitario.",
    },

    // Documento interno de partida
    { clave: "bico-doc-maestro-2026-09", tipo: "OTRO", titulo: "Maple Armor - FireWatcher / Series 2: documento maestro de investigacion tecnica y comercial", fuente: F_INTERNO, fechaEmision: "2026-09", idioma: "ES", confianza: "CONFIRMADO", notas: "Documento de partida de esta base de conocimiento." },

    // Documentos recibidos directamente de Maple Armor via Google Drive interno BICO,
    // cotejados por hash SHA-256 contra los 67 ya cargados (2026-09-23).
    { clave: "recibido-manual-DOC-FW2821-UM-Rev 1.1", tipo: "MANUAL_INSTALACION", titulo: "FW2821 Supervised Output Module - Installation Manual", fuente: F_RECIBIDO, codigo: "DOC-FW2821-UM", revision: "Rev 1.1", idioma: "EN", confianza: "CONFIRMADO", referencias: ["FW2821"] },
    { clave: "recibido-manual-DOC-FW2812-UM-Rev 1.0", tipo: "MANUAL_INSTALACION", titulo: "FW2812 Dual Input Module - Installation Manual", fuente: F_RECIBIDO, codigo: "DOC-FW2812-UM", revision: "Rev 1.0", idioma: "EN", confianza: "CONFIRMADO", referencias: ["FW2812"] },
    { clave: "recibido-manual-DOC-FW2811M-UM-2025-05-08", tipo: "MANUAL_INSTALACION", titulo: "FW2811M Mini Input Module - Installation Manual", fuente: F_RECIBIDO, codigo: "DOC-FW2811M-UM", revision: "Rev 1.0", fechaEmision: "2025-05-08", idioma: "EN", confianza: "CONFIRMADO", referencias: ["FW2811M"] },
    { clave: "recibido-manual-DOC-FW2811-UM-Rev 1.1", tipo: "MANUAL_INSTALACION", titulo: "FW2811 Input Module - Installation Manual", fuente: F_RECIBIDO, codigo: "DOC-FW2811-UM", revision: "Rev 1.1", idioma: "EN", confianza: "CONFIRMADO", referencias: ["FW2811"] },
    { clave: "recibido-manual-DOC-FW2521-UM-2025-12-04", tipo: "MANUAL_INSTALACION", titulo: "FW2521 Heat Detector Head - Installation Manual", fuente: F_RECIBIDO, codigo: "DOC-FW2521-UM", revision: "Rev 1.1", fechaEmision: "2025-12-04", idioma: "EN", confianza: "CONFIRMADO", referencias: ["FW2521"] },
    { clave: "recibido-manual-DOC-FW2511-UM-2025-04-02", tipo: "MANUAL_INSTALACION", titulo: "FW2511 Smoke Detector Head - Installation Manual", fuente: F_RECIBIDO, codigo: "DOC-FW2511-UM", revision: "Rev 1.1", fechaEmision: "2025-04-02", idioma: "EN", confianza: "CONFIRMADO", referencias: ["FW2511"] },
    { clave: "recibido-manual-DOC-FW2509-UM-2024-10-08", tipo: "MANUAL_INSTALACION", titulo: "FW2509 Sounder Base - Installation Manual", fuente: F_RECIBIDO, codigo: "DOC-FW2509-UM", revision: "Rev 1.0", fechaEmision: "2024-10-08", idioma: "EN", confianza: "CONFIRMADO", referencias: ["FW2509"] },
    { clave: "recibido-manual-DOC-FW2508-UM-2025-11-04", tipo: "MANUAL_INSTALACION", titulo: "FW2508 Low Frequency Sounder Base - Installation Manual", fuente: F_RECIBIDO, codigo: "DOC-FW2508-UM", revision: "Rev 1.0", fechaEmision: "2025-11-04", idioma: "EN", confianza: "CONFIRMADO", referencias: ["FW2508"] },
    { clave: "recibido-manual-DOC-FW2501-UM-2024-07-02", tipo: "MANUAL_INSTALACION", titulo: "FW2501 Detector Base - Installation Manual", fuente: F_RECIBIDO, codigo: "DOC-FW2501-UM", revision: "Rev 1.0", fechaEmision: "2024-07-02", idioma: "EN", confianza: "CONFIRMADO", referencias: ["FW2501"] },
    { clave: "recibido-manual-DOC-FW2411-UM-2025-04-17", tipo: "MANUAL_INSTALACION", titulo: "FW2411 Hand-held Programmer - Installation Manual", fuente: F_RECIBIDO, codigo: "DOC-FW2411-UM", revision: "Rev 1.0", fechaEmision: "2025-04-17", idioma: "EN", confianza: "CONFIRMADO", referencias: ["FW2411"] },
    { clave: "recibido-manual-DOC-FW2121-UM-2025-01-23", tipo: "MANUAL_INSTALACION", titulo: "FW2121 LCD Annunciator - Installation Manual", fuente: F_RECIBIDO, codigo: "DOC-FW2121-UM", revision: "Rev 1.1", fechaEmision: "2025-01-23", idioma: "EN", confianza: "CONFIRMADO", referencias: ["FW2121"] },
    { clave: "recibido-manual-DOC-FW2107-UM-2025-09-08", tipo: "MANUAL_INSTALACION", titulo: "FW2107, FW2107C, FW2107M Intelligent Fire Alarm / Agent Release Control Panel - Installation and Operation Manual", fuente: F_RECIBIDO, codigo: "DOC-FW2107-UM", revision: "Rev 1.6", fechaEmision: "2025-09-08", idioma: "EN", confianza: "CONFIRMADO", referencias: ["FW2107", "FW2107C", "FW2107M"], notas: "Manual de 73 paginas. Revela la variante FW2107C, no identificada antes." },
    { clave: "recibido-manual-DOC-FW2105-UM-2025-09-08", tipo: "MANUAL_INSTALACION", titulo: "FW2105 Fire Alarm Control Panel - Installation and Operation Manual", fuente: F_RECIBIDO, codigo: "DOC-FW2105-UM", revision: "Rev 1.7", fechaEmision: "2025-09-08", idioma: "EN", confianza: "CONFIRMADO", referencias: ["FW2105"], notas: "Manual de 82 paginas, revision vigente." },
    { clave: "recibido-manual-DOC-FW272X-UM-2025-07-16", tipo: "MANUAL_INSTALACION", titulo: "FW2721-FW2726 Intelligent Manual Pull Station - Installation Manual", fuente: F_RECIBIDO, codigo: "DOC-FW272X-UM", revision: "Rev 1.2", fechaEmision: "2025-07-16", idioma: "EN", confianza: "CONFIRMADO", referencias: ["FW2721", "FW2722", "FW2723", "FW2724", "FW2725", "FW2726"], notas: "Revela las referencias FW2724, FW2725 y FW2726, agrupadas como FW2721/FW2724, FW2722/FW2725, FW2723/FW2726." },
    { clave: "recibido-manual-DOC-FW131-UM-2025-07-30", tipo: "MANUAL_INSTALACION", titulo: "FW131 NAC Booster - Installation and Operation Manual", fuente: F_RECIBIDO, codigo: "DOC-FW131-UM", revision: "Rev 1.3", fechaEmision: "2025-07-30", idioma: "EN", confianza: "CONFIRMADO", referencias: ["FW131"], notas: "Manual de 42 paginas." },
    { clave: "recibido-manual-DOC-FW29X3-UM-Rev 1.0", tipo: "MANUAL_INSTALACION", titulo: "FW2963W/R, FW2973W/R Low Frequency Horn/Strobe - Installation Manual", fuente: F_RECIBIDO, codigo: "DOC-FW29X3-UM", revision: "Rev 1.0", idioma: "EN", confianza: "CONFIRMADO", referencias: ["FW2963W", "FW2963R", "FW2973W", "FW2973R"], notas: "Revela los SKU especificos por color (W=blanco, R=rojo)." },
    { clave: "recibido-manual-DOC-FW29X1-UM-Rev 1.4", tipo: "MANUAL_INSTALACION", titulo: "FW2961R/W, FW2971R/W, FW2981R/W Horn/Strobe - Installation Manual", fuente: F_RECIBIDO, codigo: "DOC-FW29X1-UM", revision: "Rev 1.4", idioma: "EN", confianza: "CONFIRMADO", referencias: ["FW2961R", "FW2961W", "FW2971R", "FW2971W", "FW2981R", "FW2981W"], notas: "Revela los SKU especificos por color (R=rojo, W=blanco)." },
    { clave: "recibido-manual-DOC-FW2851-UM-Rev 1.1", tipo: "MANUAL_INSTALACION", titulo: "FW2851 Isolator Module - Installation Manual", fuente: F_RECIBIDO, codigo: "DOC-FW2851-UM", revision: "Rev 1.1", idioma: "EN", confianza: "CONFIRMADO", referencias: ["FW2851"] },
    { clave: "recibido-manual-DOC-FW2845-UM-2025-09-04", tipo: "MANUAL_INSTALACION", titulo: "FW2845 Protocol Converter Module - Installation Manual", fuente: F_RECIBIDO, codigo: "DOC-FW2845-UM", revision: "Rev 1.0", fechaEmision: "2025-09-04", idioma: "EN", confianza: "CONFIRMADO", referencias: ["FW2845", "FW562"], notas: "Confirma que conecta el detector de ducto FW562 a los paneles FW2105/FW2107." },
    { clave: "recibido-manual-DOC-FW2841-UM-Rev 1.0", tipo: "MANUAL_INSTALACION", titulo: "FW2841 Conventional Zone Module - Installation Manual", fuente: F_RECIBIDO, codigo: "DOC-FW2841-UM", revision: "Rev 1.0", idioma: "EN", confianza: "CONFIRMADO", referencias: ["FW2841"] },
    { clave: "recibido-manual-DOC-FW2831-UM-Rev 1.1", tipo: "MANUAL_INSTALACION", titulo: "FW2831 Relay Module - Installation Manual", fuente: F_RECIBIDO, codigo: "DOC-FW2831-UM", revision: "Rev 1.1", idioma: "EN", confianza: "CONFIRMADO", referencias: ["FW2831"] },
    { clave: "recibido-manual-DOC-FW2823-UM-2025-09-04", tipo: "MANUAL_INSTALACION", titulo: "FW2823 Dual Input Relay Module - Installation Manual", fuente: F_RECIBIDO, codigo: "DOC-FW2823-UM", revision: "Rev 1.0", fechaEmision: "2025-09-04", idioma: "EN", confianza: "CONFIRMADO", referencias: ["FW2823"] },
    { clave: "recibido-manual-DOC-FW2822-UM-Rev 1.1", tipo: "MANUAL_INSTALACION", titulo: "FW2822 Releasing Module - Installation Manual", fuente: F_RECIBIDO, codigo: "DOC-FW2822-UM", revision: "Rev 1.1", idioma: "EN", confianza: "CONFIRMADO", referencias: ["FW2822"] },
    { clave: "recibido-manual-DOC-FW2105-UM-2023-11-04", tipo: "MANUAL_INSTALACION", titulo: "FW2105 Fire Alarm Control Panel - Installation and Operation Manual (revision anterior)", fuente: F_RECIBIDO, codigo: "DOC-FW2105-UM", revision: "Rev 1.0", fechaEmision: "2023-11-04", idioma: "EN", confianza: "CONFIRMADO", referencias: ["FW2105"], notas: "Revision anterior (1.0, 2023-11-04) del mismo manual; se conserva junto a la Rev 1.7 (2025-09-08) por la Regla 3 (conservar todas las revisiones)." },
    { clave: "recibido-manual-DOC-S2 Configurator-PM-2026-02-01", tipo: "MANUAL_PROGRAMACION", titulo: "S2 Configurator - Programming Manual", fuente: F_RECIBIDO, codigo: "DOC-S2 Configurator-PM", revision: "Rev 1.1", fechaEmision: "2026-02-01", idioma: "EN", confianza: "CONFIRMADO", referencias: ["S2-CONFIGURATOR"], notas: "Manual de 62 paginas del software de programacion." },
    { clave: "recibido-ds-fw434-fw435", tipo: "DATASHEET", titulo: "FW434/FW435 Module Box - Datasheet", fuente: F_RECIBIDO, codigo: "FW434/FW435-DS-R1.1", revision: "Rev 1.1", fechaEmision: "2024-10", idioma: "EN", confianza: "CONFIRMADO", referencias: ["FW434", "FW435"], notas: "Confirma capacidad: FW434 hasta 16 modulos, FW435 hasta 8 modulos. Emitido por Maple Armor Group, Oakville ON." },
    { clave: "recibido-ds-fw2601-pipesense", tipo: "DATASHEET", titulo: "FW2601 Maple Armor PipeSense Series Aspirating Smoke Detector - Specification", fuente: F_RECIBIDO, codigo: "DS-5034-1", idioma: "EN", confianza: "CONFIRMADO", referencias: ["FW2601"], notas: "Codigo real del documento: DS-5034-1 (el nombre de archivo 'ASD-2601-1-1' no lo reflejaba). Confirma SKUs opcionales para 1, 2 o 4 tubos." },
    { clave: "recibido-entrenamiento-Quiz 4 - Panel Programming", tipo: "INSTRUCTIVO", titulo: "Quiz 4 - Panel Programming", fuente: F_RECIBIDO, idioma: "EN", confianza: "CONFIRMADO", notas: "Material de evaluacion del curso de entrenamiento Series 2 recibido de Maple Armor / distribuidor." },
    { clave: "recibido-entrenamiento-Quiz 3 - Panel Operation", tipo: "INSTRUCTIVO", titulo: "Quiz 3 - Panel Operation", fuente: F_RECIBIDO, idioma: "EN", confianza: "CONFIRMADO", notas: "Material de evaluacion del curso de entrenamiento Series 2 recibido de Maple Armor / distribuidor." },
    { clave: "recibido-entrenamiento-Quiz 2 - Field Devices", tipo: "INSTRUCTIVO", titulo: "Quiz 2 - Field Devices", fuente: F_RECIBIDO, idioma: "EN", confianza: "CONFIRMADO", notas: "Material de evaluacion del curso de entrenamiento Series 2 recibido de Maple Armor / distribuidor." },
    { clave: "recibido-entrenamiento-Quiz 1 - Series 2 Fire Alarm Panels", tipo: "INSTRUCTIVO", titulo: "Quiz 1 - Series 2 Fire Alarm Panels", fuente: F_RECIBIDO, idioma: "EN", confianza: "CONFIRMADO", notas: "Material de evaluacion del curso de entrenamiento Series 2 recibido de Maple Armor / distribuidor." },
    { clave: "recibido-entrenamiento-exercise-panel-programming", tipo: "INSTRUCTIVO", titulo: "Exercise - Panel Programming", fuente: F_RECIBIDO, idioma: "EN", confianza: "CONFIRMADO", notas: "Ejercicio practico del curso de entrenamiento Series 2." },
    { clave: "recibido-entrenamiento-Series 2 Product Overview", tipo: "PRESENTACION", titulo: "Series 2 Product Overview", fuente: F_RECIBIDO, idioma: "EN", confianza: "PROBABLE", notas: "Modulo de la presentacion de entrenamiento Series 2. Contenido no verificado con extraccion de texto (solo por nombre y tamano de archivo, a diferencia de los PDF)." },
    { clave: "recibido-entrenamiento-Panel Operation", tipo: "PRESENTACION", titulo: "Panel Operation", fuente: F_RECIBIDO, idioma: "EN", confianza: "PROBABLE", notas: "Modulo de la presentacion de entrenamiento Series 2. Contenido no verificado con extraccion de texto." },
    { clave: "recibido-entrenamiento-Panel Programming", tipo: "PRESENTACION", titulo: "Panel Programming", fuente: F_RECIBIDO, idioma: "EN", confianza: "PROBABLE", notas: "Modulo de la presentacion de entrenamiento Series 2. Contenido no verificado con extraccion de texto." },
    { clave: "recibido-entrenamiento-Module 5 - Configurator Installation", tipo: "PRESENTACION", titulo: "Module 5 - Configurator Installation", fuente: F_RECIBIDO, idioma: "EN", confianza: "PROBABLE", notas: "Modulo de la presentacion de entrenamiento Series 2 (atribuido a Jonathan Colucci). Contenido no verificado con extraccion de texto." },
    { clave: "recibido-entrenamiento-Module 6 & 7 - Project Configuration, Upload/Download", tipo: "PRESENTACION", titulo: "Module 6 & 7 - Project Configuration, Upload/Download", fuente: F_RECIBIDO, idioma: "EN", confianza: "PROBABLE", notas: "Modulo de la presentacion de entrenamiento Series 2 (atribuido a Jonathan Colucci). Contenido no verificado con extraccion de texto." },
    { clave: "recibido-entrenamiento-Exercise #2 - Project Configuration & Download", tipo: "PRESENTACION", titulo: "Exercise #2 - Project Configuration & Download", fuente: F_RECIBIDO, idioma: "EN", confianza: "PROBABLE", notas: "Modulo de la presentacion de entrenamiento Series 2. Contenido no verificado con extraccion de texto." },
    { clave: "recibido-entrenamiento-Module 8 - Zone Mapping & Exercise #3", tipo: "PRESENTACION", titulo: "Module 8 - Zone Mapping & Exercise #3", fuente: F_RECIBIDO, idioma: "EN", confianza: "PROBABLE", notas: "Modulo de la presentacion de entrenamiento Series 2 (atribuido a Jonathan Colucci). Contenido no verificado con extraccion de texto." },
    { clave: "recibido-entrenamiento-Module 10 - Logic Programming", tipo: "PRESENTACION", titulo: "Module 10 - Logic Programming", fuente: F_RECIBIDO, idioma: "EN", confianza: "PROBABLE", notas: "Modulo de la presentacion de entrenamiento Series 2 (atribuido a Jonathan Colucci). Contenido no verificado con extraccion de texto." },
    { clave: "recibido-software-s2-configurator-instalador", tipo: "SOFTWARE", titulo: "S2 Configurator - Instalador v2.1.6.2", fuente: F_RECIBIDO, idioma: "EN", confianza: "CONFIRMADO", referencias: ["S2-CONFIGURATOR"], notas: "Instalador de 188 MB (.exe). NO se copio a data/uploads por su tamano (supera el limite de 50MB de la herramienta). Disponible en el Drive compartido: H:\\Mi unidad\\Compartido Faro Bico\\Maple Armor\\Documentacion Tecnica\\Software\\S2 Configurator_2.1.6.2 1.exe" },
    { clave: "recibido-catalogo-general-v4", tipo: "CATALOGO", titulo: "Maple Armor Product Catalogue V4", fuente: F_RECIBIDO, idioma: "EN", confianza: "CONFIRMADO", notas: "Catalogo general, 36 paginas, version V4 (segun metadato interno del PDF)." },
    {
      clave: "bico-lista-precios-distribucion-2026-09-23",
      tipo: "LISTA_PRECIOS",
      titulo: "Distribution Price List BICO (2026-09-23)",
      fuente: F_PRECIOS,
      fechaEmision: "2026-09-23",
      idioma: "EN",
      confianza: "CONFIRMADO",
      notas:
        "63 referencias con precio 'Precio BICO'. El archivo no indica explicitamente la moneda (la celda solo usa formato de simbolo $ con configuracion regional es-CO); por consistencia con el contexto de distribucion internacional se registra como USD, pendiente de confirmacion formal con Maple Armor/BICO (ver hallazgo). Nota del propio archivo: incluir Model y SKU Code al hacer el pedido. El precio de cada referencia se guarda como especificacion COMERCIAL directamente sobre el producto, no en esta semilla.",
      referencias: [
        "FW2105", "FW2511", "FW2521", "FW2721", "FW2722", "FW2723", "FW2961", "FW2971W", "FW2971", "FW2981",
        "FW901R", "FW901W", "FW2811", "FW2821", "FW2851", "FW2831", "FW2841", "FW2121", "FW2501", "FW2411",
        "FW2202", "FW2301", "FW2852", "FW2321", "FW2321-1", "FW2331", "FW2361", "FW2390", "FW2371-4", "FW2107",
        "FW2731", "FW2732", "FW2733", "FW2734", "FW2701", "FW2822", "FW2502", "FW2811M", "FW2129-H1", "FW2129-H2",
        "FW2261", "FW2252-4S4L", "FW2252-8-RGY", "FW2252-8-2RY", "FW2252-8-2S2L", "FW2252-4-3S3L", "FW2252-CORE",
        "FW2252-8-S2L", "FW2252-DMMY", "FW2204L", "FW2561-RI", "FW2509", "FW2812", "FW2845", "FW2963W", "FW2963R",
        "FW2973W", "FW2973R", "FW2312", "FW2107M", "FW2508", "JBF 295K", "FW2131",
      ],
    },
  ],
  hallazgos: [
    // Reglas
    { clave: "regla-1-no-eliminar", tipo: "REGLA", titulo: "Regla 1 - No eliminar referencias", contenido: "Si una referencia aparece en un documento antiguo, UL, exportacion, manual o catalogo, debe permanecer en la base. Se marca como DESCONTINUADO, RENOMBRADO o PENDIENTE, nunca se borra." },
    { clave: "regla-2-no-asumir-equivalencias", tipo: "REGLA", titulo: "Regla 2 - No asumir equivalencias", contenido: "Referencias parecidas no son iguales hasta encontrar documentacion que lo demuestre. Casos abiertos: FW2327-1 vs FW2321-1; FW2962/FW2965 vs FW2971/FW2981; FW2512/FW2522 vs FW2512-2/FW2522-2." },
    { clave: "regla-3-conservar-revisiones", tipo: "REGLA", titulo: "Regla 3 - Conservar todas las revisiones", contenido: "Una ficha de 2023 y una de 2025 se conservan ambas como documentos distintos." },
    { clave: "regla-4-prioridad-fuentes", tipo: "REGLA", titulo: "Regla 4 - Prioridad de fuentes", contenido: "Orden: 1. Maple Armor Canada; 2. Maple Armor China; 3. UL Solutions; 4. Jade Bird Fire; 5. documentos regulatorios; 6. exportaciones/aduanas; 7. distribuidores; 8. fabricantes/marketplaces secundarios." },
    { clave: "regla-5-amount-no-es-precio", tipo: "REGLA", titulo: "Regla 5 - Un Amount de exportacion no es precio unitario", contenido: "Nunca interpretar el campo Amount de un registro aduanero como precio unitario sin cantidad, unidad y moneda." },
    { clave: "regla-6-detnov-contable", tipo: "REGLA", titulo: "Regla 6 - Cifras contables de Detnov no son precios de producto", contenido: "No utilizar como precio de producto las cifras contables de inversion de Jade Bird en Detnov." },

    // Discrepancias
    { clave: "disc-fw2327-1-fw2321-1", tipo: "DISCREPANCIA", titulo: "FW2327-1 vs FW2321-1", contenido: "FW2321-1 esta confirmada como Sub-ALU en tres fuentes primarias; FW2327-1 no tiene documentacion primaria. No asumir que son la misma tarjeta.", referencia: "FW2327-1" },
    { clave: "disc-fw2962-fw2965-vs-fw2971-fw2981", tipo: "DISCREPANCIA", titulo: "FW2962 / FW2965 vs FW2971 / FW2981", contenido: "FW2971 (horn) y FW2981 (strobe) tienen ficha confirmada. FW2962 y FW2965 aparecen sin documentacion primaria.", referencia: "FW2962" },
    { clave: "disc-fw2512-fw2512-2", tipo: "DISCREPANCIA", titulo: "FW2512 / FW2522 vs FW2512-2 / FW2522-2", contenido: "FW2512 y FW2522 aparecen como detectores convencionales en fuentes secundarias; FW2512-2 y FW2522-2 aparecen en la exportacion 2026 como direccionables de 24 VDC. No fusionar.", referencia: "FW2512-2" },
    { clave: "disc-fw2852-vs-fw2851", tipo: "DISCREPANCIA", titulo: "FW2852 no es un modulo de campo equivalente al FW2851", contenido: "FW2851 es el aislador SLC de campo. FW2852 es la unidad aisladora interna (ISU) del panel FW2105.", referencia: "FW2852" },
    { clave: "disc-fw2129-variantes", tipo: "DISCREPANCIA", titulo: "Variantes FW2129-H1/H2/H3/H5", contenido: "UL lista cada variante individualmente. No tratarlas como simples nombres comerciales del FW2129.", referencia: "FW2129" },
    { clave: "disc-firewatcher-no-es-series2", tipo: "DISCREPANCIA", titulo: "FireWatcher no es sinonimo de Series 2", contenido: "Existen referencias FireWatcher legacy que la pagina canadiense aun muestra con revisiones 2023-2024. Reconstruir la evolucion FireWatcher legacy -> MA Gen 2 -> Series 2 actual antes de mapear equivalencias." },
    { clave: "disc-china-no-todo-es-series2", tipo: "DISCREPANCIA", titulo: "Productos de Maple Armor China vs Series 2 canadiense", contenido: "No asumir que todo lo que vende Maple Armor China forma parte de la Series 2 canadiense: cada producto debe clasificarse." },
    { clave: "disc-ds3112-1-vs-doc-12961", tipo: "DISCREPANCIA", titulo: "DS3112-1 vs DOC-12961 (notificacion)", contenido: "Hay dos generaciones documentales para FW2961/FW2971/FW2981. Hacer diff tecnico entre ambas.", referencia: "FW2961" },

    // Pendientes (prioridades)
    { clave: "pend-01-datasheets-manuales", tipo: "PENDIENTE", titulo: "Prioridad 1 - Recuperar los 80+ datasheets y 60+ manuales", contenido: "La propia Maple Armor confirma que existen. Recorrer Products / Series 2 y registrar cada archivo con codigo, revision y fecha." },
    { clave: "pend-02-maple-armor-china", tipo: "PENDIENTE", titulo: "Prioridad 2 - Recorrer exhaustivamente Maple Armor China", contenido: "Su Resource Center contiene categorias especificas de certificates, datasheets, catalog, manuals, solutions y case studies." },
    { clave: "pend-03-ul-indice", tipo: "PENDIENTE", titulo: "Prioridad 3 - Explotar UL como indice de referencias ocultas", contenido: "Extraer de los archivos UL todos los numeros de parte, incluidos componentes internos y variantes." },
    { clave: "pend-04-catalogos-historicos", tipo: "PENDIENTE", titulo: "Prioridad 4 - Recuperar los catalogos historicos 2019 / 2022 / 2023 / 2024 / 2025", contenido: "Base de la matriz historica." },
    { clave: "pend-05-manuales-instalacion", tipo: "PENDIENTE", titulo: "Prioridad 5 - Recuperar los manuales de instalacion", contenido: "Cableado, distancias, AWG, EOL, topologia y programacion por producto." },
    { clave: "pend-06-discrepancias", tipo: "PENDIENTE", titulo: "Prioridad 6 - Resolver todas las discrepancias de numeros de parte", contenido: "Ver los hallazgos tipo DISCREPANCIA." },
    { clave: "pend-07-precios-liquidacion-2022", tipo: "PENDIENTE", titulo: "Prioridad 7 - Recuperar el Excel de precios de liquidacion Jade Bird 2022", contenido: "Base para estimar precios de fabrica." },
    { clave: "pend-08-detnov", tipo: "PENDIENTE", titulo: "Prioridad 8 - Investigar operaciones con Detnov", contenido: "Precios de transferencia, facturas, operaciones intragrupo, importaciones, cuentas por pagar." },
    { clave: "pend-09-precios-exportacion", tipo: "PENDIENTE", titulo: "Prioridad 9 - Reconstruir precios de exportacion", contenido: "A partir de registros aduaneros completos (cantidad, unidad, moneda, valor total, peso, HS code)." },
    { clave: "pend-10-bom-series2", tipo: "PENDIENTE", titulo: "Prioridad 10 - Crear la BOM tecnica definitiva de Series 2", contenido: "BOM FW2105, FW2107, FW2107M; matrices SLC, NAC, releasing, detectores/bases, modulos, anunciadores, notificacion, UL, historica y precios." },
    { clave: "pend-referencias-sin-documentacion", tipo: "PENDIENTE", titulo: "Referencias identificadas sin investigacion primaria", contenido: "FW2121H, FW2823, FW2845, FW2881H, FW2951, FW2610 (resuelto), FW2512-2, FW2522-2, FW2601-P2(FM), ZR-D25." },
    { clave: "pend-fw2107-releasing", tipo: "PENDIENTE", titulo: "FW2107: arquitectura de releasing", contenido: "Investigar loops, NAC, releasing, agent release, FW2822, FW2731/2732/2733/2734.", referencia: "FW2107" },
    { clave: "pend-fw2121-comunicacion", tipo: "PENDIENTE", titulo: "FW2121: comunicacion y limites", contenido: "Comunicacion, maximo de unidades, alimentacion, direccionamiento, eventos, comandos, cableado, distancia y topologia.", referencia: "FW2121" },
    { clave: "pend-fw2812-direcciones", tipo: "PENDIENTE", titulo: "FW2812: direcciones SLC de las dos entradas", contenido: "Documentar si el modulo de doble entrada ocupa una o dos direcciones en el SLC.", referencia: "FW2812" },

    // Hallazgos
    { clave: "hall-biblioteca-maple-armor", tipo: "HALLAZGO", titulo: "Tamano de la biblioteca tecnica de Maple Armor", contenido: "Maple Armor afirma tener 80+ datasheets, 60+ installation manuals, 25+ presentations y 40+ videos/webinars." },
    { clave: "hall-series2-plataforma", tipo: "HALLAZGO", titulo: "Series 2 es una plataforma completa", contenido: "Paneles, anunciadores, detectores, estaciones manuales, modulos y notification appliances, todo bajo Series 2." },
    { clave: "hall-jade-bird-repositorio", tipo: "HALLAZGO", titulo: "El Baike de Jade Bird contiene material interno de Maple Armor", contenido: "MA Gen 2 Catalog, brochure UL a 3C, guia de aplicacion, catalogo 2019, casos Canada, embalaje UL y listas de precios." },
    { clave: "hall-columnas-por-referencia", tipo: "HALLAZGO", titulo: "Datos tecnicos que deben extraerse para cada referencia", contenido: "Identificacion, electrico, comunicacion, cableado, mecanico, funcional, compatibilidad, certificaciones y documentacion." },

    // Verificacion por navegacion directa, 2026-09-22 (primera pasada)
    {
      clave: "hall-2026-09-22-verificacion",
      tipo: "HALLAZGO",
      titulo: "Verificacion directa de fuentes (2026-09-22): 25 datasheets reales y varias correcciones",
      contenido: "Se navego directamente maplearmor.com, maplearmor.cn, UL Product iQ y jbufa.com. Resultado: 25 datasheets de Maple Armor Canada son reales y descargables sin cuenta; el Resource Center de Maple Armor China existe pero exige un codigo de canje; UL Product iQ confirmo S35910 y S35947 y revelo ademas S35539 y S35854.",
    },
    { clave: "corr-fw2261", tipo: "HALLAZGO", titulo: "Correccion: FW2261 (no FW2261L)", contenido: "Verificado en Maple Armor China y UL (SYZV.S35910): el nombre real es FW2261, Local LED Annunciator.", referencia: "FW2261" },
    { clave: "corr-fw131", tipo: "HALLAZGO", titulo: "Correccion: FW131 es un NAC Booster, no un panel legacy", contenido: "Verificado en el Resource Center de Maple Armor China: es un modulo NAC Booster vigente en Series 2.", referencia: "FW131" },
    { clave: "corr-fw562", tipo: "HALLAZGO", titulo: "Correccion: FW562 es un detector de ducto direccionable", contenido: "Verificado en el Resource Center de Maple Armor China: es un detector de humo de ducto direccionable vigente.", referencia: "FW562" },
    { clave: "corr-fw2327-1", tipo: "DISCREPANCIA", titulo: "FW2327-1: sin rastro en fuentes primarias, posible error de transcripcion", contenido: "No aparece en Maple Armor Canada, Maple Armor China ni UL Product iQ. FW2321-1 (Sub-ALU) si esta confirmado. Se conserva la referencia por prudencia, pero se degrada su prioridad.", referencia: "FW2327-1" },
    { clave: "hall-familia-telefonia-emergencia", tipo: "HALLAZGO", titulo: "Nueva familia descubierta: telefonia de incendio / comunicacion de emergencia", contenido: "UL Product iQ y el Resource Center de Maple Armor China revelan: FW151 (con variantes -PS/-AP/-MIC/-DK/-DB), FW151-FP (BlazeCom), FW451/FW451-S, FW863/FW864A y FW2423-3.9K." },
    { clave: "hall-china-resource-gated", tipo: "HALLAZGO", titulo: "El Resource Center de Maple Armor China exige codigo de canje", contenido: "Las seis categorias existen con items reales listados por titulo, pero cada boton de descarga ejecuta JavaScript y el sitio avisa que hay que contactarlos para obtener un codigo de canje (兑换码)." },
    { clave: "pend-jbufa-interno-cert-vencido", tipo: "PENDIENTE", titulo: "en.jbufa.com (repositorio interno Jade Bird) inaccesible por certificado SSL vencido", contenido: "El dominio en.jbufa.com tiene el certificado SSL vencido y bloquea el acceso. El repositorio interno con catalogos historicos, guia de aplicacion y Excel de precios de liquidacion 2022 sigue sin recuperarse. El sitio corporativo en chino (jbufa.com, sin 'en.') si es accesible y ya se cargo." },
    { clave: "pend-52wmb-no-verificado", tipo: "PENDIENTE", titulo: "Registro de exportacion a Vietnam (52wmb.com) no verificado de forma independiente", contenido: "No se encontro el registro especifico del embarque B/L 108418787850 en busqueda publica. Los datos detallados suelen estar detras de una suscripcion de pago." },

    // Segunda pasada de verificacion, 2026-09-22
    {
      clave: "hall-china-products-publico",
      tipo: "HALLAZGO",
      titulo: "Hallazgo clave: el catalogo 'Products' de Maple Armor China SI es accesible, sin codigo de canje",
      contenido: "El sitio chino tiene DOS secciones de documentacion distintas. 1) 'Resource Center' (资源中心): boton de descarga ejecuta JavaScript y exige codigo de canje -- sigue bloqueado. 2) Catalogo de producto ('Products' / '产品介绍', URLs bajo /portal/tailorism/detail.html?id=N): cada ficha tiene un boton 'View Datasheet' que enlaza DIRECTO a un PDF publico en /upload/default/..., sin login ni codigo. Se verifico bajando un archivo completo. Se recorrieron mas de 50 fichas (ids 1-78) y se recuperaron mas de 35 datasheets reales.",
    },
    {
      clave: "hall-ul-no-implica-legado",
      tipo: "HALLAZGO",
      titulo: "Correccion metodologica: aparecer en un archivo UL no confirma que un producto este descontinuado",
      contenido: "En la primera pasada se marco como DESCONTINUADO/LEGACY toda referencia que solo aparecia en UL bajo categorias como 'Boxes, Noncoded' o 'Control Unit Accessories'. Esto resulto incorrecto: FW434/FW435 y FW722/FW752 tienen fichas VIGENTES en el catalogo publico Products. Un archivo UL acumula todos los modelos certificados historicamente bajo un mismo numero, vigentes y descontinuados mezclados. Se corrigieron FW721/722/723/751/752 y FW434/FW435 a ACTIVO/Series 2, y se bajaron FW190/FW201/FW337/FW397, FW841/FW831/FW859/FW121/FW122/FW123 y FW900/FW901/FW951/FW2900 de DESCONTINUADO a PENDIENTE.",
    },

    // Cotejo del acervo interno de Google Drive de BICO, 2026-09-23
    {
      clave: "2026-09-23-cotejo-hash-google-drive-interno",
      tipo: "HALLAZGO",
      titulo: "Cotejo por contenido (hash SHA-256) del acervo interno de Google Drive de BICO",
      contenido:
        "Se evaluo la carpeta compartida H:\\Mi unidad\\Compartido Faro Bico\\Maple Armor\\Documentacion Tecnica (64 archivos, excluyendo desktop.ini) comparando el hash SHA-256 de cada archivo contra los 67 documentos ya cargados en la base de conocimiento, en vez de comparar por nombre de archivo (instruccion expresa del usuario). Resultado: 22 archivos de la subcarpeta Datasheets resultaron ser copias identicas (mismo hash) de datasheets ya existentes con otros nombres de archivo y se omitieron sin duplicar. 42 archivos tenian contenido nuevo: 25 manuales de instalacion en Manuales/, 2 datasheets nuevos (FW434/FW435 y FW2601 PipeSense) en Datasheets/, 13 piezas de material de entrenamiento (4 quizzes, 1 ejercicio y 8 presentaciones) en Entrenamiento/, 1 instalador de software (S2 Configurator v2.1.6.2, 188MB, no copiado por exceder el limite de 50MB de la herramienta pero registrado como documento) y 1 catalogo general (V4) en Catalgo general/.",
    },
    {
      clave: "2026-09-23-correcciones-productos-desde-manuales-recibidos",
      tipo: "HALLAZGO",
      titulo: "Correcciones a fichas de producto a partir de manuales oficiales recibidos directamente",
      contenido:
        "La lectura de los manuales oficiales de instalacion recibidos permitio corregir 6 fichas de producto que tenian datos pendientes o incompletos: FW2411 (identificado como Hand-held Programmer, antes sin funcion definida), FW2845 (Protocol Converter Module que conecta el detector de ducto FW562 a los paneles FW2105/FW2107), FW2823 (Dual Input Relay Module), FW434 (confirmada capacidad de 16 modulos), FW435 (confirmada capacidad de 8 modulos) y FW2601 (confirmados SKUs opcionales de 1, 2 o 4 tubos, codigo real de datasheet DS-5034-1).",
    },
    {
      clave: "2026-09-23-nuevos-skus-por-variante-desde-manuales",
      tipo: "HALLAZGO",
      titulo: "15 nuevas referencias de producto reveladas por variante en manuales recibidos",
      contenido:
        "Los manuales oficiales recibidos revelaron variantes de producto no registradas previamente en la base de conocimiento: FW2107C (variante del panel FW2107, junto a FW2107 y FW2107M, segun DOC-FW2107-UM-R1.6); FW2724, FW2725 y FW2726 (estaciones manuales agrupadas como FW2721/FW2724, FW2722/FW2725, FW2723/FW2726 en DOC-FW272X-UM-R1.2); FW2963W/R y FW2973W/R (variantes de color blanco/rojo de las bocinas-estrobo de baja frecuencia en DOC-FW29X3-UM-R1.0); y FW2961R/W, FW2971R/W, FW2981R/W (variantes de color rojo/blanco de bocinas y estrobos en DOC-FW29X1-UM-R1.4). Tambien se registro S2-CONFIGURATOR como producto (software de programacion), con su manual de programacion oficial (DOC-S2 Configurator-PM-R1.1, 2026-02-01) e instalador. Pendiente: precisar la diferencia funcional exacta de cada variante frente a su modelo generico.",
    },

    // Lista de precios de distribucion BICO, 2026-09-23
    {
      clave: "2026-09-23-precios-distribucion-bico-incorporados",
      tipo: "HALLAZGO",
      titulo: "Lista de precios de distribucion BICO (2026-09-23) incorporada como precio por referencia",
      contenido:
        "Se incorporo la lista de precios de distribucion BICO recibida de Maple Armor (63 referencias con precio) como especificacion del grupo COMERCIAL en cada producto ('Precio distribucion BICO'). 58 referencias ya existian en la base y se les agrego el precio; 5 referencias eran nuevas y se crearon (FW2202, FW2371-4, FW2701, JBF 295K, FW2131). Ademas se corrigieron FW901R y FW901W: la lista los describe como 'HORN STROBE BASE' (categoria Base), no como dispositivos de notificacion visual genericos sin confirmar; se reclasificaron de NOTIFICACION/PENDIENTE a BASES/ACTIVO. El archivo original se conserva como documento tipo LISTA_PRECIOS vinculado a cada referencia.",
    },
    {
      clave: "2026-09-23-moneda-lista-precios-bico-no-especificada",
      tipo: "PENDIENTE",
      titulo: "Moneda de la lista de precios de distribucion BICO no especificada explicitamente",
      contenido:
        "La columna 'Precio BICO' usa formato de celda con simbolo '$' y configuracion regional es-CO (codigo de idioma 540A), pero el archivo no declara la moneda de forma explicita. Los valores (ej. USD 558.39 para el panel FW2105) son consistentes en magnitud con precios de distribuidor en dolares, no con pesos colombianos. Se registraron como USD por ese criterio, pero debe confirmarse formalmente con Maple Armor o BICO antes de usarlos en una cotizacion oficial.",
    },
    {
      clave: "2026-09-23-discrepancia-fw2202-vs-fw2201",
      tipo: "DISCREPANCIA",
      titulo: "FW2202 (lista de precios BICO) vs FW2201 (AMI confirmado) -- mismo nombre, numero distinto",
      contenido:
        "La lista de precios de distribucion BICO (2026-09-23) trae la referencia FW2202 con la descripcion 'ADVANCED MACHINE INTERFACE (AMI)', identica a la ya confirmada para FW2201 en el Resource Center de Maple Armor China. Podria ser un error de digitacion del proveedor al armar la lista, o una variante real distinta. Siguiendo la Regla 2 (no asumir equivalencias), se creo FW2202 como referencia separada en estado PENDIENTE en vez de fusionarla con FW2201; debe confirmarse con el fabricante cual de las dos hipotesis es correcta.",
      referencia: "FW2202",
    },
  ],
};
