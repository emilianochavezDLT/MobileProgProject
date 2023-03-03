// Main Page Javascript


//The closeForm function will close the form and hide all of its contents 
function closeVisibilty(id) {

    if(document.getElementById(id).style.display === "block"){

        document.getElementById(id).style.display = "none"; //Unhides the contents of the id
        
    }
    

}

//The open function will take an any id as a parameter and unhide the contents of that id
function openVisibilty(id) {

    document.getElementById(id).style.display = "block"; //Unhides the contents of the id
}


