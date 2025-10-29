import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Code } from 'mdast';
import type { Element } from 'hast';

/**
 * Remark plugin to convert Mermaid code blocks to HTML divs
 * that can be rendered by mermaid.js on the client side.
 * 
 * This plugin runs in the remark (markdown) phase and converts
 * code blocks with lang="mermaid" into a special structure that
 * will become a div.mermaid element after rehype conversion.
 */
const remarkMermaid: Plugin = () => {
  return (tree) => {
    visit(tree, 'code', (node: Code, index, parent) => {
      if (node.lang === 'mermaid') {
        // Convert to a "paragraph" containing raw HTML
        // This will be parsed by rehype and become a proper HAST node
        const htmlNode = node as any;
        htmlNode.type = 'html';
        htmlNode.value = `<pre class="mermaid">${node.value}</pre>`;

        // Note: We use <pre> instead of <div> because:
        // 1. It preserves whitespace (important for Mermaid syntax)
        // 2. It's semantically correct (preformatted text)
        // 3. Mermaid.js works with any element that has class="mermaid"
      }
    });
  };
};

export default remarkMermaid;
