
const fs = require('fs');

//Sets the given name and value in global.js as an exportable module
async function setGlobal(name, value){
  const data = `module.exports.${name} = '${value}';\n`;

  return new Promise((resolve, reject) => {
    fs.appendFile('global.js', data, (err) => {
      if (err){
        reject(err);
      } else {
        resolve(data);
      }
    });
  })
}
module.exports.setGlobal = setGlobal;