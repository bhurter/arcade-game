// Enemies our player must avoid
var Enemy = function ( x, y, speed ) {
	// Variables applied to each of our instances go here,
	// we've provided one for you to get started
	this.x = x;
	this.y = y;
	this.speed = speed;
	// The image/sprite for our enemies, this uses
	// a helper we've provided to easily load images
	this.sprite = 'images/enemy-bug1.png';
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function ( dt ) {
	// You should multiply any movement by the dt parameter
	// which will ensure the game runs at the same speed for
	// all computers.
	this.x += ( this.speed * dt );
	if ( this.x >= maxWidth ) {
		this.x = 0;
	}
	this.checkCollision();
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function () {
	ctx.drawImage( Resources.get( this.sprite ), this.x, this.y );
	this.height = Resources.get( this.sprite ).height;
	this.width = Resources.get( this.sprite ).width;
};

Enemy.prototype.checkCollision = function () {
	// added multiplier  to give more flexibility with collisions
	if ( ( this.x + .75 * this.width >= player.x ) &&
		( this.x <= player.x + .75 * player.width ) &&
		( this.y <= player.y + .75 * player.height ) &&
		( this.y + .75 * this.height >= player.y )
	) {
		console.log( 'collision at enemy.x = ' + this.x + 'and player.x = ' + player.x );
		console.log( 'collision at enemy.y = ' + this.y + 'and player.y = ' + player.y );
		boing.play();
		addHeart( -1 );
		resetPlayer();
	}
};
// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
// Enemies our player must avoid
var Player = function ( x, y, moveX, moveY, sprite ) {
	this.x = x
	this.y = y
	this.moveX = moveX;
	this.moveY = moveY;
	this.sprite = sprite;
	this.gameScore = 0;

	// The image/sprite for our player, this uses
	// a helper we've provided to easily load images
	//this.sprite = 'images/char-horn-girl1.png';
};

// Update the player's position, required method for game
// Parameter: dt, a time delta between ticks
Player.prototype.update = function () {
	// You should multiply any movement by the dt parameter
	// which will ensure the game runs at the same speed for
	// all computers.
	var maxX = maxWidth - this.width;
	var maxY = maxHeight - ( this.height + moveX );

	if ( this.y <= this.height ) { //0 ) {
		// made it to top!  Increase level and go again

		setTimeout( this.goalAchieved(), 1500 );

	} else if ( this.y >= maxY ) {
		// tried to move down below bottom of playing field.  Don't allow
		this.y = maxY;
	}

	if ( this.x <= 0 ) {
		// tried to move of left of playing field.  Don't allow
		this.x = 0;
	} else if ( this.x >= maxX ) { //maxWidth ) {
		//tried to move off right of playing field.  Don't allow.
		this.x = maxX;
	}

};

// Draw the player on the screen, required method for game
Player.prototype.render = function () {
	ctx.drawImage( Resources.get( this.sprite ), this.x, this.y );
	this.height = Resources.get( this.sprite ).height;
	this.width = Resources.get( this.sprite ).width;
};


Player.prototype.handleInput = function ( keyPress ) {

	switch ( keyPress ) {
	case "left": //move left
		if ( this.x - this.moveX >= 0 ) {
			this.x -= this.moveX;
		} else {
			this.x = 0;
		}
		break;

	case "up": //move up
		if ( this.y - this.moveY >= 0 ) {
			this.y -= this.moveY;
		} else {
			this.y = 0;
		}
		break;

	case "right": //move right
		if ( this.x + this.moveX <= maxWidth ) {
			this.x += this.moveX;
		} else {
			this.x = maxWidth - this.width;
		}
		break;

	case "down": //move down
		if ( this.y + this.moveY <= maxHeight ) {
			this.y += this.moveY;
		} else {
			this.y = maxHeight - this.height;
		}
		break;

	default: // do nothing
		break;
	}
	for ( let i = 1; i <= 5; i++ ) {
		walking.play();
	}

}

Player.prototype.goalAchieved = function () {
	// TODO  pause game so user knows they made it to Top - NOT WORKING right now
	// TODO  add "congrats message"
	//this.render();

	console.log( "Level Up" );
	success.play();
	addLevel();
	addHeart( 1 );
	this.gameScore += 5000;
	let milliseconds = Date.now() - this.timeStart;
	if ( milliseconds < 5000 ) {
		this.gameScore += ( 5000 - milliseconds ) * 10;
	}
	updateGameScore( this.gameScore );
	reset( this, startX, startY );
}

/*
 * Sound object
 */
var Sound = function ( src ) {
	this.sound = document.createElement( "audio" );
	this.sound.src = src;
	this.sound.setAttribute( "preload", "auto" );
	this.sound.setAttribute( "controls", "none" );
	this.sound.style.display = "none";
	document.body.appendChild( this.sound );
}
Sound.prototype.play = function () {
	this.sound.play();
}

Sound.prototype.stop = function () {
	this.sound.pause();
}

/*
 * Wait function - wait for amount of time, then send player back to start again.
 * Can be used when player reaches the top
 * TBD - can I use this also when there is a collision?
 */

function wait( ms ) {
	return new Promise( function ( resolve ) {
		window.setTimeout( function () {
			resolve()
		}, ms );
	} )
}

function reset( gameCharacter, x, y ) {
	gameCharacter.x = x;
	gameCharacter.y = y;
	gameCharacter.timeStart = Date.now();

};

// TODO - game over modal
// TODO - settings
// TODO - sounds
// TODO - test speeds and positions - need to adjust
// TODO - styling on main page
// TODO - add background images


// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

function addEnemy() {
	var loc = randomInt( enemyMinY, enemyMaxY );
	//var speed = speedMin + ( speedInc * gameLevel );
	var speed = randomInt( speedMin, speedMax );
	const enemy = new Enemy( 0, loc, speed );
	allEnemies.push( enemy );
}

function addLevel() {
	addEnemy();
	gameLevel = gameLevel + 1;
	document.getElementById( "level" ).innerHTML = "Level: " + gameLevel;
}

function addHeart( num ) {
	lives += num;
	if ( lives > 5 ) {
		lives = 5;
	} else if ( lives < 0 ) {
		lives = 0;
	}
	let hearts = document.getElementById( "hearts" );
	let numHearts = hearts.childElementCount;

	for ( let i = 0; i < numHearts; i++ ) {
		let heart = hearts.children[ i ];
		if ( i < lives ) {
			heart.innerHTML = '<i class="fa fa-heart red-heart"></i>';
		} else {
			heart.innerHTML = '<i class="fa fa-heart-o red-heart"></i>';
		}
	}

}

function updateGameScore( myScore ) {
	document.getElementById( "score" ).innerHTML = "Score:  " + myScore;
}


function resetPlayer() {
	reset( player, startX, startY );
	if ( lives <= 0 ) {
		gameOver();
	}
}

function gameOver() {
	allEnemies.length = 0;
	$( '#gameOver' ).modal();
	//gameOverVoice.play();
}

function randomInt( min, max ) {
	return Math.floor( Math.random() * ( max - min + 1 ) + min );
}

function newGame() {
	gameOverVoice.stop();
	gameLevel = 1;
	document.getElementById( "level" ).innerHTML = "Level: " + gameLevel;
	allEnemies.length = 0;
	addEnemy();
	addHeart( 5 );
	player.gameScore = 0;
	updateGameScore( player.gameScore );
}

var maxWidth = 505;
var maxHeight = 606;
var nRows = 6;
var nCols = 5;
var tileWidth = maxWidth / nCols;
var tileHeight = 83; //maxHeight / 6;
var allEnemies = [];
var startX = ( Math.round( nCols / 2 ) - 1 ) * tileWidth;
var startY = tileHeight * ( nRows - 1 );
var gameLevel = 1;
var lives = 0;
var enemyMinY = tileHeight
var enemyMaxY = tileHeight * 4;
var speedMin = 50;
var speedMax = 150;
var moveX = tileWidth / 3;
var moveY = tileHeight / 3;
var playerImg = 'images/char-horn-girl1.png'

if ( nCols % 2 === 0 ) {
	startX = ( nCols / 2 ) * tileWidth - ( Math.round( tileWidth / 2 ) );
} else {
	startX = ( Math.round( nCols / 2 ) - 1 ) * tileWidth;
}

// add an enemy to the enemies array
//addEnemy();

const player = new Player( startX, startY, moveX, moveY, playerImg );
/* const tada = new Sound( "sounds/tada.mp3" ); */
const boing = new Sound( "sounds/boing.wav" );
const gameOverVoice = new Sound( "sounds/gameover.mp3" );
const walking = new Sound( "sounds/walking.wav" );
const success = new Sound( "sounds/success.wav" );
newGame();


// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener( 'keyup', function ( e ) {
	var allowedKeys = {
		37: 'left',
		38: 'up',
		39: 'right',
		40: 'down'
	};

	player.handleInput( allowedKeys[ e.keyCode ] );
} );



// add event listener for reset button
document.getElementById( 'restart' ).addEventListener( 'click', function () {
	newGame();
} );
