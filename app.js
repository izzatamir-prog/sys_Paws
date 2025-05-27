var cats = [];
var likedCats = [];
var currentCatIndex = 0;

var catContainer = document.getElementById('catContainer');
var resultsDiv = document.getElementById('results');
var resultsText = document.getElementById('resultsText');
var likedCatsDiv = document.getElementById('likedCats');

function init() {
    loadCats();
}
function loadCats() {
    var catPromises = [];
    var _loop_1 = function (i) {
        var catPromise = fetch('https://cataas.com/cat?json=true')
            .then(function (response) { return response.json(); })
            .then(function (data) { return ({
            id: data._id,
            url: data.url
        }); })
            .catch(function (error) {
            console.log('Error loading cat:', error);
            return {
                id: 'fallback-' + i,
                url: 'https://placekitten.com/' + (300 + i) + '/' + (300 + i)
            };
        });
        catPromises.push(catPromise);
    };
    for (var i = 0; i < 10; i++) {
        _loop_1(i);
    }
    Promise.all(catPromises).then(function (fetchedCats) {
        cats = fetchedCats;
        showCurrentCat();
    });
}
function showCurrentCat() {
    if (!catContainer)
        return;
    if (currentCatIndex >= cats.length) {
        showResults();
        return;
    }
    catContainer.innerHTML = "\n        <div class=\"cat-card\" id=\"currentCat\">\n            <img src=\"".concat(cats[currentCatIndex].url, "\" alt=\"Cat\">\n            <div class=\"cat-info\">Cat ").concat(currentCatIndex + 1, " of ").concat(cats.length, "</div>\n        </div>\n    ");
    setupSwipe();
}
function setupSwipe() {
    var catCard = document.getElementById('currentCat');
    if (!catCard)
        return;
    var startX, moveX;
    catCard.addEventListener('touchstart', function (e) {
        startX = e.touches[0].clientX;
    }, { passive: true });
    catCard.addEventListener('touchmove', function (e) {
        moveX = e.touches[0].clientX;
        var diffX = moveX - startX;

        if (Math.abs(diffX) > 10) {
            e.preventDefault();
            catCard.style.transform = "translateX(".concat(diffX, "px)");
        }
    }, { passive: false });
    catCard.addEventListener('touchend', function () {
        var diffX = moveX - startX;
        if (diffX > 100) {
            likedCats.push(cats[currentCatIndex]);
            catCard.classList.add('swipe-right');
        }
        else if (diffX < -100) {
            catCard.classList.add('swipe-left');
        }
        else {
            catCard.style.transform = '';
            return;
        }
        setTimeout(function () {
            currentCatIndex++;
            showCurrentCat();
        }, 300);
    });
}
function showResults() {
    if (!catContainer || !resultsDiv || !resultsText || !likedCatsDiv)
        return;
    catContainer.style.display = 'none';
    resultsDiv.style.display = 'block';
    resultsText.textContent = "You liked ".concat(likedCats.length, " out of ").concat(cats.length, " cats");
    likedCatsDiv.innerHTML = '';
    likedCats.forEach(function (cat) {
        likedCatsDiv.innerHTML += "<img src=\"".concat(cat.url, "\" alt=\"Liked cat\">");
    });
}


window.onload = init;
