/**
 * @file Component for displaying file options for a stylesheet.
 */

const React = require('react');

const FileOptions = require('./FileOptions');

const FieldSwitch = require('../../fields/FieldSwitch');

const FieldSelect = require('../../fields/FieldSelect');

const FieldSaveFile = require('../../fields/FieldSaveFile');

const NoContent = require('../../NoContent');

class FileOptionsStyles extends FileOptions {

	/**
	 * Constrcutor.
	 *
	 * @param {Object} props
	 */
	constructor( props ) {
		super( props );

		this.outputSuffix = '-dist';
		this.outputExtension = '.css';
		this.saveDialogFilters = [
			{ name: 'CSS', extensions: [ 'css' ] }
		];
	}

	/**
	 * Returns true if the current file is a partial.
	 * Currently, it simply checks if the filename begins with an underscore.
	 */
	isPartial() {
		return this.props.file.name.startsWith('_');
	}

	/**
	 * Render.
	 */
	render() {
		if ( this.isPartial() ) {
			return (
				<NoContent>
					<p>This is a partial file,<br /> it cannot be compiled<br /> on its own.</p>
				</NoContent>
			);
		}

		return (
			<div id='file-options' className='file-options-style'>
				{ this.renderHeader() }

				<div className='body'>
					<FieldSaveFile
						name='output'
						label='Output Path'
						onChange={ this.handleChange }
						value={ this.getOutputPath( 'display' ) }
						sourceFile={ this.props.file }
						sourceBase={ this.props.base }
						dialogFilters={ this.saveDialogFilters }
					/>

					<hr />

					<FieldSwitch
						name='autocompile'
						label='Auto Compile'
						labelPos='left'
						onChange={ this.handleChange }
						value={ this.getOption( 'autocompile', false ) }
					/>

					<hr />

					{ this.state.type === 'sass' &&
						<FieldSelect
							name='style'
							label='Output Style'
							labelPos='left'
							onChange={ this.handleChange }
							value={ this.getOption( 'style', 'nested' ) }
							options={ {
								nested: 'Nested',
								compact: 'Compact',
								expanded: 'Expanded',
								compressed: 'Compressed'
							} }
						/>
					}

					<FieldSwitch
						name='sourcemaps'
						label='Sourcemaps'
						labelPos='left'
						onChange={ this.handleChange }
						value={ this.getOption( 'sourcemaps', false ) }
					/>

					<FieldSwitch
						name='autoprefixer'
						label='Autoprefixer'
						labelPos='left'
						onChange={ this.handleChange }
						value={ this.getOption( 'autoprefixer', false ) }
					/>
				</div>

				{ this.renderFooter() }
			</div>
		);
	}
}

module.exports = FileOptionsStyles;
