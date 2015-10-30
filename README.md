# Elements Browser

This is an elements browser which currently supports browsing the [elements](https://github.com/atomelements/).

# Contributing

This site is built using a slew of awesome technologies which you'll have to install to
make changes to this project.

## Dependencies

### Jekyll

Jekyll is a static site generator, it is based on ruby and there is an excellent [guide](http://jekyll-windows.juthilo.com/)
for installing jekyll. Also, have look at windows installation [doc](http://jekyllrb.com/docs/windows/#installation), make sure that you read the `BOM` related part of it carefully.
Note that we don't use syntax highlighting features of jekyll so you can skip parts
about installing syntax highlighters like `Pygments` and `Rogue`.

### Node and Npm

Node and Npm though not used directly are dependencies of Bower and Gulp, so they need to
be installed. [Install nodjs](https://nodejs.org/en/), the installation process also installs
npm.

### Bower

Run following command in your terminal to install Bower

```
npm install -g bower
```

### Gulp

Run following command in your terminal to install Gulp

```
npm install -g gulp
```

### Install node and bower packages

Run following command in your terminal to install the node and bower packages

```
npm install && bower install
```

## Running

Okay, now that you have all the dependencies installed you can serve the site locally.

```
gulp serve
```

## Making changes to code

### Adding an element

It is important that you follow directory and file naming conventions mentioned in following
steps. Each new element to be added has a certain metadata associated with it, this is
added in the front matter of the file created for the element.

```
---
component_name: [name of the component]
component_category: [category of the element, it has to be one of those listed in _data/categories.json]
component_icon: [icon of the component]
component_display_name: [the name used in menu, url(slugified) and page header]
permalink: [url of the component page, it is of form '/[slugified component_display_name]']
---
```

1. Create a new folder in the elements directory with slugified display name
2. Make a new html file in this new directory with same name as directory
3. Add front matter to the file, this file cannot contain any content
4. Import the file in `footer.html`, all imports are in footer for simplifying vulcanization
5. Add the `demo-snippet.html` file, this will contain the markup to show the demo of element
