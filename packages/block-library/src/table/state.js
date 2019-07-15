/**
 * External dependencies
 */
import { times, get, mapValues, every } from 'lodash';

/**
 * Creates a table state.
 *
 * @param {number} options.rowCount    Row count for the table to create.
 * @param {number} options.columnCount Column count for the table to create.
 *
 * @return {Object} New table state.
 */
export function createTable( {
	rowCount,
	columnCount,
} ) {
	return {
		body: times( rowCount, () => ( {
			cells: times( columnCount, () => ( {
				content: '',
				tag: 'td',
			} ) ),
		} ) ),
	};
}

/**
 * Updates cell content in the table state.
 *
 * @param {Object} state               	 Current table state.
 * @param {string} options.section     	 Section of the cell to update.
 * @param {number} options.rowIndex    	 Row index of the cell to update.
 * @param {number} options.columnIndex 	 Column index of the cell to update.
 * @param {number} options.attributeName The name of the attribute to update.
 * @param {number} options.value 	   	 The value to update the attribute with.
 *
 * @return {Object} New table state.
 */
export function updateCellAttribute( state, {
	section,
	rowIndex,
	columnIndex,
	attributeName,
	value,
} ) {
	return {
		[ section ]: state[ section ].map( ( row, currentRowIndex ) => {
			if ( currentRowIndex !== rowIndex ) {
				return row;
			}

			return {
				cells: row.cells.map( ( cell, currentColumnIndex ) => {
					if ( currentColumnIndex !== columnIndex ) {
						return cell;
					}

					return {
						...cell,
						[ attributeName ]: value,
					};
				} ),
			};
		} ),
	};
}
/**
 * Gets an attribute for a cell.
 *
 * @param {Object} state 			   	 Current table state.
 * @param {string} options.section     	 Section of the cell to update.
 * @param {number} options.rowIndex    	 Row index of the cell to update.
 * @param {number} options.columnIndex 	 Column index of the cell to update.
 * @param {number} options.attributeName The name of the attribute to get the value of.
 *
 * @return {*} The attribute value.
 */
export function getCellAttribute( state, {
	section,
	rowIndex,
	columnIndex,
	attributeName,
} ) {
	return get( state, [ section, rowIndex, 'cells', columnIndex, attributeName ] );
}

/**
 * Updates cell content in the table state.
 *
 * @param {Object} state               Current table state.
 * @param {string} options.section     Section of the cell to update.
 * @param {number} options.rowIndex    Row index of the cell to update.
 * @param {number} options.columnIndex Column index of the cell to update.
 * @param {Array}  options.content     Content to set for the cell.
 *
 * @return {Object} New table state.
 */
export function updateCellContent( state, { content: value, ...options } ) {
	return updateCellAttribute( state, {
		...options,
		value,
		attributeName: 'content',
	} );
}

/**
 * Inserts a row in the table state.
 *
 * @param {Object} state            Current table state.
 * @param {string} options.section  Section in which to insert the row.
 * @param {number} options.rowIndex Row index at which to insert the row.
 *
 * @return {Object} New table state.
 */
export function insertRow( state, {
	section,
	rowIndex,
	columnCount,
} ) {
	const cellCount = columnCount || state[ section ][ 0 ].cells.length;

	return {
		[ section ]: [
			...state[ section ].slice( 0, rowIndex ),
			{
				cells: times( cellCount, () => ( {
					content: '',
					tag: section === 'head' ? 'th' : 'td',
				} ) ),
			},
			...state[ section ].slice( rowIndex ),
		],
	};
}

/**
 * Deletes a row from the table state.
 *
 * @param {Object} state            Current table state.
 * @param {string} options.section  Section in which to delete the row.
 * @param {number} options.rowIndex Row index to delete.
 *
 * @return {Object} New table state.
 */
export function deleteRow( state, {
	section,
	rowIndex,
} ) {
	return {
		[ section ]: state[ section ].filter( ( row, index ) => index !== rowIndex ),
	};
}

/**
 * Inserts a column in the table state.
 *
 * @param {Object} state               Current table state.
 * @param {string} options.section     Section in which to insert the column.
 * @param {number} options.columnIndex Column index at which to insert the column.
 *
 * @return {Object} New table state.
 */
