//This is going to be the main file for our application
//Testing the server with api for our workout app

//Importing the express module
const express = require("express");
//Import uuid
//const uuid = require('uuid'); //We are going to keep it basic for now and just use our id as a number
//Importing the body-parser module
const bodyParser = require("body-parser");

//Creating an instance of express
const app = express();

//Setting up the static folder to serve the front end web pages

//This is going to be the folder that is going to hold the front end web pages,
//we can just ignore this for now since. It was just to test out the server.
//app.use(express.static('public'));

//Middleware
//This is going to be used to parse the data that the user sends to the server
//We are going to use the json method to parse the data,
//meaning that we are going to parse the data as json, and not as url encoded data
app.use(bodyParser.json());

//Creating a variable to hold the data
//This is going to be an array of objects
/*
    This should be what the user inputs from the forms in the front end
const workouts = [

    Basic Anotomy of the object
    {
        Here we are going to have the id, which is the key
        and the value is 2
        id: 2,
        
        Here we are going to have the name, which is the key
        and the value is 'Pull Ups'
        name: 'Pull Ups',
    }

    {
        id: 3,
        playlistTitle: 'Chest',
        description: 'Bench Press, Dips, Push Ups',
    },

*/

//Creating an array of objects
const workouts = [];

/* The functions below have two arguments/parameter.
 
The request and the response. The request is what the user is sending to the server.
The request sends the data to the server. Everything that the user sends to the server is
stored in the request object. 

The response is what the server sends back to the user.

Below we are creating a route for the api. 
This is called an endpoint. The endpoint is the url that the user is going to use to
access the api. We are going to use the get method to get the data from the api.
The get method is going to take two arguments. The first argument is the url that the user
is going to use to access the api. The second argument is a callback function that takes
two arguments. The first argument is the request and the second argument is the response.

An api is an application programming interface. It is a set of rules that allow programs to
communicate with each other. It is a set of functions and procedures that allow the creation
of applications that access the features or data of an operating system, application, or other
service.

*/

//Creating a route for the api
app.get("/workouts", (req, res) => {
  res.json(workouts);
});

/*
This is a get request for a single workout. We are going to use the some method to check
if the id that the user is looking for is in the array. If the id is in the array then we
are going to return the workout. If the id is not in the array then we are going to return
a 400 status code and a message that says that the workout was not found.
*/
app.get("/workouts/:id", (req, res) => {
  const found = workouts.some(
    (workout) => workout.id === parseInt(req.params.id)
  );
  if (found) {
    res.json(
      workouts.filter((workout) => workout.id === parseInt(req.params.id))
    );
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
app.post("/workouts", (req, res) => {
  const newWorkout = req.body;
  console.log(req.body);
  console.log("Received: ", newWorkout);
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

app.post("/workouts/:id", (req, res) => {
  //Checking if the workout exists by using the some method
  const found = workouts.some(
    (workout) => workout.id === parseInt(req.params.id)
  );
  //If the workout is found then we are going to update the workout
  if (found) {
    //Creating a variable to hold the updated workout
    const updWorkout = req.body;
    //Looping through the array to find the workout that the user is looking for
    workouts.forEach((workout) => {
      //Checking if the id matches the id that the user is looking for
      if (workout.id === parseInt(req.params.id)) {
        //Updating the workout
        workout.description = updWorkout.description
          ? updWorkout.description
          : workout.description;
        //Sending the updated workout back to the user
        res.json({ msg: "Workout updated", workout });
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
app.put("/workouts/:id", (req, res) => {
  //Checking if the workout exists by using the some method
  /**
   * The some method is going to loop through the array and check if the id that the user
   * is looking for is in the array. If the id is in the array then the some method is going
   * to return true. If the id is not in the array then the some method is going to return
   * false.
   */
  const found = workouts.some(
    (workout) => workout.id === parseInt(req.params.id)
  );

  //If the workout is found then we are going to update the workout
  if (found) {
    //Creating a variable to hold the updated workout
    const updWorkout = req.body;

    //Looping through the array and updating the workout
    workouts.forEach((workout) => {
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
        Object.keys(updWorkout).forEach((key) => {
          workout[key] = updWorkout[key];
        });

        //Sending the updated workout back to the user
        res.json({ msg: "Workout updated", workout });
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

app.delete("/workouts/:id", (req, res) => {
  //Checking if the workout exists by using the some method
  /**
   * The some method is going to loop through the array and check if the id that the user
   * is looking for is in the array. If the id is in the array then the some method is going
   * to return true. If the id is not in the array then the some method is going to return
   * false.
   *
   *
   */
  let found = workouts.some(
    (workout) => workout.id === parseInt(req.params.id)
  );

  //If the workout is found then we are going to delete the workout
  if (found) {
    //Deleting the workout by using the splice method
    //The splice method is going to take two arguments. The first argument is going to be
    //the index of the workout that we want to delete. The second argument is going to be
    //the number of workouts that we want to delete. In this case we are only going to delete
    //one workout.
    workouts.splice(
      workouts.findIndex((workout) => workout.id === parseInt(req.params.id)),
      1
    );

    //Sending the updated array back to the user
    res.json({ msg: "User deleted", workouts });
  } else {
    res.status(400).json({ msg: `No workout with the id of ${req.params.id}` });
  }
});

//We have to change the following below once we start hosting
app.listen(3000, () => console.log("Server started on port 3000"));
console.log("http://localhost:3000");
