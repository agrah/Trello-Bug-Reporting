
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

//Returns a Reformatted Bug with all the oldBug fields updated to the newBug fields
function reformatBug(oldBug, newBug){
  let formattedBug = oldBug;
  //find and trim the old bug properties then replace it with the new one
  if (newBug.name){
    const oldName = oldBug.name.slice(oldBug.name.lastIndexOf(']') + 1);
    formattedBug.name = formattedBug.name.replace(oldName, newBug.name);
  }
  if (newBug.context){
    const oldContext = oldBug.name.slice(0, oldBug.name.lastIndexOf(']') + 1);
    formattedBug.name = formattedBug.name.replace(oldContext, `[${newBug.context}]`);
  }
  if (newBug.summary){
    const oldSummary = oldBug.desc.slice(oldBug.desc.indexOf('###Summary:\n') + 12, oldBug.desc.indexOf('\n\n###Steps To Produce:'));
    formattedBug.desc = formattedBug.desc.replace(oldSummary, newBug.summary);
  }
  if (newBug.steps_to_produce){
    const oldSteps = oldBug.desc.slice(oldBug.desc.indexOf('###Steps To Produce:\n') + 21, oldBug.desc.indexOf('\n\n###Expected Result:'));
    formattedBug.desc = formattedBug.desc.replace(oldSteps, newBug.steps_to_produce);
  }
  if (newBug.expected_result){
    const oldExpected = oldBug.desc.slice(oldBug.desc.indexOf('###Expected Result:\n') + 20, oldBug.desc.indexOf('\n\n###Actual Result:'));
    formattedBug.desc = formattedBug.desc.replace(oldExpected, newBug.expected_result);
  }
  if (newBug.actual_result){
    if (oldBug.desc.indexOf('###Notes:\n') == -1){
      const oldActual = oldBug.desc.slice(oldBug.desc.indexOf('###Actual Result:\n') + 18);
      formattedBug.desc = formattedBug.desc.replace(oldActual, newBug.actual_result);
    } else {
      const oldActual = oldBug.desc.slice(oldBug.desc.indexOf('###Actual Result:\n') + 18, oldBug.desc.indexOf('\n\n###Notes:\n'));
      formattedBug.desc = formattedBug.desc.replace(oldActual, newBug.actual_result);
    }
  }
  if (newBug.notes){
    const oldNotes = oldBug.desc.slice(oldBug.desc.indexOf('###Notes:\n') + 10);
    formattedBug.desc = formattedBug.desc.replace(oldNotes, newBug.notes);
  }
  return formattedBug;
}
module.exports.reformatBug = reformatBug;

//Formats the response to send back
function response(body, code){
  return {
    body: JSON.stringify(body),
    headers: {},
    statusCode: code
  };
}
module.exports.response = response;

//Checks the Environment Variables are set
function validateEnv(env){
  if (env.KEY == undefined || env.KEY == '<TRELLO_API_KEY>' || env.TOKEN == undefined || env.TOKEN == '<TRELLO_API_TOKEN>'){
    throw new Error('Token or Key not set in Environment Variables');
  }
}
module.exports.validateEnv = validateEnv;