// Define our cat type
type Cat = {
    id: string;
    url: string;
};

// Simple cat data storage
let cats: Cat[] = [];
let likedCats: Cat[] = [];
let currentCatIndex = 0;

// DOM elements
const catContainer = document.getElementById('catContainer');
const resultsDiv = document.getElementById('results');
const resultsText = document.getElementById('resultsText');
const likedCatsDiv = document.getElementById('likedCats');

// Initialize the app
function init() {
    loadCats();
}

function loadCats() {
    const catPromises: Promise<Cat>[] = [];

    for (let i = 0; i < 10; i++) {
        const catPromise = fetch('https://cataas.com/cat?json=true')
            .then(response => response.json())
            .then(data => ({
                id: data._id,
                url: data.url
            }))
            .catch(error => {
                console.log('Error loading cat:', error);
                return {
                    id: 'fallback-' + i,
                    url: 'https://placekitten.com/' + (300 + i) + '/' + (300 + i)
                };
            });

        catPromises.push(catPromise);
    }

    Promise.all(catPromises).then(fetchedCats => {
        cats = fetchedCats;
        showCurrentCat();
    });
}


// Show current cat
function showCurrentCat() {
    if (!catContainer) return;
    
    if (currentCatIndex >= cats.length) {
        showResults();
        return;
    }

    catContainer.innerHTML = `
        <div class="cat-card" id="currentCat">
            <img src="${cats[currentCatIndex].url}" alt="Cat">
            <div class="cat-info">Cat ${currentCatIndex + 1} of ${cats.length}</div>
        </div>
    `;

    setupSwipe();
}

// Set up swipe events
function setupSwipe() {
    const catCard = document.getElementById('currentCat');
    if (!catCard) return;
    
    let startX: number, moveX: number;

    catCard.addEventListener('touchstart', function(e: TouchEvent) {
        startX = e.touches[0].clientX;
    }, {passive: true});

    catCard.addEventListener('touchmove', function(e: TouchEvent) {
        moveX = e.touches[0].clientX;
        const diffX = moveX - startX;
        
        // Only move horizontally
        if (Math.abs(diffX) > 10) {
            e.preventDefault();
            (catCard as HTMLElement).style.transform = `translateX(${diffX}px)`;
        }
    }, {passive: false});

    catCard.addEventListener('touchend', function() {
    const diffX = moveX - startX;

    if (diffX > 100) {
        likedCats.push(cats[currentCatIndex]);
        catCard.classList.add('swipe-right');
    } else if (diffX < -100) {
        catCard.classList.add('swipe-left');
    } else {
        (catCard as HTMLElement).style.transform = '';
        return;
    }

    setTimeout(() => {
        currentCatIndex++;
        showCurrentCat();
    }, 300);
});

}

function showResults() {
    if (!catContainer || !resultsDiv || !resultsText || !likedCatsDiv) return;

    catContainer.style.display = 'none';
    resultsDiv.style.display = 'block';
    resultsText.textContent = `You liked ${likedCats.length} out of ${cats.length} cats`;

    likedCatsDiv.innerHTML = '';
    likedCats.forEach(cat => {
        likedCatsDiv.innerHTML += `<img src="${cat.url}" alt="Liked cat">`;
    });
}

// Start the app
window.onload = init;