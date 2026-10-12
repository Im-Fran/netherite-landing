#!/usr/bin/env node
// Builds public/templates/index.json from public/templates/<lang>/<id>.md and
// public/themes/index.json from public/themes/<id>.json. Both are generated, not committed.
//
// Template metadata lives in `template-*` lines of the frontmatter; they are removed as text
// (bodies use {{placeholders}}, which aren't valid YAML) and the rest is the body the app installs.
// Same format as Netherite's TemplateCatalog. `--check` runs the self-tests.
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const PUBLIC = new URL('../public/', import.meta.url).pathname;
const LANGS = ['en', 'es'];

/** Returns [metadata without the `template-` prefix, installable body]. */
export function parse(text) {
  const lines = text.split('\n');
  if (lines[0]?.trim() !== '---') return [{}, text];
  const end = lines.findIndex((l, i) => i > 0 && l.trim() === '---');
  if (end < 0) return [{}, text];
  const meta = {};
  const kept = [];
  for (const line of lines.slice(1, end)) {
    const i = line.indexOf(':');
    const key = line.slice(0, i).trim();
    if (i >= 0 && key.startsWith('template-')) meta[key.slice('template-'.length)] = line.slice(i + 1).trim();
    else kept.push(line);
  }
  const rest = lines.slice(end + 1).join('\n');
  return [meta, kept.length ? `---\n${kept.join('\n')}\n---\n${rest}` : rest.replace(/^\n+/, '')];
}

export function buildTemplates(root) {
  const entries = [];
  for (const lang of readdirSync(root, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)) {
    if (!LANGS.includes(lang)) throw new Error(`templates/${lang}: language folder must be ${LANGS.join(' or ')}`);
    for (const file of readdirSync(join(root, lang)).filter((f) => f.endsWith('.md'))) {
      const [meta, body] = parse(readFileSync(join(root, lang, file), 'utf8'));
      if (!meta.name) throw new Error(`templates/${lang}/${file}: missing template-name`);
      entries.push({
        id: file.slice(0, -3),
        lang,
        name: meta.name,
        description: meta.description ?? '',
        symbol: meta.symbol || 'doc.text',
        tags: (meta.tags ?? '').split(',').map((t) => t.trim()).filter(Boolean),
        path: `templates/${lang}/${file}`,
        body,
      });
    }
  }
  const english = new Set(entries.filter((e) => e.lang === 'en').map((e) => e.id));
  const missing = [...new Set(entries.map((e) => e.id))].filter((id) => !english.has(id));
  if (missing.length) throw new Error(`missing English version: ${missing.sort().join(', ')}`);
  entries.sort((a, b) => (a.id === b.id ? a.lang.localeCompare(b.lang) : a.id.localeCompare(b.id)));
  return { version: 1, templates: entries };
}

/** Themes in the app's Theme JSON format (`.netherite/themes/<name>.json`), plus their id and path. */
export function buildThemes(root) {
  const themes = readdirSync(root)
    .filter((f) => f.endsWith('.json') && f !== 'index.json')
    .sort()
    .map((file) => {
      const theme = JSON.parse(readFileSync(join(root, file), 'utf8'));
      if (typeof theme.name !== 'string' || !theme.name) throw new Error(`themes/${file}: missing name`);
      return { id: file.slice(0, -5), path: `themes/${file}`, ...theme };
    });
  return { version: 1, themes };
}

function check() {
  const [meta, body] = parse('---\ntemplate-name: Meeting\ntemplate-tags: work, meetings\ndate: {{date}} {{time}}\n---\n# {{title}}\n\n---\nend\n');
  assert.deepEqual(meta, { name: 'Meeting', tags: 'work, meetings' });
  assert.equal(body, '---\ndate: {{date}} {{time}}\n---\n# {{title}}\n\n---\nend\n');
  assert.equal(parse('---\ntemplate-name: To-do\n---\n# {{title}}\n')[1], '# {{title}}\n');
  assert.deepEqual(parse('# plain\n'), [{}, '# plain\n']);
  assert.deepEqual(parse('---\nunclosed\n'), [{}, '---\nunclosed\n']);

  const dir = mkdtempSync(join(tmpdir(), 'catalog-'));
  try {
    const t = join(dir, 'templates');
    mkdirSync(join(t, 'en'), { recursive: true });
    mkdirSync(join(t, 'es'));
    writeFileSync(join(t, 'en', 'a.md'), '---\ntemplate-name: A\ntemplate-tags: x, y\n---\n# A\n');
    writeFileSync(join(t, 'es', 'a.md'), '---\ntemplate-name: A es\n---\n# A\n');
    const out = buildTemplates(t);
    assert.deepEqual(out.templates.map((e) => [e.id, e.lang]), [['a', 'en'], ['a', 'es']]);
    assert.deepEqual(out.templates[0].tags, ['x', 'y']);
    assert.equal(out.templates[0].symbol, 'doc.text');
    assert.equal(out.templates[0].path, 'templates/en/a.md');
    writeFileSync(join(t, 'es', 'b.md'), '---\ntemplate-name: B\n---\n');
    assert.throws(() => buildTemplates(t), /missing English/);
    rmSync(join(t, 'es', 'b.md'));
    writeFileSync(join(t, 'en', 'c.md'), '# no metadata\n');
    assert.throws(() => buildTemplates(t), /missing template-name/);
    rmSync(join(t, 'en', 'c.md'));
    mkdirSync(join(t, 'fr'));
    assert.throws(() => buildTemplates(t), /language folder/);

    const th = join(dir, 'themes');
    mkdirSync(th);
    writeFileSync(join(th, 'ocean.json'), '{"name":"Ocean","accent":{"light":"#000","dark":"#fff"}}');
    writeFileSync(join(th, 'index.json'), '{}');
    assert.deepEqual(buildThemes(th).themes, [{ id: 'ocean', path: 'themes/ocean.json', name: 'Ocean', accent: { light: '#000', dark: '#fff' } }]);
    writeFileSync(join(th, 'bad.json'), '{}');
    assert.throws(() => buildThemes(th), /missing name/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
  console.log('ok');
}

if (process.argv.includes('--check')) {
  check();
} else {
  const write = (path, data) => writeFileSync(join(PUBLIC, path), JSON.stringify(data, null, 2) + '\n');
  write('templates/index.json', buildTemplates(join(PUBLIC, 'templates')));
  write('themes/index.json', buildThemes(join(PUBLIC, 'themes')));
}
