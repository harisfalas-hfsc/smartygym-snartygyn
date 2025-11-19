import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TextAlign } from '@tiptap/extension-text-align';
import { Link } from '@tiptap/extension-link';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Underline } from '@tiptap/extension-underline';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Button } from './button';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Table as TableIcon,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Palette,
  Grid3x3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

// Extended TableCell with border customization
const CustomTableCell = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      borderColor: {
        default: null,
        parseHTML: element => element.getAttribute('data-border-color'),
        renderHTML: attributes => {
          if (!attributes.borderColor) return {};
          return { 
            'data-border-color': attributes.borderColor,
            style: `border-color: ${attributes.borderColor} !important;`
          };
        },
      },
      borderWidth: {
        default: '1px',
        parseHTML: element => element.getAttribute('data-border-width') || '1px',
        renderHTML: attributes => {
          return { 
            'data-border-width': attributes.borderWidth,
            style: `border-width: ${attributes.borderWidth} !important;`
          };
        },
      },
      borderStyle: {
        default: 'solid',
        parseHTML: element => element.getAttribute('data-border-style') || 'solid',
        renderHTML: attributes => {
          return { 
            'data-border-style': attributes.borderStyle,
            style: `border-style: ${attributes.borderStyle} !important;`
          };
        },
      },
    };
  },
});

