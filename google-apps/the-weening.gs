const omdbApiKey = 'your-key-here'; // API key to the OMDb API
const tmdbApiKey = 'your-key-here' // API key to the TMDb API


// OMDb Functions ------------------------------------------------------------

function getImdbData(imdbId) {
    const url = `http://www.omdbapi.com/?i=${encodeURIComponent(imdbId)}&plot=full&apikey=${omdbApiKey}`;

    // Make the API request
    const response = UrlFetchApp.fetch(url);
    const responseText = response.getContentText();
    Logger.log(responseText);  // Log the response for inspection

    const data = JSON.parse(responseText);

    // Check if the response contains a valid movie
    if (data.Response === "True") {
        // Prepare the data you want to display
        // var imdbLink = 'https://imdb.com/title/' + imdbId;

        const releasedDateParts = data.Released.split(' ');
        const releasedDate = `${releasedDateParts[1]} ${releasedDateParts[0]}`;

        var runtimeStr = data.Runtime;
        if (runtimeStr && runtimeStr.includes('min')) {
            var totalMinutes = parseInt(runtimeStr.replace(' min', ''));
            var hours = Math.floor(totalMinutes / 60);
            var minutes = totalMinutes % 60;
            runtimeStr = hours + 'h ' + minutes + 'm';
        } else {
            runtimeStr = 'Not available';
        }

        const movieData = [
            // '=HYPERLINK("'+imdbLink+'", "[IMDb]")',
            releasedDate,
            data.Year,
            data.Plot,
            data.Rated,
            runtimeStr,
            data.Director,
            data.Writer,
            data.Actors
        ];

        // // Get the active sheet and the cell that called the function
        // const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
        // const cell = sheet.getActiveCell();

        // // Write the data horizontally starting from the active cell
        // const startRow = cell.getRow();
        // const startColumn = cell.getColumn();
        // // sheet.getRange(startRow, startColumn, 1, movieData.length).setValues([movieData]);

        // return "Data displayed successfully";
        return movieData;
    } else {
        return "Movie not found";
    }
}


function getIMDBSynopsis(imdbID) {
    const url = `http://www.omdbapi.com/?i=${encodeURIComponent(imdbID)}&apikey=${omdbApiKey}`;

    // Make the API request
    const response = UrlFetchApp.fetch(url);
    const data = JSON.parse(response.getContentText());

    // Check if the response contains a valid movie
    if (data.Response === "True") {
        return data.Plot;  // Return the movie plot/synopsis
    } else {
        return "Movie not found";
    }
}

function getIMDBIdentifier(title) {
    const url = `http://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${omdbApiKey}`;

    // Make the API request
    const response = UrlFetchApp.fetch(url);
    const data = JSON.parse(response.getContentText());

    // Check if the response contains a valid movie
    if (data.Response === "True") {
        return data.imdbID;  // Return the movie plot/synopsis
    } else {
        return "Movie not found";
    }
}

function getReleaseYear(imdbID) {
    const url = `http://www.omdbapi.com/?i=${encodeURIComponent(imdbID)}&apikey=${omdbApiKey}`;

    // Make the API request
    const response = UrlFetchApp.fetch(url);
    const data = JSON.parse(response.getContentText());

    // Check if the response contains a valid movie
    if (data.Response === "True") {
        return data.Year;  // Return the movie plot/synopsis
    } else {
        return "Movie not found";
    }
}

function getMovieRuntime(imdbID) {
    const url = `http://www.omdbapi.com/?i=${encodeURIComponent(imdbID)}&apikey=${omdbApiKey}`;

    // Fetch the movie data from the OMDb API
    var response = UrlFetchApp.fetch(url);
    var data = JSON.parse(response.getContentText());

    if (data.Response == "True") {
        var runtimeStr = data.Runtime; // Runtime in the format "XX min"

        if (runtimeStr && runtimeStr.includes('min')) {
            var totalMinutes = parseInt(runtimeStr.replace(' min', ''));
            var hours = Math.floor(totalMinutes / 60);
            var minutes = totalMinutes % 60;
            return hours + 'h ' + minutes + 'm';
        } else {
            return 'Not available';
        }
    } else {
        return 'Movie not found';
    }
}

// Fandango ------------------------------------------------------------------

function getFandangoLink(movieTitle, date) {
    // URL encode the movie title and date
    var encodedTitle = encodeURIComponent(movieTitle);
    var encodedDate = encodeURIComponent(date);

    // Construct the Fandango URL (this example assumes searching by title and date)
    var fandangoBaseUrl = "https://www.fandango.com/search?q=";
    var searchUrl = fandangoBaseUrl + encodedTitle + "&date=" + encodedDate;

    return searchUrl;
}

function fandangoLink(movieTitle, date) {
    var url = getFandangoLink(movieTitle, date);
    return '=HYPERLINK("' + url + '", "Fandango: ' + movieTitle + ' on ' + date + '")';
}

// TMDb Functions ------------------------------------------------------------

/**
 * Get TMDb movie ID from an IMDb ID
 *
 * @param {string} imdbId The IMDb ID (e.g., "tt1922777")
 * @return {string} The TMDb ID, or an error message
 * @customfunction
 */
function GET_TMDB_ID(imdbId) {
    if (!imdbId) {
        return "";
    }

    var url = "https://api.themoviedb.org/3/find/" + encodeURIComponent(imdbId) +
        "?external_source=imdb_id&api_key=" + tmdbApiKey;

    try {
        var response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
        var data = JSON.parse(response.getContentText());

        if (data.movie_results && data.movie_results.length > 0) {
            return data.movie_results[0].id; // TMDb ID
        } else if (data.tv_results && data.tv_results.length > 0) {
            return data.tv_results[0].id; // In case it's a TV show
        } else {
            return "Not found";
        }
    } catch (e) {
        return "Error: " + e.message;
    }
}

function getTmdbPoster(tmdbId) {
    const url = `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${tmdbApiKey}`;
    const response = UrlFetchApp.fetch(url);
    const data = JSON.parse(response.getContentText());
    return `https://image.tmdb.org/t/p/w500${data.poster_path}`;
}
