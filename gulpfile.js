// Packages
// Gulp packages are loaded through gulp-load-plugins
const { src, dest, watch, series, parallel } = require('gulp')
const browserSync = require('browser-sync')
const panini = require('panini')


// Compile pages, layouts and partials into one file
function compilePages () {
  // Return all html files in pages dir/sub dir
  return src('src/pages/**/*.html')
    // Pass dirs through panini to compile
    .pipe(panini({
      root: 'src/pages/',
      layouts: 'src/layouts/',
      pageLayouts: {
        // https://github.com/foundation/panini#pagelayouts
        // All pages within src/pages/[foldername] will use the equlivalent layout e.g.
        // 'newsletter': 'newsletter'
      },
      partials: 'src/partials/'
    }))
    // Push compiled files into the build dir
    .pipe(dest('build/'))
}
exports.compilePages = compilePages