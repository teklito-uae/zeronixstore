import { useEffect, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Table as TiptapTable } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import type { Editor } from "@tiptap/core";
import type { EditorState } from "@tiptap/pm/state";
import type { Schema } from "@tiptap/pm/model";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import {
  Bold,
  Columns3,
  Italic,
  Heading2,
  Heading3,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo,
  Rows3,
  Table as TableIcon,
  Trash2,
  Undo,
  WandSparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  enableTables?: boolean;
  /** Fixes the editable area to this height (e.g. "320px") and scrolls internally instead of growing. */
  contentHeight?: string;
}

function isSelectionInsideTable(state: EditorState): boolean {
  const { $from } = state.selection;
  for (let depth = $from.depth; depth > 0; depth -= 1) {
    if ($from.node(depth).type.spec.tableRole) return true;
  }
  return false;
}

function buildTableNodeFromGrid(schema: Schema, grid: string[][]) {
  const { table, tableRow, tableCell, tableHeader, paragraph } = schema.nodes;
  if (!table || !tableRow || !tableCell || !tableHeader || !paragraph) return null;
  const colCount = Math.max(...grid.map((row) => row.length));
  const rows = grid.map((cells, rowIndex) =>
    tableRow.create(
      null,
      Array.from({ length: colCount }, (_, colIndex) => {
        const raw = (cells[colIndex] ?? "").trim();
        const cellType = rowIndex === 0 ? tableHeader : tableCell;
        const content = raw ? paragraph.create(null, schema.text(raw)) : paragraph.create();
        return cellType.create(null, content);
      }),
    ),
  );
  return table.create(null, rows);
}

/**
 * Strips the whitespace mess that tends to come in with pasted content: stray
 * non-breaking spaces, runs of repeated spaces, leading/trailing indentation
 * inside a line, doubled-up line breaks, and empty paragraphs that render as
 * blank-line gaps. Runs as a single transaction so it's one undo step.
 */
function cleanUpFormatting(editor: Editor) {
  const { state } = editor;
  const { doc } = state;
  const tr = state.tr;

  const ops: { from: number; to: number; text?: string }[] = [];

  // Decide up front which empty top-level paragraphs/headings are safe to drop.
  // If every top-level block happens to be blank, the schema still requires at
  // least one block left behind, so the first blank one is spared.
  const isRemovableEmptyBlock = (n: ProseMirrorNode) =>
    (n.type.name === "paragraph" || n.type.name === "heading") && n.content.size === 0;
  const topLevel: { node: ProseMirrorNode; pos: number }[] = [];
  doc.forEach((child, offset) => topLevel.push({ node: child, pos: offset }));
  const hasKeeperBlock = topLevel.some((c) => !isRemovableEmptyBlock(c.node));
  const removablePositions = new Set(
    topLevel
      .filter((c) => isRemovableEmptyBlock(c.node))
      .slice(hasKeeperBlock ? 0 : 1)
      .map((c) => c.pos),
  );

  doc.descendants((node, pos, parent: ProseMirrorNode | null) => {
    if (node.type.name === "codeBlock") return false;

    if (node.isTextblock) {
      let breakRun = 0;
      node.forEach((child, offset) => {
        if (child.type.name === "hardBreak") {
          breakRun += 1;
          if (breakRun > 1) {
            ops.push({ from: pos + 1 + offset, to: pos + 1 + offset + child.nodeSize });
          }
        } else {
          breakRun = 0;
        }
      });

      if (removablePositions.has(pos)) {
        ops.push({ from: pos, to: pos + node.nodeSize });
      }
    }

    if (node.isText && node.text) {
      const isFirst = parent?.firstChild === node;
      const isLast = parent?.lastChild === node;
      let cleaned = node.text.replace(/ /g, " ").replace(/[ \t]{2,}/g, " ");
      if (isFirst) cleaned = cleaned.replace(/^[ \t]+/, "");
      if (isLast) cleaned = cleaned.replace(/[ \t]+$/, "");
      if (cleaned !== node.text) {
        ops.push({ from: pos, to: pos + node.nodeSize, text: cleaned });
      }
    }
  });

  ops.sort((a, b) => b.from - a.from);
  for (const op of ops) {
    if (op.text !== undefined) {
      tr.insertText(op.text, op.from, op.to);
    } else {
      tr.delete(op.from, op.to);
    }
  }

  if (tr.docChanged) {
    editor.view.dispatch(tr);
  }
  editor.commands.focus();
}

