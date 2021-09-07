// PROVIDED CODE BELOW (LINES 1 - 80) DO NOT REMOVE

// The store will hold all information needed globally
var store = {
	track_id: undefined,
	player_id: undefined,
	race_id: undefined,
	tracks: undefined
}

// We need our javascript to wait until the DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
	onPageLoad()
	setupClickHandlers()
})

async function onPageLoad() {
	try {
		const tracks = await getTracks();
		const html = renderTrackCards(tracks);
		tracksToStore(tracks);
		renderAt('#tracks', html);
	} catch (error) {
		const errorHtml = `<h4 style='color:red'>Could not download track information</h4>`;
		renderAt('#tracks', errorHtml);
		console.log(error);
		console.error(error);
	}

	try {
		const racers = await getRacers();
		const html = renderRacerCars(racers)
		renderAt('#racers', html)
	} catch (error) {
		const errorHtml = `<h4 style='color:red'>Could not download racers information</h4>`;
		renderAt('#racers', errorHtml);
		console.log(error);
		console.error(error);
	}
}

function tracksToStore(tracks) {
	store.tracks = tracks;
}

function setupClickHandlers() {
	document.addEventListener('click', function (event) {
		const { target } = event

		// Race track form field
		if (target.matches('.card.track')) {
			handleSelectTrack(target)
		}

		// Podracer form field
		if (target.matches('.card.podracer')) {
			handleSelectPodRacer(target)
		}

		// Submit create race form
		if (target.matches('#submit-create-race')) {
			event.preventDefault()

			// start race
			handleCreateRace()
		}

		// Handle acceleration click
		if (target.matches('#gas-peddle')) {
			handleAccelerate(target)
		}

	}, false)
}

async function delay(ms) {
	try {
		return await new Promise(resolve => setTimeout(resolve, ms));
	} catch (error) {
		console.log("an error shouldn't be possible here")
		console.log(error)
	}
}
// ^ PROVIDED CODE ^ DO NOT REMOVE

// This async function controls the flow of the race, add the logic and error handling
async function handleCreateRace() {

	try {
		//Get player_id and track_id from the store
		const player_id = store.player_id;
		const track_id = store.track_id;
		// console.log('PlayerID', store.player_id);

		//Get tracks info from store
		const track_info = store.tracks.find((element) => element.id === track_id);

		// render starting UI
		renderAt('#race', renderRaceStartView(track_info))

		//Create Race API Call
		const race = await createRace(player_id, track_id);

		//update the store with the race id
		store.race_id = race.ID;

		// The race has been created, now start the countdown
		await runCountdown();

		// call the async function startRace
		await startRace(store.race_id);

		//call the async function runRace
		await runRace(store.race_id);

	} catch (error) {
		console.log(error);
		//output to the webpage here 
		renderAt('#leaderBoard', '<h3>Issue running the race, please refresh page and try again</h3>');
	}

}

function runRace(raceID) {

	return new Promise((resolve, reject) => {
		//use Javascript's built in setInterval method to get race info every 500ms
		const raceInterval = setInterval(async () => {
			try {
				const res = await getRace(raceID);
				if (res.status === 'in-progress') {
					renderAt('#leaderBoard', raceProgress(res.positions))
				}
				if (res.status === 'finished') {
					clearInterval(raceInterval) // to stop the interval from repeating
					renderAt('#race', resultsView(res.positions)) // to render the results view
					resolve(res) // resolve the promise
				}
			} catch (error) {
				clearInterval(raceInterval);
				console.log(error);
				reject(error)
			}
		}, 500);
	})
}

async function runCountdown() {
	try {
		// wait for the DOM to load
		await delay(1000)
		let timer = 3

		return new Promise((resolve, reject) => {
			const countDown = setInterval(((timer) => {
				return function () {
					try {
						document.getElementById('big-numbers').innerHTML = --timer;
						if (timer === 0) {
							resolve();
							clearInterval(counDownt);
						}
					} catch (error) {
						reject('Issue with countdown timer');
					}
				}
			})(timer), 1000);
		});
	} catch (error) {
		console.log(error);
		throw new Error('Issue with Countdown code');
	}
}

function handleSelectPodRacer(target) {
	console.log("selected a pod", target.id)

	// remove class selected from all racer options
	const selected = document.querySelector('#racers .selected')
	if (selected) {
		selected.classList.remove('selected')
	}

	// add class selected to current target
	target.classList.add('selected')

	// Save the selected racer to the store
	store.player_id = parseInt(target.id);
}

function handleSelectTrack(target) {
	console.log("selected a track", target.id)

	// remove class selected from all track options
	const selected = document.querySelector('#tracks .selected')
	if (selected) {
		selected.classList.remove('selected')
	}

	// add class selected to current target
	target.classList.add('selected')

	//save the selected track id to the store
	store.track_id = parseInt(target.id);
}

function viewStore() {
	console.log('here is the store');
	console.log(store);
}

