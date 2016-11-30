//Requiring Request NPM Package
var request = require("request");
//Requiring Inquirer NPM Package
var inquirer = require("inquirer");
//Requirnig Spotify NPM Package
var spotify = require("spotify");
//Requiring fs NPM Package
var fs = require("fs");
//Referencing keys for twitter that are ignored on github
var keys = require("./keys.js");
//Requiring Twitter NPM package
var Twitter = require("twitter");
//Creating new instance of Twitter object with consumer keys and access keys that are stored in keys.js
var client = new Twitter({
	consumer_key: keys.twitterKeys.consumer_key,
	consumer_secret: keys.twitterKeys.consumer_secret,
	access_token_key: keys.twitterKeys.access_token_key,
	access_token_secret: keys.twitterKeys.access_token_secret
});

//*******************************************************************
//							TWITTER SECTION
//*******************************************************************
//Twitter search function
function TwitterSearch(screen_name="asiarules") {
	this.screen_name = screen_name;
	//Prompt to be able to have user input a handle that he/she wants to see tweets from
	this.prompt = function() {
		inquirer.prompt(
		{
			type: "input",
			name: "handle",
			message: "Enter a handle you would like to see tweets from: @"
		}).then(function(name) {
			//If user inputs value for name
			if(name.handle){
				//We create new instance of TwitterSearch constructor that passes that handle that the user input as the screen_name argument
				var x = new TwitterSearch(name.handle);
				//Then runs the search function of that new instance.
				x.search();
			//Else if the user does not put in a value
			} else {
				//We create a new instance of TwitterSearch that passes no parameter, which gracefully degrades to the default screen_name of asiarules
				var x = new TwitterSearch();
				//
				x.search();
			}
		})
	};
	this.search = function() {	
		//Setting our input screen_name variable to a property of screen_name within an object because Twitter's NPM searches for the property of the key 'screen_name'
		var parameterA = {screen_name: screen_name};
		//Twitter NPM's built in search for the statuses of a user as defined in paramterA.screen_name, that returns a successful callback of tweets
		client.get("statuses/user_timeline", parameterA, function(error, tweets, response) {
			//If call is successful
			if (!error) {
				//Program loops 20 times to return the latest 20 tweets and their timestamps
				for (var i = 0; i < 20; i++) {
					console.log("Created at: " + tweets[i].created_at);
					console.log(tweets[i].text + "\n");
				}
			}
		})
	};
}

//*******************************************************************
//							MOVIE SECTION
//*******************************************************************
//MovieSearch constructor with default search name of Mr Nobody if user doesn't provide input
function MovieSearch(name="Mr Nobody") 
{
	this.name = name,
	//Query URL that we are requesting API information from
	this.queryURL = "http://www.omdbapi.com/?tomatoes=true&t=" + this.name,
	//Request NPM that uses prompted information to find movie information from OMDB database
	this.search = function() {
		//Request NPM
		request(this.queryURL, function(error, response, body) {
			//If no error and status code === 200 (ie, success), then information will print
			if (!error && response.statusCode === 200) {
				var omdbResponse = JSON.parse(body);
				console.log("The title of the movie is " + omdbResponse.Title);
				console.log("The movie came out in " + omdbResponse.Year);
				console.log("The IMDB rating is " + omdbResponse.imdbRating);
				console.log("The movie was produced in " + omdbResponse.Country);
				console.log("Language: " + omdbResponse.Language);
				console.log("Plot: " + omdbResponse.Plot);
				console.log("Actors: " + omdbResponse.Actors);
				console.log("The Rotten Tomatoes rating is " + omdbResponse.tomatoMeter);
				console.log("Rotten Tomatoes URL is " + omdbResponse.tomatoURL);
			//Else, the console will log the error that is being thrown back
			} else {
				console.log(error);
			}
		});
	},
	//Utilizing User Input to search a movie that a user inputs
	this.prompt = function() {
		//Prompting the user for a movie title
		inquirer.prompt([
			{
				type: "input",
				name: "movieName",
				message: "Please type a movie name you'd like to search for: "
			}
		//Once a movie has been input by user
		]).then(function(movie) {
			//If a movie name is provided by user
			if (movie.movieName) {
				//MovieSearch will perform using that movie name as parameter
				var x = new MovieSearch(movie.movieName);
				x.search();
			//Else, if there is no user input
			} else {
				//MovieSearch will use default parameter 'Mr Nobody'
				var x = new MovieSearch();
				x.search();
			}
		})
	}
}

