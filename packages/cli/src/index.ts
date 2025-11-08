#!/usr/bin/env node

/**
 * @visualizer/cli
 * Command-line tool for converting Markdown to HTML
 *
 * @packageDocumentation
 */

import { readFile, writeFile } from 'node:fs/promises';
import { stderr, stdout } from 'node:process';
import { normalize, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { process as renderMarkdown } from '@visualizer/core';

/**
 * CLI options for markdown conversion
 * @public
 */
export interface CliOptions {
  input: string;
  output?: string;
  watch?: boolean;
  theme?: string;
  highlight?: boolean;
  gfm?: boolean;
  math?: boolean;
  diagrams?: boolean;
}

/**
 * 🔒 SECURITY: Validate and sanitize file paths
 * Prevents path traversal attacks (../../etc/passwd)
 * @internal
 */
function validatePath(path: string, purpose: 'input' | 'output'): string {
  const normalized = normalize(path);

  // Reject paths that traverse upward beyond current directory
  if (normalized.includes('..')) {
    throw new Error(`🔒 Security: Path traversal detected in ${purpose} path: ${path}`);
  }

  // Reject absolute paths to sensitive system directories
  const sensitivePatterns = ['/etc/', '/sys/', '/proc/', '/root/', 'C:\\Windows\\'];
  if (sensitivePatterns.some(pattern => normalized.includes(pattern))) {
    throw new Error(`🔒 Security: Access to system directory denied: ${path}`);
  }

  return resolve(normalized);
}

async function readMarkdownFile(filePath: string): Promise<string> {
  try {
    return await readFile(filePath, 'utf8');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to read input file: ${message}`);
  }
}

async function writeOutputFile(filePath: string, contents: string): Promise<void> {
  try {
    await writeFile(filePath, contents, 'utf8');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to write output file: ${message}`);
  }
}

function printUsage(): void {
  stdout.write(
    [
      'md-visualizer',
      'Usage: md-visualizer <input.md> [--output <file>]',
      '',
      'Converts a Markdown file to HTML using @visualizer/core.',
    ].join('\n') + '\n\n',
  );
}

/**
 * Convert markdown file to HTML via CLI
 * @public
 * @remarks This is a placeholder implementation
 */
export async function convertMarkdown(options: CliOptions): Promise<void> {
  // 🔒 SECURITY: Validate paths before any file operations
  const inputPath = validatePath(options.input, 'input');
  const markdown = await readMarkdownFile(inputPath);
  const html = await renderMarkdown(markdown);

  if (options.output) {
    const outputPath = validatePath(options.output, 'output');
    await writeOutputFile(outputPath, html);
    return;
  }

  stdout.write(`${html}\n`);
}

/**
 * Main CLI entry point
 * @public
 */
export async function main(args: string[]): Promise<void> {
  if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
    printUsage();
    if (args.length === 0) {
      throw new Error('Missing input file argument.');
    }
    return;
  }

  if (args.includes('-v') || args.includes('--version')) {
    stdout.write(`@visualizer/cli v0.0.0\n`);
    return;
  }

  const input = args.find(arg => !arg.startsWith('-'));
  if (!input) {
    printUsage();
    throw new Error('Missing input file argument.');
  }

  const outputFlagIndex = args.findIndex(arg => arg === '-o' || arg === '--output');
  const outputValue = outputFlagIndex >= 0 ? args[outputFlagIndex + 1] : undefined;

  await convertMarkdown({
    input,
    output: outputValue,
  });
}

const executedDirectly =
  typeof process.argv[1] === 'string' && import.meta.url === pathToFileURL(process.argv[1]).href;

if (executedDirectly) {
  main(process.argv.slice(2)).catch(error => {
    const message = error instanceof Error ? error.message : String(error);
    stderr.write(`Error: ${message}\n`);
    process.exit(1);
  });
}
