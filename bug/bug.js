
const request = require('request');
const { TOKEN, KEY } = require('../credentials');
const { BUG_LIST_ID, TRIVIAL_LABEL, MINOR_LABEL, MAJOR_LABEL, CRITICAL_LABEL } = require('../global');


//Creates the bug as a card in Trello
async function createBug(bug){
  //decide which label should be chosen
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
  
  const options = { method: 'POST',
    url: 'https://api.trello.com/1/cards',
    qs: { 
      name: `[${bug.context}] ${bug.name}`,
      desc: `###Summary:\n${bug.summary}\n\n###Steps To Produce:\n${bug.steps_to_produce}\n\n###Expected Result:\n${bug.expected_result}\n\n###Actual Result:\n${bug.actual_result}\n\n###Notes:\n${bug.notes}`,
      idLabels: bug.labelID,
      idList: BUG_LIST_ID,
      key: KEY,
      token: TOKEN 
    }
  };

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
