import { Component } from '@angular/core';

const REPO = 'https://github.com/Im-Fran/Netherite';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
  readonly repo = REPO;
  readonly download = `${REPO}/releases/latest`;
  readonly year = new Date().getFullYear();

  readonly groups = [
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
  ];
}
