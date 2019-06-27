
const request = require('request');
const { TOKEN, KEY } = require('../credentials');

//Creates the Board
async function initBoard(name){
  const options = { method: 'POST',
    url: 'https://api.trello.com/1/boards/',
    qs: { 
      name: name,
      defaultLabels: 'false',
      defaultLists: 'false',
      keepFromSource: 'none',
      prefs_permissionLevel: 'private',
      prefs_voting: 'disabled',
      prefs_comments: 'members',
      prefs_invitations: 'members',
      prefs_selfJoin: 'true',
      prefs_cardCovers: 'true',
      prefs_background: 'blue',
      prefs_cardAging: 'regular',
      key: KEY,
      token: TOKEN 
    } 
  };

  return new Promise((resolve, reject) => {
    request(options, function (error, response, body) {
      if (error) {
        console.log(error);
        reject(error);
      } else {
        const parsed = JSON.parse(body);
        resolve(parsed.id);
      }
    })
  });
}
module.exports.initBoard = initBoard;

//Creates a list given the name
async function initList(name, boardID){
  const options = { 
    method: 'POST',
    url: 'https://api.trello.com/1/lists',
    qs: { name: name, idBoard: boardID, pos: 'bottom', key: KEY, token: TOKEN } 
  };

  return new Promise((resolve, reject) => {
    request(options, function (error, response, body) {
      if (error) {
        console.log(error);
        reject(error);
      } else {
        const parsed = JSON.parse(body);
        resolve(parsed.id);
      }
    })
  });
}
module.exports.initList = initList;

//Creates a label given the name and color
async function initLabel(name, color, boardID){
  const options = { 
    method: 'POST',
    url: 'https://api.trello.com/1/labels',
    qs: { name: name, color: color, idBoard: boardID, key: KEY, token: TOKEN } 
  };

  return new Promise((resolve, reject) => {
    request(options, function (error, response, body) {
      if (error) {
        console.log(error);
        reject(error);
      } else {
        const parsed = JSON.parse(body);
        resolve(parsed.id);
      }
    })
  });
}
module.exports.initLabel = initLabel;
