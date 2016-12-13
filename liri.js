let twitter = require('twitter');
let spotify = require('spotify');
let request = require('request');
let fs = require('fs');
let keys = require('./keys.js');
let source = ''; //global var which sets the source url for the subsequent api calls

//permissible user command, array
let commandList = ['my-tweets', 'spotify-this-song', 'movie-this', 'do-what-it-says'];
let command = process.argv[2].toLowerCase();
let input = process.argv.slice(3).join(' ');
let choice = commandList.indexOf(command);

//basic validation of user command line inputs
if (choice === -1) {
    console.log('Input a valid command, options are \n my-tweets \n spotify-this-song \n movie-this \n do-what-it-says');
} else if (!input) {
    console.log('We will make a selection since you didn\'t input anything');
}

//call for correct api based on user input
if (choice === 0) {
    twitterSearch();
} else if (choice === 1) {
    spotifySearch();
} else if (choice === 2) {
    movieSearch();
} else {
    doWhatItSays();
}

//search for a spotify track
function spotifySearch(input) {
    spotify.search({ type: 'track', query: input }, function(err, data) {
        if (err) {
            console.log('Error occurred: ' + err);
            return;
        }

        //create string of all artist names involved with track
        //grab first track returned
        let artists = data.tracks.items[0].artists;
        artists = artists.reduce((a, b) => {
            return a + b.name + ' '
        }, '');

        console.log('======RESULTS========');
        console.log('Artist(s): ' + artists);
        console.log('Song Name: ' + data.tracks.items[0].name);
        console.log('Preview Link: ' + data.tracks.items[0].href);
        console.log('Album Name: ' + data.tracks.items[0].album.name);
        console.log('=====================');
    });
}

//search for an omdb track
function movieSearch(input) {

    let result = '';

    //default if no user input
    if (!input) {
        input = 'Mr. Nobody';
    }
    // let url = 'http://www.omdbapi.com/?t=' + input + '&plot=short&r=json&tomatoes=true';
    let url = `http://www.omdbapi.com/?t=${input}&plot=short&r=json&tomatoes=true`;

    //execute imdb search via request npm module
    request(url, function(error, response, body) {
        if (!error && (response.statusCode == 200 || response.statusCode == 201)) {
            //parse data into object and grab the data observations component
            let data = JSON.parse(body);

            console.log('======RESULTS========');
            console.log('Title: ' + data.Title);
            console.log('Year Released: ' + data.Year);
            console.log('IMDB Rating: ' + data.imdbRating);
            console.log('Country Produced: ' + data.Country);
            console.log('Language(s): ' + data.Language);
            console.log('Plot: ' + data.Plot);
            console.log('Actors: ' + data.Actors);
            console.log('Rotten Toatoes Rating: ' + data.tomatoRating);
            console.log('Rotten Toatoes URL: ' + data.tomatoURL);
            console.log('=====================');

        } else if (error) {
            console.log('Error' + error);
        }

    });
}

//twitter search fr up the most recent 20 tweets
function twitterSearch(input) {
    //create a new twitter client
    let client = new twitter({
        consumer_key: keys.twitterKeys.consumer_key,
        consumer_secret: keys.twitterKeys.consumer_secret,
        access_token_key: keys.twitterKeys.access_token_key,
        access_token_secret: keys.twitterKeys.access_token_secret,
    });

    //default if no user input
    if (!input) {
        input = 'realDonaldTrump';
    }

    let params = { screen_name: input };

    //print recent tweets
    client.get('statuses/user_timeline/', params, function(error, tweets, response) {
        if (!error) {

            console.log('=======================\n');

            tweets.forEach((cur, ind) => {
                console.log('========Tweet'+ind+'=========');
                console.log(tweets[ind].text + '\n');
            });
            console.log('=======================');

        } else if (error) {
            console.log("Error: " + error);
        }
    });


}

//execute do what it says using the random.txt contents
function doWhatItSays() {
    fs.readFile("random.txt", "utf8", function(error, data) {
        if (!error) {
            randomText = data.split(",");
            let song = randomText[1];
            spotifySearch(song);
        } else {
            console.log('Error: ' + error);
        }
    });
};

