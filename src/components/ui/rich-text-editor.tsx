import React, { useState, useEffect } from 'react';
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
import { TableWrapper } from '@/lib/tiptap-extensions/table-wrapper-extension';
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { TableFloatingToolbar } from './table-floating-toolbar';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

// Extended TableCell with border, background, and width customization
const CustomTableCell = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      colwidth: {
        default: null,
        parseHTML: element => {
          const width = element.getAttribute('data-colwidth') || element.style.width;
          return width ? [parseInt(width)] : null;
        },
        renderHTML: attributes => {
          if (!attributes.colwidth) return {};
          const width = attributes.colwidth[0];
          return { 
            'data-colwidth': width,
            style: `width: ${width}px !important;`
          };
        },
      },
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

// Extended TableHeader with border, background, and width customization
const CustomTableHeader = TableHeader.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      colwidth: {
        default: null,
        parseHTML: element => {
          const width = element.getAttribute('data-colwidth') || element.style.width;
          return width ? [parseInt(width)] : null;
        },
        renderHTML: attributes => {
          if (!attributes.colwidth) return {};
          const width = attributes.colwidth[0];
          return { 
            'data-colwidth': width,
            style: `width: ${width}px !important;`
          };
        },
      },
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

// Extended TableRow with height customization
const CustomTableRow = TableRow.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      height: {
        default: 'auto',
        parseHTML: element => element.style.height || 'auto',
        renderHTML: attributes => {
          if (attributes.height === 'auto') return {};
          return { 
            style: `height: ${attributes.height};`
          };
        },
      },
    };
  },
});

