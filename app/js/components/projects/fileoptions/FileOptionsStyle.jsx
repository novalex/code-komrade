/**
 * @file Component for displaying file options for a stylesheet.
 */

const React = require('react');

const FileOptions = require('./FileOptions');

const FieldSwitch = require('../../fields/FieldSwitch');

const FieldSelect = require('../../fields/FieldSelect');

const FieldSaveFile = require('../../fields/FieldSaveFile');

class FileOptionsStyles extends FileOptions {
	constructor( props ) {
		super( props );

		this.outputSuffix = '-dist';
		this.outputExtension = '.css';
		this.saveDialogFilters = [
			{ name: 'CSS', extensions: [ 'css' ] }
		];
	}

	isPartial() {
		return this.props.file.name.startsWith('_');
	}

	render() {
		if ( this.isPartial() ) {
			return (
				<div id='file-options' className='file-options-style'>
					<div className='header'>
						<strong>{ this.props.file.name }</strong>
					</div>
					<div className='body'>
						<p>This is a partial file, it cannot be compiled by itself.</p>
					</div>
				</div>
			);
		}

		return (
			<div id='file-options' className='file-options-style'>
				<div className='header'>
					<strong>{ this.props.file.name }</strong>
				</div>

				<div className='body'>
					<FieldSaveFile
						name='output'
						label='Output Path'
						onChange={ this.setOutputPath }
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

				<div className='footer'>
					{ this.renderButton() }
				</div>
			</div>
		);
	}
}

module.exports = FileOptionsStyles;
