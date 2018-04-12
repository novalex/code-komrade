/**
 * @file Component for displaying file options for a stylesheet.
 */

const React = require('react');

const FileOptions = require('./FileOptions');

const FieldSwitch = require('../../fields/FieldSwitch');

const FieldSelect = require('../../fields/FieldSelect');

const FieldSaveFile = require('../../fields/FieldSaveFile');

class FileOptionsStylesheet extends FileOptions {
	constructor( props ) {
		super( props );

		this.buildTaskName = 'build-css';
		this.outputSuffix = '-dist';
		this.outputExtension = '.css';
		this.saveDialogFilters = [
			{ name: 'CSS', extensions: [ 'css' ] }
		];
		this.styleOptions = {
			nested: 'Nested',
			compact: 'Compact',
			expanded: 'Expanded',
			compressed: 'Compressed'
		};
	}

	isPartial( file ) {
		return file.name.startsWith('_');
	}

	render() {
		if ( this.isPartial( this.props.file ) ) {
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

					<FieldSelect
						name='style'
						label='Output Style'
						labelPos='left'
						onChange={ this.handleChange }
						value={ this.getOption( 'style', 'nested' ) }
						options={ this.styleOptions }
					/>
				</div>

				<div className='footer'>
					{ this.renderButton() }
				</div>
			</div>
		);
	}
}

module.exports = FileOptionsStylesheet;
