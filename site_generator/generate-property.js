'use strict';

let fs = require('q-io/fs');
let path = require('path');
let hydrolysis = require('hydrolysis');
let getConfig = require('./config').getConfig;
let Q = require('q');

function getPropertyType(type) {
  let translate = {
    array: 'list'
  };

  type = type.toLowerCase();

  return translate[type] || type;
}

function createPropertyFile(componentBaseDir, config) {
  let name = path.basename(componentBaseDir);
  let filePath = path.resolve(componentBaseDir, `${name}.html`);
  let hydroPromise = hydrolysis.Analyzer.analyze(filePath);

  return hydroPromise
    .then(parsedElement => {
      let data = {
        name: '',
        properties: [{
          name: 'Properties',
          fields: {}
        }]
      };

      let fields = data.properties[0].fields;
      let element = config.elements.find(el => el.name === name);
      data.name = element.displayName || name;
      let filePath = element.propertyFile;
      element = parsedElement.elementsByTagName[name];

      if (!element) {
        throw new Error(`${name}.html doesn't contain any element with name ${name}`);
      }

      element.properties.forEach(prop => {
        let type = getPropertyType(prop.type);

        if (type === 'function' || prop.private) {
          return;
        }

        //property name
        let propObj = fields[prop.name] = {};

        //display name
        propObj.name = prop.name;
        propObj.type = type;
        propObj.value = prop.default;
      });

      return {
        filePath: filePath,
        data: data
      };
    });
}

Q.spawn(function* () {
  let config = yield getConfig();
  let paths = config.elements
    .map(el => {
      let dir = `_site/${el.pageDirName}/bower_components/${el.name}`;

      return {
        baseDir: dir,
        propertyFile: `${dir}/property.json`
      };
    });

  yield Promise.all(paths.map(Q.async(function* (p) {
    let exists = yield fs.exists(p.propertyFile);

    if (!exists) {
      let property = yield createPropertyFile(p.baseDir, config);
      let filePath = property.filePath;
      let data = property.data;

      data =  JSON.stringify(data, null, 4);
      yield fs.write(filePath, data);
    }
  })));
});
