var fs = require('fs');
var path = require('path');
var hydrolysis = require('hydrolysis');
var getConfig = require('./config');
var baseDir;

function getPropertyType(type) {
  var translate = {
    array: 'list'
  };

  type = type.toLowerCase();

  return translate[type] || type;
}

function createPropertyFile(componentBaseDir) {
  var name = path.basename(componentBaseDir);
  var filePath = path.resolve(componentBaseDir, `${name}.html`);
  var hydroPromise = hydrolysis.Analyzer.analyze(filePath);

  return Promise.all([getConfig(), hydroPromise])
    .then(values => {
      var element, filePath, fields;
      var config = values.shift();
      var parsedElement = values.shift();
      var data = {
        name: '',
        properties: [{
          name: 'Properties',
          fields: {}
        }]
      };

      fields = data.properties[0].fields;
      element = config.elements.find(el => el.name === name);
      data.name = element.displayName || name;
      filePath = element.propertyFile;
      element = parsedElement.elementsByTagName[name];

      if (!element) {
        throw new Error(`${name}.html doesn't contain any element with name ${name}`);
      }

      element.properties.forEach(prop => {
        var propObj, type = getPropertyType(prop.type);

        if (type === 'function' || prop.private) {
          return;
        }

        //property name
        propObj = fields[prop.name] = {};

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
      var filePath = obj.filePath;
      var data = obj.data;

      data =  JSON.stringify(data, null, 4);

      fs.writeFileSync(filePath, data);
    })
    .catch(err => {
      console.log(err.stack || err);
    });
} else {
  console.log('Provide the base directory of a component');
}
