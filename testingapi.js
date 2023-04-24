const express = require('express');
const bodyParser = require('body-parser');
//Creating an instance of express
const app = express();
//Middleware
const crypto = require('crypto');
const sqlite3 = require('sqlite3');
const { parse } = require('path');


//Setting up the static folder to serve the front end web pages
app.use(express.static('public'));


//Middleware
//This is going to be used to parse the data that the user sends to the server
//We are going to use the json method to parse the data, 
//meaning that we are going to parse the data as json, and not as url encoded data
app.use(bodyParser.json());



/**
 * We are going to create a database to store authentication information
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

//Creating a database of filenames so that filenames are not duplicated
const filenamesdb = new sqlite3.Database('filenamesDatabase.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the filenamesDatabase database.');
});

async function openDB(usernameDB){
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(`${usernameDB}.db`, (err) => {
      if (err) {
        console.error(err.message);
      } else {
        resolve(db);
      }
      console.log(`Connected to the ${usernameDB} database.`);
    });
  });
}



//Creating a table to store the users
//This creates the table called users if it does not exist
usersdb.run('CREATE TABLE IF NOT EXISTS users (username VARCHAR(255) UNIQUE, password VARCHAR(255), id INTEGER PRIMARY KEY AUTOINCREMENT)');

//Creating a table to store the filenames
//This creates the table called filenames if it does not exist
filenamesdb.run('CREATE TABLE IF NOT EXISTS filenames (filename VARCHAR(255) UNIQUE, id INTEGER PRIMARY KEY AUTOINCREMENT)');


/**
 * At this point we are going to create our methods for authorization
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

            const findUser = usersdb.prepare('SELECT * FROM users WHERE username = ?');
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


const findUserByUsername = (username) => {
    return new Promise((resolve, reject) => {
      usersdb.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) {
          reject(err);
        } else if (!row) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  };
  







//This is a fucntion to standarized the request body for the tag
//const standardizeTag = (tag) => {
//   
//  return new Promise((resolve, reject) => {
//    
//    //Creating a variable to hold the standardized tag
//    let standardizedTag = tag;
//    //The tag will be standardized by making it lowercase
//    standardizedTag = standardizedTag.toLowerCase();
//    //The tag will be standardized by removing the spaces
//    standardizedTag = standardizedTag.replace(/\s/g, '');
//
//    //The tag will be standardized by removing the special characters
//    standardizedTag = standardizedTag.replace(/[^\w\s]/gi, '');
//
//    //The tag will be standardized by removing the numbers
//    standardizedTag = standardizedTag.replace(/[0-9]/g, '');
//
//    resolve(standardizedTag);
//  })
//  
//}




/*
 **************************************************** 
 * This is the starting point of the http Restful api
 * **************************************************
*/



//Creating a route for the api
app.get('/api', (req, res) => {
   // res.json(workouts);
    //res.status(200);
});



/*
This is a get request for a single workout. We are going to use the some method to check
if the id that the user is looking for is in the array. If the id is in the array then we
are going to return the workout. If the id is not in the array then we are going to return
a 400 status code and a message that says that the workout was not found.
*/ 
app.get('/api/:playlistTitle', (req, res) => {
    const found = workouts.some(workout => workout.id === parseInt(req.params.id));
    if (found) {
        res.json(workouts.filter(workout => workout.id === parseInt(req.params.id)));
    } else {
        res.status(400).json({ msg: `No workout with the id of ${req.params.id}` });
    }
});




