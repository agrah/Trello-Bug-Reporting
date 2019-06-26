
const request = require('request');
const { TOKEN, KEY, LIST_ID } = require('../credentials');


//Creates the bug as a card in Trello
async function createBug(bug){
  const options = { method: 'POST',
    url: 'https://api.trello.com/1/cards',
    qs: 
    { name: bug.name,
      desc: `
      summary: ${bug.summary},
      steps to produce: ${bug.steps_to_produce},
      expected result: ${bug.expected_result},
      actual result: ${bug.actual_result},
      notes: ${bug.actual_result}
      `,
      idList: LIST_ID,
      key: KEY,
      token: TOKEN } };

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
