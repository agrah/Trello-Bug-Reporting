
const request = require('request');

const { logger } = require('../logger');
const { TOKEN, KEY } = require('../credentials');
const { BUG_LIST_ID, TRIVIAL_LABEL, MINOR_LABEL, MAJOR_LABEL, CRITICAL_LABEL } = require('../global');
const { reformatBug } = require('../utils');


//Creates the bug as a card in Trello
async function createBug(bug){
  //Set the Label ID based on the given label name
  switch( bug.label ){
    case 'critical':
      bug.labelID = CRITICAL_LABEL;
      break;
    case 'major':
      bug.labelID = MAJOR_LABEL;
      break;
    case 'minor':
      bug.labelID = MINOR_LABEL;
      break;
    case 'trivial':
      bug.labelID = TRIVIAL_LABEL;
      break; 
    default:
      throw new Error('Given label is invalid.');
  }

  //Remove the notes property formatting if not provided
  let description;
  if (bug.notes == undefined){
    description = `###Summary:\n${bug.summary}\n\n###Steps To Produce:\n${bug.steps_to_produce}\n\n###Expected Result:\n${bug.expected_result}\n\n###Actual Result:\n${bug.actual_result}`
  } else {
    description = `###Summary:\n${bug.summary}\n\n###Steps To Produce:\n${bug.steps_to_produce}\n\n###Expected Result:\n${bug.expected_result}\n\n###Actual Result:\n${bug.actual_result}\n\n###Notes:\n${bug.notes}`
  }
  
  //Define the options for the request
  const options = { method: 'POST',
    url: 'https://api.trello.com/1/cards',
    qs: { 
      name: `[${bug.context}] ${bug.name}`,
      desc: description,
      idLabels: bug.labelID,
      idList: BUG_LIST_ID,
      key: KEY,
      token: TOKEN 
    }
  };

  //Send the request
  return new Promise((resolve, reject) => {
    request(options, function (error, response, body) {
      if (error) {
        reject(error);
      } else {
        resolve(JSON.parse(body));
      }
    })
  });
}
module.exports.createBug = createBug;

//Retrieves the list of bugs in the reported list
async function retrieveBugs(){
  //Define the options for the request
  const options = { method: 'GET',
    url: `https://api.trello.com/1/lists/${BUG_LIST_ID}/cards`,
    qs: {
      fields: 'id,name,desc,labels,url',
      key: KEY,
      token: TOKEN
    }
  };

  //Send the request
  return new Promise((resolve, reject) => {
    request(options, function (error, response, body) {
      if (error) {
        reject(error);
      } else {
        resolve(JSON.parse(body));
      }
    })
  });
}
module.exports.retrieveBugs = retrieveBugs;

//Retrieves a single bug
async function retrieveBug(id){
  //Define the options for the request
  const options = { method: 'GET',
    url: `https://api.trello.com/1/cards/${id}`,
    qs: {
      fields: 'id,name,desc,labels,url',
      key: KEY,
      token: TOKEN
    }
  };

  //Send the request
  return new Promise((resolve, reject) => {
    request(options, function (error, response, body) {
      if (error) {
        reject(error);
      } else if(response.statusCode == 400 || response.statusCode == 404){
        reject({code: response.statusCode, message: body});
      } else if(response.statusCode == 200){
        resolve(JSON.parse(body));
      } else {
        reject({code: response.statusCode, message: 'Strange response from Trello API'});
      }
    });
  }); 
}
module.exports.retrieveBug = retrieveBug;

//Updates the bug as a card in Trello
async function updateBug(id, bug){
  //Retrieve existing bug
  const oldBug = await retrieveBug(id);
  
  //Reformat the new bug
  const newBug = reformatBug(oldBug, bug);

  //Set the Label ID based on the given label name
  if(bug.label){
    switch( bug.label ){
      case 'critical':
        newBug.idLabels = CRITICAL_LABEL;
        break;
      case 'major':
        newBug.idLabels = MAJOR_LABEL;
        break;
      case 'minor':
        newBug.idLabels = MINOR_LABEL;
        break;
      case 'trivial':
        newBug.idLabels = TRIVIAL_LABEL;
        break; 
      default:
        throw new Error('Given label is invalid.');
    }
  }

  //Attach key and token to query string
  newBug.key = KEY;
  newBug.token = TOKEN;
  
  //Define the options for the request
  const options = { method: 'PUT',
    url: `https://api.trello.com/1/cards/${id}`,
    qs: newBug
  };

  //Send the request
  return new Promise((resolve, reject) => {
    request(options, function (error, response, body) {
      if (error) {
        reject(error);
      } else {
        resolve(JSON.parse(body));
      }
    })
  });
}
module.exports.updateBug = updateBug;

//Updates the bug as a card in Trello
async function deleteBug(id){
  //Define the options for the request
  const options = {
    method: 'DELETE',
    url: `https://api.trello.com/1/cards/${id}`,
    qs: {key: KEY, token: TOKEN}
  }

  //Send the request
  return new Promise((resolve, reject) => {
    request(options, function (error, response, body) {
      if (error) {
        reject(error);
      } else if(response.statusCode == 400 || response.statusCode == 404){
        reject({code: response.statusCode, message: body});
      } else if(response.statusCode == 200){
        resolve(id);
      } else {
        reject({code: response.statusCode, message: 'Strange response from Trello API'});
      }
    })
  });
}
module.exports.deleteBug = deleteBug;