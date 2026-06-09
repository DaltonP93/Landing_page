/**
 * Renderizador de Markdown mínimo y seguro (escapa HTML antes de formatear).
 * Soporta: ## y ### encabezados, **negrita**, *cursiva*, [texto](url),
 * listas con "- ", y párrafos separados por línea en blanco.
 */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function inline(s: string): string {
  return escapeHtml(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-neon-blue underline">$1</a>');
}

export function renderMarkdown(md: string): string {
  const blocks = md.split(/\n{2,}/);
  const html: string[] = [];

  for (const block of blocks) {
    const lines = block.split('\n');

    if (lines.every((l) => l.trim().startsWith('- '))) {
      const items = lines.map((l) => `<li>${inline(l.trim().slice(2))}</li>`).join('');
      html.push(`<ul class="list-disc pl-5 space-y-1 text-muted/70">${items}</ul>`);
      continue;
    }

    if (block.startsWith('### ')) {
      html.push(`<h3 class="text-lg font-semibold text-white mt-6 mb-2">${inline(block.slice(4))}</h3>`);
      continue;
    }
    if (block.startsWith('## ')) {
      html.push(`<h2 class="text-xl font-bold text-white mt-8 mb-3">${inline(block.slice(3))}</h2>`);
      continue;
    }

    html.push(`<p class="text-muted/70 leading-relaxed mb-4">${inline(block).replace(/\n/g, '<br/>')}</p>`);
  }

  return html.join('\n');
}