//*******************************************************************
//						MUSICSEARCH SECTION (SPOTIFY)
//*******************************************************************
//Music search function with default song "The Sign"
function MusicSearch(song="The Sign") {
	this.song = song;
	this.prompt = function() {
		//Prompting the user for a song title
		inquirer.prompt([
			{
				type: "input",
				name: "song",
				message: "Please type a song title you'd like to search for: "
			}
		//Once a song has been input by user
		]).then(function(response) {
			//If song name is provided by user
			if (response.song) {
				//MusicSearch will perform with that song as the parameter
				var x = new MusicSearch(response.song);
				x.find();
			//Else, if the user does not input a song
			} else {
				//MusicSearch will search with the default parameter of "The Sign"
				var x = new MusicSearch();
				x.find();
			}
		});
	};
	//Uses the Spotify NPM to find the user's song
	this.find = function() {
		console.log("song inside find: " + song);
		spotify.search({ type: 'track', query: song }, function(err, data) {
			console.log("?" + song);
			if ( err ) {
				console.log("Error occurred: " + err);
				return;
			} else {
				//Creating variable to set shorter path name
				var path = data.tracks.items;
				//For aesthetic purposes
				console.log("---------------------------");
				//Console log the top 5 returns from Spotify's API
				for (var j = 0; j < 5; j++) {
					console.log("Song searched for: " + song);
					console.log("Artist(s): " + path[j].artists[0].name);
					console.log("Song Title: " + path[j].name);
					console.log("Preview Link of Song from Spotify: " + path[j].external_urls.spotify);
					console.log("Album: " + path[j].album.name);
					console.log("---------------------------");
				}
			}
		});
	}
}

//*******************************************************************
//						DO WHAT IT SAYS SECTION
//*******************************************************************
//This performs the action in the random.txt file
function DoDefault() {
	//Creates a blank array to be able to perform a split method
	var dataArray = [];
	//File System method readFile which reads the text within "random.txt"
	fs.readFile("random.txt", "utf8", (err, data) => {
		//If error occurs, will log the error to the screen
		if (err) throw err;
		//Else, splitting the array based on "," character, since the text of the random.txt is written as method,song/movie/twitterhandle
		dataArray = data.split(",");
		//Calls methodSelect function which handles which method to perform that passes parameters of 1. the method to call, and then 2. the value associated with that method (ie, movie name or song name or twitter handle to be searched)
		methodSelect(dataArray[0], dataArray[1])
	});
}

//*******************************************************************
//						SWITCH CASE SECTION
//*******************************************************************
//Switch case function that handles the selection of the method to use depending on user selection (first parameter only) or, if the user selects "Do What It Says" which passes in 2 parameters
function methodSelect(userSelection, doCase) {
	//Switch case that looks at the userSelection parameter
	switch(userSelection) {
		//If user or random.txt specifies Movie Search 
		case "Movie Search":
			//If a second parameter is not present (ie, DoDefault did not pass a second parmameter)
			if(!doCase){
				//Creates new instance of MovieSearch
				var userMovie = new MovieSearch();
				//Enters the prompt function of that constructed object, which allows user to then input value of the movie if he/she wants to
				userMovie.prompt();
				break;
			//Else if second parameter is passed (ie, DoDefault does pass a second parameter)
			} else {
				//Creates new instance of MovieSearch that passes argument of that second parameter
				var userMovie = new MovieSearch(doCase);
				userMovie.search();
				break;
			}
		//If user or random.txt specifies Twitter Search
		case "Twitter Search":
			//If a second parameter is not present (DoDefault did not pass a second parameter)
			if(!doCase){
				//Creates new instance of TwitterSearch
				var userTwitter = new TwitterSearch();
				//Enters the prompt function of that constructed object, which prompts user to input value of handle they want to receive tweets from
				userTwitter.prompt();
				break;
			//If a second parameter is present (DoDefault does pass second parameter in random.txt)
			} else {
				//Creates new instance of TwitterSearch which passes the second parameter from random.txt that was extracted in DoDefault
				var userTwitter = new TwitterSearch(doCase);
				//Enters the new instance's search function using that second parameter that was passed
				userTwitter.search();
				break
			}
		//If user or random.txt specifies Music Search
		case "Music Search":
			//If a second parameter is not present (DoDefault did not pass a second parameter)
			if(!doCase) {
				//Creates new instance of MusicSearch
				var userSong = new MusicSearch();
				//Enters the prompt function of that constructed object, which prompts user to input value of song that they want to search
				userSong.prompt();
				break;
			//Else if second parameter is present (DoDefault does pass second parameter from random.txt)
			} else {
				//Creates new instance of MusicSearch that passes random.txt's second parameter as extracted from DoDefault as the song name to search
				var userSong = new MusicSearch(doCase);
				//Searches for song in random.txt
				userSong.find();
				break;
			}
	}
}

//*******************************************************************
//						USER INTERFACE SECTION
//*******************************************************************
//Function that lets user to initially select which method he wants to look at
function userSelection() {
	//Prompts user for a selection from among a list of options
	inquirer.prompt([
		{
			type: "list",
			name: "methodSelection",
			message: "Please select a method.",
			choices: ["Movie Search", "Twitter Search", "Music Search", "Do What It Says"]
		}
	]).then(function(selection) {
		if (selection.methodSelection != "Do What It Says"){
			methodSelect(selection.methodSelection);
		} else {
			DoDefault();
		}
	});
}

//Starts the program
userSelection();