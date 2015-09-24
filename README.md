Vector Screencast Project
=========================

For an online demo see [www.rozsival.com](http://www.rozsival.com).

Usage
-----

Install [Node.js](https://nodejs.org) first. Then download the library to your project using `npm i --save vector-screencast`.

```html
<div id="recorder"></div>
<div id="player"></div>
```

```es6
import { Recorder, Player } from 'vector-screencast';

// to attach the recorder to your page:
var recorder = new Recorder("recorder", {
	UploadURL: "/your/upload/script/url",
	Audio: {
		host: "yourdomain.com",
		port: 4000,
		path: "/your/audio/server/instance/path/at/your/domain"
	}
});

// to attach a player to your page:
var player = new Player("player", {
	Source: "path/to/the/recording.svg"
});
```

For more settings and details, see the demo and read the [API docs](http://rozsival.com/docs) please.


Building the project from source
--------------------------------

To build the project, install [Node.js](http://nodejs.org) first. Install *gulp* via `npm install -g gulp` command.
You might need to execute this command as super user. Then go to the root directory of the Vector Screencast Project
 and install all dependencies by running `npm install` command.
 
To build all components of the project, run the `gulp` command. To build only the library, run `gulp release`,
to build only demo components, run `gulp demo`. To generate API documentation from the source of the library,
run `gulp doc`. Documentation will be placed in the */doc* folder. To run unit tests, run `gulp test`.

If you want to develop 

If you have any trouble, feel free to contact me via email simon(at)rozsival.com

Roadmap
-------

Current version: ** 0.9.0 ** -- this version covers the basic behavior which was intended for the 

- v1.0.0: Create unit tests
- v1.1.0: Implement several new features - zooming, infinite canvas - move the canvas via draging, fullscreen
- v1.2.0: Replace the UI layer with React.js components and introduce hot module replacement
...
- v2.0.0: 

Bachelor thesis
---------------

The original project was inspired by the guys behind the czech branch of the Khan Academy.
The ideas and  of this project project is described in my [Bachelor thesis](./thesis/thesis.pdf') at the [Faculty of Mathematics and Physics](http://mff.cuni.cz) of the [Charles University in Prague](http://www.cuni.cz). 