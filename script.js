$(document).ready(function(){

  var PRIV_KEY = "869f38f630192156d452c4e1e4fc8fc67f13a74d";
  var PUBLIC_KEY = "b106b44fbf7b966e7f495d03e27d0183";

  $("#search").keyup(function(){

    if ( $("#search").val() == "" ) {
      $("#search-result").html("");
      $("#pagination .pagination-list").html("");
      showBookmarksList();
    } else {
      $("#bookmarks-list").html("");
    }

      var ts = new Date().getTime();
      var hash = CryptoJS.MD5(ts + PRIV_KEY + PUBLIC_KEY).toString();

      var url = 'https://gateway.marvel.com:443/v1/public/characters';
      console.log(url);

      var search_name = $("#search").val();

      $.getJSON(url, {
        ts: ts,
        apikey: PUBLIC_KEY,
        hash: hash,
        nameStartsWith: search_name
        })
        .done(function(response) {
          //console.log(response.data.results[1].name);
          console.log(response.data.results.length);

          var characters = response.data.results;

          var page = 1;

          drowCharacters(page, characters); // funkcija koja prikazuje rezultate pretrage sa argumentom za prvu stranu
          // na pocetku pretrage, prilikom unosa karaktera uvek ce se prikazivati najpre prva strana dok se preko pager-a ne izabere neka druga

          var total_pages = totalPages(characters); // funkcija koja racuna ukupan broj stranica
          console.log(total_pages);

          if(total_pages > 1) {
            drowPager(total_pages); // funkcija koja prikazuje pager
          } else {
            $("#pagination .pagination-list").html("");
          }

          checkBookmark(); // funkicija provera koji karakteri su dodati na bookmarks listi
                          // i u zavisnosti od toga prikazuje se dugme za dodavanje ili dugme za brisanje iz bookmarks liste


        })
        .fail(function(err){
          // the error codes are listed on the dev site
          $("#search-result").html(err);
        });



  }); // end keyup


}); // end document ready

function changePage(page) {

  $("#pagination .pagination-list .page").removeClass("active");
  $("#pagination .pagination-list .page").eq(page-1).addClass("active");

  var PRIV_KEY = "869f38f630192156d452c4e1e4fc8fc67f13a74d";
  var PUBLIC_KEY = "b106b44fbf7b966e7f495d03e27d0183";

  var ts = new Date().getTime();
  var hash = CryptoJS.MD5(ts + PRIV_KEY + PUBLIC_KEY).toString();

  var url = 'https://gateway.marvel.com:443/v1/public/characters';
  console.log(url);

  var search_name = $("#search").val();

  $.getJSON(url, {
    ts: ts,
    apikey: PUBLIC_KEY,
    hash: hash,
    nameStartsWith: search_name
    })
    .done(function(response) {

      var characters = response.data.results;

      drowCharacters(page, characters); // funkcija koja prikazuje rezultate pretrage sa argumentom za prvu stranu
      // na pocetku pretrage, prilikom unosa karaktera uvek ce se prikazivati najpre prva strana dok se preko pager-a ne izabere neka druga

      checkBookmark(); // funkicija provera koji karakteri su dodati na bookmarks listi
                      // i u zavisnosti od toga prikazuje se dugme za dodavanje ili dugme za brisanje iz bookmarks liste


    })
    .fail(function(err){
      // the error codes are listed on the dev site
      $("#search-result").html(err);
    });
}

function addBookmark(character) {

  var character_name = $(character).parent().find(".character-name").text();
  var img_path = $(character).parent().find("img").attr("src");

  console.log(character_name);
  console.log(img_path);

  var characters = [];

  var characters_bookmark = JSON.parse(localStorage.getItem("characters"));

  if (characters_bookmark == null) {
    characters[0] = {
      "name" : character_name,
      "img_path" : img_path
    }
    localStorage.setItem("characters", JSON.stringify(characters));
  } else {
    characters = characters_bookmark;
    characters[characters.length] = {
      "name" : character_name,
      "img_path" : img_path
    }
    localStorage.setItem("characters", JSON.stringify(characters));
  }

  $(character).parent().find("input.add-bookmark").addClass("hide");
  $(character).parent().find("input.remove-bookmark").removeClass("hide");


} // end addBookmark

