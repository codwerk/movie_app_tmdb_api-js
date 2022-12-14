var API_KEY = 'api_key=cc4c125990f5777406886df6fdb3e266';
var BASE_URL = 'https://api.themoviedb.org/3';
var API_URL = BASE_URL + '/discover/movie?sort_by=popularity.desc&'+ API_KEY;
var IMG_URL = 'https://image.tmdb.org/t/p/w500';
var searchURL = BASE_URL + '/search/movie?'+ API_KEY;
var searchGenres = BASE_URL +'/genre/movie/list?'+ API_KEY;

var searchTerm;
var totalResults;
var movies;
var genres = [];
var selectedGenre = [];
var dataMovie;
var embed = []

var currentPage = 1;
var nextPage = 2;
var prevPage = 3;
var lastUrl = '';
var totalPages = 100;

var form = document.getElementById('form');
var tagsEl = document.getElementById('tags');
var nbResult = document.getElementById('nbResult');

var prev = document.getElementById('prev');
var current = document.getElementById('current');
var next = document.getElementById('next');
var mainOffsetT = document.getElementById('main').offsetTop;

var videosMovie = document.getElementById('videos-movie');
var detailsMovie = document.getElementById('details-movie');

var resultsEl = document.querySelector('.movie-list');
var liAll = document.querySelectorAll('#tags li');
var search = form.elements['search'];


form.onsubmit = function(e) {
  e.preventDefault();
  searchTerm = search.value;
  search.value = "";
  selectedGenre = [];
  removeClass();
  if(searchTerm.trim().length === 0) {
    return;
  }
  search ? getMovies(searchURL+'&query='+searchTerm, true) : getMovies(API_URL);
}


// TMDB
window.addEventListener('load', () => {
  listGenres(searchGenres)
  getMovies(API_URL)
})
async function getMovies(url, a) {
  lastUrl = url;
  await fetch(url)
  .then( data => data.json())
  .then( data => {
    if(data){

      totalResults = data.total_results;
      currentPage = data.page;
      prevPage = currentPage - 1;
      nextPage = currentPage + 1;
      totalPages = data.total_pages;

      movies = data.results.map( function(element) { return element}  );
      movies.length !== 0  ? showMovies(movies) : resultsEl.innerHTML = '<h1 class="title">aucun résultat trouvé</h1>';

      if(searchTerm && a) {
        nbResult.textContent = `Nous avons trouvé ${totalResults} ${totalResults > 1 ? 'results' : 'result'} pour ${searchTerm}`;
      } else {
        nbResult.textContent  = ""
      }

      current.textContent = currentPage;

      if(currentPage <= 1) {
        prev.classList.add('disabled');
        next.classList.remove('disabled');
      } else if(currentPage >= totalPages) {
        prev.classList.remove('disabled');
        next.classList.add('disabled');
      } else {
        prev.classList.remove('disabled');
        next.classList.remove('disabled');
      }
    }
    getGenresAndId()
  })
  .catch( error => {
    console.log(error);
  })
}

async function listGenres(url) {
  await fetch(url)
  .then( data => data.json())
  .then( data => {
    let result = ""
    data.genres.forEach( function(genre) {
      result += `<li class="tag" id="${genre.id}">${genre.name}</li>`
    })

    tagsEl.insertAdjacentHTML('beforeend', result)
    selectedGenres(tagsEl)
  })
  .catch( error => {
    console.log(error);
  })
}

async function getDetails (id) {
  await fetch(BASE_URL + '/movie/' +id+ '?'+ API_KEY)
  .then( function (data) { return data.json()})
  .then( function (data) {
    
    if(data){
      dataMovie = data;
      let result = '';
      
      const {original_title, title, genres, overview , homepage, popularity, release_date, revenue, vote_average, vote_count} = dataMovie
      var releaseDate = getDate(release_date);

      result+= `
        <h3>${title}</h3>
        <p>${overview}</p>
        <a href="${homepage}" target="_blank" class="">Homepage</a>
        <p>
          Date : ${releaseDate}
          <br> Popularité: ${popularity} 
          <br> Revenue: ${revenue} 
          <br> Nombre de vote: ${vote_count}
          <br> Moyenne des votes: ${ Math.round(vote_average)}
        </p>
      `

      detailsMovie.insertAdjacentHTML('beforeend', result)
    }
    
  })
}

async function getVideos(id) {
  await fetch(BASE_URL + '/movie/' +id+ '/videos?'+ API_KEY)
  .then( function (data) { return data.json()})
  .then( function (data) {
    
    if(data){
      if(data.results.length > 0) {

  
        let last = data.results.pop();
        const {key, name} = last
        embed.push(`<iframe id="iframe-cont" width="560" height="315" src="https://www.youtube.com/embed/${key}" title="${name}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`);
        // data.results.forEach( ({name, key, site, type}) => {
        //   if(site === 'YouTube' && type === 'Trailer') {
        //     embed.push(`<iframe width="560" height="315" src="https://www.youtube.com/embed/${key}" title="${name}" class="embed hide" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`);
        //   }
        // })
        videosMovie.innerHTML = embed
        // videosMovie.innerHTML += embed.join('');
      } else {
        videosMovie.innerHTML = '<h1 class="title">aucun résultat trouvé</h1>';
      }
    }
    
  })
}

function getColor(vote) {
  if( vote >= 7 ) {
    return 'green'
  } else if( vote >= 5 ) {
    return 'orange'
  } else {
    return 'red'
  }
}

function getDate(date) {
  const str = date;
  const res = new Date(str);
  return res.toLocaleDateString()
}