// Extended Table with style presets
const CustomTable = Table.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      tableStyle: {
        default: 'default',
        parseHTML: element => element.getAttribute('data-table-style') || 'default',
        renderHTML: attributes => {
          if (!attributes.tableStyle || attributes.tableStyle === 'default') return {};
          return { 
            'data-table-style': attributes.tableStyle,
            'class': `table-${attributes.tableStyle}`
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
  const [selectedRowHeight, setSelectedRowHeight] = useState<string>('auto');
  const [customRowHeight, setCustomRowHeight] = useState<string>('60');
  const [currentTableStyle, setCurrentTableStyle] = useState<'default' | 'compact' | 'wide' | 'striped'>('default');
  const [columnWidth, setColumnWidth] = useState<string>('');
  const [columnWidthUnit, setColumnWidthUnit] = useState<'px' | '%'>('px');
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);

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
      TableWrapper,
      CustomTable.configure({
        resizable: true,
      }),
      CustomTableRow,
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
    // Insert table and auto-wrap in tableWrapper for drag-and-drop
    editor.chain().focus().insertTable({ 
      rows: tableRows, 
      cols: tableCols, 
      withHeaderRow: tableWithHeader 
    }).run();
    
    // Wrap the newly inserted table in a tableWrapper
    setTimeout(() => {
      const { state } = editor;
      const { $anchor } = state.selection;
      const tableWrapperType = state.schema.nodes.tableWrapper;
      
      if (tableWrapperType) {
        // Find the table node we just inserted
        let tablePos: number | null = null;
        let depth = $anchor.depth;
        
        while (depth > 0) {
          const node = $anchor.node(depth);
          if (node.type.name === 'table') {
            tablePos = $anchor.before(depth);
            break;
          }
          depth--;
        }
        
        if (tablePos !== null) {
          const tableNode = state.doc.nodeAt(tablePos);
          if (tableNode && tableNode.type.name === 'table') {
            // Check if not already wrapped
            const parentPos = tablePos > 0 ? tablePos - 1 : 0;
            const parentNode = state.doc.nodeAt(parentPos);
            
            if (!parentNode || parentNode.type.name !== 'tableWrapper') {
              // Wrap in tableWrapper
              const wrapper = tableWrapperType.create(
                { alignment: 'left', float: 'none', width: '100%' },
                tableNode
              );
              
              const transaction = state.tr.replaceWith(
                tablePos,
                tablePos + tableNode.nodeSize,
                wrapper
              );
              
              editor.view.dispatch(transaction);
            }
          }
        }
      }
    }, 10);
    
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

  const insertPricingTable = () => {
    editor?.chain().focus().insertTable({ rows: 4, cols: 3, withHeaderRow: true }).run();
    setTimeout(() => {
      const { state } = editor;
      const { tr } = state;
      let colIndex = 0;
      
      state.doc.descendants((node, pos) => {
        if (node.type.name === 'tableHeader') {
          const headers = ['Basic', 'Pro', 'Enterprise'];
          if (colIndex < headers.length) {
            tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              backgroundColor: 'hsl(var(--primary) / 0.1)',
            });
          }
          colIndex++;
        }
      });
      editor.view.dispatch(tr);
      applyTableStyle('wide');
    }, 100);
    setShowTemplateDialog(false);
  };

  const insertComparisonTable = () => {
    editor?.chain().focus().insertTable({ rows: 5, cols: 4, withHeaderRow: true }).run();
    setTimeout(() => {
      applyTableStyle('striped');
    }, 100);
    setShowTemplateDialog(false);
  };

  const insertScheduleGrid = () => {
    editor?.chain().focus().insertTable({ rows: 6, cols: 8, withHeaderRow: true }).run();
    setTimeout(() => {
      const { state } = editor;
      const { tr } = state;
      
      state.doc.descendants((node, pos) => {
        if (node.type.name === 'tableHeader') {
          tr.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            backgroundColor: 'hsl(var(--primary) / 0.2)',
          });
        }
      });
      editor.view.dispatch(tr);
      applyTableStyle('compact');
    }, 100);
    setShowTemplateDialog(false);
  };

  const insertWorkoutScheduleTable = () => {
    editor?.chain().focus().insertTable({ rows: 8, cols: 6, withHeaderRow: true }).run();
    setTimeout(() => {
      const { state } = editor;
      const { tr } = state;
      
      state.doc.descendants((node, pos) => {
        if (node.type.name === 'tableHeader') {
          tr.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            backgroundColor: 'hsl(var(--primary) / 0.2)',
          });
        }
      });
      editor.view.dispatch(tr);
      applyTableStyle('default');
    }, 100);
    setShowTemplateDialog(false);
  };

  const insertMealPlanTable = () => {
    editor?.chain().focus().insertTable({ rows: 6, cols: 5, withHeaderRow: true }).run();
    setTimeout(() => {
      const { state } = editor;
      const { tr } = state;
      
      state.doc.descendants((node, pos) => {
        if (node.type.name === 'tableHeader') {
          tr.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            backgroundColor: '#dcfce7',
          });
        }
      });
      editor.view.dispatch(tr);
      applyTableStyle('striped');
    }, 100);
    setShowTemplateDialog(false);
  };

  const insertProgressTrackerTable = () => {
    editor?.chain().focus().insertTable({ rows: 10, cols: 7, withHeaderRow: true }).run();
    setTimeout(() => {
      const { state } = editor;
      const { tr } = state;
      
      state.doc.descendants((node, pos) => {
        if (node.type.name === 'tableHeader') {
          tr.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            backgroundColor: '#dbeafe',
          });
        }
      });
      editor.view.dispatch(tr);
      applyTableStyle('compact');
    }, 100);
    setShowTemplateDialog(false);
  };

  const insertExerciseLogTable = () => {
    editor?.chain().focus().insertTable({ rows: 12, cols: 6, withHeaderRow: true }).run();
    setTimeout(() => {
      const { state } = editor;
      const { tr } = state;
      
      state.doc.descendants((node, pos) => {
        if (node.type.name === 'tableHeader') {
          tr.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            backgroundColor: '#fef3c7',
          });
        }
      });
      editor.view.dispatch(tr);
      applyTableStyle('default');
    }, 100);
    setShowTemplateDialog(false);
  };

  const applyColumnWidth = () => {
    if (!columnWidth) return;
    const width = columnWidthUnit === 'px' ? parseInt(columnWidth) : Math.round((parseInt(columnWidth) / 100) * 800);
    editor?.commands.updateAttributes('tableCell', { colwidth: [width] });
    editor?.commands.updateAttributes('tableHeader', { colwidth: [width] });
  };

  const applyTableStyle = (style: 'default' | 'compact' | 'wide' | 'striped') => {
    if (!editor) return;
    
    editor.chain().focus().updateAttributes('table', { tableStyle: style }).run();
    setCurrentTableStyle(style);
    
    // Apply style-specific formatting
    switch(style) {
      case 'compact':
        // Reduce padding and use thin borders
        applyBorderToAllCells('#6b7280', '1px', 'solid');
        // Apply row height to all rows
        const { state: compactState } = editor;
        const { tr: compactTr } = compactState;
        compactState.doc.descendants((node, pos) => {
          if (node.type.name === 'tableRow') {
            compactTr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              height: '40px',
            });
          }
        });
        editor.view.dispatch(compactTr);
        break;
      case 'wide':
        // Increase padding and use thicker borders
        applyBorderToAllCells('#000000', '2px', 'solid');
        // Apply row height to all rows
        const { state: wideState } = editor;
        const { tr: wideTr } = wideState;
        wideState.doc.descendants((node, pos) => {
          if (node.type.name === 'tableRow') {
            wideTr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              height: '80px',
            });
          }
        });
        editor.view.dispatch(wideTr);
        break;
      case 'striped':
        // Apply alternating row backgrounds
        const { state } = editor;
        const { tr } = state;
        let rowIndex = 0;
        
        state.doc.descendants((node, pos) => {
          if (node.type.name === 'tableRow') {
            const bgColor = rowIndex % 2 === 0 ? '#ffffff' : '#f3f4f6';
            node.descendants((cellNode, cellPos) => {
              if (cellNode.type.name === 'tableCell' || cellNode.type.name === 'tableHeader') {
                tr.setNodeMarkup(pos + cellPos + 1, undefined, {
                  ...cellNode.attrs,
                  backgroundColor: bgColor,
                });
              }
            });
            rowIndex++;
          }
        });
        editor.view.dispatch(tr);
        break;
      case 'default':
        // Reset to default styling
        resetTableBorders();
        // Reset row heights to auto
        const { state: defaultState } = editor;
        const { tr: defaultTr } = defaultState;
        defaultState.doc.descendants((node, pos) => {
          if (node.type.name === 'tableRow') {
            defaultTr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              height: 'auto',
            });
          }
        });
        editor.view.dispatch(defaultTr);
        break;
    }
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
  useEffect(() => {
    if (!editor || !editor.isActive('table')) return;
    applyCellBackground(cellBgColor, applyToAllCells);
  }, [cellBgColor, applyToAllCells]);

  // Check if table is currently active
  const isTableActive = editor?.isActive('table') || false;

  return (
    <div className="border border-input rounded-md bg-background relative">
      {/* Floating Table Toolbar */}
      {isTableActive && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-40">
          <TableFloatingToolbar editor={editor} isTableActive={isTableActive} />
        </div>
      )}
      
      <TooltipProvider>
      <div className="flex flex-wrap gap-1 p-2 border-b border-input">
        {/* Basic formatting */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={cn(editor.isActive('bold') && 'bg-muted')}
            >
              <Bold className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Bold</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={cn(editor.isActive('italic') && 'bg-muted')}
            >
              <Italic className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Italic</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={cn(editor.isActive('underline') && 'bg-muted')}
            >
              <UnderlineIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Underline</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={cn(editor.isActive('strike') && 'bg-muted')}
            >
              <Strikethrough className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Strikethrough</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleSubscript().run()}
              className={cn(editor.isActive('subscript') && 'bg-muted')}
            >
              <SubscriptIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Subscript</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleSuperscript().run()}
              className={cn(editor.isActive('superscript') && 'bg-muted')}
            >
              <SuperscriptIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Superscript</TooltipContent>
        </Tooltip>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Font size dropdown */}
        <Tooltip>
          <TooltipTrigger asChild>
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
          </TooltipTrigger>
          <TooltipContent>Font Size</TooltipContent>
        </Tooltip>

        {/* Text color with presets */}
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" size="sm">
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
          </TooltipTrigger>
          <TooltipContent>Text Color</TooltipContent>
        </Tooltip>

        {/* Highlight */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleHighlight({ color: '#fbbf24' }).run()}
              className={cn(editor.isActive('highlight') && 'bg-muted')}
            >
              <Highlighter className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Highlight Text</TooltipContent>
        </Tooltip>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Headings */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={cn(editor.isActive('heading', { level: 1 }) && 'bg-muted')}
            >
              <Heading1 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Heading 1</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={cn(editor.isActive('heading', { level: 2 }) && 'bg-muted')}
            >
              <Heading2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Heading 2</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={cn(editor.isActive('heading', { level: 3 }) && 'bg-muted')}
            >
              <Heading3 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Heading 3</TooltipContent>
        </Tooltip>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Lists */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={cn(editor.isActive('bulletList') && 'bg-muted')}
            >
              <List className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Bullet List</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={cn(editor.isActive('orderedList') && 'bg-muted')}
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Numbered List</TooltipContent>
        </Tooltip>

        {/* Blockquote */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={cn(editor.isActive('blockquote') && 'bg-muted')}
            >
              <Quote className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Block Quote</TooltipContent>
        </Tooltip>

        {/* Code block */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={cn(editor.isActive('codeBlock') && 'bg-muted')}
            >
              <Code className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Code Block</TooltipContent>
        </Tooltip>

        {/* Horizontal rule */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
            >
              <Minus className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Horizontal Line</TooltipContent>
        </Tooltip>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Table with dialog for size selection */}
        <Tooltip>
          <TooltipTrigger asChild>
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
          </TooltipTrigger>
          <TooltipContent>Insert Table</TooltipContent>
        </Tooltip>

        {/* Table Template Gallery */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
              <DialogTrigger asChild>
                <Button type="button" variant="ghost" size="sm">
                  <Grid3x3 className="h-4 w-4" />
                  <Plus className="h-3 w-3 -ml-1" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Table Templates</DialogTitle>
                  <DialogDescription>
                    Choose a pre-built table layout to get started quickly
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4 max-h-[70vh] overflow-y-auto">
                  {/* General Templates */}
                  <button
                    onClick={insertPricingTable}
                    className="p-4 border-2 border-border rounded-lg hover:border-primary transition-colors text-left group"
                  >
                    <div className="text-lg font-semibold mb-2 group-hover:text-primary">💰 Pricing Table</div>
                    <div className="text-sm text-muted-foreground mb-3">
                      3 columns for Basic, Pro, and Enterprise tiers
                    </div>
                    <div className="bg-muted rounded p-2 text-xs">
                      <div className="grid grid-cols-3 gap-1 mb-1">
                        <div className="bg-primary/20 p-1 text-center">Basic</div>
                        <div className="bg-primary/20 p-1 text-center">Pro</div>
                        <div className="bg-primary/20 p-1 text-center">Enterprise</div>
                      </div>
                      <div className="space-y-1">
                        <div className="bg-background p-1">Features</div>
                        <div className="bg-background p-1">Price</div>
                        <div className="bg-background p-1">Support</div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={insertComparisonTable}
                    className="p-4 border-2 border-border rounded-lg hover:border-primary transition-colors text-left group"
                  >
                    <div className="text-lg font-semibold mb-2 group-hover:text-primary">⚖️ Comparison Table</div>
                    <div className="text-sm text-muted-foreground mb-3">
                      4 columns with striped rows for easy scanning
                    </div>
                    <div className="bg-muted rounded p-2 text-xs">
                      <div className="grid grid-cols-4 gap-1 mb-1">
                        <div className="bg-primary/20 p-1 text-center">Feature</div>
                        <div className="bg-primary/20 p-1 text-center">A</div>
                        <div className="bg-primary/20 p-1 text-center">B</div>
                        <div className="bg-primary/20 p-1 text-center">C</div>
                      </div>
                      <div className="space-y-1">
                        <div className="bg-background p-1">Item 1</div>
                        <div className="bg-muted/50 p-1">Item 2</div>
                        <div className="bg-background p-1">Item 3</div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={insertScheduleGrid}
                    className="p-4 border-2 border-border rounded-lg hover:border-primary transition-colors text-left group"
                  >
                    <div className="text-lg font-semibold mb-2 group-hover:text-primary">📅 Schedule Grid</div>
                    <div className="text-sm text-muted-foreground mb-3">
                      8 columns for weekly schedule with time slots
                    </div>
                    <div className="bg-muted rounded p-2 text-xs">
                      <div className="grid grid-cols-8 gap-px mb-1">
                        <div className="bg-primary/30 p-1 text-center text-[10px]">Time</div>
                        <div className="bg-primary/30 p-1 text-center text-[10px]">Mon</div>
                        <div className="bg-primary/30 p-1 text-center text-[10px]">Tue</div>
                        <div className="bg-primary/30 p-1 text-center text-[10px]">Wed</div>
                        <div className="bg-primary/30 p-1 text-center text-[10px]">Thu</div>
                        <div className="bg-primary/30 p-1 text-center text-[10px]">Fri</div>
                        <div className="bg-primary/30 p-1 text-center text-[10px]">Sat</div>
                        <div className="bg-primary/30 p-1 text-center text-[10px]">Sun</div>
                      </div>
                      <div className="space-y-px">
                        <div className="grid grid-cols-8 gap-px">
                          <div className="bg-background p-1 text-[10px]">9AM</div>
                          <div className="bg-background p-1"></div>
                          <div className="bg-background p-1"></div>
                          <div className="bg-background p-1"></div>
                          <div className="bg-background p-1"></div>
                          <div className="bg-background p-1"></div>
                          <div className="bg-background p-1"></div>
                          <div className="bg-background p-1"></div>
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Fitness-Specific Templates */}
                  <button
                    onClick={insertWorkoutScheduleTable}
                    className="p-4 border-2 border-border rounded-lg hover:border-primary transition-colors text-left group"
                  >
                    <div className="text-lg font-semibold mb-2 group-hover:text-primary">🏋️ Workout Schedule</div>
                    <div className="text-sm text-muted-foreground mb-3">
                      Weekly training plan with exercises, sets, reps
                    </div>
                    <div className="bg-muted rounded p-2 text-xs">
                      <div className="grid grid-cols-6 gap-px mb-1">
                        <div className="bg-primary/20 p-1 text-center text-[10px]">Day</div>
                        <div className="bg-primary/20 p-1 text-center text-[10px]">Exercise</div>
                        <div className="bg-primary/20 p-1 text-center text-[10px]">Sets</div>
                        <div className="bg-primary/20 p-1 text-center text-[10px]">Reps</div>
                        <div className="bg-primary/20 p-1 text-center text-[10px]">Rest</div>
                        <div className="bg-primary/20 p-1 text-center text-[10px]">Notes</div>
                      </div>
                      <div className="space-y-px">
                        <div className="grid grid-cols-6 gap-px">
                          <div className="bg-background p-1 text-[10px]">Mon</div>
                          <div className="bg-background p-1 text-[10px]">Bench</div>
                          <div className="bg-background p-1 text-[10px]">4</div>
                          <div className="bg-background p-1 text-[10px]">8-10</div>
                          <div className="bg-background p-1 text-[10px]">90s</div>
                          <div className="bg-background p-1 text-[10px]"></div>
                        </div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={insertMealPlanTable}
                    className="p-4 border-2 border-border rounded-lg hover:border-primary transition-colors text-left group"
                  >
                    <div className="text-lg font-semibold mb-2 group-hover:text-primary">🥗 Meal Plan</div>
                    <div className="text-sm text-muted-foreground mb-3">
                      Daily nutrition tracking with macros
                    </div>
                    <div className="bg-muted rounded p-2 text-xs">
                      <div className="grid grid-cols-5 gap-1 mb-1">
                        <div className="bg-green-100 p-1 text-center text-[10px]">Meal</div>
                        <div className="bg-green-100 p-1 text-center text-[10px]">Food</div>
                        <div className="bg-green-100 p-1 text-center text-[10px]">Protein</div>
                        <div className="bg-green-100 p-1 text-center text-[10px]">Carbs</div>
                        <div className="bg-green-100 p-1 text-center text-[10px]">Fats</div>
                      </div>
                      <div className="space-y-1">
                        <div className="bg-background p-1 text-[10px]">Breakfast</div>
                        <div className="bg-muted/50 p-1 text-[10px]">Lunch</div>
                        <div className="bg-background p-1 text-[10px]">Dinner</div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={insertProgressTrackerTable}
                    className="p-4 border-2 border-border rounded-lg hover:border-primary transition-colors text-left group"
                  >
                    <div className="text-lg font-semibold mb-2 group-hover:text-primary">📊 Progress Tracker</div>
                    <div className="text-sm text-muted-foreground mb-3">
                      Track measurements, weight, body composition
                    </div>
                    <div className="bg-muted rounded p-2 text-xs">
                      <div className="grid grid-cols-7 gap-px mb-1">
                        <div className="bg-blue-100 p-1 text-center text-[10px]">Date</div>
                        <div className="bg-blue-100 p-1 text-center text-[10px]">Weight</div>
                        <div className="bg-blue-100 p-1 text-center text-[10px]">BF%</div>
                        <div className="bg-blue-100 p-1 text-center text-[10px]">Chest</div>
                        <div className="bg-blue-100 p-1 text-center text-[10px]">Waist</div>
                        <div className="bg-blue-100 p-1 text-center text-[10px]">Arms</div>
                        <div className="bg-blue-100 p-1 text-center text-[10px]">Legs</div>
                      </div>
                      <div className="space-y-px">
                        <div className="grid grid-cols-7 gap-px">
                          <div className="bg-background p-1 text-[10px]">Week 1</div>
                          <div className="bg-background p-1"></div>
                          <div className="bg-background p-1"></div>
                          <div className="bg-background p-1"></div>
                          <div className="bg-background p-1"></div>
                          <div className="bg-background p-1"></div>
                          <div className="bg-background p-1"></div>
                        </div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={insertExerciseLogTable}
                    className="p-4 border-2 border-border rounded-lg hover:border-primary transition-colors text-left group"
                  >
                    <div className="text-lg font-semibold mb-2 group-hover:text-primary">📝 Exercise Log</div>
                    <div className="text-sm text-muted-foreground mb-3">
                      Record sets, reps, weight for each exercise
                    </div>
                    <div className="bg-muted rounded p-2 text-xs">
                      <div className="grid grid-cols-6 gap-px mb-1">
                        <div className="bg-yellow-100 p-1 text-center text-[10px]">Exercise</div>
                        <div className="bg-yellow-100 p-1 text-center text-[10px]">Set 1</div>
                        <div className="bg-yellow-100 p-1 text-center text-[10px]">Set 2</div>
                        <div className="bg-yellow-100 p-1 text-center text-[10px]">Set 3</div>
                        <div className="bg-yellow-100 p-1 text-center text-[10px]">Set 4</div>
                        <div className="bg-yellow-100 p-1 text-center text-[10px]">Total</div>
                      </div>
                      <div className="space-y-px">
                        <div className="grid grid-cols-6 gap-px">
                          <div className="bg-background p-1 text-[10px]">Squat</div>
                          <div className="bg-background p-1 text-[10px]">225x5</div>
                          <div className="bg-background p-1"></div>
                          <div className="bg-background p-1"></div>
                          <div className="bg-background p-1"></div>
                          <div className="bg-background p-1"></div>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              </DialogContent>
            </Dialog>
          </TooltipTrigger>
          <TooltipContent>Table Templates</TooltipContent>
        </Tooltip>

        {/* Image insertion dropdown */}
        <Tooltip>
          <TooltipTrigger asChild>
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
          </TooltipTrigger>
          <TooltipContent>Insert Image</TooltipContent>
        </Tooltip>

        {/* Emoji picker */}
        <Tooltip>
          <TooltipTrigger asChild>
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
          </TooltipTrigger>
          <TooltipContent>Insert Emoji</TooltipContent>
        </Tooltip>

        {/* Special characters dropdown */}
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" size="sm">
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
                          className="p-2 hover:bg-accent rounded text-center transition-colors"
                          title={char}
                        >
                          {char}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </TooltipTrigger>
          <TooltipContent>Special Characters</TooltipContent>
        </Tooltip>

        {editor.isActive('table') && (
          <>
            <div className="w-px h-6 bg-border mx-1" />
            {/* Table operations dropdown - Structure controls FIRST */}
            <Tooltip>
              <TooltipTrigger asChild>
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
                    <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1">
                      Cells
                      <span className="block text-[10px] mt-0.5 font-normal">Select multiple cells to merge</span>
                    </DropdownMenuLabel>
                    <DropdownMenuItem 
                      onSelect={() => editor.chain().focus().mergeCells().run()}
                      disabled={!editor.can().mergeCells()}
                      className="cursor-pointer flex items-center justify-between"
                    >
                      <span className="flex items-center">
                        <Merge className="h-4 w-4 mr-2" />
                        Merge Cells
                      </span>
                      {!editor.can().mergeCells() && (
                        <span className="text-[10px] text-muted-foreground">(Select cells)</span>
                      )}
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
                    
                    {/* Row height controls */}
                    <div className="px-2 py-2 space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Set Row Height</p>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant={selectedRowHeight === 'auto' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedRowHeight('auto')}
                          className="text-xs h-8"
                        >
                          Auto
                        </Button>
                        <Button
                          type="button"
                          variant={selectedRowHeight === '40px' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedRowHeight('40px')}
                          className="text-xs h-8"
                        >
                          Small
                        </Button>
                        <Button
                          type="button"
                          variant={selectedRowHeight === '60px' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedRowHeight('60px')}
                          className="text-xs h-8"
                        >
                          Medium
                        </Button>
                        <Button
                          type="button"
                          variant={selectedRowHeight === '80px' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedRowHeight('80px')}
                          className="text-xs h-8"
                        >
                          Large
                        </Button>
                        <Button
                          type="button"
                          variant={selectedRowHeight === '120px' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedRowHeight('120px')}
                          className="text-xs h-8"
                        >
                          Extra Large
                        </Button>
                        <Button
                          type="button"
                          variant={selectedRowHeight === 'custom' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedRowHeight('custom')}
                          className="text-xs h-8"
                        >
                          Custom
                        </Button>
                      </div>
                      
                      {selectedRowHeight === 'custom' && (
                        <div className="flex gap-2 items-center">
                          <Input
                            type="number"
                            value={customRowHeight}
                            onChange={(e) => setCustomRowHeight(e.target.value)}
                            placeholder="Height in px"
                            className="h-8 text-xs"
                            min="20"
                            max="500"
                          />
                          <span className="text-xs text-muted-foreground">px</span>
                        </div>
                      )}

                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          const height = selectedRowHeight === 'custom' 
                            ? `${customRowHeight}px` 
                            : selectedRowHeight;
                          editor?.chain().focus().updateAttributes('tableRow', { height }).run();
                        }}
                        className="w-full"
                      >
                        Apply Row Height
                      </Button>
                    </div>

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
              </TooltipTrigger>
              <TooltipContent>Table Structure</TooltipContent>
            </Tooltip>

            {/* Table border and background customization dropdown - Style controls SECOND */}
            <Tooltip>
              <TooltipTrigger asChild>
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
                  <DropdownMenuContent align="start" className="w-80 bg-background z-50 max-h-[70vh] overflow-y-auto">
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
                    <DropdownMenuLabel>Table Style Presets</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <div className="p-2 space-y-2">
                      <Button
                        type="button"
                        variant={currentTableStyle === 'default' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => applyTableStyle('default')}
                        className="w-full text-xs justify-start"
                      >
                        <span className="mr-2">📋</span> Default
                      </Button>
                      <Button
                        type="button"
                        variant={currentTableStyle === 'compact' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => applyTableStyle('compact')}
                        className="w-full text-xs justify-start"
                      >
                        <span className="mr-2">📏</span> Compact
                      </Button>
                      <Button
                        type="button"
                        variant={currentTableStyle === 'wide' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => applyTableStyle('wide')}
                        className="w-full text-xs justify-start"
                      >
                        <span className="mr-2">📐</span> Wide
                      </Button>
                      <Button
                        type="button"
                        variant={currentTableStyle === 'striped' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => applyTableStyle('striped')}
                        className="w-full text-xs justify-start"
                      >
                        <span className="mr-2">📊</span> Striped
                      </Button>
                    </div>

                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Cell Background</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <div className="p-2 space-y-2">
                      <Input
                        type="color"
                        value={cellBgColor}
                        onChange={(e) => setCellBgColor(e.target.value)}
                        className="h-10 w-full cursor-pointer"
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => applyCellBackground(cellBgColor, applyToAllCells)}
                        className="w-full"
                      >
                        Apply Background
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCellBgColor('transparent');
                          applyCellBackground('transparent', applyToAllCells);
                        }}
                        className="w-full"
                      >
                        Remove Background
                      </Button>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TooltipTrigger>
              <TooltipContent>Table Borders & Style</TooltipContent>
            </Tooltip>
          </>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={addLink}
              className={cn(editor.isActive('link') && 'bg-muted')}
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Insert Link</TooltipContent>
        </Tooltip>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Text alignment */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              className={cn(editor.isActive({ textAlign: 'left' }) && 'bg-muted')}
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Align Left</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              className={cn(editor.isActive({ textAlign: 'center' }) && 'bg-muted')}
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Align Center</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              className={cn(editor.isActive({ textAlign: 'right' }) && 'bg-muted')}
            >
              <AlignRight className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Align Right</TooltipContent>
        </Tooltip>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Undo/Redo */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().undo().run()}
            >
              <Undo className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Undo</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().redo().run()}
            >
              <Redo className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Redo</TooltipContent>
        </Tooltip>
      </div>
      </TooltipProvider>
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none p-3 w-full max-w-full overflow-x-hidden break-words whitespace-pre-wrap"
        style={{ minHeight }}
      />
      <style>{`
        .ProseMirror {
          outline: none;
          min-height: ${minHeight};
          word-wrap: break-word;
          overflow-wrap: break-word;
          word-break: break-word;
          white-space: pre-wrap;
          max-width: 100%;
          box-sizing: border-box;
          overflow-x: hidden;
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
          word-break: break-word;
        }
        .ProseMirror h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.5em 0;
          word-wrap: break-word;
          overflow-wrap: break-word;
          word-break: break-word;
        }
        .ProseMirror h3 {
          font-size: 1.25em;
          font-weight: bold;
          margin: 0.5em 0;
          word-wrap: break-word;
          overflow-wrap: break-word;
          word-break: break-word;
        }
        .ProseMirror ul, .ProseMirror ol {
          padding-left: 1.5em;
          margin: 0.5em 0;
        }
        .ProseMirror li {
          word-wrap: break-word;
          overflow-wrap: break-word;
          word-break: break-word;
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
          margin: 1em 0;
          white-space: pre-wrap;
          word-wrap: break-word;
          overflow-wrap: break-word;
          overflow-x: hidden;
          overflow-y: auto;
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
          table-layout: fixed;
        }
        .ProseMirror table td,
        .ProseMirror table th {
          border: 1px solid hsl(var(--border));
          padding: 0.5em;
          vertical-align: top;
          position: relative;
          word-wrap: break-word;
          overflow-wrap: break-word;
          word-break: break-word;
        }
        .ProseMirror table th {
          background-color: hsl(var(--muted));
          font-weight: bold;
          text-align: left;
        }
        .ProseMirror table td[data-colwidth],
        .ProseMirror table th[data-colwidth] {
          box-sizing: border-box;
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

        /* Table style presets in editor */
        .ProseMirror table.table-compact td,
        .ProseMirror table.table-compact th {
          padding: 0.25em;
          font-size: 0.875rem;
        }

        .ProseMirror table.table-compact {
          margin: 0.5em 0;
        }

        .ProseMirror table.table-wide td,
        .ProseMirror table.table-wide th {
          padding: 1em;
          line-height: 1.8;
        }

        .ProseMirror table.table-wide {
          margin: 1.5em 0;
        }

        .ProseMirror table.table-striped tbody tr:nth-child(even) {
          background-color: #f3f4f6;
        }

        .ProseMirror table.table-striped tbody tr:nth-child(odd) {
          background-color: #ffffff;
        }
      `}</style>
    </div>
  );
};