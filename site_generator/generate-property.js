'use strict';

let fs = require('fs');
let path = require('path');
let hydrolysis = require('hydrolysis');
let getConfig = require('./config').getConfig;
let baseDir;

function getPropertyType(type) {
  let translate = {
    array: 'list'
  };

  type = type.toLowerCase();

  return translate[type] || type;
}

function createPropertyFile(componentBaseDir) {
  let name = path.basename(componentBaseDir);
  let filePath = path.resolve(componentBaseDir, `${name}.html`);
  let hydroPromise = hydrolysis.Analyzer.analyze(filePath);

  return Promise.all([getConfig(), hydroPromise])
    .then(values => {
      let config = values.shift();
      let parsedElement = values.shift();
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

if (process.argv.length > 2) {
  baseDir = process.argv[2];

  createPropertyFile(baseDir)
    .then(obj => {
      let filePath = obj.filePath;
      let data = obj.data;

      data =  JSON.stringify(data, null, 4);

      fs.writeFileSync(filePath, data);
    })
    .catch(err => {
      console.log(err.stack || err);
    });
} else {
  console.log('Provide the base directory of a component');
}