export function RichTextEditor({ value, onChange, placeholder, enableTables, contentHeight }: RichTextEditorProps) {
  const [, setToolbarTick] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: placeholder ?? "Write the article…" }),
      ...(enableTables
        ? [TiptapTable.configure({ resizable: false }), TableRow, TableHeader, TableCell]
        : []),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: cn(
          "max-w-none overflow-y-auto px-3 py-2.5 text-sm leading-relaxed focus:outline-none [&_p]:my-2 [&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mt-3 [&_h3]:mb-2 [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_img]:rounded-lg [&_img]:my-3 [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-primary [&_blockquote]:pl-3 [&_blockquote]:italic [&_table]:my-3 [&_table]:w-full [&_table]:table-fixed [&_table]:border-collapse [&_table]:overflow-hidden [&_table]:rounded-lg [&_table]:border [&_table]:border-border [&_td]:border [&_td]:border-border [&_td]:p-2 [&_td]:align-top [&_th]:border [&_th]:border-border [&_th]:bg-muted/60 [&_th]:p-2 [&_th]:text-left [&_th]:align-top [&_th]:font-semibold [&_tr:nth-child(even)]:bg-muted/30 [&_.selectedCell]:bg-primary/10",
          !contentHeight && "min-h-[280px]",
        ),
        ...(contentHeight ? { style: `height: ${contentHeight}` } : {}),
      },
      handlePaste: enableTables
        ? (view, event) => {
            const text = event.clipboardData?.getData("text/plain");
            if (!text) return false;
            const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").filter((line) => line.length > 0);
            if (lines.length < 2 || !lines.some((line) => line.includes("\t"))) return false;
            if (isSelectionInsideTable(view.state)) return false;

            const grid = lines.map((line) => line.split("\t"));
            const tableNode = buildTableNodeFromGrid(view.state.schema, grid);
            if (!tableNode) return false;

            event.preventDefault();
            const tr = view.state.tr.replaceSelectionWith(tableNode).scrollIntoView();
            view.dispatch(tr);
            return true;
          }
        : undefined,
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    onSelectionUpdate: () => setToolbarTick((t) => t + 1),
  });

  // Keeps the editor in sync when `value` is set programmatically (e.g. loading
  // an existing post after the editor has already mounted with empty content).
  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, value]);

  if (!editor) return null;

  function toggleLink() {
    if (!editor) return;
    if (editor.isActive("link")) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    const url = window.prompt("Link URL");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  }

  const toolbarItems = [
    { icon: Bold, label: "Bold", active: editor.isActive("bold"), onClick: () => editor.chain().focus().toggleBold().run() },
    { icon: Italic, label: "Italic", active: editor.isActive("italic"), onClick: () => editor.chain().focus().toggleItalic().run() },
    { icon: Heading2, label: "Heading 2", active: editor.isActive("heading", { level: 2 }), onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { icon: Heading3, label: "Heading 3", active: editor.isActive("heading", { level: 3 }), onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
    { icon: List, label: "Bullet list", active: editor.isActive("bulletList"), onClick: () => editor.chain().focus().toggleBulletList().run() },
    { icon: ListOrdered, label: "Numbered list", active: editor.isActive("orderedList"), onClick: () => editor.chain().focus().toggleOrderedList().run() },
    { icon: Quote, label: "Quote", active: editor.isActive("blockquote"), onClick: () => editor.chain().focus().toggleBlockquote().run() },
    { icon: LinkIcon, label: "Link", active: editor.isActive("link"), onClick: toggleLink },
  ];

  const inTable = enableTables && editor.isActive("table");

  return (
    <div className="overflow-hidden rounded-lg border border-input">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/40 p-1.5">
        {toolbarItems.map(({ icon: Icon, label, active, onClick }) => (
          <Button
            key={label}
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={label}
            aria-pressed={active}
            onClick={onClick}
            className={cn(active && "bg-muted text-foreground")}
          >
            <Icon />
          </Button>
        ))}

        {enableTables && (
          <>
            <Separator orientation="vertical" className="mx-1 h-5" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Table"
                  aria-pressed={inTable}
                  className={cn(inTable && "bg-muted text-foreground")}
                >
                  <TableIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {!inTable ? (
                  <DropdownMenuItem
                    onSelect={() =>
                      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
                    }
                  >
                    <TableIcon />
                    Insert table
                  </DropdownMenuItem>
                ) : (
                  <>
                    <DropdownMenuItem onSelect={() => editor.chain().focus().addRowBefore().run()}>
                      <Rows3 />
                      Insert row above
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => editor.chain().focus().addRowAfter().run()}>
                      <Rows3 />
                      Insert row below
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => editor.chain().focus().deleteRow().run()}
                      className="text-destructive"
                    >
                      <Trash2 />
                      Delete row
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => editor.chain().focus().addColumnBefore().run()}>
                      <Columns3 />
                      Insert column left
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => editor.chain().focus().addColumnAfter().run()}>
                      <Columns3 />
                      Insert column right
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => editor.chain().focus().deleteColumn().run()}
                      className="text-destructive"
                    >
                      <Trash2 />
                      Delete column
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => editor.chain().focus().toggleHeaderRow().run()}>
                      <TableIcon />
                      Toggle header row
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => editor.chain().focus().deleteTable().run()}
                      className="text-destructive"
                    >
                      <Trash2 />
                      Delete table
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}

        <Separator orientation="vertical" className="mx-1 h-5" />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Clean up formatting"
          title="Clean up formatting — removes extra blank lines, stray spaces, and repeated line breaks"
          onClick={() => cleanUpFormatting(editor)}
        >
          <WandSparkles />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-5" />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Undo"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Redo"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo />
        </Button>
      </div>
      <EditorContent editor={editor} className="bg-background" />
      {enableTables && (
        <p className="border-t border-border bg-muted/20 px-3 py-1.5 text-xs text-muted-foreground">
          Tip: paste tab-separated data (e.g. copied from Excel or Google Sheets) to create a table automatically.
        </p>
      )}
    </div>
  );
}