function showBookmarksList() {
  var characters = JSON.parse(localStorage.getItem("characters"));
  if (characters == null) {
    $("#bookmarks-list").html("<h2>Bookmarks list</h2><h4>Your bookmarks list is empty</h4>");
  } else {
    var html = "<h2>Bookmarks list</h2>";
    for(var i=0; i<characters.length; i++) {
      html += "<div class='col-lg-3 col-md-3 col-sm-6 col-xs-12'><div class='character-item'>"
        + "<div class=character-name>" + characters[i].name + "</div>"
        + "<input type='button' class='bookmark remove-bookmark' value='Remove from bookmark' onClick=removeBookmark(this)>"
        + "<img src=" + characters[i].img_path + ">"
        + "</div></div>";
    }
    $("#bookmarks-list").html(html);
  }

}

function removeBookmark(character) {
  var character_name = $(character).parent().find(".character-name").text();

  var characters_bookmark = JSON.parse(localStorage.getItem("characters"));

  for(var i=0; i<characters_bookmark.length; i++) {
    if( characters_bookmark[i].name == character_name ) {
      characters_bookmark.splice(i,1);
      break;
    }
  }

  if (characters_bookmark.length > 0) {
    localStorage.setItem("characters", JSON.stringify(characters_bookmark));
  } else {
      localStorage.setItem("characters", "");
      localStorage.removeItem("characters");
  }

  $(character).parent().find("input.add-bookmark").removeClass("hide");
  $(character).parent().find("input.remove-bookmark").addClass("hide");

  if ( $("#search").val() == "" ) {
    $("#search-result").html("");
    showBookmarksList();
  } else {
    $("#bookmarks-list").html("");
  }
}

function checkBookmark() {
  var characters = JSON.parse(localStorage.getItem("characters"));
  var display_characters = $(".character-item");

  for(var i = 0; i < display_characters.length; i++)
    for (var j = 0; j < characters.length; j++) {
      if ( $(display_characters).eq(i).find(".character-name").text() == characters[j].name ) {
        $(display_characters).eq(i).find("input.add-bookmark").addClass("hide");
        $(display_characters).eq(i).find("input.remove-bookmark").removeClass("hide");
      }
    }
}

function totalPages(characters) {
  var character_number = characters.length;
  var total_pages;

  if(character_number % 12 != 0) {
    total_pages = parseInt(character_number/12) + 1;
  } else {
    total_pages = parseInt(character_number/12);
  }

  console.log(total_pages);
  return total_pages;
}

function drowPager(total_pages) {
  var html = "<div class='page active' onClick=changePage(" + 1 + ")>" + 1 + " </div>";
  for(var i=2; i<=total_pages; i++) {
    html += "<div class='page' onClick=changePage(" + i + ")>" + i + " </div>";
  }

  $("#pagination .pagination-list").html(html);
}

function drowCharacters(page, characters) {

  var html = '<h2>Search results</h2>';
  var istart;
  var iend;

  istart = (page-1) * 12;
  if(characters.length < page * 12) {
    iend = characters.length;
  } else {
    iend = page * 12;
  }

  for(var i = istart; i < iend; i++) {
    html += "<div class='col-lg-3 col-md-3 col-sm-6 col-xs-12'><div class='character-item'>"
      + "<div class=character-name>" + characters[i].name + "</div>"
      + "<input type='button' class='bookmark add-bookmark' value='Add to bookmark' onClick=addBookmark(this)>"
      + "<input type='button' class='bookmark remove-bookmark hide' value='Remove from bookmark' onClick=removeBookmark(this)>"
      + "<img src=" + characters[i].thumbnail.path + "." + characters[i].thumbnail.extension + ">"
      + "</div></div>";
  }
  $("#search-result").html(html);
}
