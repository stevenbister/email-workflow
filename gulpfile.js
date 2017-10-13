var gulp  = require('gulp'),
    sass = require('gulp-sass'),
    replace = require('gulp-replace'),
    replaceQuotes = require('gulp-replace-quotes'),
    imagemin = require('gulp-imagemin'),
    uncss = require('gulp-uncss'),
    sequence = require('gulp-sequence'),
    fs = require('fs'),
    browserSync = require('browser-sync').create(),
    del = require('del'),
    panini = require('panini'),
    siphon = require('siphon-media-query');

//compile pages, layouts and partials
gulp.task('pages', function() {
  gulp.src('app/pages/**/*.html')
  .pipe(panini({
    root: 'app/pages/',
    layouts: 'app/layouts/',
    partials: 'app/partials/',
    helpers: 'app/helpers/'
  }))
  .pipe(gulp.dest('build'))
  .on('finish', browserSync.reload);
});
//refresh the pages to recomiple layouts etc. this needs to happen as the pages task will not refresh on it's own
gulp.task('pages:reset', function(done) {
  panini.refresh();
  gulp.run('pages');
  done();
});

//compile sass
gulp.task('sass', function() {
  return gulp.src('app/assets/sass/**/*.scss')
  .pipe(sourcemaps.init())
  .pipe(sass().on('error', sass.logError))
  .pipe(gulp.dest('build/css'));
});
gulp.task('sass:watch', function() {
  gulp.watch('app/assets/sass/**/*.scss', ['sass']);
});

//watch files and launch browser-sync
gulp.task('watch', ['sass:watch', 'pages'], function() {
  var files = [
      'app/**/*.html',
      'app/assets/img/**/*.{png,jpg,gif,svg,webp}',
      'build/css/**/*.css'
  ];

  browserSync.init(files, {
    notify: false,
    server: {
      baseDir: "build"
    }
  });
  //watch panini files and refresh on save
  gulp.watch(['app/{root,layouts,partials,helpers}/**/*'], ['pages:reset']);
});

//delete the dist folder so we're starting fresh
gulp.task('deleteDistFolder', function() {
  return del('dist');
});

//compress images
gulp.task('compressImages', function() {
  gulp.src('app/assets/img/**/*')
  .pipe(imagemin({
    verbose: true
  }))
  .pipe(gulp.dest('dist/img'))
});

//remove unused css selectors and replace double quotes with single quotes
gulp.task('tidycss', function() {
  return gulp.src('build/css/main.css')
  .pipe(uncss({
    html: ['build/**/*.html'],
    //list selectors for unused css to ignore e.g. client specific selectors
    ignore: [
      '#outlook a',
      '.ExternalClass',
      '.ExternalClass p',
      '.ExternalClass span',
      '.ExternalClass font',
      '.ExternalClass td',
      '.ExternalClass div',
      '#backgroundTable',
      '.image_fix'
    ]
  }))
  .pipe(replaceQuotes({
    quote: 'single'
  }))
  .pipe(gulp.dest('build/css'));
});

//insert css remove link to external sheet & embed media queries
gulp.task('insert', function() {
  //set stylesheets to stings and siphon out media queries
  var css = fs.readFileSync('build/css/main.css').toString(),
      mediaQuery = siphon(css);

  return gulp.src('build/**/*.html')
  .pipe(replace('<!-- <style> -->', '<style amf:inline>' + css + '</style>'))
  .pipe(replace('<!-- <media queries> -->', '<style>' + mediaQuery + '</style>'))
  .pipe(replace('<link rel="stylesheet" type="text/css" href="css/main.css">', ''))
  .pipe(gulp.dest('dist'));
});

//compile
gulp.task('compile', sequence('deleteDistFolder', ['compressImages', 'tidycss'], 'insert'));
