'use strict';
 
var gulp    = require( 'gulp' ),
    gutil   = require( 'gulp-util' ),
    fork    = require( 'child_process' ).fork,
    tinyLr  = require( 'tiny-lr' ),
    async   = require( 'async' );
 
var dirs = {
    app: [
        'views/*.ejs',
        'app/controllers/*.js',
        // 'models/{,*/}*.js',
        // 'libs/{,*/}*.js',
        'app.js',
    ],
    public: [
        'public/*.js',
        'public/*.css'
        
    ]
};
 
var livereload = {
    instance: null,
 
    port: 35729,
 
    start: function( callback ) {
        livereload.instance = tinyLr();
 
        livereload.instance.listen( livereload.port, callback );
    },
 
    changed: function( event, callback ) {
        var filepath = event.path;
 
        livereload.instance.changed({
            body: {
                files: [ filepath ]
            }
        });
        if( callback ) callback();
    }
};
 
var app = {
    instance: {},
 
    path: 'app.js',
 
    env: { NODE_ENV: 'development', port: 5000 },
 
    start: function( callback ) {
        process.execArgv.push( '--harmony' );
 
        app.instance = fork( app.path, { silent: true, env: app.env } );
        app.instance.stdout.pipe( process.stdout );
        app.instance.stderr.pipe( process.stderr );
 
        gutil.log( gutil.colors.cyan( 'Starting' ), 'express server ( PID:', app.instance.pid, ')' );
 
        if( callback ) callback();
    },
 
    stop: function( callback ) {
        if( app.instance.connected ) {
            app.instance.on( 'exit', function() {
                gutil.log( gutil.colors.red( 'Stopping' ), 'express server ( PID:', app.instance.pid, ')' );
                if( callback ) callback();
            });
            return app.instance.kill( 'SIGINT' );
        }
        if( callback ) callback();
    },
 
    restart: function( event ) {
        async.series([
            app.stop,
            app.start,
            function( callback ) {
                livereload.changed( event, callback );
            }
        ]);
    }
};
 
 
gulp.task( 'server', function( callback ) {
    async.series([
        app.start,
        livereload.start
    ], callback );
});
 
 
gulp.task( 'watch', function() {
    gulp.watch( dirs.app, app.restart );
    gulp.watch( dirs.public, livereload.changed );
});
 
 
gulp.task( 'default', [ 'server', 'watch' ] );
// var gulp = require('gulp');
// 	// nodemon = require('gulp-nodemon');
// //var gulp = require('gulp');
// // var server = require('gulp-express');
// var spawn = require('child_process').spawn;


// // function startExpress() {
 
// // //  var express = require('express');
// // //  var app = express();
// // //  app.use(express.static(__dirname));
// // //  app.listen(4000);
// //  server.run(['app.js']);
// // }

// // function swallowError (error) {

// //     //If you want details of the error in the console
// //     console.log(error.toString());

// //     // this.emit('end');
// // }


// gulp.task('handleerrors', function(){
// 	var exec = require('child_process').exec;
// 	var spawn = require('child_process').spawn;

// 	// var proc2 = spawn('node', ['app'],  { 
// 	// 	stdio: 'inherit'
// 	// });
// // server.run(['app.js']); 
// 	 // var proc = exec('node app', function(error, stdout, stderr) {
// 	 //    console.log('stdout: ' + stdout);
// 	 //    console.log('stderr: ' + error);
// 	 //    if (error || stderr){
// 	 //    	console.log("Error found");
// 	 //        // proc = exec('gulp server');
// 	 //        // process.exit();
// 	 //        // proc.kill();	   

// 	 //    }
// 	 //    // if (error !== null) {

// 	 //    //     console.log('exec error: ' + error);
// 	 //    //     // proc = exec('gulp server');
// 	 //    //     // process.exit();
// 	 //    // }
// 		// }
// 	 // );

// 	// proc.on("error", function(data){
// 	// 	console.log("Yo");
// 	// })

// 	// proc.stdout.on('data', function (data) {
// 	//   console.log('stdout: ' + data);
// 	// });

