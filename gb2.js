const searchURL = "https://api.rawg.io/api/games?";

function getGames(search, page_size = 21, ordering) {
  const params = {
    search: search,
    page_size: page_size,
    ordering: "-rating",
  };
  const queryString = formatQueryParams(params);
  const url = searchURL + queryString;

  console.log(url);

  fetch(url)
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then((responseJson) => displayResults(responseJson))
    .catch((err) => {
      $("#js-error-message").text(`Something went wrong: ${err.message}`);
    });
}

function formatQueryParams(params) {
  const queryItems = Object.keys(params).map(
    (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
  );
  return queryItems.join("&");
}

function displayResults(responseJson) {
  console.log(responseJson);
  $(".results").empty();

  for (let i = 0; i < responseJson.results.length; i++) {
    $(".results").append(
      `
      <div class="games">
        <h2>${responseJson.results[i].name}</h2>
        ${
          responseJson.results[i].background_image !== null
            ? `<img src="${responseJson.results[i].background_image}" alt="${responseJson.results[i].name} background image"></p>`
            : ""
        }
        
        <p>Release Date: ${responseJson.results[i].released}</p>
        ${
          responseJson.results[i].metacritic !== null
            ? `<p>Metacritic Score: ${responseJson.results[i].metacritic}</p>`
            : ""
        }
        <a href="#" id="${
          responseJson.results[i].id
        }" class="more-info">More Info and YouTube Review Videos!</a>
      </div>
     `
    );
  }
  $("#results").removeClass("hidden");
}

function searchYoutube(gameName) {
  console.log(gameName);
  var params = {
    part: "snippet",
    key: "AIzaSyBuCHW7S1hpnmSS5jgfK3jqQcn7OTQocKQ",
    q: gameName + "game review IGN",
    maxResults: 3,
    type: "video",
    order: "Relevance",
    safeSearch: "strict",
    relevanceLanguage: "en",
  };
  url = "https://www.googleapis.com/youtube/v3/search";
  $.getJSON(url, params, function (data) {
    showYoutube(gameName, data.items);
  });
}

function showYoutube(gameName, results) {
  console.log(results);
  $(".youtube").empty();

  //Error msg for no search results
  if (results.length === 0) {
    $(".youtube").append("No results found");
  } else {
    for (let i = 0; i < results.length; i++) {
      $(".youtube").append(
        `
        <section>
        <h3>${results[i].snippet.title}</h3><iframe width="420" height="315"
       src="https://www.youtube.com/embed/${results[i].id.videoId}?controls=1" title="${results[i].snippet.title} review video">
        /iframe>`
      );
    }
    $(".youtube").append(
      `<a href="https://www.youtube.com/results?search_query=${gameName}"
        target="blank">More on YouTube</a>`
    );
  }
  $(".modal").scrollTop(0);
}

function displayMoreInfo(id) {
  $(".modal").show();
  console.log({ id });
  $(".modal .modal-image")
    .css("background-image", `url('${id.background_image}')`)
    .removeClass("loading");
  $(".modal p").html(id.description);
  $(".modal h2").text(id.name);
  const gameName = id.name;
  searchYoutube(gameName);
}

function getMoreInfo(id) {
  fetch(`https://api.rawg.io/api/games/${id}`)
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then((responseJson) => displayMoreInfo(responseJson))
    .catch((err) => {
      $("#js-error-message").text(`Something went wrong: ${err.message}`);
    });
}

$(".close").click(closeModal);
$(".overlay").click(closeModal);

function closeModal(e) {
  e.preventDefault();
  $(".modal").hide();
  $(".overlay").hide();
}

function watchForm() {
  $("form").submit((event) => {
    event.preventDefault();
    const game = $("#search-keyword").val();

    getGames(game);
  });
}

function watchMoreInfo() {
  $(".results").on("click", ".more-info", (e) => {
    e.preventDefault();
    $(".modal-image").addClass("loading");
    $(".modal h2").text("Loading...");
    $(".modal").show();
    $(".overlay").show();
    const id = e.target.id;
    getMoreInfo(id);
  });
}

$(watchForm);
$(watchMoreInfo);
