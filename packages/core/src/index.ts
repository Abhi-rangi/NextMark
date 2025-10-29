import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import remarkMermaid from './remark-mermaid-plugin.js';
import type { Element } from 'hast';

/**
 * Security-hardened sanitization schema
 * Extends default schema with support for:
 * - Code syntax highlighting (class names)
 * - KaTeX math rendering (specific classes and attributes)
 * - Mermaid diagrams (pre-rendered SVG)
 */
const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    // Allow code highlighting classes
    code: [...(defaultSchema.attributes?.code || []), 'className'],
    span: [...(defaultSchema.attributes?.span || []), 'className', 'style'],
    div: [...(defaultSchema.attributes?.div || []), 'className'],
    pre: [...(defaultSchema.attributes?.pre || []), 'className'],
    // KaTeX requires specific attributes
    annotation: ['encoding'],
    math: ['xmlns'],
    mi: [],
    mn: [],
    mo: [],
    mrow: [],
    mfrac: [],
    msup: [],
    msub: [],
    // Allow SVG for Mermaid (already sanitized by mermaid library)
    svg: [
      ...(defaultSchema.attributes?.svg || []),
      'className',
      'viewBox',
      'width',
      'height',
      'xmlns'
    ],
    path: ['d', 'fill', 'stroke', 'strokeWidth', 'className'],
    g: ['className', 'transform'],
    rect: ['x', 'y', 'width', 'height', 'fill', 'stroke', 'className'],
    circle: ['cx', 'cy', 'r', 'fill', 'stroke', 'className'],
    text: ['x', 'y', 'className', 'textAnchor', 'dominantBaseline'],
    line: ['x1', 'y1', 'x2', 'y2', 'stroke', 'strokeWidth', 'className'],
    polygon: ['points', 'fill', 'stroke', 'className'],
  },
  tagNames: [
    ...(defaultSchema.tagNames || []),
    // KaTeX math elements
    'math',
    'annotation',
    'semantics',
    'mrow',
    'mi',
    'mn',
    'mo',
    'mfrac',
    'msup',
    'msub',
    'mtext',
    // SVG elements for Mermaid
    'svg',
    'g',
    'path',
    'rect',
    'circle',
    'text',
    'line',
    'polygon',
    'defs',
    'marker',
  ],
};

export async function process(markdown: string) {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath) // Add math support
    .use(remarkMermaid) // Add mermaid plugin (outputs HTML nodes)
    .use(remarkRehype, { allowDangerousHtml: true }) // Parse HTML from plugins
    .use(rehypeRaw) // 🔧 Parse raw HTML strings into proper HAST nodes
    .use(rehypeKatex) // Render math with KaTeX
    .use(rehypeHighlight)
    .use(rehypeSanitize, sanitizeSchema) // 🔒 SECURITY: Sanitize AFTER parsing
    .use(rehypeStringify) // Convert to HTML string
    .process(markdown);

  return String(file);
}