export function insertColumn( state, {
	columnIndex,
} ) {
	return mapValues( state, ( section, sectionName ) => {
		// Bail early if the table section is empty.
		if ( isEmptyTableSection( section ) ) {
			return section;
		}

		return section.map( ( row ) => {
			// Bail early if the row is empty or it's an attempt to insert past
			// the last possible index of the array.
			if ( isEmptyRow( row ) || row.cells.length < columnIndex ) {
				return row;
			}

			return {
				cells: [
					...row.cells.slice( 0, columnIndex ),
					{
						content: '',
						tag: sectionName === 'head' ? 'th' : 'td',
					},
					...row.cells.slice( columnIndex ),
				],
			};
		} );
	} );
}

/**
 * Deletes a column from the table state.
 *
 * @param {Object} state               Current table state.
 * @param {string} options.section     Section in which to delete the column.
 * @param {number} options.columnIndex Column index to delete.
 *
 * @return {Object} New table state.
 */
export function deleteColumn( state, {
	columnIndex,
} ) {
	return mapValues( state, ( section ) => {
		// Bail early if the table section is empty.
		if ( isEmptyTableSection( section ) ) {
			return section;
		}

		return section.map( ( row ) => ( {
			cells: row.cells.length >= columnIndex ? row.cells.filter( ( cell, index ) => index !== columnIndex ) : row.cells,
		} ) ).filter( ( row ) => row.cells.length );
	} );
}

/**
 * Toggles the existance of a section.
 *
 * @param {Object} state   Current table state.
 * @param {string} section Name of the section to toggle.
 *
 * @return {Object} New table state.
 */
export function toggleSection( state, section ) {
	// Section exists, replace it with an empty row to remove it.
	if ( ! isEmptyTableSection( state[ section ] ) ) {
		return { [ section ]: [] };
	}

	// Get the length of the first row of the body to use when creating the header.
	const columnCount = get( state, [ 'body', 0, 'cells', 'length' ], 1 );

	// Section doesn't exist, insert an empty row to create the section.
	return insertRow( state, { section, rowIndex: 0, columnCount } );
}

/**
 * Determines whether a table section is empty.
 *
 * @param {Object} sectionRows Table section state.
 *
 * @return {boolean} True if the table section is empty, false otherwise.
 */
export function isEmptyTableSection( sectionRows ) {
	return ! sectionRows || ! sectionRows.length || every( sectionRows, isEmptyRow );
}

/**
 * Determines whether a table row is empty.
 *
 * @param {Object} row Table row state.
 *
 * @return {boolean} True if the table section is empty, false otherwise.
 */
export function isEmptyRow( row ) {
	return ! ( row.cells && row.cells.length );
}

/**
 * Determines if a cell is within a multi-cell selection.
 *
 * @param {Object} cellLocation The cell to check
 * @param {Object} selection    The selection data
 *
 * @return {boolean} True if the cell is within a selection, false otherwise.
 */
export function isCellInMultiSelection( cellLocation, selection ) {
	if ( ! cellLocation || ! selection ) {
		return false;
	}

	switch ( selection.type ) {
		case 'table':
			return true;
		case 'row':
			return isRowSelected( cellLocation, selection );
		case 'column':
			return isColumnSelected( cellLocation, selection );
		case 'cell':
			return false;
	}
}

/**
 * Determines if a cell is within a row selection.
 *
 * @param {Object} cellLocation The cell to check
 * @param {Object} selection    The selection data
 *
 * @return {boolean} True if the cell is within a selection, false otherwise.
 */
export function isRowSelected( cellLocation, selection ) {
	if ( ! cellLocation || ! selection ) {
		return false;
	}
	return selection.type === 'row' && cellLocation.section === selection.section && cellLocation.rowIndex === selection.rowIndex;
}

/**
 * Determines if a cell is within a column selection.
 *
 * @param {Object} cellLocation The cell to check
 * @param {Object} selection    The selection data
 *
 * @return {boolean} True if the cell is within a selection, false otherwise.
 */
