// Spanish terms mirror the app's String Catalog (bóveda, lienzo, enlaces entrantes, destacados…).
const en = {
  langName: 'English',
  title: 'Netherite — Native notes in plain Markdown',
  description:
    'A native, local-first notes app for Mac, iPhone and iPad. Your knowledge in plain Markdown files you own. Opens Obsidian vaults as-is.',
  skip: 'Skip to content',
  nav: { label: 'Main', features: 'Features', open: 'Open source', github: 'GitHub', download: 'Download' },
  hero: {
    iconAlt: 'Netherite app icon',
    title: 'Your knowledge, in plain Markdown you own.',
    subtitle:
      'A native, local-first notes app for Mac, iPhone and iPad. Built with SwiftUI, it opens your Obsidian vaults as-is.',
    download: 'Download for macOS',
    github: 'View on GitHub',
    platforms: 'macOS 26 · iOS 26 · iPadOS 26 · Free and open source (GPLv3)',
  },
  mock: {
    crumb: 'Projects / Netherite launch.md',
    vault: 'Vault',
    daily: 'Daily',
    projects: 'Projects',
    note: 'Netherite launch',
    reading: 'Reading',
    base: 'Books.base',
    tags: ['#project', '#writing'],
    a: 'Ship the landing page, then write up the notes from ',
    link: '[[Weekly review]]',
    b: '. Remember: ',
    mark: 'your notes stay as plain files',
    c: '.',
    done: 'Design the hero',
    todo: 'Deploy to Cloudflare Pages',
    tip: 'Tip',
    tipText: 'Callouts, tables, math and Mermaid render right in the editor.',
    caption:
      'Illustration of a note in the Netherite editor with tags, a wikilink, a highlight, tasks and a callout.',
  },
  features: {
    title: 'Everything a second brain needs',
    subtitle:
      'Backlinks, a knowledge graph, an infinite canvas, database-like Bases and search with operators — all around a fast native editor.',
    groups: [
      {
        title: 'Writing',
        items: [
          ['Live Preview editor', 'Built on TextKit 2. Tasks, callouts, tables, math and Mermaid render in place; the Markdown only reappears on the line you edit.'],
          ['Reading view', 'The whole note rendered with interactive tasks, embeds and syntax-highlighted code.'],
          ['Completions', '[[ for links and headings, # for tags, / for slash commands and templates.'],
          ['Properties', 'YAML frontmatter edited as typed fields: text, number, checkbox, date and list.'],
        ],
      },
      {
        title: 'Connecting ideas',
        items: [
          ['Links & backlinks', 'Wikilinks, heading and ^block references, unlinked mentions, outline and footnotes.'],
          ['Rename-safe', 'Rename or move a note and every link pointing to it is rewritten.'],
          ['Graph view', 'Global and local force-directed graph with filters and tag colouring.'],
          ['Search', 'Full-text with tag:, path:, task:, [property:value], "phrases", OR and /regex/.'],
        ],
      },
      {
        title: 'Visual thinking',
        items: [
          ['Canvas', 'An infinite board of text, note, web and group cards. JSON Canvas compatible.'],
          ['Bases', '.base files that filter, sort and edit notes by their properties as tables, cards or lists.'],
          ['Core plugins', 'Daily notes, templates, bookmarks, workspaces, slides, audio recorder and more.'],
          ['Themes', 'JSON themes with light and dark variants, right inside your vault.'],
        ],
      },
      {
        title: 'Everywhere',
        items: [
          ['iCloud Drive sync', 'Or any local folder. Obsidian vaults open as-is.'],
          ['System integration', 'Share-sheet web clipper, widgets, Control Center, Shortcuts, Siri and Spotlight.'],
          ['Importer', 'Evernote, Notion, HTML and Apple Notes exports, and plain Markdown folders.'],
          ['Publish & CLI', 'Export a static site and deploy it to Cloudflare Pages, from the app or the netherite CLI.'],
        ],
      },
    ],
  },
  folder: {
    title: 'A vault is just a folder.',
    pre: 'No database, no lock-in. Every note is a Markdown file any other app can read — including Obsidian, whose wikilinks, ',
    and: ' and ',
    post: ' files Netherite understands. Keep your vault in iCloud Drive to sync between devices, or anywhere on disk.',
    treeLabel: 'Example vault folder',
    root: '~/iCloud Drive/Notes',
    daily: 'Daily/',
    projects: 'Projects/',
    note: 'Netherite launch.md',
    base: 'Books.base',
  },
  open: {
    title: 'Free, open source, yours.',
    text: "Netherite is licensed under the GPLv3, available in English and Spanish, and follows Apple's Human Interface Guidelines.",
    download: 'Download the latest release',
    star: 'Star on GitHub',
  },
  footer: { affiliation: 'Not affiliated with or endorsed by Obsidian.', made: 'Made with', coffee: 'coffee', by: 'by' },
};

export type Strings = typeof en;

