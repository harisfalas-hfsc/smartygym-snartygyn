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
import { Image } from '@tiptap/extension-image';
import { Highlight } from '@tiptap/extension-highlight';
import { CodeBlock } from '@tiptap/extension-code-block';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
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
  ImageIcon,
  Upload,
  Plus,
  Trash,
  Merge,
  Split,
  Table2,
  Smile,
  Type,
  Highlighter,
  Quote,
  Minus,
  Code,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

// Extended TableCell with border and background customization
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
      backgroundColor: {
        default: null,
        parseHTML: element => element.getAttribute('data-bg-color') || element.style.backgroundColor,
        renderHTML: attributes => {
          if (!attributes.backgroundColor) return {};
          return { 
            'data-bg-color': attributes.backgroundColor,
            style: `background-color: ${attributes.backgroundColor} !important;`
          };
        },
      },
    };
  },
});

// Extended TableHeader with border and background customization
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
      backgroundColor: {
        default: null,
        parseHTML: element => element.getAttribute('data-bg-color') || element.style.backgroundColor,
        renderHTML: attributes => {
          if (!attributes.backgroundColor) return {};
          return { 
            'data-bg-color': attributes.backgroundColor,
            style: `background-color: ${attributes.backgroundColor} !important;`
          };
        },
      },
    };
  },
});