// 	// proc.stderr.on('data', function (data) {
// 	//   console.log('stderr: ' + data);
// 	// });

// 	// proc.on('close', function (code) {
// 	//   console.log('child process exited with code ' + code);
// 	// });

// 	// proc.on('Error', function( err ){ 
// 	// 	proc.kill('SIGINT'); 
// 	// })

// 	// process.on('uncaughtException', function(err) {
// 	//   console.log(err);
// 	//   proc.kill('SIGINT');
// 	// });

// 	// proc.stderr.on('data', function (data) {
// 	// 	proc.kill('SIGINT');
// 	//   //console.log('stderr: ' + data);
// 	// });
// 	// proc.stdout.on('error', function (data) {
// 	//   // console.log('stdout: ' + data);
// 	//   proc.kill('SIGINT');
// 	// });
// 	// {

// 	// if (err){ //return cb(err); // return error
// 	//     //cb(); // finished task
// 	// 	// ex('gulp server', swallowError);
// 	// 	console.log("ERRRRRRRRRRRR! : "+err);
// 	// 	//server.notify()
// 	// 	// spawn('gulp', ['server'], {stdio: 'inherit'});
// 	// 	// var exo = require('child_process').exec;
// 	// 	console.log("ERR0000000000000000000000000000000000000000000000");
// 	// 	// exo('gulp server', function(err2){
// 	// 	// 	console.log("ERR : "+err2)
// 	// 	// 	console.log('Exit');
// 	// 	// 		//process.exit();
// 	// 	// 	//process.exit();
// 	// 	// 	console.log('Exiting')
// 	// 	// });
// 	// 	console.log('Exit');

// 	// 	// proc.kill('SIGINT');
// 	// 	// proc.exit();
// 	// 		//process.exit();
// 	// 	// process.exit();
// 	// 	console.log('Exiting')
// 	// 	}
// 	// });
//   return gulp.src('app/controllers/*.js')
//      .on('error', function(err){ 
//      	console.log("ERRROR -2 ");

//   //    	var exec = require('child_process').spawn;
// 		// var proc = exec('node',['app'], { 
// 		// 	stdio: 'inherit'
// 		// });
//      	proc.kill('SIGINT');
//      	// console.log(err.message); 
//      	// this.emit('end');
//      })
//     // .pipe(minifyCSS())
//     // .pipe(gulp.dest('./dist'));
// });

// var ex = require('child_process').exec;
// gulp.task('server', function() {
//   	// place code for your default task here
// 	//	server.run(['app.js'])




// 	var exec = require('child_process').exec;
// 	exec('node app', function(err) {
// 		console.log("ERRRRRRRRRRRR! : "+err);
// 	});
//  //    		if (err){ //return cb(err); // return error
// 	// 	    //cb(); // finished task
// 	// 	ex('gulp server', swallowError);
// 	// 	console.log("ERRRRRRRRRRRR! : "+err);
// 	// 	//server.notify()
// 	// 	//spawn('gulp', ['server'], {stdio: 'inherit'});
// 	// 	var exo = require('child_process').exec;
// 	// 	exo('gulp server', function(err){console.log(err)});
// 	// 	console.log('Exit');
//  //  		process.exit();
// 	// 	//process.exit();
// 	// 	console.log('Exiting')
// 	// 	}
// 	//   });

// // server.run(['app.js']); 


// 	//.on('error', swallowError);
// 	gulp.watch(['app.js', 'app/**/*.js', 'app/controllers/*.js'], ['handleerrors'])
// 	// .on('error', swallowError);
// });



// gulp.task('develop', function () {
//   nodemon({ script: 'app.js'
//           , ext: 'html js'
//           , ignore: ['ignored.js']
//           //, tasks: ['lint'] 
// 	})
//     .on('restart', function () {
//       console.log('restarted!')
//     })
// })


// gulp.task('start', function(){
//   nodemon({
//     script: 'bin/www'
//   , ext: 'js'
//  // , env: { 'NODE_ENV': 'development' }
//   }).on ('error', function(err){
// 	console.log(err);
// 	})
// })