const es: Strings = {
  langName: 'Español',
  title: 'Netherite — Notas nativas en Markdown plano',
  description:
    'Una app de notas nativa y local para Mac, iPhone y iPad. Tu conocimiento en archivos Markdown planos que son tuyos. Abre bóvedas de Obsidian tal cual.',
  skip: 'Saltar al contenido',
  nav: { label: 'Principal', features: 'Funciones', open: 'Código abierto', github: 'GitHub', download: 'Descargar' },
  hero: {
    iconAlt: 'Icono de la app Netherite',
    title: 'Tu conocimiento, en Markdown plano que es tuyo.',
    subtitle:
      'Una app de notas nativa y local para Mac, iPhone y iPad. Hecha con SwiftUI, abre tus bóvedas de Obsidian tal cual.',
    download: 'Descargar para macOS',
    github: 'Ver en GitHub',
    platforms: 'macOS 26 · iOS 26 · iPadOS 26 · Gratis y de código abierto (GPLv3)',
  },
  mock: {
    crumb: 'Proyectos / Lanzamiento de Netherite.md',
    vault: 'Bóveda',
    daily: 'Diario',
    projects: 'Proyectos',
    note: 'Lanzamiento de Netherite',
    reading: 'Lecturas',
    base: 'Libros.base',
    tags: ['#proyecto', '#escritura'],
    a: 'Publica la página y luego redacta las notas de ',
    link: '[[Revisión semanal]]',
    b: '. Recuerda: ',
    mark: 'tus notas siguen siendo archivos planos',
    c: '.',
    done: 'Diseñar el hero',
    todo: 'Desplegar en Cloudflare Pages',
    tip: 'Consejo',
    tipText: 'Los destacados, tablas, fórmulas y Mermaid se muestran directamente en el editor.',
    caption:
      'Ilustración de una nota en el editor de Netherite con etiquetas, un wikilink, un resaltado, tareas y un destacado.',
  },
  features: {
    title: 'Todo lo que necesita un segundo cerebro',
    subtitle:
      'Enlaces entrantes, un grafo de conocimiento, un lienzo infinito, Bases como bases de datos y búsqueda con operadores, todo alrededor de un editor nativo y rápido.',
    groups: [
      {
        title: 'Escritura',
        items: [
          ['Editor con vista previa en vivo', 'Basado en TextKit 2. Tareas, destacados, tablas, fórmulas y Mermaid se muestran en el lugar; el Markdown solo reaparece en la línea que editas.'],
          ['Vista de lectura', 'La nota completa renderizada, con tareas interactivas, incrustaciones y código con resaltado de sintaxis.'],
          ['Autocompletado', '[[ para enlaces y encabezados, # para etiquetas, / para comandos y plantillas.'],
          ['Propiedades', 'El frontmatter YAML se edita como campos tipados: texto, número, casilla, fecha y lista.'],
        ],
      },
      {
        title: 'Conectar ideas',
        items: [
          ['Enlaces y enlaces entrantes', 'Wikilinks, referencias a encabezados y ^bloques, menciones sin enlazar, esquema y notas al pie.'],
          ['Renombrado seguro', 'Renombra o mueve una nota y cada enlace que apunta a ella se reescribe.'],
          ['Vista de grafo', 'Grafo global y local dirigido por fuerzas, con filtros y colores por etiqueta.'],
          ['Búsqueda', 'Texto completo con tag:, path:, task:, [property:value], "frases", OR y /regex/.'],
        ],
      },
      {
        title: 'Pensamiento visual',
        items: [
          ['Lienzo', 'Un tablero infinito de tarjetas de texto, nota, web y grupo. Compatible con JSON Canvas.'],
          ['Bases', 'Archivos .base que filtran, ordenan y editan notas según sus propiedades, como tablas, tarjetas o listas.'],
          ['Plugins principales', 'Notas diarias, plantillas, marcadores, espacios de trabajo, diapositivas, grabadora de audio y más.'],
          ['Temas', 'Temas JSON con variantes clara y oscura, dentro de tu propia bóveda.'],
        ],
      },
      {
        title: 'En todas partes',
        items: [
          ['Sincronización con iCloud Drive', 'O con cualquier carpeta local. Las bóvedas de Obsidian se abren tal cual.'],
          ['Integración con el sistema', 'Web clipper desde la hoja de compartir, widgets, Centro de control, Atajos, Siri y Spotlight.'],
          ['Importador', 'Exportaciones de Evernote, Notion, HTML y Notas de Apple, y carpetas de Markdown plano.'],
          ['Publicar y CLI', 'Exporta un sitio estático y despliégalo en Cloudflare Pages, desde la app o con la CLI netherite.'],
        ],
      },
    ],
  },
  folder: {
    title: 'Una bóveda es solo una carpeta.',
    pre: 'Sin base de datos, sin ataduras. Cada nota es un archivo Markdown que cualquier otra app puede leer, incluido Obsidian, cuyos wikilinks y archivos ',
    and: ' y ',
    post: ' Netherite entiende. Guarda tu bóveda en iCloud Drive para sincronizarla entre dispositivos, o en cualquier lugar del disco.',
    treeLabel: 'Ejemplo de carpeta de una bóveda',
    root: '~/iCloud Drive/Notas',
    daily: 'Diario/',
    projects: 'Proyectos/',
    note: 'Lanzamiento de Netherite.md',
    base: 'Libros.base',
  },
  open: {
    title: 'Gratis, de código abierto, tuya.',
    text: 'Netherite tiene licencia GPLv3, está disponible en inglés y español, y sigue las Human Interface Guidelines de Apple.',
    download: 'Descargar la última versión',
    star: 'Dale una estrella en GitHub',
  },
  footer: { affiliation: 'Sin afiliación ni respaldo de Obsidian.', made: 'Hecho con', coffee: 'café', by: 'por' },
};

export type Lang = 'en' | 'es';
export const STRINGS: Record<Lang, Strings> = { en, es };
