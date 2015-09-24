import concat from 'gulp-concat';
import del from 'del';
import * as fs from 'fs';
import gulp from 'gulp';
import less from 'gulp-less';
import sourcemaps from 'gulp-sourcemaps';
import merge from 'merge-stream';
import minifyCSS from 'gulp-minify-css';
import * as path from 'path';
import rename from 'gulp-rename';
import tsc from 'gulp-tsc';
import uglify from 'gulp-uglify';
import ignore from 'gulp-ignore';
import typedoc from 'gulp-typedoc';
import mocha from 'gulp-mocha';

/**
 * Load configuration files
 */

import libProject from './src/VectorScreencast/tsconfig.json'; // source maps are irrelevant for the release version
import workersProject from './src/AudioRecordingWorkers/tsconfig.json';
import testsProject from './test/src/tsconfig.json';
import audioServerProject from './src/AudioServer/tsconfig.json';

/**
 * Remove all files generated by gulp in all default tasks
 */

gulp.task("clean-release", () => {
	del([ 
		"./release/**/*", // everything in the release directory should be deleted
	]);	
});

gulp.task("clean-demo", () => {
	// the DEMO needs some cherry picking:		
	del([ 
		// themes
		"./demo/public/css/themes",
		// lib
		"./demo/public/js/libs/" + libProject.compilerOptions.out,
		"./demo/public/js/libs/" + libProject.compilerOptions.out + ".map",
		// compile-less		
		"./demo/public/js/workers/**/*",
		// audio-server
		"./demo/" + audioServerProject.compilerOptions.out,
		"./demo/" + audioServerProject.compilerOptions.out + ".map",		
	]);	
});

gulp.task("clean-doc", () => {
	del([
		"./docs/**/*", // delete everything in docs directory
	])
});

gulp.task("clean-tests", () => {
	del([
		"./test/build/**/*", // delete everything in docs directory
	])
});

gulp.task("clean", ["clean-release", "clean-demo", "clean-doc", "clean-tests"]);

/**
 * Gulp task for transpiling .LESS files into .CSS
 * For every subdirectory in ./public/themes, all it's *.less files are merged into one,
 * they are transpiled into a css, this css is minified and then saved into ./public/themes/<foldername>.min.css,
 * where <foldername> is the name of the theme's subdirectory.
 * This task is based on https://github.com/gulpjs/gulp/blob/master/docs/recipes/running-task-steps-per-folder.md
 */

function getFolders(dir) {
    return fs.readdirSync(dir)
		      .filter(function(file) {
		        return fs.statSync(path.join(dir, file)).isDirectory();
		      });
}

const themesPath = "./src/Themes"; 
gulp.task("themes", () => {
   const folders = getFolders(themesPath);
   const tasks = folders.map(function(folder) {
	  return gulp.src(path.join(themesPath, folder, "theme.less"))
  				.pipe(less())
				.pipe(minifyCSS())
        		.pipe(rename(folder + '.min.css'))				
				.pipe(gulp.dest("./release/themes"));				
   });

   return merge(tasks);
});

gulp.task("themes-demo", () => {
   const folders = getFolders(themesPath);
   const tasks = folders.map(function(folder) {
	  return gulp.src(path.join(themesPath, folder, "theme.less"))
  				.pipe(sourcemaps.init())
				.pipe(less())
  				.pipe(sourcemaps.write())
        		.pipe(rename(folder + '.min.css'))
				.pipe(gulp.dest("./demo/public/css/themes"));
   });

   return merge(tasks);	
});

/**
 * Compile the VectorScreencast JavaScript library
 * The source of VectorScreencast is written in TypeScript and must be transpiled to pure Javascript.
 */


//
// A) for release
//
 
gulp.task("vector-screencast-release", () => {
	return gulp.src("./src/VectorScreencast/VectorScreencast.ts")
			.pipe(tsc(libProject.compilerOptions))
			.pipe(ignore.exclude([ "**/*.map" ])) // do not uglify .map files
			.pipe(uglify({
				sequences: true,
				dead_code: true,
				conditionals: true,
				unused: true,
				join_consts: true,
				properties: true				
			}))
			.pipe(gulp.dest("./release/vector-screencast-lib"));
});

//
// B) for the demo
//

gulp.task("copy-source-for-sourcemaps", function () {
	return gulp.src("./src/VectorScreencast/**/*")
				.pipe(gulp.dest("./demo/public/js/src/VectorScreencast/"));
});

gulp.task("vector-screencast-demo", ["copy-source-for-sourcemaps"], () => {
	return gulp.src("./src/VectorScreencast/VectorScreencast.ts")
			.pipe(sourcemaps.init())
			.pipe(tsc(libProject.compilerOptions))
			.pipe(sourcemaps.write("./demo/public/js/libs"))
			.pipe(gulp.dest("./demo/public/js/libs"));
});


/**
 * Compile the VectorScreencast JavaScript library
 * The source of VectorScreencast is written in TypeScript and must be transpiled to pure Javascript.
 */

gulp.task("workers", () => {	
	return gulp.src("./src/AudioRecordingWorkers/**/*.ts")
						.pipe(tsc(workersProject.compilerOptions))
						.pipe(gulp.dest("./release/workers"));
});

gulp.task("workers-demo", () => {	
	return gulp.src("./src/AudioRecordingWorkers/**/*.ts")
						.pipe(tsc(workersProject.compilerOptions))
						.pipe(gulp.dest("./demo/public/js/workers"));
});

/**
 * Compile the Audio recording server
 * The Audio recording server is written in TypeScript and must be transpiled to pure JavaScript.
 */
gulp.task("audio-server", (cb) => {	
	return gulp.src("./src/AudioServer/**/*.ts")
					.pipe(tsc(audioServerProject.compilerOptions))
					.pipe(gulp.dest("./release/audio-server"));
});

gulp.task("audio-server-demo", (cb) => {	
	return gulp.src("./src/AudioServer/**/*.ts")
					.pipe(tsc(audioServerProject.compilerOptions))
					.pipe(gulp.dest("./demo/"));
});


/**
 * Compile tests
 */
gulp.task("build-tests", [ "clean-tests" ], (cb) => {
	return gulp.src("./test/src/**/*.ts")
				.pipe(tsc(testsProject.compilerOptions))
				.once("error", () => {}) // prevent from crashing, error message will be displayed by tsc 
				.pipe(gulp.dest("./test/build"));
});

gulp.task("build-tests:watch", [ "build-tests" ], () => {
	gulp.watch("./test/src/**/*.ts", [ "build-tests" ]);
});

gulp.task("test", () => {
	return gulp.src("./test/build/**/*.js")
				.pipe(mocha({
					reporter: 'dot'
				}));
});

gulp.task("test:watch", ["test"], () => {
	return gulp.watch("./test/build/**/*.js", [ "test" ]);
});

/**
 * Main tasks:
 */

gulp.task("demo", ["clean-demo", "audio-server-demo", "vector-screencast-demo", "themes-demo", "workers-demo"]);
gulp.task("release", ["clean-release", "audio-server", "vector-screencast-release", "themes", "workers"]);
gulp.task("doc", () => {
	return gulp.src("./src/VectorScreencast/**/*.ts")
					.pipe(typedoc({
						out: "./docs/",
						target: libProject.compilerOptions.target || 'ES5',
						module: libProject.compilerOptions.module || 'commonjs',
						mode: "file",
						name: "Vector Screencast",
						theme: "default"						
					}));
});

// default: compile both the JS library and the server
gulp.task("default", [ "test", "release", "demo", "doc" ]);
