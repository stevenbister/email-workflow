var gulp  = require('gulp'),
    rename = require('gulp-rename'),
    inline = require('gulp-inline-css'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    inlineCss = require('gulp-inline-css'),
    replace = require('gulp-replace'),
    imagemin = require('gulp-imagemin'),
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
  //.pipe(sourcemaps.write('./css/maps'))
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
  gulp.watch(['app/{layouts,partials,helpers}/**/*'], ['pages:reset']);
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

//inline css remove link to external sheet & embed media queries
gulp.task('inline', function() {
  var css = fs.readFileSync('build/css/main.css').toString(),
      mediaQuery = siphon(css);

  return gulp.src('build/**/*.html')
  .pipe(inlineCss({
    applyStyleTags: false,
    removeStyleTags: true,
    preserveMediaQueries: true,
    removeLinkTags: false
  }))
  .pipe(replace('<!-- <media queries> -->', '<style>' + mediaQuery + '</style>'))
  .pipe(replace('<link rel="stylesheet" type="text/css" href="css/main.css">', ''))
  .pipe(gulp.dest('dist'));
});

//compile
gulp.task('compile', ['deleteDistFolder', 'compressImages', 'inline']);