// Special characters grouped by category
const SPECIAL_CHARS = {
  Currency: ['€', '£', '¥', '$', '¢', '₹', '₽', '₩', '₪'],
  Arrows: ['→', '←', '↑', '↓', '↔', '⇒', '⇐', '⇑', '⇓'],
  Math: ['±', '×', '÷', '≠', '≈', '≤', '≥', '∞', '√', '∑', '∏'],
  Symbols: ['©', '®', '™', '§', '¶', '•', '°', '†', '‡', '¤'],
  Punctuation: ['…', '–', '—', '\u201c', '\u201d', '\u2018', '\u2019', '‹', '›', '«', '»'],
  Misc: ['★', '☆', '♥', '♦', '♣', '♠', '✓', '✗', '✔', '✘'],
};

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Start typing...',
  minHeight = '200px',
}) => {
  const [borderColor, setBorderColor] = useState('#000000');
  const [borderWidth, setBorderWidth] = useState('1px');
  const [borderStyle, setBorderStyle] = useState('solid');
  const [cellBgColor, setCellBgColor] = useState('#ffffff');
  const [applyToAllCells, setApplyToAllCells] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [tableWithHeader, setTableWithHeader] = useState(true);
  const [showTableDialog, setShowTableDialog] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // We'll use the separate CodeBlock extension
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      CodeBlock,
      Subscript,
      Superscript,
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'editor-image',
        },
      }),
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
        HTMLAttributes: {
          class: 'text-primary hover:underline',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      handlePaste: (view, event) => {
        // Enhanced paste handling for Word/rich documents
        const html = event.clipboardData ? event.clipboardData.getData('text/html') : null;
        if (html) {
          // Let TipTap handle it with its built-in paste rules
          return false;
        }
        return false;
      },
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

  const insertTableWithSize = () => {
    editor.chain().focus().insertTable({ 
      rows: tableRows, 
      cols: tableCols, 
      withHeaderRow: tableWithHeader 
    }).run();
    setShowTableDialog(false);
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

  const insertImageFromURL = () => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const uploadImage = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      toast.loading('Uploading image...');
      
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `content-images/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('contact-files')
          .upload(filePath, file);
        
        if (uploadError) {
          toast.dismiss();
          toast.error('Failed to upload image');
          return;
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('contact-files')
          .getPublicUrl(filePath);
        
        editor.chain().focus().setImage({ src: publicUrl }).run();
        toast.dismiss();
        toast.success('Image inserted successfully');
      } catch (error) {
        toast.dismiss();
        toast.error('Failed to upload image');
      }
    };
    
    input.click();
  };

  const applyCellBackground = (color: string, applyToAll: boolean) => {
    if (applyToAll) {
      const { state } = editor;
      const { tr } = state;
      let modified = false;

      state.doc.descendants((node, pos) => {
        if (node.type.name === 'tableCell' || node.type.name === 'tableHeader') {
          tr.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            backgroundColor: color,
          });
          modified = true;
        }
      });

      if (modified) {
        editor.view.dispatch(tr);
      }
    } else {
      editor.commands.updateAttributes('tableCell', { backgroundColor: color });
      editor.commands.updateAttributes('tableHeader', { backgroundColor: color });
    }
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    editor.chain().focus().insertContent(emojiData.emoji).run();
    setShowEmojiPicker(false);
  };

  const insertSpecialChar = (char: string) => {
    editor.chain().focus().insertContent(char).run();
  };

  const setFontSize = (size: string) => {
    editor.chain().focus().setMark('textStyle', { fontSize: size }).run();
  };

  // Auto-apply border changes
  React.useEffect(() => {
    if (!editor || !editor.isActive('table')) return;
    if (applyToAllCells) {
      applyBorderToAllCells(borderColor, borderWidth, borderStyle);
    } else {
      applyBorderToCell(borderColor, borderWidth, borderStyle);
    }
  }, [borderColor, borderWidth, borderStyle, applyToAllCells]);

  // Auto-apply background color changes
  React.useEffect(() => {
    if (!editor || !editor.isActive('table')) return;
    applyCellBackground(cellBgColor, applyToAllCells);
  }, [cellBgColor, applyToAllCells]);

  return (
    <div className="border border-input rounded-md bg-background">
      <div className="flex flex-wrap gap-1 p-2 border-b border-input">
        {/* Basic formatting */}
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
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          className={cn(editor.isActive('subscript') && 'bg-muted')}
        >
          <SubscriptIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          className={cn(editor.isActive('superscript') && 'bg-muted')}
        >
          <SuperscriptIcon className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Font size dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="sm">
              <Type className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-40 bg-background z-50">
            <DropdownMenuLabel>Font Size</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setFontSize('12px')} className="cursor-pointer">
              <span className="text-xs">Small</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFontSize('16px')} className="cursor-pointer">
              <span className="text-base">Normal</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFontSize('20px')} className="cursor-pointer">
              <span className="text-lg">Large</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFontSize('24px')} className="cursor-pointer">
              <span className="text-xl">Extra Large</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Text color with presets */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="sm" title="Text Color">
              <Palette className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 bg-background z-50">
            <DropdownMenuLabel>Text Color</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <div className="p-3 space-y-3">
              {/* Preset color swatches */}
              <div>
                <label className="text-xs font-medium mb-2 block">Quick Colors</label>
                <div className="flex gap-2 flex-wrap">
                  <button
                    type="button"
                    className="w-8 h-8 rounded border-2 border-input bg-black hover:ring-2 hover:ring-primary transition-all"
                    onClick={() => editor.chain().focus().setColor('#000000').run()}
                    title="Black"
                  />
                  <button
                    type="button"
                    className="w-8 h-8 rounded border-2 border-input bg-gray-500 hover:ring-2 hover:ring-primary transition-all"
                    onClick={() => editor.chain().focus().setColor('#6b7280').run()}
                    title="Gray"
                  />
                  <button
                    type="button"
                    className="w-8 h-8 rounded border-2 border-input bg-blue-500 hover:ring-2 hover:ring-primary transition-all"
                    onClick={() => editor.chain().focus().setColor('#3b82f6').run()}
                    title="Blue"
                  />
                  <button
                    type="button"
                    className="w-8 h-8 rounded border-2 border-input bg-red-500 hover:ring-2 hover:ring-primary transition-all"
                    onClick={() => editor.chain().focus().setColor('#ef4444').run()}
                    title="Red"
                  />
                  <button
                    type="button"
                    className="w-8 h-8 rounded border-2 border-input hover:ring-2 hover:ring-primary transition-all"
                    style={{ backgroundColor: 'hsl(var(--primary))' }}
                    onClick={() => {
                      const root = document.documentElement;
                      const primaryHsl = getComputedStyle(root).getPropertyValue('--primary').trim();
                      editor.chain().focus().setColor(`hsl(${primaryHsl})`).run();
                    }}
                    title="Gold (Brand)"
                  />
                  <button
                    type="button"
                    className="w-8 h-8 rounded border-2 border-gray-400 bg-white hover:ring-2 hover:ring-primary transition-all"
                    onClick={() => editor.chain().focus().setColor('#ffffff').run()}
                    title="White"
                  />
                </div>
              </div>

              {/* Custom color picker */}
              <div>
                <label className="text-xs font-medium mb-2 block">Custom Color</label>
                <Input
                  type="color"
                  onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
                  className="h-10 w-full cursor-pointer"
                />
              </div>

              {/* Remove color button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => editor.chain().focus().unsetColor().run()}
                className="w-full"
              >
                Remove Color
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Highlight */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHighlight({ color: '#fbbf24' }).run()}
          className={cn(editor.isActive('highlight') && 'bg-muted')}
        >
          <Highlighter className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Headings */}
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

        {/* Lists */}
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

        {/* Blockquote */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={cn(editor.isActive('blockquote') && 'bg-muted')}
        >
          <Quote className="h-4 w-4" />
        </Button>

        {/* Code block */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={cn(editor.isActive('codeBlock') && 'bg-muted')}
        >
          <Code className="h-4 w-4" />
        </Button>

        {/* Horizontal rule */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Table with dialog for size selection */}
        <Dialog open={showTableDialog} onOpenChange={setShowTableDialog}>
          <DialogTrigger asChild>
            <Button type="button" variant="ghost" size="sm">
              <TableIcon className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Insert Table</DialogTitle>
              <DialogDescription>
                Select the number of rows and columns for your table
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Rows</label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={tableRows}
                  onChange={(e) => setTableRows(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Columns</label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={tableCols}
                  onChange={(e) => setTableCols(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="with-header"
                  checked={tableWithHeader}
                  onChange={(e) => setTableWithHeader(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="with-header" className="text-sm cursor-pointer">
                  Include header row
                </label>
              </div>
              <Button onClick={insertTableWithSize} className="w-full">
                Insert Table
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Image insertion dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="sm">
              <ImageIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48 bg-background z-50">
            <DropdownMenuItem onSelect={insertImageFromURL} className="cursor-pointer">
              <LinkIcon className="h-4 w-4 mr-2" />
              Insert from URL
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={uploadImage} className="cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              Upload from Device
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Emoji picker */}
        <DropdownMenu open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="sm">
              <Smile className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-auto p-0 bg-background z-50">
            <EmojiPicker onEmojiClick={onEmojiClick} width={350} height={400} />
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Special characters dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="sm" title="Special Characters">
              <span className="text-sm font-bold">Ω</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-80 bg-background z-50 max-h-96 overflow-y-auto">
            {Object.entries(SPECIAL_CHARS).map(([category, chars]) => (
              <div key={category}>
                <DropdownMenuLabel className="text-xs">{category}</DropdownMenuLabel>
                <div className="grid grid-cols-9 gap-1 p-2">
                  {chars.map((char) => (
                    <button
                      key={char}
                      type="button"
                      onClick={() => insertSpecialChar(char)}
                      className="h-8 w-8 flex items-center justify-center hover:bg-muted rounded border border-transparent hover:border-primary text-lg"
                      title={char}
                    >
                      {char}
                    </button>
                  ))}
                </div>
                <DropdownMenuSeparator />
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {editor.isActive('table') && (
          <>
            <div className="w-px h-6 bg-border mx-1" />
            {/* Table operations dropdown - Structure controls FIRST */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" size="sm">
                  <Table2 className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 bg-background z-50 max-h-[70vh] overflow-y-auto">
                <DropdownMenuLabel>Table Structure</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* Row operations */}
                <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1">Rows</DropdownMenuLabel>
                <DropdownMenuItem onSelect={() => editor.chain().focus().addRowBefore().run()} className="cursor-pointer">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Row Above
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => editor.chain().focus().addRowAfter().run()} className="cursor-pointer">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Row Below
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => editor.chain().focus().deleteRow().run()} className="cursor-pointer">
                  <Trash className="h-4 w-4 mr-2" />
                  Delete Row
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                {/* Column operations */}
                <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1">Columns</DropdownMenuLabel>
                <DropdownMenuItem onSelect={() => editor.chain().focus().addColumnBefore().run()} className="cursor-pointer">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Column Left
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => editor.chain().focus().addColumnAfter().run()} className="cursor-pointer">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Column Right
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => editor.chain().focus().deleteColumn().run()} className="cursor-pointer">
                  <Trash className="h-4 w-4 mr-2" />
                  Delete Column
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                {/* Cell operations */}
                <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1">Cells</DropdownMenuLabel>
                <DropdownMenuItem 
                  onSelect={() => editor.chain().focus().mergeCells().run()}
                  disabled={!editor.can().mergeCells()}
                  className="cursor-pointer"
                >
                  <Merge className="h-4 w-4 mr-2" />
                  Merge Cells
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onSelect={() => editor.chain().focus().splitCell().run()}
                  disabled={!editor.can().splitCell()}
                  className="cursor-pointer"
                >
                  <Split className="h-4 w-4 mr-2" />
                  Split Cell
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => editor.chain().focus().toggleHeaderCell().run()} className="cursor-pointer">
                  <Grid3x3 className="h-4 w-4 mr-2" />
                  Toggle Header Cell
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                {/* Table operations */}
                <DropdownMenuItem 
                  onSelect={() => editor.chain().focus().deleteTable().run()}
                  className="cursor-pointer text-destructive"
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete Table
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Table border and background customization dropdown - Style controls SECOND */}
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
              <DropdownMenuContent align="start" className="w-64 bg-background z-50 max-h-[70vh] overflow-y-auto">
                <DropdownMenuLabel className="flex items-center justify-between">
                  Table Border Options
                  <label className="flex items-center gap-2 text-xs font-normal cursor-pointer">
                    <input
                      type="checkbox"
                      checked={applyToAllCells}
                      onChange={(e) => setApplyToAllCells(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    Apply to all
                  </label>
                </DropdownMenuLabel>
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
                          className="w-6 h-6 rounded border border-input bg-black hover:ring-2 hover:ring-primary transition-all"
                          onClick={() => setBorderColor('#000000')}
                          title="Black"
                        />
                        <button
                          type="button"
                          className="w-6 h-6 rounded border border-input bg-gray-500 hover:ring-2 hover:ring-primary transition-all"
                          onClick={() => setBorderColor('#6b7280')}
                          title="Gray"
                        />
                        <button
                          type="button"
                          className="w-6 h-6 rounded border border-input bg-blue-500 hover:ring-2 hover:ring-primary transition-all"
                          onClick={() => setBorderColor('#3b82f6')}
                          title="Blue"
                        />
                        <button
                          type="button"
                          className="w-6 h-6 rounded border border-input bg-red-500 hover:ring-2 hover:ring-primary transition-all"
                          onClick={() => setBorderColor('#ef4444')}
                          title="Red"
                        />
                        <button
                          type="button"
                          className="w-6 h-6 rounded border border-input hover:ring-2 hover:ring-primary transition-all"
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
                          className="w-6 h-6 rounded border border-input bg-white hover:ring-2 hover:ring-primary transition-all"
                          onClick={() => setBorderColor('#ffffff')}
                          title="White"
                        />
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
                <DropdownMenuLabel>Quick Presets</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <div className="p-2 space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={removeBordersFromTable}
                    className="w-full text-xs justify-start"
                  >
                    Remove All Borders
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={resetTableBorders}
                    className="w-full text-xs justify-start"
                  >
                    Default Borders
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={applyGoldBorders}
                    className="w-full text-xs justify-start"
                  >
                    Gold Borders
                  </Button>
                </div>

                <DropdownMenuSeparator />
                <DropdownMenuLabel>Cell Background</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <div className="p-2 space-y-3">
                  <div>
                    <label className="text-xs font-medium mb-1 block">Background Color</label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={cellBgColor}
                        onChange={(e) => setCellBgColor(e.target.value)}
                        className="h-8 w-16 p-1 cursor-pointer"
                      />
                      <div className="flex gap-1 flex-wrap flex-1">
                        <button
                          type="button"
                          className="w-6 h-6 rounded border border-input bg-white"
                          onClick={() => setCellBgColor('#ffffff')}
                          title="White"
                        />
                        <button
                          type="button"
                          className="w-6 h-6 rounded border border-input bg-gray-200"
                          onClick={() => setCellBgColor('#e5e7eb')}
                          title="Light Gray"
                        />
                        <button
                          type="button"
                          className="w-6 h-6 rounded border border-input"
                          style={{ backgroundColor: 'hsl(var(--primary) / 0.1)' }}
                          onClick={() => setCellBgColor('hsl(var(--primary) / 0.1)')}
                          title="Light Gold"
                        />
                      </div>
                    </div>
                  </div>
                </div>
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

        {/* Text alignment */}
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

        {/* Undo/Redo */}
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
        }
        .ProseMirror h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.5em 0;
        }
        .ProseMirror h3 {
          font-size: 1.25em;
          font-weight: bold;
          margin: 0.5em 0;
        }
        .ProseMirror ul, .ProseMirror ol {
          padding-left: 1.5em;
          margin: 0.5em 0;
        }
        .ProseMirror blockquote {
          border-left: 3px solid hsl(var(--primary));
          padding-left: 1em;
          margin: 1em 0;
          font-style: italic;
        }
        .ProseMirror code {
          background-color: hsl(var(--muted));
          padding: 0.2em 0.4em;
          border-radius: 3px;
          font-family: monospace;
        }
        .ProseMirror pre {
          background-color: hsl(var(--muted));
          padding: 1em;
          border-radius: 5px;
          overflow-x: auto;
          margin: 1em 0;
        }
        .ProseMirror pre code {
          background: none;
          padding: 0;
        }
        .ProseMirror hr {
          border: none;
          border-top: 2px solid hsl(var(--border));
          margin: 2em 0;
        }
        .ProseMirror mark {
          background-color: #fbbf24;
          padding: 0.1em 0.2em;
        }
        .ProseMirror table {
          border-collapse: collapse;
          width: 100%;
          margin: 1em 0;
        }
        .ProseMirror table td,
        .ProseMirror table th {
          border: 1px solid hsl(var(--border));
          padding: 0.5em;
          vertical-align: top;
          position: relative;
        }
        .ProseMirror table th {
          background-color: hsl(var(--muted));
          font-weight: bold;
          text-align: left;
        }
        .ProseMirror .selectedCell:after {
          background: rgba(200, 200, 255, 0.4);
          content: "";
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          pointer-events: none;
          position: absolute;
          z-index: 2;
        }
        .ProseMirror .column-resize-handle {
          background-color: hsl(var(--primary));
          bottom: -2px;
          position: absolute;
          right: -2px;
          pointer-events: none;
          top: 0;
          width: 4px;
        }
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};