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

		this.onClick = this.onClick.bind( this );
	}

	onClick( event ) {
		event.persist();
		event.preventDefault();

		let fileSaveOptions = {};

		if ( this.props.dialogTitle ) {
			fileSaveOptions.title = this.props.dialogTitle;
		}

		if ( ! this.props.value && this.props.sourceFile ) {
			fileSaveOptions.defaultPath = this.props.sourceFile.path;
		} else if ( this.props.value && this.props.sourceBase ) {
			fileSaveOptions.defaultPath = fileAbsolutePath( this.props.sourceBase, this.props.value );
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

			if ( this.props.onChange ) {
				this.props.onChange( this.props.name, savePath );
			}
		}
	}

	render() {
		return (
			<Field type='save-file' label={ this.props.label } labelPos={ this.props.labelPos }>
				<input
					type='hidden'
					name={ this.props.name }
					id={ 'field_' + this.props.name }
					value={ this.props.value }
					readOnly
				/>
				<small onClick={ this.onClick }>{ this.props.value }</small>
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
	dialogFilters: PropTypes.oneOfType([ PropTypes.array, PropTypes.object ]),
	disabled: PropTypes.bool
};

module.exports = FieldSaveFile;
