'use strict';

const middy = require('middy');
const { cors } = require('middy/middlewares');
const Joi = require('@hapi/joi');

const { createBug, retrieveBugs, retrieveBug, updateBug, deleteBug } = require('./bug');
const { initBoard, initList, initLabel } = require('./trello');
const { setGlobal, response, validateEnv } = require('../utils');
const { initSchema, createSchema, updateSchema } = require('./schema');
const { logger } = require('../logger');


let initialise = async (event) => {
  try {
    validateEnv(process.env);
    logger.info('POST /bug/init: Initalising board and lists...');

    //Parse in the request body and validate it
    const req = JSON.parse(event.body);
    const { error } = Joi.validate(req, initSchema);
    if (error){
      return response({message: "Invalid Request", error: error.details[0].message}, 400);
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
    return response({message: `Initalisation complete!`}, 200);

  } catch(err) {
    logger.error('POST /bug/init: Internal Error Caught ', err);
    return response({message: "Internal Error", error: err.message}, 500);
  }
}
initialise = middy(initialise).use(cors());
module.exports.initialise = initialise;

let create_bug = async (event) => {
  try {
    validateEnv(process.env);
    logger.info('POST /bug/create: Creating bug...');

    //Parse in the request body and validate it
    const req = JSON.parse(event.body);
    const { error } = Joi.validate(req, createSchema);
    if (error){
      return response({message: "Invalid Request", error: error.details[0].message}, 400);
    }
    
    //Create the bug card on Trello and return it's ID
    const result = await createBug(req);
    logger.info('POST /bug/create: Creating bug complete!');
    return response({id: result.id}, 200);

  } catch(err) {
    logger.error('GET /bug/{id}: Internal Error Caught ', err);
    return response({message: "Internal Error", error: err.message}, 500);
  }
}
create_bug = middy(create_bug).use(cors());
module.exports.create_bug = create_bug;

let retrieve_all = async (event) => {
  try {
    validateEnv(process.env);
    logger.info('GET /bug: Retrieving bugs...');

    //Retrieve the list of bugs on the reported Trello List and return them
    const result = await retrieveBugs();
    logger.info('GET /bug: Retrieving bugs complete!');
    return response({bugs: result}, 200);

  } catch(err) {
    logger.error('GET /bug: Internal Error Caught ', err);
    return response({message: "Internal Error", error: err.message }, 500);
  }
}
retrieve_all = middy(retrieve_all).use(cors());
module.exports.retrieve_all = retrieve_all;

let retrieve_bug = async (event) => {
  try {
    validateEnv(process.env);
    logger.info('GET /bug/{id}: Retrieving bug...');
    
    //Retrieve the bug on the reported Trello List and return it
    const result = await retrieveBug(event.pathParameters.id);
    logger.info('GET /bug/{id}: Retrieving bug complete!');
    return response({bug: result}, 200);

  } catch(err) {
    if (err.code == 400 || err.code == 404){
      logger.warn('GET /bug/{id}: ' + err.message);
      return response({message: err.message}, err.code);
    } else {
      logger.error('GET /bug/{id}: Internal Error Caught ', err);
      return response({message: "Internal Error", error: err.message}, 500);
    }
  }
}
retrieve_bug = middy(retrieve_bug).use(cors());
module.exports.retrieve_bug = retrieve_bug;

let update_bug = async (event) => {
  try {
    validateEnv(process.env);
    logger.info('PUT /bug/{id}: Updating bug...');

    //Parse in the request body and validate it
    const req = JSON.parse(event.body);
    const { error } = Joi.validate(req, updateSchema);
    if (error){
      return response({message: "Invalid Request", error: error.details[0].message}, 400);
    }
    
    //Update the given bug card on Trello and return it's ID
    const result = await updateBug(event.pathParameters.id, req);
    logger.info('PUT /bug/{id}: Updating bug complete!');
    return response({id: result.id}, 200);

  } catch(err) {
    if (err.code == 400 || err.code == 404){
      logger.warn('PUT /bug/{id}: ' + err.message);
      return response({message: err.message}, err.code);
    } else {
      logger.error('PUT /bug/{id}: Internal Error Caught ', err);
      return response({message: "Internal Error", error: err.message}, 500);
    }
  }
}
update_bug = middy(update_bug).use(cors());
module.exports.update_bug = update_bug;

let delete_bug = async (event) => {
  try {
    validateEnv(process.env);
    logger.info('DELETE /bug/{id}: Deleting bug...');

    //Delete the bug card on Trello
    const result = await deleteBug(event.pathParameters.id);
    logger.info('DELETE /bug/{id}: Deleting bug complete!');
    return response({id: result}, 200);

  } catch(err) {
    if (err.code == 400 || err.code == 404){
      logger.warn('DELETE /bug/{id}: ' + err.message);
      return response({message: err.message}, err.code);
    } else {
      logger.error('DELETE /bug/{id}: Internal Error Caught ', err);
      return response({message: "Internal Error", error: err.message}, 500);
    }
  }
}
delete_bug = middy(delete_bug).use(cors());
module.exports.delete_bug = delete_bug;