//This is the post request to create a new user in the database
//This is going to take the username and password and store it in the database
/**
 * The Request body will contain the username and password
 * it will look like
 * {
 * "user": "username", pass: "password"
 * } 
*/
app.post('/api/createUser', async (req, res) => {
    //Assigning the request body to userSign
    const userSign = req.body;
  
    //Setting the cache control to no cache
    res.set('Cache-Control', 'no-cache')
    //We do not want an empty username or password, so we have to implment a check and return a 400 status code
    if (!userSign.user || !userSign.pass) {
      res.status(400).json({ msg: 'Please include a username and password' });
    } else {
      try {
        //Next we are going to check if the user already exists,
        //If the user already exists then we are going to return a 400 status code
        const userFound = await findUserByUsername(userSign.user);
        console.log('Userfound = ', userFound);
        if (userFound === true) {
          res.status(400).json({ msg: 'User already exists' });
        } else {
          //Hashing the password
          const userPassword = hash(userSign.pass);
          //Creating a user
          const createUser = usersdb.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
          createUser.run(userSign.user, userPassword, (err) => {
            if (err) {
              console.log(err);
              res.status(500).json({ msg: 'Internal server error' });
            } else {
              res.status(200).json({ msg: 'User created' });
            }
          }).finalize();
        }
      } catch (err) {
        console.log(err);
        res.status(500).json({ msg: 'Internal server error' });
      }
    }
});
  


/*
Creating a post request. This is going to be used to add a workout to the array. We are
going to use the body-parser module to parse the data that the user sends to the server.
We are going to use the push method to add the new workout to the array. We are going to
use the json method to send the new workout back to the user.

The request body will look like this
{
  playlistTitle: 'Chest',
  description: 'Some description',
  exerciseList: [ 'Jumps', 'Bench', 'Legs' ]
}

*/
app.post('/api', isAuthorized, async(req, res) => {
  const newWorkout = req.body;
  console.log(req.body)
  const [user] = parseBasic(req)
  console.log(user);
  console.log('Received: ',newWorkout);
  // const tag = await standardizeTag(newWorkout.playlistTitle);
  // console.log('Tag: ', tag);
  console.log('User: ', user);

  //Next we are going to get request authorzation header
  //We need to make a database our of the user's user name
  //We are going to use the user's username as the name of the database

  //Creating a database for the user
  const userdb = openDB(user);
  //Creating a table for the user
  userdb.prepare(`CREATE TABLE IF NOT EXISTS ${newWorkout.playlistTitle} (id INTEGER PRIMARY KEY AUTOINCREMENT, playlistTitle VARCHAR(255), description VARCHAR(255), exerciseList VARCHAR(255)`)
  //Creating a workout
  const titleDesEx = userdb.prepare(`INSERT INTO ${newWorkout.playlistTitle} (playlistTitle, description) VALUES (?, ?)`);
  titleDesEx.run(newWorkout.playlistTitle, newWorkout.description, (err) => {
    if (err) {
      console.log(err);
      res.status(500).json({ msg: 'Internal server error' });
    } else {
      res.status(200).json({ msg: 'Workout created' });
    }
  }
  ).finalize();

  //Inserting the exercises into the database
  const exercises = userdb.prepare(`INSERT INTO ${newWorkout.playlistTitle} (exerciseList) VALUES (?)`);



  

    
});
    
    

/**
 * Making a post request for an already existing workout
 * If the workout already exists then we just want to update the workout
 * We are not going to change the name of the workout, but we are going to change the
 * description of the workout and just add to the description 
 */

app.post('/api/:id', (req, res) => {
    





});



//Creating a put request. This is going to be used to update a workout in the array.
//We are going to use the map method to loop through the array and check if the id matches
//the id that the user is looking for. If the id matches then we are going to update the
//workout. If the id does not match then we are going to return the workout.
app.put('/api/:id', (req, res) => {

   


});

//Creating a delete request. This is going to be used to delete a workout user from the array.
//We are going to use the filter method to loop through the array and check if the id matches
//the id that the user is looking for. If the id matches then we are going to delete the
//workout. If the id does not match then we are going to return the workout.

app.delete('/api/:id', (req, res) => {

  
});




app.listen(3000, () => console.log('Server started on port 3000'));
console.log('http://localhost:3000');