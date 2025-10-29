/**
 * @visualizer/vscode-ext
 * VS Code extension for Smart Markdown Visualizer
 * 
 * @packageDocumentation
 */

/**
 * Extension configuration
 * @public
 */
export interface ExtensionConfig {
    /** Enable live preview panel */
    enablePreview?: boolean;
    /** Enable diagnostics */
    enableDiagnostics?: boolean;
    /** Preview theme */
    theme?: string;
    /** Auto-scroll synchronization */
    syncScroll?: boolean;
}

/**
 * Extension context for VS Code
 * @public
 * @remarks This is a placeholder type
 */
export interface ExtensionContext {
    subscriptions: any[];
    extensionPath: string;
}

/**
 * Activate the VS Code extension
 * @public
 * @remarks This is a placeholder implementation
 */
export function activate(context: ExtensionContext): void {
    throw new Error('VS Code extension not yet implemented. See packages/vscode-ext/README.md for planned features.');
}

/**
 * Deactivate the VS Code extension
 * @public
 */
export function deactivate(): void {
    // Cleanup when implemented
}

/**
 * Open markdown preview panel
 * @public
 */
export function openPreview(documentUri: string): void {
    throw new Error('Preview functionality not yet implemented.');
}

