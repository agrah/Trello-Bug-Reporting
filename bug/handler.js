'use strict';

const middy = require('middy');
const { cors } = require('middy/middlewares');

const { createBug } = require('./bug');
const { initBoard, initList, initLabel } = require('./trello');
const { setGlobal } = require('../utils');


let initialise = async (event) => {
  try {
    //Parse in the request body
    const req = JSON.parse(event.body);
    
    //Create the Board and set it's ID
    const boardID = await initBoard(req.board_name);
    await setGlobal('BOARD_ID', boardID);
    
    //Create the lists
    const lists = ['Reported', 'Accepted', 'In Progress', 'To Be Validated', 'Done'];
    for(let i = 0; i < lists.length; i++){
      let listID = await initList(lists[i], boardID);
      //Store the list ID that we want to submit bug cards to
      if(lists[i] == 'Reported'){
        await setGlobal('BUG_LIST_ID', listID);
      }
      console.log(`List created with id: ${listID} name: ${lists[i]}`);
    }
    
    //Create the labels
    const labels = [
      { name: 'Trivial', color: 'green'},
      { name: 'Minor', color: 'yellow' },
      { name: 'Major', color: 'orange' },
      { name: 'Critical', color: 'red' }
    ];
    for (let j = 0; j < labels.length; j++){
      const labelID = await initLabel(labels[j].name, labels[j].color, boardID);
      //Store the label ID
      await setGlobal(`${labels[j].name.toUpperCase()}_LABEL`, labelID);
      console.log(`Label created with id: ${labelID} name: ${labels[j].name}`);
    }
    console.log('Trello Bug Board Initialisation Complete!');
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Board Initalisation complete!`
      }),
    };

  } catch(err) {
    return {
      body: JSON.stringify({message: "Internal Error", error: err.message }),
      headers: {},
      statusCode: 500
    };
  }
}
initialise = middy(initialise).use(cors());
module.exports.initialise = initialise;

let create = async (event) => {
  try {
    //Parse in the request body
    const req = JSON.parse(event.body);
    
    //Create the bug card on Trello
    const result = await createBug(req);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Bug card created with id: ${result.id}`
      }),
    };

  } catch(err) {
    return {
      body: JSON.stringify({message: "Internal Error", error: err.message }),
      headers: {},
      statusCode: 500
    };
  }
}
create = middy(create).use(cors());
module.exports.create = create;