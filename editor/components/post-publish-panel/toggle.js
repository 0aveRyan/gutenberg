/**
 * External Dependencies
 */
import { get } from 'lodash';

/**
 * WordPress Dependencies
 */
import { Button, ifCondition } from '@wordpress/components';
import { compose } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { withSelect } from '@wordpress/data';

/**
 * Internal Dependencies
 */
import PostPublishButton from '../post-publish-button';

function PostPublishPanelToggle( {
	hasPublishAction,
	isSaving,
	isPublishable,
	isSaveable,
	isPublished,
	isBeingScheduled,
	isPending,
	isScheduled,
	onToggle,
	isOpen,
	forceIsDirty,
	forceIsSaving,
} ) {
	const isButtonEnabled = (
		! isSaving && ! forceIsSaving && isPublishable && isSaveable
	) || isPublished;

	const showToggle = ! isPublished && ! ( isScheduled && isBeingScheduled ) && ! ( isPending && ! hasPublishAction );

	if ( ! showToggle ) {
		return <PostPublishButton forceIsDirty={ forceIsDirty } forceIsSaving={ forceIsSaving } />;
	}

	return (
		<Button
			className="editor-post-publish-panel__toggle"
			isPrimary
			onClick={ onToggle }
			aria-expanded={ isOpen }
			disabled={ ! isButtonEnabled }
			isBusy={ isSaving && isPublished }
		>
			{ isBeingScheduled ? __( 'Schedule…' ) : __( 'Publish…' ) }
		</Button>
	);
}

export default compose( [
	withSelect( ( select ) => {
		const {
			isSavingPost,
			isEditedPostSaveable,
			isEditedPostPublishable,
			isCurrentPostPending,
			isCurrentPostPublished,
			isEditedPostBeingScheduled,
			isCurrentPostScheduled,
			getCurrentPost,
			getCurrentPostType,
		} = select( 'core/editor' );

		const {
			getPostType,
		} = select( 'core' );

		const postType = getCurrentPostType();

		return {
			hasPublishAction: get( getCurrentPost(), [ '_links', 'wp:action-publish' ], false ),
			isSaving: isSavingPost(),
			isSaveable: isEditedPostSaveable(),
			isPublishable: isEditedPostPublishable(),
			isPending: isCurrentPostPending(),
			isPublished: isCurrentPostPublished(),
			isScheduled: isCurrentPostScheduled(),
			isBeingScheduled: isEditedPostBeingScheduled(),
			postType: postType,
			isPostPublishable: get( getPostType( postType ), [ 'publishable' ], true ),
		};
	} ),
	ifCondition( ( { isPostPublishable } ) => isPostPublishable ),
] )( PostPublishPanelToggle );
