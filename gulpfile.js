// Packages
// Gulp packages are loaded through gulp-load-plugins
const { src, dest, watch, series, parallel } = require('gulp')
const browserSync = require('browser-sync')
const fs = require('fs')
const del = require('del')
const panini = require('panini')
const siphon = require('siphon-media-query')
const gulpLoadPlugins = require('gulp-load-plugins')
const PLUGIN = gulpLoadPlugins({
  rename: {
    'gulp-replace-quotes': 'replaceQuotes'
  }
})

// Project app folders
// All edits are made here
const APP = {
  root: 'app/',
  html: 'app/**/*.html',
  pages: 'app/pages/**/*.html',
  styles: 'app/assets/sass/**/*.scss',
  img: 'app/assets/images/**/*'
}

// Project build folders
// Edits made in app folder are built here for viewing
const BUILD = {
  root: 'build/',
  html: 'build/**/*.html',
  styles: 'build/css/',
  img: 'build/images/'
}

// Compile pages, layouts and partials into one file
function pages () {
  return src(APP.pages)
    .pipe(panini({
      root: 'app/pages/',
      layouts: 'app/layouts/',
      partials: 'app/partials/',
      helpers:  'app/helpers/'
    }))
    .pipe(dest(BUILD.root))
    .on('finish', browserSync.reload)
}
exports.pages = pages

// Refresh pages to rebuild layouts etc. this needs to happen as the pages task will not refresh on it's own
function pagesRefresh (done) {
  panini.refresh()
  done()
}
exports.pagesRefresh = pagesRefresh

// Compile scss
function styles () {
  return src(APP.styles)
    .pipe(PLUGIN.sourcemaps.init())
    .pipe(PLUGIN.sass().on('error', PLUGIN.sass.logError))
    .pipe(PLUGIN.sourcemaps.write('./'))
    .pipe(dest(BUILD.styles))
}
exports.styles = styles

// Copy images into the build folder
function copyImages () {
  return src(APP.img)
    .pipe(dest(BUILD.img))
}
exports.copyImages = copyImages

// Compress images
function compressImages () {
  return src(BUILD.img + '**/*')
    .pipe(PLUGIN.imagemin({
      verbose: true
    }))
    .pipe(dest('dist/images'))
}
exports.compressImages = compressImages

// Browsersync
function browsersync () {
  // Watch these files
  let files = [
    BUILD.styles + '**/*.css'
  ]

  browserSync.init(files, {
    server: {
      baseDir: BUILD.root
    }
  })

  watch(APP.img, parallel(copyImages))
  watch(APP.styles, parallel(styles))
  watch(APP.html, parallel(pages))
  // Watch panini files and refresh on save
  watch(['app/{root,layouts,pages,partials}/**/*'], series(pagesRefresh))
}
exports.browsersync = browsersync

// Delete dist folder so we're starting fresh
function deleteDistFolder (cb) {
  return del('dist', cb)
}
exports.deleteDistFolder = deleteDistFolder

// Remove unused css selectors and replace double quotes with single quotes
function tidycss () {
  return src(BUILD.styles + 'main.css')
    .pipe(PLUGIN.uncss({
      html: [BUILD.html],
      // List selectors for unused css to ignore e.g. client specific selectors
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
    .pipe(PLUGIN.replaceQuotes({
      quote: 'single'
    }))
    .pipe(dest(BUILD.styles))
}
exports.tidycss = tidycss

// Embed css into file, remove link to external stylesheet and embed media queries
function insert () {
  // Set styleshees as strings and siphon media queries
  let css = fs.readFileSync(BUILD.styles + 'main.css').toString()
  let mediaQuery = siphon(css)

  return src(BUILD.html)
    .pipe(PLUGIN.replace('<!-- <style> -->', '<style amf:inline>' + css + '</style>'))
    .pipe(PLUGIN.replace('<!-- <media queries> -->', '<style>' + mediaQuery + '</style>'))
    .pipe(PLUGIN.replace('<link rel="stylesheet" type="text/css" href="css/main.css">', ''))
    .pipe(dest('dist'));
}
exports.insert = insert

// Build all files and assets into dist folder
exports.build = series(deleteDistFolder, compressImages, tidycss, insert)