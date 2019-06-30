'use strict';

const middy = require('middy');
const { cors } = require('middy/middlewares');
const Joi = require('@hapi/joi');

const { createBug, retrieveBugs } = require('./bug');
const { initBoard, initList, initLabel } = require('./trello');
const { setGlobal } = require('../utils');
const { initSchema, createSchema } = require('./schema');
const { logger } = require('../logger');


let initialise = async (event) => {
  try {
    logger.info('POST /bug/init: Initalising board and lists...');
    //Parse in the request body and validate it
    const req = JSON.parse(event.body);
    const { error } = Joi.validate(req, initSchema);
    if (error){
      return {
        body: JSON.stringify({message: "Invalid Request", error: error.details[0].message }),
        headers: {},
        statusCode: 400
      };
    }
    
    //Create the Board and set it's ID
    logger.info('POST /bug/init: Creating board...');
    const boardID = await initBoard(req.board_name);
    await setGlobal('BOARD_ID', boardID);
    logger.info('POST /bug/init: Board created!');
    
    //Create the lists
    logger.info('POST /bug/init: Creating lists...');
    const lists = ['Reported', 'Accepted', 'In Progress', 'To Be Validated', 'Done'];
    for(let i = 0; i < lists.length; i++){
      let listID = await initList(lists[i], boardID);
      //Store the list ID that we want to submit bug cards to
      if(lists[i] == 'Reported'){
        await setGlobal('BUG_LIST_ID', listID);
      }
    }
    logger.info('POST /bug/init: Lists created!');
    
    //Create the labels
    logger.info('POST /bug/init: Creating labels...');
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
    }
    logger.info('POST /bug/init: Lables created!');
    logger.info('POST /bug/init: Initalisation Complete!');
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Initalisation complete!`
      }),
    };

  } catch(err) {
    logger.error('POST /bug/init: Internal Error Caught ', err);
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
    logger.info('POST /bug/create: Creating bug...');
    //Parse in the request body and validate it
    const req = JSON.parse(event.body);
    const { error } = Joi.validate(req, createSchema);
    if (error){
      return {
        body: JSON.stringify({message: "Invalid Request", error: error.details[0].message }),
        headers: {},
        statusCode: 400
      };
    }
    
    //Create the bug card on Trello
    const result = await createBug(req);
    logger.info('POST /bug/create: Creating bug complete!')
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Bug card created with id: ${result.id}`
      }),
    };

  } catch(err) {
    logger.error('POST /bug/create: Internal Error Caught ', err);
    return {
      body: JSON.stringify({message: "Internal Error", error: err.message }),
      headers: {},
      statusCode: 500
    };
  }
}
create = middy(create).use(cors());
module.exports.create = create;

let retrieve = async (event) => {
  try {
    logger.info('GET /bug: Retrieving bugs...');

    //Retrieve the list of bugs on the reported Trello List
    const result = await retrieveBugs();

    logger.info('GET /bug: Retrieving bugs complete!');
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Bugs retrieved successfully!`, bugs: result
      }),
    };

  } catch(err) {
    logger.error('GET /bug: Internal Error Caught ', err);
    return {
      body: JSON.stringify({message: "Internal Error", error: err.message }),
      headers: {},
      statusCode: 500
    };
  }
}
retrieve = middy(retrieve).use(cors());
module.exports.retrieve = retrieve;