// Extended TableHeader with border customization
const CustomTableHeader = TableHeader.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      borderColor: {
        default: null,
        parseHTML: element => element.getAttribute('data-border-color'),
        renderHTML: attributes => {
          if (!attributes.borderColor) return {};
          return { 
            'data-border-color': attributes.borderColor,
            style: `border-color: ${attributes.borderColor} !important;`
          };
        },
      },
      borderWidth: {
        default: '1px',
        parseHTML: element => element.getAttribute('data-border-width') || '1px',
        renderHTML: attributes => {
          return { 
            'data-border-width': attributes.borderWidth,
            style: `border-width: ${attributes.borderWidth} !important;`
          };
        },
      },
      borderStyle: {
        default: 'solid',
        parseHTML: element => element.getAttribute('data-border-style') || 'solid',
        renderHTML: attributes => {
          return { 
            'data-border-style': attributes.borderStyle,
            style: `border-style: ${attributes.borderStyle} !important;`
          };
        },
      },
    };
  },
});

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Start typing...',
  minHeight = '200px',
}) => {
  const [borderColor, setBorderColor] = useState('#000000');
  const [borderWidth, setBorderWidth] = useState('1px');
  const [borderStyle, setBorderStyle] = useState('solid');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      CustomTableHeader,
      CustomTableCell,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const applyBorderToCell = (color: string, width: string, style: string) => {
    editor.commands.updateAttributes('tableCell', {
      borderColor: color,
      borderWidth: width,
      borderStyle: style,
    });
    editor.commands.updateAttributes('tableHeader', {
      borderColor: color,
      borderWidth: width,
      borderStyle: style,
    });
  };

  const applyBorderToAllCells = (color: string, width: string, style: string) => {
    const { state } = editor;
    const { tr } = state;
    let modified = false;

    state.doc.descendants((node, pos) => {
      if (node.type.name === 'tableCell' || node.type.name === 'tableHeader') {
        tr.setNodeMarkup(pos, undefined, {
          ...node.attrs,
          borderColor: color,
          borderWidth: width,
          borderStyle: style,
        });
        modified = true;
      }
    });

    if (modified) {
      editor.view.dispatch(tr);
    }
  };

  const removeBordersFromTable = () => {
    applyBorderToAllCells('transparent', '0px', 'none');
  };

  const resetTableBorders = () => {
    applyBorderToAllCells('hsl(var(--border))', '1px', 'solid');
  };

  const applyGoldBorders = () => {
    applyBorderToAllCells('hsl(var(--primary))', '2px', 'solid');
  };

  return (
    <div className="border border-input rounded-md bg-background">
      <div className="flex flex-wrap gap-1 p-2 border-b border-input">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(editor.isActive('bold') && 'bg-muted')}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(editor.isActive('italic') && 'bg-muted')}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={cn(editor.isActive('underline') && 'bg-muted')}
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={cn(editor.isActive('strike') && 'bg-muted')}
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={cn(editor.isActive('heading', { level: 1 }) && 'bg-muted')}
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={cn(editor.isActive('heading', { level: 2 }) && 'bg-muted')}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={cn(editor.isActive('heading', { level: 3 }) && 'bg-muted')}
        >
          <Heading3 className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(editor.isActive('bulletList') && 'bg-muted')}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(editor.isActive('orderedList') && 'bg-muted')}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addTable}
        >
          <TableIcon className="h-4 w-4" />
        </Button>

        {editor.isActive('table') && (
          <>
            <div className="w-px h-6 bg-border mx-1" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="gap-1"
                >
                  <Palette className="h-4 w-4" />
                  <Grid3x3 className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64 bg-background z-50">
                <DropdownMenuLabel>Table Border Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <div className="p-2 space-y-3">
                  <div>
                    <label className="text-xs font-medium mb-1 block">Border Color</label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={borderColor}
                        onChange={(e) => setBorderColor(e.target.value)}
                        className="h-8 w-16 p-1 cursor-pointer"
                      />
                      <div className="flex gap-1 flex-wrap flex-1">
                        <button
                          type="button"
                          className="w-6 h-6 rounded border border-input bg-black"
                          onClick={() => setBorderColor('#000000')}
                          title="Black"
                        />
                        <button
                          type="button"
                          className="w-6 h-6 rounded border border-input bg-gray-500"
                          onClick={() => setBorderColor('#6b7280')}
                          title="Gray"
                        />
                        <button
                          type="button"
                          className="w-6 h-6 rounded border border-input"
                          style={{ backgroundColor: 'hsl(var(--primary))' }}
                          onClick={() => {
                            const root = document.documentElement;
                            const primaryHsl = getComputedStyle(root).getPropertyValue('--primary').trim();
                            setBorderColor(`hsl(${primaryHsl})`);
                          }}
                          title="Primary/Gold"
                        />
                        <button
                          type="button"
                          className="w-6 h-6 rounded border border-input bg-white"
                          onClick={() => setBorderColor('#ffffff')}
                          title="White"
                        />
                        <button
                          type="button"
                          className="w-6 h-6 rounded border-2 border-red-500 bg-transparent relative"
                          onClick={() => setBorderColor('transparent')}
                          title="Transparent"
                        >
                          <span className="absolute inset-0 flex items-center justify-center text-red-500 text-xs font-bold">✕</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium mb-1 block">Border Width</label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={borderWidth === '0px' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setBorderWidth('0px')}
                        className="flex-1 text-xs"
                      >
                        None
                      </Button>
                      <Button
                        type="button"
                        variant={borderWidth === '1px' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setBorderWidth('1px')}
                        className="flex-1 text-xs"
                      >
                        Thin
                      </Button>
                      <Button
                        type="button"
                        variant={borderWidth === '2px' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setBorderWidth('2px')}
                        className="flex-1 text-xs"
                      >
                        Medium
                      </Button>
                      <Button
                        type="button"
                        variant={borderWidth === '3px' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setBorderWidth('3px')}
                        className="flex-1 text-xs"
                      >
                        Thick
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium mb-1 block">Border Style</label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={borderStyle === 'solid' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setBorderStyle('solid')}
                        className="flex-1 text-xs"
                      >
                        Solid
                      </Button>
                      <Button
                        type="button"
                        variant={borderStyle === 'dashed' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setBorderStyle('dashed')}
                        className="flex-1 text-xs"
                      >
                        Dashed
                      </Button>
                      <Button
                        type="button"
                        variant={borderStyle === 'dotted' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setBorderStyle('dotted')}
                        className="flex-1 text-xs"
                      >
                        Dotted
                      </Button>
                    </div>
                  </div>
                </div>

                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  onClick={() => applyBorderToCell(borderColor, borderWidth, borderStyle)}
                  className="cursor-pointer"
                >
                  Apply to Selected Cell
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => applyBorderToAllCells(borderColor, borderWidth, borderStyle)}
                  className="cursor-pointer"
                >
                  Apply to All Cells
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Quick Presets</DropdownMenuLabel>
                
                <DropdownMenuItem onClick={removeBordersFromTable} className="cursor-pointer">
                  Remove All Borders
                </DropdownMenuItem>
                <DropdownMenuItem onClick={resetTableBorders} className="cursor-pointer">
                  Default Borders
                </DropdownMenuItem>
                <DropdownMenuItem onClick={applyGoldBorders} className="cursor-pointer">
                  Gold Borders
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addLink}
          className={cn(editor.isActive('link') && 'bg-muted')}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={cn(editor.isActive({ textAlign: 'left' }) && 'bg-muted')}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={cn(editor.isActive({ textAlign: 'center' }) && 'bg-muted')}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={cn(editor.isActive({ textAlign: 'right' }) && 'bg-muted')}
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none p-3"
        style={{ minHeight }}
      />
      <style>{`
        .ProseMirror {
          outline: none;
          min-height: ${minHeight};
          word-wrap: break-word;
          overflow-wrap: break-word;
          white-space: normal;
          max-width: 100%;
        }
        .ProseMirror p {
          margin: 0.5em 0;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        .ProseMirror h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 0.5em 0;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        .ProseMirror h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.5em 0;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        .ProseMirror h3 {
          font-size: 1.25em;
          font-weight: bold;
          margin: 0.5em 0;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        .ProseMirror ul, .ProseMirror ol {
          padding-left: 1.5em;
          margin: 0.5em 0;
        }
        .ProseMirror table {
          border-collapse: collapse;
          margin: 1em 0;
          overflow: hidden;
          table-layout: fixed;
          width: 100%;
        }
        .ProseMirror table td, .ProseMirror table th {
          border: 1px solid hsl(var(--border));
          padding: 0.5em;
          position: relative;
          vertical-align: top;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        .ProseMirror table th {
          background-color: hsl(var(--muted));
          font-weight: bold;
          text-align: left;
        }
        .ProseMirror a {
          color: hsl(var(--primary));
          text-decoration: underline;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
      `}</style>
    </div>
  );
};
