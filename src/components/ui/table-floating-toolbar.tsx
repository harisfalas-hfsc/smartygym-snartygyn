import React from 'react';
import { Editor } from '@tiptap/react';
import { Button } from './button';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  MoveHorizontal,
  ArrowLeftToLine,
  ArrowRightToLine,
  Trash2,
  Table2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { cn } from '@/lib/utils';

interface TableFloatingToolbarProps {
  editor: Editor;
  isTableActive: boolean;
}

export const TableFloatingToolbar: React.FC<TableFloatingToolbarProps> = ({
  editor,
  isTableActive,
}) => {
  if (!isTableActive) return null;

  const getCurrentAlignment = () => {
    const { $anchor } = editor.state.selection;
    let depth = $anchor.depth;
    
    while (depth > 0) {
      const node = $anchor.node(depth);
      if (node.type.name === 'tableWrapper') {
        return node.attrs.alignment || 'left';
      }
      depth--;
    }
    return 'left';
  };

  const getCurrentFloat = () => {
    const { $anchor } = editor.state.selection;
    let depth = $anchor.depth;
    
    while (depth > 0) {
      const node = $anchor.node(depth);
      if (node.type.name === 'tableWrapper') {
        return node.attrs.float || 'none';
      }
      depth--;
    }
    return 'none';
  };

  const getCurrentWidth = () => {
    const { $anchor } = editor.state.selection;
    let depth = $anchor.depth;
    
    while (depth > 0) {
      const node = $anchor.node(depth);
      if (node.type.name === 'tableWrapper') {
        return node.attrs.width || '100%';
      }
      depth--;
    }
    return '100%';
  };

  const currentAlignment = getCurrentAlignment();
  const currentFloat = getCurrentFloat();
  const currentWidth = getCurrentWidth();

  return (
    <div className="flex items-center gap-1 p-1 bg-background border border-border rounded-md shadow-lg">
      {/* Alignment Controls */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            title="Table Alignment"
          >
            {currentAlignment === 'center' ? (
              <AlignCenter className="h-4 w-4" />
            ) : currentAlignment === 'right' ? (
              <AlignRight className="h-4 w-4" />
            ) : (
              <AlignLeft className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Table Alignment</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => editor.commands.setTableAlignment('left')}
            className={cn(currentAlignment === 'left' && 'bg-accent')}
          >
            <AlignLeft className="h-4 w-4 mr-2" />
            Align Left
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.commands.setTableAlignment('center')}
            className={cn(currentAlignment === 'center' && 'bg-accent')}
          >
            <AlignCenter className="h-4 w-4 mr-2" />
            Align Center
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.commands.setTableAlignment('right')}
            className={cn(currentAlignment === 'right' && 'bg-accent')}
          >
            <AlignRight className="h-4 w-4 mr-2" />
            Align Right
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Float Controls */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            title="Table Float"
          >
            <MoveHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Table Float</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => editor.commands.setTableFloat('none')}
            className={cn(currentFloat === 'none' && 'bg-accent')}
          >
            None (Block)
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.commands.setTableFloat('left')}
            className={cn(currentFloat === 'left' && 'bg-accent')}
          >
            <ArrowLeftToLine className="h-4 w-4 mr-2" />
            Float Left
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.commands.setTableFloat('right')}
            className={cn(currentFloat === 'right' && 'bg-accent')}
          >
            <ArrowRightToLine className="h-4 w-4 mr-2" />
            Float Right
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Width Controls */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs"
            title="Table Width"
          >
            {currentWidth}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Table Width</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => editor.commands.setTableWidth('25%')}
            className={cn(currentWidth === '25%' && 'bg-accent')}
          >
            25%
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.commands.setTableWidth('50%')}
            className={cn(currentWidth === '50%' && 'bg-accent')}
          >
            50%
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.commands.setTableWidth('75%')}
            className={cn(currentWidth === '75%' && 'bg-accent')}
          >
            75%
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.commands.setTableWidth('100%')}
            className={cn(currentWidth === '100%' && 'bg-accent')}
          >
            100%
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Select Whole Table & Enable Drag */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => {
          const { state, view } = editor;
          const { $anchor } = state.selection;
          let depth = $anchor.depth;
          let tablePos: number | null = null;
          let tableNode: any = null;
          
          // Find the table node
          while (depth > 0) {
            const node = $anchor.node(depth);
            if (node.type.name === 'table') {
              tablePos = $anchor.before(depth);
              tableNode = node;
              break;
            }
            depth--;
          }
          
          if (tablePos !== null && tableNode) {
            // Check if table is already wrapped in tableWrapper
            let isWrapped = false;
            if (depth > 1) {
              const parentNode = $anchor.node(depth - 1);
              if (parentNode && parentNode.type.name === 'tableWrapper') {
                isWrapped = true;
              }
            }
            
            if (!isWrapped) {
              // Wrap table in tableWrapper for drag-and-drop
              const tableWrapperType = state.schema.nodes.tableWrapper;
              if (tableWrapperType) {
                const wrapper = tableWrapperType.create(
                  { alignment: 'left', float: 'none', width: '100%' },
                  tableNode
                );
                
                const transaction = state.tr.replaceWith(
                  tablePos,
                  tablePos + tableNode.nodeSize,
                  wrapper
                );
                
                view.dispatch(transaction);
                
                // Select the wrapped table after a short delay
                setTimeout(() => {
                  const newState = editor.state;
                  const newPos = tablePos!;
                  const wrapperNode = newState.doc.nodeAt(newPos);
                  if (wrapperNode) {
                    editor.commands.setTextSelection({ 
                      from: newPos + 1, 
                      to: newPos + wrapperNode.nodeSize - 1 
                    });
                  }
                }, 10);
              }
            } else {
              // Already wrapped, just select it
              editor.commands.setTextSelection({ 
                from: tablePos + 1, 
                to: tablePos + tableNode.nodeSize - 1 
              });
            }
          }
        }}
        title="Select Table (enables drag handle)"
      >
        <Table2 className="h-4 w-4" />
      </Button>

      {/* Delete Table */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
        onClick={() => editor.commands.deleteTable()}
        title="Delete Table"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};
