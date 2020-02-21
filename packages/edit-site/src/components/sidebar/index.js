/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';
import { createSlotFill, Panel } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { GlobalStylesPanel } from '@wordpress/global-styles';

/**
 * Internal dependencies
 */

const { Slot: InspectorSlot, Fill: InspectorFill } = createSlotFill(
	'EditSiteSidebarInspector'
);

function Sidebar() {
	const isGlobalStylesModeEnabled = useSelect( ( select ) => {
		return select( 'core/editor' ).getGlobalStylesMode();
	}, [] );

	return (
		<div
			className="edit-site-sidebar"
			role="region"
			aria-label={ __( 'Site editor advanced settings.' ) }
			tabIndex="-1"
		>
			{ isGlobalStylesModeEnabled ? (
				<Panel header={ __( 'Global Styles' ) }>
					<GlobalStylesPanel />
				</Panel>
			) : (
				<Panel header={ __( 'Inspector' ) }>
					<InspectorSlot bubblesVirtually />
				</Panel>
			) }
		</div>
	);
}

Sidebar.InspectorFill = InspectorFill;

export default Sidebar;
