'use strict';

const middy = require('middy');
const { cors } = require('middy/middlewares');

const { createBug } = require('./bug');

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