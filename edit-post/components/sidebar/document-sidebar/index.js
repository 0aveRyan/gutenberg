/**
 * WordPress dependencies
 */
import { Panel } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { PostTypeSupportCheck } from '@wordpress/editor';

/**
 * Internal Dependencies
 */
import PostStatus from '../post-status';
import PostExcerpt from '../post-excerpt';
import PostTaxonomies from '../post-taxonomies';
import FeaturedImage from '../featured-image';
import DiscussionPanel from '../discussion-panel';
import LastRevision from '../last-revision';
import PageAttributes from '../page-attributes';
import MetaBoxes from '../../meta-boxes';
import SettingsHeader from '../settings-header';
import Sidebar from '../';
import PostsPanel from '../posts-panel';
import TemplateSettingsPanel from '../template-settings-panel';

const SIDEBAR_NAME = 'edit-post/document';

const DocumentSidebar = () => (
	<PostTypeSupportCheck supportKeys="document">
		<Sidebar
			name={ SIDEBAR_NAME }
			label={ __( 'Editor settings' ) }
		>
			<SettingsHeader sidebarName={ SIDEBAR_NAME } />
			<Panel>
				<PostStatus />
				<PostsPanel />
				<TemplateSettingsPanel />
				<LastRevision />
				<PostTaxonomies />
				<FeaturedImage />
				<PostExcerpt />
				<DiscussionPanel />
				<PageAttributes />
				<MetaBoxes location="side" usePanel />
			</Panel>
		</Sidebar>
	</PostTypeSupportCheck>
);

export default DocumentSidebar;
