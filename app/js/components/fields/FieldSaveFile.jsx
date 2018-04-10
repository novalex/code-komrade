/**
 * @file Component for a save file field.
 */

const { dialog } = require('electron').remote;

const { slash, fileRelativePath, fileAbsolutePath } = require('../../utils/pathHelpers');

const React = require('react');

const PropTypes = require('prop-types');

const Field = require('./Field');

class FieldSaveFile extends React.Component {
	constructor( props ) {
		super( props );

		this.state = {
			path: this.props.value
		}

		this.onClick = this.onClick.bind( this );
	}

	static getDerivedStateFromProps( nextProps, prevState ) {
		let path = ( nextProps.value === null ) ? '' : nextProps.value;

		return { path };
	}

	onClick( event ) {
		event.persist();
		event.preventDefault();

		let fileSaveOptions = {};

		if ( this.props.dialogTitle ) {
			fileSaveOptions.title = this.props.dialogTitle;
		}

		if ( ! this.state.path && this.props.sourceFile ) {
			fileSaveOptions.defaultPath = fileAbsolutePath( this.props.sourceFile.path );
		} else if ( this.state.path && this.props.sourceBase ) {
			fileSaveOptions.defaultPath = fileAbsolutePath( this.props.sourceBase, this.state.path );
		}

		if ( this.props.dialogFilters ) {
			fileSaveOptions.filters = this.props.dialogFilters;
		}

		let filename = dialog.showSaveDialog( fileSaveOptions );

		if ( filename ) {
			let savePath = slash( filename );

			if ( this.props.sourceBase ) {
				savePath = slash( fileRelativePath( this.props.sourceBase, filename ) );
			}

			this.setState({ path: savePath }, function() {
				if ( this.props.onChange ) {
					this.props.onChange( event, savePath );
				}
			});
		}
	}

	render() {
		return (
			<Field type='save-file' label={ this.props.label } labelPos={ this.props.labelPos }>
				<input
					type='text'
					name={ this.props.name }
					onClick={ this.onClick }
					id={ 'field_' + this.props.name }
					value={ this.state.path }
					readOnly='true'
				/>
			</Field>
		);
	}
}

FieldSaveFile.propTypes = {
	name: PropTypes.string.isRequired,
	label: PropTypes.string.isRequired,
	labelPos: PropTypes.string,
	onChange: PropTypes.func,
	value: PropTypes.string,
	sourceFile: PropTypes.object,
	dialogTitle: PropTypes.string,
	dialogFilters: PropTypes.oneOfType([ PropTypes.array, PropTypes.object ])
};

module.exports = FieldSaveFile;
