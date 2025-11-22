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
        },
      }),
    ];
  },
});
