//This is going to be the main file for our application
//Testing the server with api for our workout app

//Importing the express module
const express = require('express');
const bodyParser = require('body-parser');
//Creating an instance of express
const app = express();
const crypto = require('crypto');
const sqlite3 = require('sqlite3')



//Middleware
//This is going to be used to parse the data that the user sends to the server
//We are going to use the json method to parse the data, 
//meaning that we are going to parse the data as json, and not as url encoded data
app.use(bodyParser.json());

/**
 * ****************************************************
 * We are going to create a database to store authentication information
 * ****************************************************
*/

//Creating a database
const usersdb = new sqlite3.Database('usersDatabase.db', (err) => {

	//This is to check if there is an error
	if (err) {
		//This is to print the error message
		console.error(err.message);
	}
	//If there is no error then we will print the message
	console.log('Connected to the usersDatabase database.');
});		

//Creating a table to store the users
//This creates the table called users if it does not exist
usersdb.run('CREATE TABLE IF NOT EXISTS users (username VARCHAR(255) UNIQUE, password VARCHAR(255), id INTEGER PRIMARY KEY AUTOINCREMENT)');



/**
 *****************************************************
 * At this point we are going to create our methods for authorization
 *****************************************************
*/

//Generating a method to generate a hash for hashing the password
const hash = (password) => 
crypto.createHash('sha256').update(password).digest('hex')

//Next is to prompt authorization
const promptAuth = (res) => {
	res.status(401).setHeader('WWW-Authenticate', 'Basic');
	res.end('Access denied');
}

//Next is to parse the authorization header
// helper function to get a username/password tuple from request headers.
// Returns an empty array if no authorization header is present
const parseBasic = (req) => {
	if(req.headers.authorization) {
	  // split the value of the header "Basic lwjkjvljk"
	  const [ _, value ] = req.headers.authorization.split(" ")
	  // decode base64 string into binary values in a buffer
	  const buff = Buffer.from(value, 'base64')
	  
	  // convert the buffer into string and split user:pass
	  return buff.toString().split(":").slice(0,2);
	}
	return []
}


//We are going to create he method to check if the user is authorized
//This is going to be used to check if the user is authorized
const isAuthorized = async(req, res, next) => {
    //Creating a variable to hold the username and password
    //We are going to use the parseBasic method to parse the username and password
    const [username, password] = parseBasic(req);

    //Checking if the username and password are not empty
    if (username && password) {
        //Creating a variable to hold the sql query

        //Creating a variable to hold the user
        //This function is going to be used to get the user from the database
        //We essentially making a find user function here.
        //The purpose of the function to find the user in the database
        const userFound = await new Promise((resolve, reject) => {

            const findUser = db.prepare('SELECT * FROM users WHERE username = ?');
            findUser.get(username, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            }).finalize();

        })

        //Checking if the user is found
        if (userFound) {
            
            //Hashing the password, because we store the hashed password in the database
            const userPassword = hash(password);
            //Checking if the password is correct
            if (userPassword === userFound.password) {
                //If the user password is correct then we are going to call the next function
                next();
            }else {
                //If the password is not correct then we are going to prompt authorization
                promptAuth(res);
            }
        }else {
            //If the user is not found then we are going to prompt authorization
            promptAuth(res);
        }
    }

    //if the username and password are empty then we are going to prompt authorization
    else {
        //If the username and password are empty then we are going to prompt authorization
        promptAuth(res);
    }

}//End of isAuthorized method





/*
 **************************************************** 
 * This is the starting point of the http Restful api
 * **************************************************
*/

//Creating a route for the api
app.get('/api', (req, res) => {
    res.json(workouts);
});


/*
This is a get request for a single workout. We are going to use the some method to check
if the id that the user is looking for is in the array. If the id is in the array then we
are going to return the workout. If the id is not in the array then we are going to return
a 400 status code and a message that says that the workout was not found.
*/ 
app.get('/api/:id', (req, res) => {
    const found = workouts.some(workout => workout.id === parseInt(req.params.id));
    if (found) {
        res.json(workouts.filter(workout => workout.id === parseInt(req.params.id)));
    } else {
        res.status(400).json({ msg: `No workout with the id of ${req.params.id}` });
    }
});