export function isColumnSelected( cellLocation, selection ) {
	if ( ! cellLocation || ! selection ) {
		return false;
	}
	return selection.type === 'column' && cellLocation.columnIndex === selection.columnIndex;
}

/**
 * Returns the location of the cell above.
 *
 * @param {Object} state        The table state.
 * @param {Object} cellLocation The cell location (section, rowIndex, columnIndex).
 *
 * @return {?Object} The location of the cell above this one or undefined
 *                   if this cell is at the table perimeter.
 */
export function getCellAbove( state, cellLocation ) {
	const { section: sectionName, rowIndex, columnIndex } = cellLocation;
	const isFirstRow = rowIndex === 0;

	// This is the first row of the first section, return undefined early.
	if ( sectionName === 'head' && isFirstRow ) {
		return;
	}

	// Handle getting the cell from the next section.
	if ( isFirstRow ) {
		const previousSectionName = sectionName === 'foot' ? 'body' : 'head';
		const previousSection = state[ previousSectionName ];

		// There is no previous section, return undefined early.
		if ( isEmptyTableSection( previousSection ) ) {
			return;
		}

		// The previous section doesn't have as many columns, return undefined early.
		const columnCount = previousSection[ 0 ].cells.length;
		if ( columnIndex > columnCount - 1 ) {
			return;
		}

		const lastRowOfPreviousSection = previousSection.length - 1;

		return {
			section: previousSectionName,
			rowIndex: lastRowOfPreviousSection,
			columnIndex,
		};
	}

	return {
		...cellLocation,
		rowIndex: rowIndex - 1,
	};
}

/**
 * Returns the location of the cell below.
 *
 * @param {Object} state        The table state.
 * @param {Object} cellLocation The cell location (section, rowIndex, columnIndex).
 *
 * @return {?Object} The location of the cell below this one or undefined
 *                   if this cell is at the table perimeter.
 */
export function getCellBelow( state, cellLocation ) {
	const { section: sectionName, rowIndex, columnIndex } = cellLocation;
	const section = state[ sectionName ];
	const rowCount = section.length;
	const isLastRow = rowIndex === rowCount - 1;

	// This is the last row of the last section, return undefined early.
	if ( sectionName === 'foot' && isLastRow ) {
		return;
	}

	// Handle getting the cell from the next section.
	if ( isLastRow ) {
		const nextSectionName = sectionName === 'head' ? 'body' : 'foot';
		const nextSection = state[ nextSectionName ];

		// There is no next section, return undefined early.
		if ( isEmptyTableSection( nextSection ) ) {
			return;
		}

		// The next section doesn't have as many columns, return undefined early.
		const columnCount = nextSection[ 0 ].cells.length;
		if ( columnIndex > columnCount - 1 ) {
			return;
		}

		return {
			section: nextSectionName,
			rowIndex: 0,
			columnIndex,
		};
	}

	return {
		...cellLocation,
		rowIndex: rowIndex + 1,
	};
}

/**
 * Returns the location of the cell to the right.
 *
 * @param {Object} state        The table state.
 * @param {Object} cellLocation The cell location (section, rowIndex, columnIndex).
 *
 * @return {?Object} The location of the cell to the right of this one or undefined
 *                   if this cell is at the table perimeter.
 */
export function getCellToRight( state, cellLocation ) {
	const { section: sectionName, rowIndex, columnIndex } = cellLocation;
	const section = state[ sectionName ];
	const columnCount = section[ rowIndex ].cells.length;
	const hasCellToRight = columnIndex < columnCount - 1;

	return hasCellToRight ? {
		...cellLocation,
		columnIndex: columnIndex + 1,
	} : undefined;
}

/**
 * Returns the location of the cell to the left.
 *
 * @param {Object} cellLocation The cell location (section, rowIndex, columnIndex).
 *
 * @return {?Object} The location of the cell to the left of this one or undefined
 *                   if this cell is at the table perimeter.
 */
export function getCellToLeft( cellLocation ) {
	const { columnIndex } = cellLocation;
	const hasCellToLeft = columnIndex > 0;

	return hasCellToLeft ? {
		...cellLocation,
		columnIndex: columnIndex - 1,
	} : undefined;
}
