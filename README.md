# Elements Browser

Interactive documentation for polymer elements

# Deps

Following is the list of needed software for generating this site.

1. git >2.6.3 ([Git Download](http://git-scm.com/download))
2. bash >4.3 (Linux and Mac have bash by default, and on windows latest git installations come with bash)
3. node >4.1 ([Node Download](https://nodejs.org/en/))
4. npm (Npm is installed alongwith node)
5. bower (Run `npm install -g bower` in the command prompt)

# Steps To Generate The Site Locally

1. Clone the repo https://github.com/atomproject/elements.git locally
2. Navigate into the repo using bash prompt
3. Run command `bower install && npm install`
4. Run command `bower install config=https://gist.github.com/chigur/01e7ca737b62d47932a9.git`
5. Edit the file `bower_components/config/metadata.json` to include the components you need
6. Run command `site_generator/generate.sh`
6. Run any server in the directory `_site` (https://gist.github.com/willurd/5720255)

# Steps To Setup Travis Build & Deploy System

1. Fork the repo https://github.com/atomproject/elements.git
2. Fork the gist https://gist.github.com/chigur/6713c27d84d139ae57e6
3. Edit the forked gist
4. Login to travis & enable builds for the forked repo
5. Clone the repo locally
6. Navigate into the repo using bash prompt and run the command `./setup-travis.sh`
