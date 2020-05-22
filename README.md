# Workflow for creating email templates

Gulp based workflow inspired by [Foundation for Emails](https://foundation.zurb.com/emails.html), trimmed down a bit and using vanilla html.

## Getting started
`yarn install`

Then to get the dev server up and running simply run

`gulp browsersync`

Once you've finished developing run 

`gulp build` 

to create a compiled version of the email with all of the assets embedded. You'll be able to get the compiled html from the dist folder.

## How it works
The workflow is split into three directories; src, build and dist. Src holds all of the files you will be editing;
### Layouts

   Holds the layout files, if anything needs editing in the  `<head>` then this is where you can find it. These wrap around the pages files.

### Pages

   These are the different email templates, the filename here is what's reflected in build and dist when everything is compiled together.

### Partials

   The different parts of the emails, put things like buttons, headers or footers in here.

### Styles

   Contains all of the stylesheets, these are Postcss partial files and are all imported into style.css.


When the `gulp browsersync` command is run all of these files are compiled and served out of the build folder.

The dist folder is then created when `gulp build` is run. This folder will contain a version of the file in build but with the css embedded and the images compressed. 

This is the launch ready file, which can be copied and pasted out into the esp where the css inlining and image handling will happen.

