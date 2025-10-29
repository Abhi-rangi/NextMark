/**
 * @visualizer/lsp
 * Language Server Protocol implementation for Smart Markdown editing
 * 
 * @packageDocumentation
 */

/**
 * LSP server configuration options
 * @public
 */
export interface LspServerOptions {
    /** Enable diagnostic reporting */
    diagnostics?: boolean;
    /** Enable hover previews */
    hover?: boolean;
    /** Enable auto-completion */
    completion?: boolean;
    /** Enable code actions */
    codeActions?: boolean;
}

/**
 * Represents a markdown diagnostics issue
 * @public
 */
export interface MarkdownDiagnostic {
    line: number;
    column: number;
    severity: 'error' | 'warning' | 'info';
    message: string;
}

/**
 * Start the LSP server
 * @public
 * @remarks This is a placeholder implementation
 */
export async function startServer(options?: LspServerOptions): Promise<void> {
    throw new Error('LSP server not yet implemented. See packages/lsp/README.md for planned features.');
}

/**
 * Validate markdown document and return diagnostics
 * @public
 */
export function validateDocument(content: string): MarkdownDiagnostic[] {
    throw new Error('LSP validation not yet implemented. See packages/lsp/README.md for planned features.');
}

