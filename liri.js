//Requiring Request NPM Package
var request = require("request");
//Requiring Inquirer NPM Package
var inquirer = require("inquirer");
//Requirnig Spotify NPM Package
var spotify = require("spotify");
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
//TO DO: Try go get twitter to be responsive to user input

//This code works to get 20 tweets from asiarules - trying to make the screen_name a responsive one that defaults to asiarules
//Twitter search function
// var TwitterSearch = function() {
// 	var params = 
// 		{
// 			screen_name: 'asiarules'	
// 		};
// 	console.log("TWEETS FROM: " + params.screen_name);	
// 	client.get('statuses/user_timeline', params, function(error, tweets, response) {
// 		if (!error) {
// 			for (var i = 0; i < 20; i++){
// 				console.log("Created at: " + tweets[i].user.created_at);
// 				console.log(tweets[i].text + "\n");
// 			}
// 		}
// 	});
// }

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
				// console.log(this.name);
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
			//If no movie name is provided by user
			if (!movie.movieName) {
				//MovieSearch will perform without parameter
				var x = new MovieSearch();
				x.search();
			//Else, if the user put a movie in, the MovieSearch object will search for that movie
			} else {
				var x = new MovieSearch(movie.movieName);
				x.search();
			}
		})
	}
}

//*******************************************************************
//							SPOTIFY SECTION
//*******************************************************************
//Having an issue with the default song not showing up as "The Sign"
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
			console.log(song);
			//If no song name is provided by user
			if (!response.song) {
				//MusicSearch will perform without parameter
				var x = new MusicSearch(song);
				x.find();
			//Else, if the user put a song in, MusicSearch will search for that movie
			} else {
				var x = new MusicSearch(response.song);
				x.find();
			}
		});
	};
	//Uses the Spotify NPM to find the user's song
	this.find = function() {
		spotify.search({ type: 'track', query: song }, function(err, data) {
			console.log(this.song);
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
					console.log(this.song);
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
			choices: ["Movie Search", "Twitter Search", "Music Search"]
		}
	]).then(function(selection) {
		if (selection.methodSelection === "Movie Search") {
			var userMovie = new MovieSearch();
			userMovie.prompt();
		} else if (selection.methodSelection === "Twitter Search") {
			TwitterSearch();
		} else if (selection.methodSelection === "Music Search") {
			var userSong = new MusicSearch();
			userSong.prompt();
		}
	});
}

//Starting the program to let the user select what he/she wants to do
userSelection();

