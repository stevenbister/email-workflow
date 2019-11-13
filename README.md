# Workflow for creating email templates

Gulp based workflow inspired by [Foundation for Emails](https://foundation.zurb.com/emails.html) but trimmed down to only what I need.

## How it works
The workflow is split into three directories; src, build and dist. Src holds all of the files you will be editing;
* __Layouts__

   Holds the layout files, if anything needs editing in the  `<head>` then this is where you can find it. These wrap around the pages files.

* __Pages__

   These are the different email templates, the filename here is what's reflected in build and dist when everything is compiled together.

* __Partials__

   The different parts of the emails, put things like buttons, headers or footers in here.

* __Styles__

   Contains all of the stylesheets, these are Postcss partial files and are all imported into style.css.


When the `gulp browsersync` command is run all of these files are compiled and served out of the build folder.

The dist folder is then created when `gulp build` is run. This folder will contain a version of the file in build but with the css embedded and the images compressed. This is the launch ready file, which can be copied and pasted out into the esp where the css inlining and image handling will happen.

## Gulp commands
* `gulp browsersync` Run this to start developing

* `gulp build` Run this to create a compiled version of the email with all of the assets embedded.