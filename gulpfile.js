// Packages
const { src, dest, watch, series, parallel } = require('gulp')
const purgecss = require('gulp-purgecss')
const browserSync = require('browser-sync').create()
const panini = require('panini')
const sourcemaps = require('gulp-sourcemaps')
const postcss = require('gulp-postcss')
const postcssImport = require('postcss-import')
const postcssMixins = require('postcss-mixins')
const postcssNested = require('postcss-nested')
const postcssVars = require('postcss-simple-vars')

// TODO: create production ready function
// TODO: This is becoming a large file - break into individual files and import back here

/**
 * Compile pages, layouts and partials
 * -----------------------------------
 */
function compilePages () {
  // Return all html files in pages dir/sub dir
  return src('src/pages/**/*.html')
    // Pass dirs through panini to compile
    .pipe(panini({
      root: 'src/pages/',
      layouts: 'src/layouts/',
      /**
       * https://github.com/foundation/panini#pagelayouts
       * All pages within src/pages/[foldername] will use the equlivalent layout e.g.
       * Uncomment the lines below to use
       */
      // pageLayouts: {
      //   'newsletter': 'newsletter'
      // },
      partials: 'src/partials/'
    }))
    // Push compiled files into the build dir
    .pipe(dest('build/'))
    .on('finish', browserSync.reload)
}
exports.compilePages = compilePages

// Refresh pages to rebuild layouts etc. this needs to happen as the pages task will not refresh on it's own
function refreshPanini (done) {
  panini.refresh()
  done()
}

/**
 * Compile, tidy & insert css files
 * --------------------------------
 */
function styles () {
  // Add plugins to array to be called in the postcss func
  const plugins = [
    postcssImport,
    postcssMixins,
    postcssNested,
    postcssVars
  ]
  // Return css, pcss or postcss files
  return src('src/styles/**/*.css')
    // Init sourcemap 
    .pipe(sourcemaps.init())
    // Run postcss & plugins
    .pipe(postcss(plugins))
    // Let's purge any unused css from the build stylesheet
    .pipe(purgecss({
      // Watch any html pages within the src dir
      content: ['src/**/*.html'],
      // Whitelist classes here - useful for client or esp specific classes
      // More info: https://www.purgecss.com/whitelisting
      whitelist: []
    }))
    // Write sourcemap
    .pipe(sourcemaps.write('./'))
    // Push files to the build dir
    .pipe(dest('build/styles/'))
    .pipe(browserSync.stream())
}
exports.styles = styles

/**
 * Browser-sync
 * https://www.browsersync.io/
 * ---------------------------
 */
function browsersync () {
  // Init browsersync and serve files from build dir
  // TODO: add files to watch
  browserSync.init({
    server: {
      baseDir: 'build/'
    }
  })

  // Watch html files in pages dir and run compilePages func parallel
  watch('src/pages/**/*.html', parallel(compilePages))
  watch('src/styles/**/*.css', parallel(styles))
  // Watch panini files and refresh on save
  watch(['src/{root,layout,pages,partials}/**/*'], series(refreshPanini))
}
exports.browsersync = browsersync