async function handleAccelerate() {
	console.log("accelerate button clicked")
	try {
		await accelerate(store.race_id);
	} catch (error) {
		console.log(error);
		renderAt('#gas-peddle', '<h3>There is an issue with the accelerator operation please refresh page</h3>');
	}
}

// HTML VIEWS ------------------------------------------------
// Provided code - do not remove

function renderRacerCars(racers) {
	if (!racers.length) {
		return `
			<h4>Loading Racers...</4>
		`
	}

	const results = racers.map(renderRacerCard).join('')

	return `
		<ul id="racers">
			${results}
		</ul>
	`
}

function renderRacerCard(racer) {
	const { id, driver_name, top_speed, acceleration, handling } = racer

	return `
		<li class="card podracer" id="${id}">
			<h3>${driver_name}</h3>
			<p>${top_speed}</p>
			<p>${acceleration}</p>
			<p>${handling}</p>
		</li>
	`
}

function renderTrackCards(tracks) {
	if (!tracks.length) {
		return `
			<h4>Loading Tracks...</4>
		`
	}

	const results = tracks.map(renderTrackCard).join('')

	return `
		<ul id="tracks">
			${results}
		</ul>
	`
}

function renderTrackCard(track) {
	const { id, name } = track

	return `
		<li id="${id}" class="card track">
			<h3>${name}</h3>
		</li>
	`
}

function renderCountdown(count) {
	return `
		<h2>Race Starts In...</h2>
		<p id="big-numbers">${count}</p>
	`
}

function renderRaceStartView(track, racers) {
	return `
		<header>
			<h1>Race: ${track.name}</h1>
		</header>
		<main id="two-columns">
			<section id="leaderBoard">
				${renderCountdown(3)}
			</section>

			<section id="accelerate">
				<h2>Directions</h2>
				<p>Click the button as fast as you can to make your racer go faster!</p>
				<button id="gas-peddle">Click Me To Win!</button>
			</section>
		</main>
		<footer></footer>
	`
}

function resultsView(positions) {
	positions.sort((a, b) => (a.final_position > b.final_position) ? 1 : -1)

	return `
		<header>
			<h1>Race Results</h1>
		</header>
		<main>
			${raceProgress(positions)}
			<a href="/race">Start a new race</a>
		</main>
	`
}

function raceProgress(positions) {
	console.log(store.player_id);
	console.log(positions);
	let userPlayer = positions.find(e => e.id === store.player_id);
	console.log(userPlayer);
	userPlayer.driver_name += " (you)"

	positions = positions.sort((a, b) => (a.segment > b.segment) ? -1 : 1)
	let count = 1

	const results = positions.map(p => {
		return `
			<tr>
				<td>
					<h3>${count++} - ${p.driver_name}</h3>
				</td>
			</tr>
		`
	})

	return `
		<main>
			<h3>Leaderboard</h3>
			<section id="leaderBoard">
				${results}
			</section>
		</main>
	`
}

function renderAt(element, html) {
	const node = document.querySelector(element)

	node.innerHTML = html
}

// ^ Provided code ^ do not remove


// API CALLS ------------------------------------------------

const SERVER = 'http://localhost:8000'

function defaultFetchOpts() {
	return {
		mode: 'cors',
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': SERVER,
		},
	}
}

//Make a fetch call (with error handling!) to each of the following API endpoints 

async function getTracks() {
	try {
		const response = await fetch(`${SERVER}/api/tracks`)
		const tracks = await response.json();
		return tracks;
	} catch (error) {
		throw new Error('Could not get track information');
	}

}

async function getRacers() {
	try {
		const response = await fetch(`${SERVER}/api/cars`)
		const racers = await response.json();
		return racers;
	} catch (error) {
		throw new Error('Could not get racer information');
	}
}

function createRace(player_id, track_id) {
	player_id = parseInt(player_id)
	track_id = parseInt(track_id)
	const body = { player_id, track_id }
	return fetch(`${SERVER}/api/races`, {
		method: 'POST',
		...defaultFetchOpts(),
		dataType: 'jsonp',
		body: JSON.stringify(body)
	})
		.then(res => res.json())
		.catch(err => console.log("Problem with createRace request::", err))
}

async function getRace(id) {
	try {
		const response = await fetch(`${SERVER}/api/races/${returnBugFreeID(id)}`);
		const data = await response.json();
		return data;
	} catch (error) {
		console.log('There has been a problem getting race info');
		throw new Error(error);
	}

}

function startRace(id) {

	return fetch(`${SERVER}/api/races/${returnBugFreeID(id)}/start`, {
		method: 'POST',
		...defaultFetchOpts()
	}).catch(err => {
		console.log("Problem with getRace request::", err)
		throw new Error(`problem starting the race`);
	})
}

//There is a debug in the API that means the id should be one less than it is
const returnBugFreeID = (id) => parseInt(id) - 1;

async function accelerate(id) {
	try {
		const res = await fetch(`${SERVER}/api/races/${returnBugFreeID(id)}/accelerate`, {
			method: 'POST',
			...defaultFetchOpts()
		});
	} catch (error) {
		throw new Error('There has been an error trying to accelerate');
	}
}
