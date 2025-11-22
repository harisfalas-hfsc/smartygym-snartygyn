import { Node, mergeAttributes } from '@tiptap/core';

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
        default: '75%',
        parseHTML: element => element.getAttribute('data-width') || '75%',
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
});