/*

Creating a post request. This is going to be used to add a workout to the array. We are
going to use the body-parser module to parse the data that the user sends to the server.
We are going to use the push method to add the new workout to the array. We are going to
use the json method to send the new workout back to the user.

*/
app.post('/api', (req, res) => {
    const newWorkout = req.body;
    console.log(req.body)
    console.log('Received: ',newWorkout);
    //Creating a variable to hold the id of the new workout
    const id = workouts.length + 1;
    //Adding the id to the new workout
    newWorkout.id = id;
    //Adding the new workout to the array
    workouts.push(newWorkout);
    //Sending the new workout back to the user
    res.json(newWorkout);
});

/**
 * Making a post request for an already existing workout
 * If the workout already exists then we just want to update the workout
 * We are not going to change the name of the workout, but we are going to change the
 * description of the workout and just add to the description 
 */

app.post('/api/:id', (req, res) => {
    //Checking if the workout exists by using the some method
    const found = workouts.some(workout => workout.id === parseInt(req.params.id));
    //If the workout is found then we are going to update the workout
    if (found) {

        //Creating a variable to hold the updated workout
        const updWorkout = req.body;
        //Looping through the array to find the workout that the user is looking for
        workouts.forEach(workout => {
            //Checking if the id matches the id that the user is looking for
            if (workout.id === parseInt(req.params.id)) {
                //Updating the workout
                workout.description = updWorkout.description ? updWorkout.description : workout.description;
                //Sending the updated workout back to the user
                res.json({ msg: 'Workout updated', workout });
            }
        });
    } else {
        res.status(400).json({ msg: `No workout with the id of ${req.params.id}` });
    }
});



//Creating a put request. This is going to be used to update a workout in the array.
//We are going to use the map method to loop through the array and check if the id matches
//the id that the user is looking for. If the id matches then we are going to update the
//workout. If the id does not match then we are going to return the workout.
app.put('/api/:id', (req, res) => {

    //Checking if the workout exists by using the some method
    /**
     * The some method is going to loop through the array and check if the id that the user
     * is looking for is in the array. If the id is in the array then the some method is going
     * to return true. If the id is not in the array then the some method is going to return
     * false.
     */
    const found = workouts.some(workout => workout.id === parseInt(req.params.id)); 

    //If the workout is found then we are going to update the workout
    if (found) {
        //Creating a variable to hold the updated workout
        const updWorkout = req.body;

        //Looping through the array and updating the workout
        workouts.forEach(workout => {

            //Checking if the id matches the id that the user is looking for
            if (workout.id === parseInt(req.params.id)) {

                //Updating the workout
                /**
                 
                *This reads as follows:
                * Object.keys(updWorkout) is going to return an array of the keys in the
                * object. The forEach method is going to loop through the array and return
                * the key. The key is going to be the name of the property in the object.
                *   
                *  
                */
                Object.keys(updWorkout).forEach(key => {
                    workout[key] = updWorkout[key];
                });

                //Sending the updated workout back to the user
                res.json({ msg: 'Workout updated', workout });
            }
        });
    } 
    
    //If the workout is not found then we are going to return a 400 status code and a message
    else {
        res.status(400).json({ msg: `No workout with the id of ${req.params.id}` });
    }


});

//Creating a delete request. This is going to be used to delete a workout user from the array.
//We are going to use the filter method to loop through the array and check if the id matches
//the id that the user is looking for. If the id matches then we are going to delete the
//workout. If the id does not match then we are going to return the workout.

app.delete('/api/:id', (req, res) => {

    //Checking if the workout exists by using the some method
    /**
     * The some method is going to loop through the array and check if the id that the user
     * is looking for is in the array. If the id is in the array then the some method is going
     * to return true. If the id is not in the array then the some method is going to return
     * false.
     * 
     * 
     */
    let found = workouts.some(workout => workout.id === parseInt(req.params.id));

    //If the workout is found then we are going to delete the workout
    if (found) {   
        
        //Deleting the workout by using the splice method
        //The splice method is going to take two arguments. The first argument is going to be
        //the index of the workout that we want to delete. The second argument is going to be
        //the number of workouts that we want to delete. In this case we are only going to delete
        //one workout.
        workouts.splice(workouts.findIndex(workout => workout.id === parseInt(req.params.id)), 1);

        //Sending the updated array back to the user
        res.json({ msg: 'User deleted', workouts });

    } else {
        res.status(400).json({ msg: `No workout with the id of ${req.params.id}` });
    }
});



//We have to change the following below once we start hosting
app.listen(3000, () => console.log('Server started on port 3000'));
console.log('http://localhost:3000');






