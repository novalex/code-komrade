/**
 * @file Component for displaying file options for a stylesheet.
 */

const React = require('react');

const FileOptions = require('./FileOptions');

const FieldSwitch = require('../fields/FieldSwitch');

const FieldSelect = require('../fields/FieldSelect');

class FileOptionsStylesheet extends FileOptions {
	isPartial( file ) {
		return file.name.startsWith('_');
	}

	styleOptions() {
		return {
			nested: 'Nested',
			compact: 'Compact',
			expanded: 'Expanded'
		};
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
					<FieldSwitch
						name='autocompile'
						label='Auto compile'
						labelPos='left'
						onChange={ this.handleChange }
						value={ this.getOption( 'autocompile', false ) }
					/>

					<hr />

					<FieldSelect
						name='style'
						label='Output style'
						labelPos='left'
						onChange={ this.handleChange }
						value={ this.getOption( 'style', 'nested' ) }
						options={ this.styleOptions() }
					/>
				</div>
			</div>
		);
	}
}

module.exports = FileOptionsStylesheet;
