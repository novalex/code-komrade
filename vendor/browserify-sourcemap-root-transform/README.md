browserify-sourcemap-root-transform
===================================

This package is a browserify plugin that transforms the sourcemap root path in your output bundle.
If you ship sourcemaps with your browserify bundle, this allows you to set the root prefix that developers will see when they
look at their sources in web inspector.

By default, the plugin will replace the basedir with the npm package name of the current package. To override this behavior,
set basedir in the plugin options.

Example:
    browserify -p '[ "browserify-sourcemap-root-transform", {"basedir":"MyCoolPackage"} ]'

Example (grunt-browserify):
    plugins : [ 'browserify-sourcemap-root-transform', {
        basedir : "MyCoolPackage"
    }]
