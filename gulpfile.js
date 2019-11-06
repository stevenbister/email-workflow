/**
 * Packages
 * --------
 */

// Gulp packages
const { src, dest, watch, series, parallel } = require('gulp')
const purgecss = require('gulp-purgecss')
const replace = require('gulp-replace')
const sourcemaps = require('gulp-sourcemaps')

// Zurb packages
const panini = require('panini')
const siphon = require('siphon-media-query')

// Postcss packages
const postcss = require('gulp-postcss')
const postcssImport = require('postcss-import')
const postcssMixins = require('postcss-mixins')
const postcssNested = require('postcss-nested')
const postcssVars = require('postcss-simple-vars')

// Other
const browserSync = require('browser-sync').create()
const fs = require('fs')
const del = require('del')

// TODO: This is becoming a large file - break into individual files and import back here

/**
 * Compile pages, layouts and partials
 * -----------------------------------
 */
function compilepages () {
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
exports.compilepages = compilepages

// Refresh pages to rebuild layouts etc. this needs to happen as the pages task will not refresh on it's own
function refreshpanini (done) {
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
  // Return the main css stylesheet
  return src('src/styles/style.css')
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
  browserSync.init({
    server: {
      baseDir: 'build/'
    }
  })

  // Watch html files in pages dir and run compilepages func parallel
  watch('src/**/*.html', parallel(compilepages))
  watch('src/styles/**/*.css', parallel(styles))
  // Watch panini files and refresh on save
  watch(['src/{root,layout,pages,partials}/**/*'], series(refreshpanini))
}
exports.browsersync = browsersync

/**
 * Embed css into file, remove link to external stylesheet and embed media queries
 * -------------------------------------------------------------------------------
 */
async function embedcss () {
  // Read the stylesheet in build dir and convert it to a string
  const css = fs.readFileSync('build/styles/style.css').toString('utf8')
  // Pull the media queries out of the file and store here
  const mediaQuery = siphon(css)
  await Promise.resolve()

  return src('build/**/*.html')
    // Embed the css over the style & media query comments found in the layout files
    .pipe(replace('<!-- <style> -->', `<style amf:inline>${css}</style>`)) // The amf:inline tag is so Adestra will inline the css for me
    .pipe(replace('<!-- <media queries> -->', `<style>${mediaQuery}</style>`))
    // Remove linked stylesheet and reference to css map
    .pipe(replace('<link rel="stylesheet" type="text/css" href="css/main.css">', ''))
    .pipe(replace('/*# sourceMappingURL=style.css.map */', ''))
    // Push to dist folder
    .pipe(dest('dist/'))
}

/**
 * Delete dist folder so we can start fresh build
 * ----------------------------------------------
 */
function deletedist () {
  return del('dist')
}

exports.build = series(deletedist, embedcss)