function getGenresAndId() {

  var dataGenres = Array.prototype.slice.call(document.querySelectorAll('li[data-genres]'));
  var elt;
  var arrayGenre;
  dataGenres.forEach( function(data){
    elt = data;
    arrayGenre = data.dataset.genres.split(",");
    nomGenre(elt, arrayGenre)
  })


  var btns = Array.prototype.slice.call(document.querySelectorAll('.know-more'));
  btns.forEach( function(btn) {
    btn.addEventListener('click', function({target}) {
      getDetails(btn.id)
      getVideos(btn.id)
      openModal(target)
    })
  })

}

function nomGenre(a, b) {
  
  var arrayG = []
  for (let index = 0; index < b.length; index++) {
    var element = b[index];
    if(element) {
      arrayG.push(document.getElementById(element).textContent)
    }
  }
  
  if(arrayG) {
    a.querySelector('#listeGenre').textContent = arrayG.join(', ');
  }
  

}

function showMovies(movies){

  resultsEl.innerHTML = (
    movies.map( movie => (
      `
        <li  class="movie" data-genres="${movie.genre_ids}">
          <div class="movie-link">
            <div class="movie-poster">
                <span class="backdrop-fill">
                  <picture>
                    <img src="${movie.backdrop_path ? IMG_URL+movie.backdrop_path : "http://via.placeholder.com/1080x1580"}" alt="${movie.original_title}">
                  </picture>
                </span>
                <span class="poster-fill">
                  <picture>
                    <img src="${movie.poster_path ? IMG_URL+movie.poster_path : "http://via.placeholder.com/1080x1580"}" alt="${movie.original_title}">
                  </picture>
              </span>
            </div>
            <div class="details">
              <h3>${movie.title}</h3>
              <p>${getDate(movie.release_date)}</p>
              <ul id="listeGenre"></ul>
              <span class="${getColor(movie.vote_average)}">${Math.round(movie.vote_average)}</span>
              <a class="know-more" href="#modal1" role="link" id="${movie.id}">savoir plus</a>
            </div>
            <div class="overview">
              <h3>Overview</h3>
              <p>${movie.overview}</p>
            </div>
          </div>
        </li>
      `
    )).join('')
  )
}

function selectedGenres(params) {;
  var all = Array.prototype.slice.call(params.children)

  all.forEach( li => {
    li.addEventListener('click', function() {
      if(selectedGenre.length === 0) {

        selectedGenre.push(li.id)
      } else {
        if(selectedGenre.includes(li.id)){
            
              selectedGenre.forEach(function(id, idx) {
                if(li.id === id) {
                  selectedGenre.splice(idx, 1)
                }
              })
            
        } else {

          selectedGenre.push(li.id)
        }
      }
      getMovies(API_URL+'&with_genres='+encodeURI(selectedGenre.join(',')));
      highlightSelection();
    })

  })
}

function removeClass() {
  var tags = Array.prototype.slice.call(tagsEl.children)
  tags.forEach( function(tag) {
    tag.classList.remove('active')
  })

}

function highlightSelection() {

  removeClass()
  clearBtn()

  if(selectedGenre.length !== 0) {
    selectedGenre.forEach( function(id) {
      var highlightTag = document.getElementById(id);
      highlightTag.classList.add('active');
    })
  }else {
    document.getElementById('clear').remove();
  }

}

function clearBtn() {
  let clearBtn = document.getElementById('clear')

  if (clearBtn) {
    clearBtn.classList.add('active');
  } else {
    let clear = document.createElement('button');
    clear.classList.add('tag', 'active');
    clear.id = 'clear';
    clear.textContent = 'Clear';

    clear.addEventListener('click', function() {
      selectedGenre = []
      removeClass()
      getMovies(API_URL)
      document.getElementById('clear').remove();
    })

    tagsEl.append(clear) 
  }
}

prev.addEventListener('click', function() {
  if(prevPage > 0) {
    pageCall(prevPage)
  }
})
next.addEventListener('click', function() {
  if(nextPage <= totalPages) {
    pageCall(nextPage)
  }
})

function pageCall(page) {
  
  let urlSplit = lastUrl.split('?'); // enlever le symbole '?'
  let queryParams = urlSplit[1].split('&') // enlever le symbole '&'
  let key = queryParams[queryParams.length-1].split('=')

  window.scrollTo({
    top: mainOffsetT,
    behavior: "smooth"
  })

  if (key[0] != 'page') {
    let url = lastUrl+'&page='+page;
    getMovies(url)
  } else {

    key[1] = page.toString();
    var a =  key.join('=')
    queryParams[queryParams.length-1] = a;
    var b = queryParams.join('&') 
    // on regroupe l'array queryParams et regoupe l'ensemble des chaines de caractère avec '&' 
    // ex : Array(3) [ "sort_by=popularity.desc", "api_key=1cf50e6248dc270629e802686245c2c8", "page=2" ]
    // resultat : sort_by=popularity.desc&api_key=1cf50e6248dc270629e802686245c2c8&page=3
    let url = urlSplit[0] + '?' + b;
    getMovies(url)
    
  }
}


var open = document.querySelectorAll('.know-more');
var headerClose = document.querySelector('#headerClose');
open.forEach( btn => {
  btn.addEventListener('click', openModal)
})
headerClose.addEventListener('click', hiddenModal)

function hiddenModal() {
  modal = document.getElementById('modal1');
  modal.setAttribute('aria-modal', 'false');
  dataMovie = "";
  embed = []
  detailsMovie.innerHTML = "";
  videosMovie.innerHTML = "";

  setTimeout(() => {
    console.clear()
  }, 3500)
}

function openModal(elt) {
  var target = elt;
  var anchor = target.getAttribute('href');
  var s = anchor.substr(anchor.indexOf("#"));

  var modal = document.querySelector(s);
  modal.setAttribute('aria-modal', 'true');
  
  setTimeout(() => {
    console.clear()
  }, 3500)
  
}