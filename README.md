# Code Komrade
GUI application for preprocessing, compiling and minifying CSS (including Sass and LESS) and JS (including ES6 using Babel) files.

![alt text](https://novalx.com/assets/code-komrade-preview.png "Application preview")

The main purpose of this app is to make working with files that require preprocessing much easier.

Too many times the process of using a traditional, CLI-based build system looks like this:  
1. grab a copy of a project you want to work on
2. run "npm install"
3. wait several minutes to get an error in one of the dependencies
4. scramble for hours to fix it
5. dig through the Gulp or Grunt configuration files to figure out how to use the build system
6. deal with the (tens of) thousands of files inside the infamous "node_modules" folder

Code Komrade aims to drastically simplify the process:  
1. grab a copy of a project you want to work on
2. open up the app and add the project folder
3. configure your build process from the GUI, and you're done

What's more, the app will save your configuration as a JSON file in the project root, so you can add it to source control and allow everyone else to just grab the project, open it inside the app, and be ready to go!

## Installation
1. Clone repository.
2. Make sure you're using version 11 of Node.js (e.g. v11.15.0). You can use [nvm](https://github.com/nvm-sh/nvm) to switch between versions. This is required due to compatibility issues between node-sass and Electron ([more info](https://github.com/sass/node-sass/issues/2054)).
3. Run `npm install`.
4. Go into the "app" directory and run `npm install` again.
5. Run `npm run start` or `gulp serve` in the root directory to start the app in development mode with hot-reloading.  
   *Note: If you get the "Node Sass does not yet support your current environment" error in the console, run `./compile-sass-binding.sh` to compile the appropriate version of the node-sass binding file.*
6. Run `gulp build` or `gulp build-production` to build app files for development or production, respectively.
7. Run `npm run package-win` or `npm run package-mac` to package the app for Windows or MacOS, respectively.

### Credits
Huge thanks to:
- the open source community
- the developers who spend their time answering questions on Stack Overflow, making tutorials or guides
- the [WPRiders](https://wpriders.com) agency for pushing me to learn new things
- [John Caserta](https://thenounproject.com/johncaserta/) for the hammer icon used in the logo.
