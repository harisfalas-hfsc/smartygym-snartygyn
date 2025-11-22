import { Table } from '@tiptap/extension-table';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { TextSelection } from '@tiptap/pm/state';

// Helper to convert number to letter (1=A, 2=B, etc.)
function numberToLetter(num: number): string {
  let result = '';
  while (num > 0) {
    const remainder = (num - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    num = Math.floor((num - 1) / 26);
  }
  return result;
}

export const TableWithSelectors = Table.extend({
  addNodeView() {
    return ({ node, HTMLAttributes, getPos, editor }) => {
      // Create wrapper container
      const wrapper = document.createElement('div');
      wrapper.className = 'table-with-selectors';
      
      // Get table dimensions
      const firstRow = node.firstChild;
      const colCount = firstRow?.childCount || 0;
      const rowCount = node.childCount;
      
      // Create column header row (A, B, C...)
      const colHeader = document.createElement('div');
      colHeader.className = 'table-col-header';
      colHeader.contentEditable = 'false';
      
      const colSelectors: HTMLElement[] = [];
      for (let i = 0; i < colCount; i++) {
        const colSelector = document.createElement('div');
        colSelector.className = 'table-col-selector';
        colSelector.textContent = numberToLetter(i + 1);
        colSelector.setAttribute('data-col', String(i));
        colSelector.title = `Select column ${numberToLetter(i + 1)}`;
        
        // Attach direct event listener
        const colIndex = i;
        const clickHandler = (e: MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          const pos = getPos();
          if (typeof pos === 'number') {
            selectColumn(editor.view, pos, colIndex);
          }
        };
        colSelector.addEventListener('mousedown', clickHandler);
        colSelectors.push(colSelector);
        
        colHeader.appendChild(colSelector);
      }
      
      // Create container for row numbers + table
      const tableContainer = document.createElement('div');
      tableContainer.className = 'table-container-with-rows';
      
      // Create row numbers column (1, 2, 3...)
      const rowNumbers = document.createElement('div');
      rowNumbers.className = 'table-row-numbers';
      rowNumbers.contentEditable = 'false';
      
      const rowSelectors: HTMLElement[] = [];
      for (let i = 0; i < rowCount; i++) {
        const rowSelector = document.createElement('div');
        rowSelector.className = 'table-row-selector';
        rowSelector.textContent = String(i + 1);
        rowSelector.setAttribute('data-row', String(i));
        rowSelector.title = `Select row ${i + 1}`;
        
        // Attach direct event listener
        const rowIndex = i;
        const clickHandler = (e: MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          const pos = getPos();
          if (typeof pos === 'number') {
            selectRow(editor.view, pos, rowIndex);
          }
        };
        rowSelector.addEventListener('mousedown', clickHandler);
        rowSelectors.push(rowSelector);
        
        rowNumbers.appendChild(rowSelector);
      }
      
      // Create the actual table element (this will be the contentDOM)
      const table = document.createElement('table');
      Object.entries(HTMLAttributes).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          table.setAttribute(key, String(value));
        }
      });
      
      // Assemble the structure
      wrapper.appendChild(colHeader);
      tableContainer.appendChild(rowNumbers);
      tableContainer.appendChild(table);
      wrapper.appendChild(tableContainer);
      
      return {
        dom: wrapper,
        contentDOM: table,
        update: (updatedNode) => {
          if (updatedNode.type.name !== 'table') return false;
          
          // Check if table structure changed (rows/cols added/removed)
          const newFirstRow = updatedNode.firstChild;
          const newColCount = newFirstRow?.childCount || 0;
          const newRowCount = updatedNode.childCount;
          
          if (newColCount !== colCount || newRowCount !== rowCount) {
            // Structure changed, need to rebuild selectors
            return false; // This will trigger a full re-render
          }
          
          return true; // Content changed but structure is the same
        },
        destroy: () => {
          // Cleanup event listeners
          colSelectors.forEach(el => {
            const newEl = el.cloneNode(true);
            el.parentNode?.replaceChild(newEl, el);
          });
          rowSelectors.forEach(el => {
            const newEl = el.cloneNode(true);
            el.parentNode?.replaceChild(newEl, el);
          });
        },
      };
    };
  },

  addProseMirrorPlugins() {
    return [
      ...(this.parent?.() || []),
      new Plugin({
        key: new PluginKey('tableSelectorsPlugin'),
        
        props: {
          handleClickOn(view, pos, node, nodePos, event) {
            const target = event.target as HTMLElement;
            
            // Handle column selector clicks
            if (target.classList.contains('table-col-selector')) {
              event.preventDefault();
              event.stopPropagation();
              
              const colIndex = parseInt(target.getAttribute('data-col') || '0', 10);
              
              // Find the table at this position
              let tablePos: number | null = null;
              view.state.doc.nodesBetween(nodePos, nodePos + node.nodeSize, (n, p) => {
                if (n.type.name === 'table' && tablePos === null) {
                  tablePos = p;
                  return false;
                }
              });
              
              if (tablePos !== null) {
                selectColumn(view, tablePos, colIndex);
              }
              
              return true;
            }
            
            // Handle row selector clicks
            if (target.classList.contains('table-row-selector')) {
              event.preventDefault();
              event.stopPropagation();
              
              const rowIndex = parseInt(target.getAttribute('data-row') || '0', 10);
              
              // Find the table at this position
              let tablePos: number | null = null;
              view.state.doc.nodesBetween(nodePos, nodePos + node.nodeSize, (n, p) => {
                if (n.type.name === 'table' && tablePos === null) {
                  tablePos = p;
                  return false;
                }
              });
              
              if (tablePos !== null) {
                selectRow(view, tablePos, rowIndex);
              }
              
              return true;
            }
            
            return false;
          },
        },
      }),
    ];
  },
});

