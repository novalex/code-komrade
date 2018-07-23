@SETLOCAL
@SET PATHEXT=%PATHEXT:;.JS;=;%
if exist "%~dp0..\node_modules\gulp\bin\gulp.js" (
	node "%~dp0..\node_modules\gulp\bin\gulp.js" %*
) else (
	node "%~dp0..\..\node_modules\gulp\bin\gulp.js" %*
)