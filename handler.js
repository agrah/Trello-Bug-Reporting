'use strict';

const middy = require('middy');
const { cors } = require('middy/middlewares');

let hello = async (event) => {
  try {
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Go Serverless v1.0! Your function executed successfully!',
        input: event,
      }, null, 2),
    };

  } catch(err) {
    return {
      body: JSON.stringify({message: "Internal Error", error: err.message }),
      headers: {},
      statusCode: 500
    };
  }
}
hello = middy(hello).use(cors());
module.exports.hello = hello;