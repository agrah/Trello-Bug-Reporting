
const request = require('request');

const { logger } = require('../logger');
const { TOKEN, KEY } = require('../credentials');
const { BUG_LIST_ID, TRIVIAL_LABEL, MINOR_LABEL, MAJOR_LABEL, CRITICAL_LABEL } = require('../global');


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
    url: `https://api.trello.com/1/lists/${BUG_LIST_ID}/cards?key=${KEY}&token=${TOKEN}`,
    qs: {fields: 'id,name,desc,labels,url'}
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
