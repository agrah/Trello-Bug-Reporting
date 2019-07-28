
# Trello Bug Reporting

A [Serverless](https://serverless.com/) service which allows you to perform basic CRUD operations on reported Bugs which are accessible through a Trello Bug Reporting Board. This service has been configured to be deployed through Amazon AWS.

## Installation
First clone the repo with
```bash
$ git clone https://github.com/agrah/Trello-Bug-Reporting.git
```
Then cd into the projects directory and install the dependencies
```bash
$ cd Trello-Bug-Reporting
$ npm install
```

### Credentials
Now we need to retrieve and set the credentials for our Trello Developer API account and our AWS account (*if you plan on deploying it to AWS*).

First head over to [Trello Developers](https://developers.trello.com/) and create an account. Once you have created an account retrieve and generate your accounts API Key and Token from [here](https://trello.com/app-key).

Now set them as environment variables in the serverless config file (***serverless.yml***) by replacing the following with your newly generated Key and Token from Trello Developers.
```yaml
environment:
  TOKEN: '<TRELLO_API_TOKEN>'
  KEY: '<TRELLO_API_KEY>'
```

**If you only plan on running this locally then you can skip the AWS credentials step. However, you wont be able to deploy the project to AWS**

Next you will need to retrieve your AWS credentials and set them for serverless. Follow these two guides to achieve this. 

 - [Retrieve AWS credentials](https://serverless.com/framework/docs/providers/aws/guide/credentials/)
 - [Set them for serverless](https://serverless.com/framework/docs/providers/aws/cli-reference/config-credentials/)

Once you have set the credentials needed, you can run either choose to deploy or run the project locally.
```bash
# Run locally
$ npm run dev

#Deploy to AWS
$ npm deploy
```

### Initialisation

Now we need to initialise the Trello Board the bugs will be submitted too. Make the following request to the initialise endpoint.

*If using AWS just replace localhost with the url your lambdas being hosted at*

**Method:** ```POST```

**URL:** ```http://localhost:3000/bug/init```

**Body:** ``` "board_name": "Bug Reports"```

Now everything should be set up!

You can now go and checkout the Bug Reporting Board that been created on your Trello account!

## Usage

With the endpoints running locally or deployed to AWS you can perform CRUD operations on the bugs. By using the following API calls.

## Create a Bug

**Description:** Creates a Bug as a card on the Bug Reporting board.

**Method:** ```POST```

**URL:** ```/bug/create```

**URL Parameters:** N/A 

**Required Fields:** 
```JSON
"name": "[string]",
"context": "[string]",
"summary": "[string]",
"steps_to_produce": "[string]",
"expected_result": "[string]",
"actual_result": "[string]",
"label": "[string / Must be 'critical', 'major', 'minor' or 'trivial']"
```
**Optional Fields:**
```JSON
"notes": "[string]"
```
**Example Call:** 
```JSON
METHOD: POST,
URL: http://localhost:3000/bug/create
BODY: {
"name": "The home button wont work",
"context": "Home Page",
"summary": "Clicking the home button wont redirect home",
"steps_to_produce": "Click the home button in the navigation bar",
"expected_result": "Expected to be redirected to the home url",
"actual_result": "No redirection occures", 
"notes": "Possible fix for James",
"label": "major" 
} 
```
**Success Response:**
 - Context: Returns the ID of the Bug Created
 - Code: ```200 ```
 - Body: ```"id": "5d3d3103cd4ace724aeb2ac0"```

**Error Response:**
 - Context: One of the required fields is left out.
 - Code:  ```400```
 - Body:  
 ``` JSON
 "message": "Invalid Request",
"error": "\"name\" is required" 
```

## Retrieve a Bug

**Description:** Retrieves a bug from the Bug Reporting board.

**Method:** ```GET```

**URL:** ```/bug/{id}```

**URL Parameters:** ``` id = [bugs unique id]``` 

**Required Fields:**  N/A

**Optional Fields:** N/A

**Example Call:** 
```JSON
METHOD: GET,
URL: http://localhost:3000/bug/5d3d3103cd4ace724aeb2ac0
BODY: {} 
```
**Success Response:**
 - Context: Returns the bug requested
 - Code: ```200 ```
 - Body: 
 ```JSON
 "bug": {
	"id": "5d3d3103cd4ace724aeb2ac0",
	"name": "[Home Page] The home button wont work",
	"desc": "###Summary:\nClicking the home button wont redirect home\n\n###Steps To Produce:\nClick the home button in the navigation bar\n\n###Expected Result:\nExpected to be redirected to the home url\n\n###Actual Result:\nNo redirection occures\n\n###Notes:\nPossible fix for James",
	"labels": [{
		"id": "5d18a907310d5e2f9cc5138e",
		"idBoard": "5d18a9035fad0d46896bc3f0",
		"name": "Major",
		"color": "orange"
	}],
	"url": "https://trello.com/c/urdJuHHy/23-home-page-the-home-button-wont-work"
}
```

**Error Response:**
 - Context: The ID provided isn't valid
 - Code:  ```400```
 - Body:  
 ``` JSON
 "message": "invalid id"
```
Or 
 - Context: The Bug ID provided has been deleted
 - Code:  ```404```
 - Body:  
 ``` JSON
"message": "The requested resource was not found."
```

## Retrieve all Bugs
**Description:** Retrieves the list of bugs from the Bug Reporting board.

**Method:** ```GET```

**URL:** ```/bug```

**URL Parameters:** N/A 

**Required Fields:**  N/A

**Optional Fields:** N/A

**Example Call:** 
```JSON
METHOD: GET,
URL: http://localhost:3000/bug
BODY: {} 
```
**Success Response:**
 - Context: Returns all the bugs on the Reported List
 - Code: ```200 ```
 - Body: 
 ```JSON
 "bugs": [{
	"id": "5d3d3103cd4ace724aeb2ac0",
	"name": "[Home Page] The home button wont work",
	"desc": "###Summary:\nClicking the home button wont redirect home\n\n###Steps To Produce:\nClick the home button in the navigation bar\n\n###Expected Result:\nExpected to be redirected to the home url\n\n###Actual Result:\nNo redirection occures\n\n###Notes:\nPossible fix for James",
	"labels": [{
		"id": "5d18a907310d5e2f9cc5138e",
		"idBoard": "5d18a9035fad0d46896bc3f0",
		"name": "Major",
		"color": "orange"
	}],
	"url": "https://trello.com/c/urdJuHHy/23-home-page-the-home-button-wont-work"
}, 
{...} 
]
```

## Update a Bug

**Description:** Updates a Bugs card on the Bug Reporting board.

**Method:** ```PUT```

**URL:** ```/bug/{id}```

**URL Parameters:**  ``` id = [bugs unique id]``` 

**Required Fields:**  At least one of the optional fields

**Optional Fields:**
```JSON
"name": "[string]",
"context": "[string]",
"summary": "[string]",
"steps_to_produce": "[string]",
"expected_result": "[string]",
"actual_result": "[string]",
"notes": "[string]",
"label": "[string / Must be 'critical', 'major', 'minor' or 'trivial']"
```
**Example Call:** 
```JSON
METHOD: PUT,
URL: http://localhost:3000/bug/5d3d3103cd4ace724aeb2ac0
BODY: {
"name": "The home button wont work on ANY of the pages",
"context": "EVERY Page",
"summary": "Clicking the home button in the nav bar wont redirect home on any of the pages",
"steps_to_produce": "Click the home button in the navigation bar reguardless of the page",
"expected_result": "Expected to be redirected to the home url",
"actual_result": "No redirection occures", 
"notes": "James should Look into our navigation bar component",
"label": "major" 
} 
```
**Success Response:**
 - Context: Returns the ID of the Bug Updated
 - Code: ```200 ```
 - Body: ```"id": "5d3d3103cd4ace724aeb2ac0"```

**Error Response:**
 - Context: One of the fields given is not.
 - Code:  ```400```
 - Body:  
 ``` JSON
 "message": "Invalid Request",
"error": "\"label\" is invalid" 
```
Or 
 - Context: The ID provided isn't valid
 - Code:  ```400```
 - Body:  
 ``` JSON
 "message": "invalid id"
```
Or 
 - Context: The Bug ID provided has been deleted
 - Code:  ```404```
 - Body:  
 ``` JSON
"message": "The requested resource was not found."
```

## Delete a Bug

**Description:** Deletes the bug from the Bug Reporting board.

**Method:** ```DELETE```

**URL:** ```/bug/{id}```

**URL Parameters:** ``` id = [bugs unique id]``` 

**Required Fields:**  N/A

**Optional Fields:** N/A

**Example Call:** 
```JSON
METHOD: DELETE,
URL: http://localhost:3000/bug/5d3d3103cd4ace724aeb2ac0
BODY: {} 
```
**Success Response:**
 - Context: Returns the id of the bug deleted
 - Code: ```200 ```
 - Body:  ```"id": "5d3d3103cd4ace724aeb2ac0"```

**Error Response:**
 - Context: The ID provided isn't valid
 - Code:  ```400```
 - Body:  
 ``` JSON
 "message": "invalid id"
```
Or 
 - Context: The Bug ID provided has been deleted
 - Code:  ```404```
 - Body:  
 ``` JSON
"message": "The requested resource was not found."
```


## What I Learned

 - How to deploy and manage streamlined AWS service with the Serverless Framework.
 - Manage Trello operations through their API.
 - Develop an API with CRUD functionality. 

## License
[MIT](https://choosealicense.com/licenses/mit/)