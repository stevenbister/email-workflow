# Workflow for creating email templates

This workflow is inspired by [Foundation for Emails](http://foundation.zurb.com/emails) and powered by [gulp](https://gulpjs.com/).

Feel free to fork or contribute!

It utilises these features to make building easier:
- [Panini](http://github.com/zurb/panini) a simple flat file generator by Zurb based on [Handlebars](http://handlebarsjs.com/)
- [Sass](http://sass-lang.com/)
- [Image compression](https://www.npmjs.com/package/gulp-imagemin)
- [gulp-uncss](https://www.npmjs.com/package/gulp-uncss)
- [Browser-sync](https://browsersync.io/)
- [css embedding](https://www.npmjs.com/package/gulp-replace)
- [media query siphoning](https://github.com/zurb/siphon-media-query)

## How it works

The workflow is split into three directories; app, build and dist. App holds all of the files you will be editing; assets, helpers, layouts, partials etc. Do all of your work in here.

When the `gulp watch` command is run all of these files are compiled and served out of the build folder so you shouldn't really have to touch this one.

The dist folder is then created when `gulp compile` is run. This folder will contain a version of the file in build but with the css embedded and the images compressed.
**This is the launch ready file.**

## Gulp commands

### Main gulp commands

- `gulp watch` will run Panini, compile Sass and start Browser-sync ready for development.
**Run this to start developing**
- `gulp compile` will delete the dist folder, compress the images, tidy the css then embed the css & media queries ready for sending.
**Run this once you are ready to test/send**

### Other gulp commands

These commands are included in the main gulp commands but from time to time you might want to run them seperately.

- `gulp pages` will run Panini & compile the template parts
- `gulp sass:watch` will complile & watch the Sass files
- `gulp deleteDistFolder` deletes the dist folder
- `gulp compressImages` compresses the images and logs info on how much the file in compressed
- `gulp tidycss` removes any unused css selectors from build/main.css and replaces any double quotes with single quotes
- `gulp insert` insert css & embed media queries into the dist folder

## Emails

### Structure

Emails are structured using a table layout structure, with the classes;

- `wrapper` a full width table that wraps around the main body of the email

`<table cellpadding="0" cellspacing="0" border="0" width="100%" class="wrapper">
  <tr>
    <td align="center">
      content
    </td>
  </tr>
</table>`

- `container` placed within that and given a set width (e.g. 600px)

`<table cellpadding="0" cellspacing="0" border="0" width="600" class="container">
  <tbody>
    <tr>
      <td align="center">All the rows go here</td>
    </tr>
  </tbody>
</table>`

- `row` placed within the container table with a width of 100%

`<table cellpadding="0" cellspacing="0" border="0" width="100%" class="row">
  <tbody>
    <tr>
      <td align="center">Columns go here</td>
    </tr>
  </tbody>
</table>`

- `column` placed within the row table, if you want to use more than one column set a width here and make sure to add `<!--[if mso]></td><td><![end if]-->` after the closing table tag to stop Outlook adding extra spacing between your columns.

`<table cellpadding="0" cellspacing="0" border="0" width="300" class="column">
  <tbody>
    <tr>
      <td align="center">Column content goes in here</td>
    </tr>
  </tbody>
</table>`

### Components

- `button` a table based button - works for most email clients **needs to be revised for Outlook.com - currently stripping the padding from the `a` tag**

`<table align="center" class="button">
    <tr>
        <td align="center">
            <a href="#" target="_blank" linklabel="">Click here</a>
        </td>
    </tr>
</table>`

- `spacer` a table based spacer to use rather than margin or padding as outlook can cause some interesting results. This is currently the most consistent way of adding spaces between elements. Just adjust the `font-size` to the height you want the space to be.

`<table align="center">
    <tr>
        <td style="font-size: 10px; line-height: 100%;">&nbsp;</td>
    </tr>
</table>`

- `menu` a nested horizontal menu

`<table cellpadding="0" cellspacing="0" border="0" class="menu">
  <tr>
    <td>
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td class="menu-item"><a href="#">Item</a></td>
          <td class="menu-item"><a href="#">Item</a></td>
          <td class="menu-item"><a href="#">Item</a></td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
