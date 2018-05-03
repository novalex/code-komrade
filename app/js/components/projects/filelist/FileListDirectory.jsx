/**
 * @file Component for rendering a directory tree.
 */

const React = require('react');

class FileListDirectory extends React.Component {
	constructor( props ) {
		super( props );

		this.state = {
			expanded: false
		};

		this.onClick = this.onClick.bind( this );
	}

	renderChildren() {
		if ( ! this.state.expanded ) {
			return null;
		}

		return this.props.children;
	}

	onClick( event ) {
		event.stopPropagation();

		this.setState( function( prevState ) {
			return { expanded: ! prevState.expanded };
		});
	}

	render() {
		let className = 'directory';

		if ( this.state.expanded ) {
			className += ' expand';
		}

		return (
			<li className={ className } onClick={ this.onClick }>
				<div className='filename'>
					{ String.fromCharCode('0x2003').repeat( this.props.level ) }
					<span className='icon' />
					<strong>{ this.props.file.name }</strong>
				</div>
				{ this.renderChildren() }
			</li>
		);
	}
}

module.exports = FileListDirectory;
