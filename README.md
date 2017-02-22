# broccoli build project

This is a project to bring proper tools like jshinting, testing, sass/scss, es6, dependency management and browserifying in a realtime build into the world of salesforce. It uses the broccoli build tool for the sake of scalability.

## installation

### quick install

Once you have cloned this repo, run:

```
npm install

```
*! please note !* this will reinstall bower, broccoli and testem if you have any of those installed already

if you're using mac or linux and need admin rights to install global node modules use:

```
sudo npm install
```

### deepdive install

To use this project you'll need the following:

- node
- (bower and git, if you're using bower dependencies)
- broccoli
- testem

You should start by installing the 'Node Version Manager' and you'll find the doc for doing that at https://github.com/coreybutler/nvm-windows#user-content-node-version-manager-nvm-for-windows. Remember to follow the documentation on how to install the latest version of node also.

Once you have node installed, if you're planning to use bower dependencies or decide later to use them, you'll need to install git. For this, go to https://git-scm.com/downloads. You can now install bower using node package manager by opening a command line console and typing 'npm install -g bower' where -g stands for global and will make the bower command available globally.

To install the actual build tool: broccoli, type 'npm install -g broccoli-cli'.

To install the testing framework 'testem' you can type 'npm install -g testem'.

Finally to install all the required libraries, go to the root directory of the build project and type 'npm install'.

(And to install the bower dependencies if there are any, type bower install.)

Now you should be setup and ready to go.

## usage

First of all, to enable deployment to an org, you should provide the credentials to an org. Do this by creating a file called 'sfCredentials.json' in the the root directory of this build project.

**i.e.**
```
{
  "username": "user@fakedomain.com",
  "password": "password123",
  "securityToken": "sdfsdlksfo83p02ks"
}
```

The usage scipts have been entered into your package.json file under the variable 'scripts'.

To create a new page by the name 'someNewPage' type 'npm run newPage someNewPage'.

To create a new staticresource by the name 'someNewResource' type 'npm run newResource someNewResource'.

To create a new aura component by the name 'someNewComponent' type 'npm run newAuraComponent someNewComponent'.

To create a new aura app by the name 'someNewApp' type 'npm run newAuraApp someNewApp'.

The structure of the two former is the same except the staticresource structure doesn't have a page.html file and won't therefore create a page on your salesforce org.

To start development and see your changes appear in realtime type 'npm start' or 'npm run start'. To quit the service do ctrl^c (twice on windows). Every time you add an npm dependency, bower dependency, a new page or a staticresource, you'll need to restart the service.

To start the service in ci mode, which will create a bundled test page and uglify and minify everything (!slow!), type 'npm run start-ci'.

And finally to build everything and run tests on all the specified browsers (specified in testem.json) type 'npm run build'.

## projet structure

###.gitignore
Contains all the files and directories that can/should be ignored. When using svn ignore them also.

###.jshint
Contains the configuration for jshint - the tool that checks your javascript for errors and performance degraders.

###bower.json
Contains your bower project definition, including bower dependencies. When typing 'bower install', dependencies will be resolved using this file. To install new bower dependencies like say jquery, type 'bower install --save jquery' the --save option will tell bower to add an entry in the depenency list in 'bower.json'.

###Brocfile.js
This is the build script for broccoli. Alter it to alter your build.

###package.json
Contains your node package manager project definition, including dependencies. When typing 'npm install', dependencies will be resolved using this file. To install new npm dependencies like say jquery, type 'npm install --save jquery' the --save option will tell npm to add an entry in the depenency list in 'package.json'.

###sfConnection.cache
Contains the cached information for the salesforce deployment plugin.

###sfCredentials.json
Add your salesforce connection credentials in this file in the strict json format:

```
{
  "username": "user@fakedomain.com",
  "password": "password123",
  "securityToken": "sdfsdlksfo83p02ks"
}
```

###testem.json
Contains the configuration for testem, used bu the ci build. The interesting bit is "launch_in_ci", where you can specify the browsers you want ci to test with. You need the browsers to be installed in the environment and testem should then be able to find the browser executable by the default installation directory.

###bower_components
Contains your bower dependencies and is managed by bower.

###browserified_modules
The build is optimised by browserifying node modules only once into this directory. When browserifying, the dependencies list is used from 'package.json' to decide which modules should be browserified.

###buildTools
Contains modules referenced by Brocfile.js. Alter these to alter your build.

###.resource directories
This is the core of your development every page/staticresource is represented by a **.resource** folder. Use the 'newPage' and 'newResource' scripts in 'package.json' to create valid page/staticresource structures. The reason for using **.resource** directories is that it is compatible with MavensMate resource bundles. 

###aura
Contains your aura components and apps.

###dist
This is the distribution directory produced by running the 'build' script in package.json. Look at it to see the results of your build. The build will automatically deploy the staticresources, pages, aura components and apps to the org that you have given credentials for.

###node_modules
Contains your node dependencies and is managed by npm.

###scripts
Contains the scripts referenced in the 'scripts' list in 'package.json'

###shared
Contains the shared files utilised by the build tool to build each page and staticresource.

###templates
Contains the template directory structures to setup new page and static resource structures. Modify these to modify the results of the 'newPage' and 'newResource' scripts.


**Please feel free to drop a line if you would like to contribute**