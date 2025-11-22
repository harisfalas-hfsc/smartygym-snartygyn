import { Node, mergeAttributes } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export interface TableWrapperOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    tableWrapper: {
      setTableAlignment: (alignment: 'left' | 'center' | 'right') => ReturnType;
      setTableFloat: (float: 'none' | 'left' | 'right') => ReturnType;
      setTableWidth: (width: string) => ReturnType;
    };
  }
}

export const tableSelectionPluginKey = new PluginKey('tableSelection');

export const TableWrapper = Node.create<TableWrapperOptions>({
  name: 'tableWrapper',

  group: 'block',

  content: 'table',

  isolating: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      alignment: {
        default: 'left',
        parseHTML: element => element.getAttribute('data-alignment') || 'left',
        renderHTML: attributes => {
          return {
            'data-alignment': attributes.alignment,
          };
        },
      },
      float: {
        default: 'none',
        parseHTML: element => element.getAttribute('data-float') || 'none',
        renderHTML: attributes => {
          return {
            'data-float': attributes.float,
          };
        },
      },
      width: {
        default: '100%',
        parseHTML: element => element.getAttribute('data-width') || '100%',
        renderHTML: attributes => {
          return {
            'data-width': attributes.width,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-table-wrapper]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-table-wrapper': '',
        class: 'table-wrapper',
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setTableAlignment:
        (alignment: 'left' | 'center' | 'right') =>
        ({ commands, state }) => {
          const { selection } = state;
          const { $anchor } = selection;

          // Find the table wrapper node
          let depth = $anchor.depth;
          while (depth > 0) {
            const node = $anchor.node(depth);
            if (node.type.name === 'tableWrapper') {
              return commands.updateAttributes('tableWrapper', { alignment });
            }
            depth--;
          }

          return false;
        },

      setTableFloat:
        (float: 'none' | 'left' | 'right') =>
        ({ commands, state }) => {
          const { selection } = state;
          const { $anchor } = selection;

          let depth = $anchor.depth;
          while (depth > 0) {
            const node = $anchor.node(depth);
            if (node.type.name === 'tableWrapper') {
              return commands.updateAttributes('tableWrapper', { float });
            }
            depth--;
          }

          return false;
        },

      setTableWidth:
        (width: string) =>
        ({ commands, state }) => {
          const { selection } = state;
          const { $anchor } = selection;

          let depth = $anchor.depth;
          while (depth > 0) {
            const node = $anchor.node(depth);
            if (node.type.name === 'tableWrapper') {
              return commands.updateAttributes('tableWrapper', { width });
            }
            depth--;
          }

          return false;
        },
    };
  },

  addProseMirrorPlugins() {
    let dragState: {
      isDragging: boolean;
      tablePos: number | null;
      startY: number;
      dropIndicator: HTMLElement | null;
    } = {
      isDragging: false,
      tablePos: null,
      startY: 0,
      dropIndicator: null,
    };

    return [
      new Plugin({
        key: tableSelectionPluginKey,

        state: {
          init() {
            return {
              selectedTable: null as number | null,
              decorations: DecorationSet.empty,
            };
          },

          apply(tr, value, oldState, newState) {
            const { selection } = newState;
            const { $anchor } = selection;

            // Find if cursor is inside a table
            let selectedTable: number | null = null;
            let depth = $anchor.depth;

            while (depth > 0) {
              const node = $anchor.node(depth);
              if (node.type.name === 'table') {
                selectedTable = $anchor.before(depth);
                break;
              }
              depth--;
            }

            // Create decorations for selected table
            let decorations = DecorationSet.empty;
            if (selectedTable !== null) {
              // Find the table wrapper if it exists
              let wrapperPos = selectedTable;
              let wrapperDepth = depth;
              
              while (wrapperDepth > 0) {
                const parentNode = $anchor.node(wrapperDepth - 1);
                if (parentNode && parentNode.type.name === 'tableWrapper') {
                  wrapperPos = $anchor.before(wrapperDepth - 1);
                  const nodeAtPos = newState.doc.nodeAt(wrapperPos);
                  if (nodeAtPos) {
                    decorations = DecorationSet.create(newState.doc, [
                      Decoration.node(wrapperPos, wrapperPos + nodeAtPos.nodeSize, {
                        class: 'table-selected',
                      }),
                    ]);
                  }
                  break;
                }
                wrapperDepth--;
              }
            }

            return {
              selectedTable,
              decorations,
            };
          },
        },

        props: {
          decorations(state) {
            return this.getState(state)?.decorations;
          },

          handleDOMEvents: {
            mousedown(view, event) {
              const target = event.target as HTMLElement;
              const wrapper = target.closest('.table-wrapper.table-selected');
              
              // Check if clicking on drag handle
              if (wrapper && target.matches('.table-wrapper.table-selected::before')) {
                // Find table wrapper position
                const wrapperElement = wrapper as HTMLElement;
                const { state } = view;
                let tableWrapperPos: number | null = null;
                
                state.doc.descendants((node, pos) => {
                  if (node.type.name === 'tableWrapper') {
                    const dom = view.domAtPos(pos + 1).node;
                    if (dom && wrapperElement.contains(dom)) {
                      tableWrapperPos = pos;
                      return false;
                    }
                  }
                });
                
                if (tableWrapperPos === null) return false;
                
                // Start drag
                dragState.isDragging = true;
                dragState.tablePos = tableWrapperPos;
                dragState.startY = event.clientY;
                
                // Create drop indicator
                const indicator = document.createElement('div');
                indicator.className = 'table-drop-indicator';
                indicator.style.position = 'absolute';
                indicator.style.left = '0';
                indicator.style.right = '0';
                indicator.style.height = '3px';
                indicator.style.background = 'hsl(var(--primary))';
                indicator.style.pointerEvents = 'none';
                indicator.style.zIndex = '1000';
                document.body.appendChild(indicator);
                dragState.dropIndicator = indicator;
                
                // Add dragging class
                wrapperElement.classList.add('dragging');
                
                const handleMouseMove = (e: MouseEvent) => {
                  if (!dragState.isDragging || !dragState.dropIndicator) return;
                  
                  // Update drop indicator position
                  const editorRect = view.dom.getBoundingClientRect();
                  const relativeY = e.clientY - editorRect.top + view.dom.scrollTop;
                  
                  dragState.dropIndicator.style.top = `${e.clientY}px`;
                  dragState.dropIndicator.style.display = 'block';
                };
                
                const handleMouseUp = (e: MouseEvent) => {
                  if (!dragState.isDragging || dragState.tablePos === null) return;
                  
                  // Calculate drop position
                  const editorRect = view.dom.getBoundingClientRect();
                  const relativeY = e.clientY - editorRect.top + view.dom.scrollTop;
                  
                  // Find closest block position
                  const $pos = view.state.doc.resolve(dragState.tablePos);
                  const targetPos = view.posAtCoords({ left: e.clientX, top: e.clientY });
                  
                  if (targetPos && targetPos.pos !== dragState.tablePos) {
                    // Move table
                    const tableNode = view.state.doc.nodeAt(dragState.tablePos);
                    if (tableNode) {
                      const { tr } = view.state;
                      
                      // Delete from old position
                      tr.delete(dragState.tablePos, dragState.tablePos + tableNode.nodeSize);
                      
                      // Insert at new position
                      const newPos = targetPos.pos > dragState.tablePos 
                        ? targetPos.pos - tableNode.nodeSize 
                        : targetPos.pos;
                      
                      tr.insert(newPos, tableNode);
                      view.dispatch(tr);
                    }
                  }
                  
                  // Cleanup
                  dragState.isDragging = false;
                  dragState.tablePos = null;
                  if (dragState.dropIndicator) {
                    dragState.dropIndicator.remove();
                    dragState.dropIndicator = null;
                  }
                  wrapperElement.classList.remove('dragging');
                  
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                };
                
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
                
                return true;
              }
              
              return false;
            },
          },
        },
      }),
    ];
  },
});
