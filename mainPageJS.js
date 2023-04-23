// Main Page Javascript


//The closeForm function will close the form and hide all of its contents 
function closeVisibilty(id) {

    if(document.getElementById(id).style.display === "block"){

        document.getElementById(id).style.display = "none"; //Unhides the contents of the id

        if(id === "sideBar"){

            closeSideBar(id);           
        
        }
        
    }
    

}

//The open function will take an any id as a parameter and unhide the contents of that id
function openVisibilty(id) {

    if(document.getElementById(id).style.display === "none"){
    
        document.getElementById(id).style.display = "block"; //Unhides the contents of the id

        //If side bar is opened, then view the list of workouts
        if(id === "sideBar"){

            toggleSideBar(id);
        
        }

    }

}

//Toggling the width of the sideBar
function toggleSideBar(id) {

    document.getElementById(id).style.width = "250px"; //Unhides the contents of the id

}

//Closes the sideBar
function closeSideBar(id) {

    document.getElementById(id).style.width = "0px"; //Unhides the contents of the id

}


//creating a list that takes a input text and adds it as a title.
//then creating a ul and appending the workouts to the list
function createList(playistTitle, Description, parentList, sideBar) {

    //Getting the input text from the playlistTitle text box
    let title = document.getElementById(playistTitle).value;

    //Parent element which is the div in this case
    let parent = document.getElementById(parentList);
    parent.innerHTML = "<h3>" + title +"</h3>"; //Clearing the parent element
    
    let tempSideBar = document.getElementById(sideBar);
    tempSideBar.style.display = "block"; //Unhides the contents of the id

    //getting the textbox input and using a delimter to split the string into the workouts array
    let textboxInput = document.getElementById(Description).value;
    let workouts = textboxInput.split(","); //Splitting the string into an array

     //creating the ul element
     let playlistUl = document.createElement("ul");
    //Adding the ul element to the parent element
    parent.appendChild(playlistUl);

    //Adding the li elements to the ul element
    for (let index = 0; index < workouts.length; index++) {
        let wI = document.createElement("li");
        wI.innerHTML = workouts[index];
        playlistUl.appendChild(wI);
    }

    tempSideBar.style.display = "none"; //Unhides the contents of the id

}


/** Add exercise function will add a new input box to the form
 * where it will allow the user to add more exercises to the list
 *
 * It will have a button that will add a new input box
 * and a button that will remove the last input box.
 * 
 */

let exerciseIncrement = 2;
//Creating a new input box
function addExercise(parent) {
    
    
    
    //Getting the parent element which is the div called exerciseBoxes
    let exerciseDiv = document.getElementById(parent);
    let exercise = document.createElement("input");
    exercise.setAttribute("type", "text");
    exercise.setAttribute("name", "exercise" + exerciseIncrement);
    exercise.setAttribute("id", "exercise" + exerciseIncrement);
    exercise.setAttribute("placeholder", "Exercise " + exerciseIncrement);
    exercise.setAttribute("class", "exercise");

    //We are going to add a button that will remove the last input box
    let removeExercise = document.createElement("button");
    removeExercise.setAttribute("type", "button");
    removeExercise.setAttribute("id", "removeExercise" + exerciseIncrement);
    removeExercise.setAttribute("class", "removeExercise");
    removeExercise.innerHTML = "X";

    //Here we are going to add an event listener to the button
    //This will remove the last input box
    removeExercise.addEventListener("click", function() {
        exerciseDiv.removeChild(exercise);
        exerciseDiv.removeChild(removeExercise);
        //Decrementing so we can keep track of the number of input boxes
        exerciseIncrement--;
    });




    //Adding the input box to the parent element    
    exerciseDiv.appendChild(exercise);
    exerciseDiv.appendChild(removeExercise);

    //Incrementing the exerciseIncrement
    exerciseIncrement++;


}