// Helper to select entire column
function selectColumn(view: any, tablePos: number, colIndex: number) {
  const { state } = view;
  const table = state.doc.nodeAt(tablePos);
  
  if (!table || table.type.name !== 'table') return;
  
  // Build a selection that includes all cells in this column
  const { tr } = state;
  let fromPos: number | null = null;
  let toPos: number | null = null;
  
  let currentPos = tablePos + 1; // Start inside table
  let foundFirst = false;
  
  table.forEach((row: any) => {
    currentPos++; // Enter row
    let currentCol = 0;
    
    row.forEach((cell: any) => {
      if (currentCol === colIndex) {
        if (!foundFirst) {
          fromPos = currentPos;
          foundFirst = true;
        }
        toPos = currentPos + cell.nodeSize;
      }
      currentPos += cell.nodeSize;
      currentCol++;
    });
    
    currentPos++; // Exit row
  });
  
  if (fromPos !== null && toPos !== null) {
    // Create text selection across the column
    const selection = TextSelection.create(state.doc, fromPos, toPos);
    tr.setSelection(selection);
    view.dispatch(tr);
  }
}

// Helper to select entire row
function selectRow(view: any, tablePos: number, rowIndex: number) {
  const { state } = view;
  const table = state.doc.nodeAt(tablePos);
  
  if (!table || table.type.name !== 'table') return;
  
  let currentPos = tablePos + 1; // Start inside table
  let currentRow = 0;
  let fromPos: number | null = null;
  let toPos: number | null = null;
  
  table.forEach((row: any) => {
    if (currentRow === rowIndex) {
      fromPos = currentPos + 1; // Inside the row
      toPos = currentPos + row.nodeSize - 1; // End of row
      return false;
    }
    currentPos += row.nodeSize;
    currentRow++;
  });
  
  if (fromPos !== null && toPos !== null) {
    // Create text selection across the row
    const { tr } = state;
    const selection = TextSelection.create(state.doc, fromPos, toPos);
    tr.setSelection(selection);
    view.dispatch(tr);
  }
}
