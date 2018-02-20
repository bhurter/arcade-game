/*
 *
 * 	Sadie Hawkins Day Race
 *
 * 	This game is a takeoff on Sadie Hawkins day, where the girls chase the young
 *	men. (See http://lil-abner.com/sadie-hawkins-day/)
 *
 *	The enemies are:
 *    Princess
 *    Cat-girl
 *    Horn-girl
 *    Pink-girl
 *
 * 	As the player, you are the boy.  Your mission is to reach the water without
 *	being "caught" by a girl.
 *
 * 		1. Use the up, down, left and right arrows to move the player.
 * 		2. If you are "caught", you lose a heart and have to try again.
 * 		3. When you reach the top you "level up" and receive:
 *    	• A new life (heart)
 *    	• 5,000 points
 *    	• 10 points for every millisecond below 5 seconds time that it takes to
 *					reach the top
 *			•	and...  Lookout.  Another girl joins the chase!
 *
 * TODO - settings - add settings to turn off sound, etc.
 * TODO - keep log of high scores
 * TODO - dynamically create hearts elements
 *
 */


/*******************************************************************************
 * Define the Sprite class
 *
 *  Properties:
 *		x - the horizontal position on the game canvas
 *		y - the vertical position on the game canvas
 *		speed - the speed at which the sprite will move
 *		sprite - the path to the image to use for the sprite
 *		height - the height in pixels of the sprite
 *		width - the width in pixels of the sprite
 *	Methods:
 *	  update - updates the sprite's position on the canvas
 * 		render - draw the sprite on the screen
 *		checkCollision - check for a collision with the Player
 ******************************************************************************/

var Sprite = function ( x, y, speed, sprite ) {

	this.x = x; // the x position where this Sprite will start
	this.y = y; // the y position where this sprite will start
	this.speed = speed; // the speed at which this Sprite will move
	this.sprite = sprite; // the image to use for this Sprite
};

/*------------------------------------------------------------------------------
 * render Prototype:  This prototype function draws the Sprite on the screen.
 * It is a required method for the game
 *		ctx - the game canvas
 *		this - the Sprite that is being rendered
 *----------------------------------------------------------------------------*/

Sprite.prototype.render = function () {

	// draw the image
	ctx.drawImage( Resources.get( this.sprite ), this.x, this.y );

	//now, get the height and width of the sprite for future calculations
	this.height = Resources.get( this.sprite ).height;
	this.width = Resources.get( this.sprite ).width;
};


/*******************************************************************************
 *
 * Define the Enemey class
 *
 *  Properties:  Inherited from Sprite
 *	Methods:
 * 	render - inherited from Sprite
 *		update - Unique to Enemy:  updates the Enemy position
 *		checkCollision - Unique to Enemy:  check for a collision with the Player
 *
 ******************************************************************************/

var Enemy = function ( x, y, speed, sprite ) {

	// invoke the Sprite super constructer
	Sprite.call( this, x, y, speed, sprite );
};

//	Set up inheritance and assign Enemy prototype
Enemy.prototype = Object.create( Sprite.prototype );
Enemy.prototype.constructor = Enemy;

/*------------------------------------------------------------------------------
 *
 *	Enemy checkCollision Prototype:
 *		The "checkCollision" prototype function checks to see if the Enemy sprite
 *		and the Player Sprite overlap.  If so, then there is a collision.
 *
 *		The checkCollision is unique to the Enemy sprite.
 *
 *			this - the Enemy sprite
 *			player - the player Sprite
 *			boing - the sound to play when there is a collision
 *
 *----------------------------------------------------------------------------*/

Enemy.prototype.checkCollision = function () {

	// check to see if this Enemy Sprite and the Player Sprite overlap.
	// I added fracture multiplier to give more flexibility with collisions.
	if ( ( this.x + .75 * this.width >= player.x ) &&
		( this.x <= player.x + .75 * player.width ) &&
		( this.y <= player.y + .75 * player.height ) &&
		( this.y + .75 * this.height >= player.y )
	) {

		// Play collision sound
		boing.play();

		// Subtract a life
		updateHearts( -1 );

		// reset the player position to the start position
		resetPlayer();
	}
};

/*------------------------------------------------------------------------------
 *
 *	Enemy update prototype
 *
 *		This prototype function updates the enemy's position on
 *		the canvas.
 *
 *		The enemy moves different from the player, so this function
 *		is unique to the Enemy, and not part of the parent class.
 *
 *		dt - time delta between ticks
 *
 *		Multiplying any movement by the dt parameter ensures the game runs at the
 *		same speed for all computers
 *
 *----------------------------------------------------------------------------*/

Enemy.prototype.update = function ( dt ) {

	// calculate the new horizontal position on the game canvas
	this.x += ( this.speed * dt );

	// When the sprite reaches the right edge of the canvas, loop back to the
	// left
	if ( this.x >= maxWidth ) {
		this.x = 0;
	}

	// check for a Collision
	this.checkCollision();
};

/******************************************************************************
 *
 * Define the Player class
 *
 * Properties:
 *		x - inherited from sprite
 *		y - inherited from Sprite
 *		speed - inherited from Sprite, but not used
 *		sprite - inherited from Sprite
 *		height - inherited from Sprite
 *		width - inherited from sprite
 *		moveX - how many pixels to move  Player left or right
 *		moveY - how many pixels to move the Player up or down
 *		gameScore - the Game score - start with zero points
 *		timeStart - the start time when the player takes their first move on the
 *			level.  Used to calculate a bonus score
 *
 *	Methods:
 * 	render - inherited from Sprite
 *		update - updates the Player position - unique to the Player object
 *		checkCollision - Unique to Enemy:  check for a collision with the Player
 *
 ******************************************************************************/

var Player = function ( x, y, moveX, moveY, sprite ) {
	// invoke the Sprite super-constructer
	Sprite.call( this, x, y, 0, sprite );

	// set properties unique to Player
	this.moveX = moveX; // how many pixels to move  Player left or right
	this.moveY = moveY; // how many pixels to move the Player up or down
	this.gameScore = 0; // the Game score - start with zero points

};

//	Set up inheritance and assign Player prototype
Player.prototype = Object.create( Sprite.prototype );
Player.prototype.constructor = Player;

/*------------------------------------------------------------------------------
 *
 *	Player goalAchieved prototype function
 *
 *		This function is run when the Player reaches the top.  It performs the
 *		following:
 *			1. Plays success sound
 *			2. Increases the game level
 *			3. Gives the player another life
 *			4. Calculates the score for the level and adds to the total Score
 *			5. Resets the Player to the grassy area so they can start again
 *
 *
 *----------------------------------------------------------------------------*/


Player.prototype.goalAchieved = function () {

	// play success sound
	success.play();

	// increase game level
	addLevel();

	// add one heart
	updateHearts( 1 );

	// Add 5000 points for reaching the top
	this.gameScore += 5000;

	// Calculate bonus score
	let milliseconds = Date.now() - this.timeStart;
	if ( milliseconds < 5000 ) {
		this.gameScore += ( 5000 - milliseconds ) * 10;
	}

	// update the screen to show the new score
	updateGameScore( this.gameScore );

	// set Player position to start X and Y
	reset( this, startX, startY );
}

/*------------------------------------------------------------------------------
 *
 *	Player handleInput function
 *
 *		This prototype function calculates new x and y positions based on which
 *		key is pressed.
 *
 *		Parameters:
 *			keyPress - identifies which key was pressed
 *
 *----------------------------------------------------------------------------*/

Player.prototype.handleInput = function ( keyPress ) {

	switch ( keyPress ) {
	case "left": //move left

		if ( this.x - this.moveX >= 0 ) {
			this.x -= this.moveX;
		} else {
			// don't let the Player move outside the screen area
			this.x = 0;
		}
		break;

	case "up": //move up
		if ( this.y - this.moveY >= 0 ) {
			this.y -= this.moveY;
		} else {
			//don't let the Player move above the water
			this.y = 0;
		}
		break;

	case "right": //move right

		if ( this.x + this.moveX <= maxWidth ) {
			this.x += this.moveX;
		} else {
			// don't let the Player move outside the screen area
			this.x = maxWidth - this.width;
		}
		break;

	case "down": //move down

		if ( this.y + this.moveY <= maxHeight ) {
			this.y += this.moveY;
		} else {
			// don't let the Player move below the grass
			this.y = maxHeight - this.height;
		}
		break;

	default: // do nothing - the user keyed other than up, down, left, or right
		break;
	}

	// play the walking sound
	walking.play();
}

/*------------------------------------------------------------------------------
 *
 *	Player update prototype
 *
 *		This prototype function updates the player's position on the canvas.
 *
 *		The player moves different from the enemy, so this function
 *		is unique to the Player, and not part of the parent class.
 *
 *		Variables:
 *			maxX - the maximum width on the screen the player can be placed
 *			maxY - the maximum height on the screen the player can be placed
 *
 *
 *----------------------------------------------------------------------------*/

Player.prototype.update = function () {

	// calculate the max width and height the player can goalAchieved
	var maxX = maxWidth - this.width;
	var maxY = maxHeight - ( this.height + moveX );


	if ( this.y <= this.height ) {
		// made it to top!  Increase level and go again
		this.goalAchieved();

	} else if ( this.y >= maxY ) {
		// tried to move down below bottom of playing field.  Don't allow
		this.y = maxY;
	}

	if ( this.x <= 0 ) {
		// tried to move of left of playing field.  Don't allow
		this.x = 0;
	} else if ( this.x >= maxX ) {

		//tried to move off right of playing field.  Don't allow.
		this.x = maxX;
	}
};


/******************************************************************************
 *
 * Define the Sound class
 *
 * Properties:
 *		sound - the audio elements
 *		sound.src - the source file for the audio element

 *	Methods:
 * 		play - plays the sounds
 *		stop - stops the sound from playing
 *
 *****************************************************************************/

var Sound = function ( src ) {

	// create the audio element in the DOM
	this.sound = document.createElement( "audio" );

	// set the audio source
	this.sound.src = src;

	// set audio attributes
	this.sound.setAttribute( "preload", "auto" );
	this.sound.setAttribute( "controls", "none" );
	this.sound.style.display = "none";

	// add audio element to the document
	document.body.appendChild( this.sound );
}

/*------------------------------------------------------------------------------
 *	Play  the sound
 *----------------------------------------------------------------------------*/

Sound.prototype.play = function () {
	this.sound.play();
}

/*------------------------------------------------------------------------------
 *	Stop the sound
 *----------------------------------------------------------------------------*/

Sound.prototype.stop = function () {
	this.sound.pause();
}

/*******************************************************************************
	Global functions
			addEnemy					-	adds a new enemy to the game board
			addLevel					-	increases the game level
			allowedKeys				- identifies and manages allowed keystrokes
 			gameOver					- manages Game Over features
			newGame						-	starts a new game
			randomInt					- returns a random integer between two values
			reset 						- resets any sprite to x, y location
			resetPlayer 			- resets a Player to starting location
			startKeyListener	-	starts the keyup listener at start of new game
			stopKeyListener		-	stops the keyup listener at end of game
			updateGameScore		- updates the Game Score and displays on screen
			updateHearts			- updates the hearts display on screen
 ******************************************************************************/

function addEnemy() {
	/*----------------------------------------------------------------------------
		This function adds a new enemy to the game board
	 *--------------------------------------------------------------------------*/

	// get a random Y position for the enemy
	var loc = randomInt( enemyMinY, enemyMaxY );

	// pick a random speed
	var speed = randomInt( speedMin, speedMax );

	// pick a random enemy sprite
	var sprite = enemyImg[ randomInt( 0, 3 ) ];

	// create a new Enemy object and push it onto the array of enemies
	const enemy = new Enemy( 0, loc, speed, sprite );
	allEnemies.push( enemy );
}

function addLevel() {
	/*---------------------------------------------------------------------------
	  This function increases the game level, adds a new Enemy, and updates the
		level displayed on the game board

		Variables:
			gameLevel - global variable to hold the game level
	 *-------------------------------------------------------------------------*/

	// add another enemy
	addEnemy();

	// increase the game level by one and display to user
	gameLevel += 1;
	document.getElementById( "level" ).innerHTML = "Level: " + gameLevel;
}

function allowedKeys( e ) {
	/*---------------------------------------------------------------------------
		This is the callback function for the keyUp event listener.  It identifies
		allowed Keys and calls the Player function handleInput
	 *-------------------------------------------------------------------------*/

	var allowedKeys = {
		37: 'left',
		38: 'up',
		39: 'right',
		40: 'down'
	};

	player.handleInput( allowedKeys[ e.keyCode ] );
}

function gameOver() {
	/*----------------------------------------------------------------------------
		This function handles the end of game.

		TODO - refactor to make more dynamic.  Right now, positions are hard-coded
	----------------------------------------------------------------------------*/

	// clear out current Enemy display on screen
	allEnemies.length = 0;

	// create a new enemy list - should have 1 instance of each unique enemy
	// note:  set speed = 0 to keep them static
	for ( let i = 0; i < enemyImg.length; i++ ) {
		var endEnemy = new Enemy( tileWidth * ( i ), 303, 0, enemyImg[ i ] );
		//(tileWidth * (i) - width*2)
		allEnemies.push( endEnemy );
	}

	// position player
	reset( player, startX + 15, 200 );

	// set location of enemies to avoid collisions and for a nice symmetrical
	// end of game display

	reset( allEnemies[ 0 ], allEnemies[ 0 ].x + ( ( tileWidth - Resources.get( allEnemies[ 0 ].sprite ).width ) / 2 ), 296 );
	reset( allEnemies[ 1 ], allEnemies[ 1 ].x + ( ( tileWidth - Resources.get( allEnemies[ 0 ].sprite ).width ) / 2 ), 248 );
	reset( allEnemies[ 2 ], allEnemies[ 2 ].x + tileWidth + ( ( tileWidth - Resources.get( allEnemies[ 0 ].sprite ).width ) / 2 ), 248 );
	reset( allEnemies[ 3 ], allEnemies[ 3 ].x + tileWidth + ( ( tileWidth - Resources.get( allEnemies[ 0 ].sprite ).width ) / 2 ), 296 );

	// add Game Over grapic
	var gameOverText = new Enemy( ( ( maxWidth - Resources.get( "images/GameOverText.png" ).width ) / 2 ), 55, 0, "images/GameOverText.png" );
	allEnemies.push( gameOverText );

	// stop the keyup LIstener
	stopKeyListener();
	// play game over sound
	gameOverVoice.play();
}

function newGame() {
	/*----------------------------------------------------------------------------
		This function resets game variables to create a new game
	 ---------------------------------------------------------------------------*/

	// stop game over sound if it is still playing
	gameOverVoice.stop();

	// reset game level to 0
	gameLevel = 0;

	// clear out enemies
	allEnemies.length = 0;

	// addLeve will set game level to 1, add a new Enemy, and update game screen
	addLevel();

	// display all hearts
	updateHearts( maxLives );

	// reset gameScore and position player to level start position
	player.gameScore = 0;
	updateGameScore( player.gameScore );
	resetPlayer();

	// add keyup LIstener
	setKeyListener();
}

function randomInt( min, max ) {
	/*----------------------------------------------------------------------------
			This function returns a random integer between two values
	 ---------------------------------------------------------------------------*/

	return Math.floor( Math.random() * ( max - min + 1 ) + min );
}

function reset( gameCharacter, x, y ) {
	/*----------------------------------------------------------------------------
	 	This function resets a game character position, and sets a start time used
		to calculate elapsed time from the time the character was reset

		TODO: can I refactor reset and resetPlayer into a single function???
	 ---------------------------------------------------------------------------*/

	// Set x and y position
	gameCharacter.x = x;
	gameCharacter.y = y;

	// set start time for later use
	gameCharacter.timeStart = Date.now();

};

function resetPlayer() {
	/*----------------------------------------------------------------------------
		This function resets the player and determines if the game is over
	----------------------------------------------------------------------------*/

	// move player back to start
	reset( player, startX, startY );

	// check if game is over
	if ( lives <= 0 ) {
		gameOver();
	}
}

function setKeyListener() {
	/*----------------------------------------------------------------------------
		This function sets up the keyup event listener
	----------------------------------------------------------------------------*/
	document.addEventListener( 'keyup', allowedKeys );
}

function stopKeyListener() {
	/*----------------------------------------------------------------------------
		This function removes the keyup event listener to disable player movement
		when the game is not in progress
	----------------------------------------------------------------------------*/
	document.removeEventListener( 'keyup', allowedKeys );
}

function updateGameScore( myScore ) {
	/*----------------------------------------------------------------------------
	This function updates the score display on the game board.

		Parameters:
			myScore - the current game score
	----------------------------------------------------------------------------*/

	document.getElementById( "score" ).innerHTML = "Score:  " + myScore;
}

function updateHearts( num ) {
	/*----------------------------------------------------------------------------
	This function updates the hearts display on the game board.  Will accept
	positive or negative numbers to increment or decrement the number of
	hearts.

	Parameters:
		num - the number of hearts to add/remove

		Variables:
			lives - the number of lives remaining
			maxLives - the maximum number of lives a user can have

	 ---------------------------------------------------------------------------*/

	// increaase number of lives
	lives += num;

	// don't let lives go over than the maximum number allowed.
	if ( lives > maxLives ) {
		lives = maxLives;

		// don't let the lives go negative
	} else if ( lives < 0 ) {
		lives = 0;
	}

	// get hearts list.
	let hearts = document.getElementById( "hearts" );
	let numHearts = hearts.childElementCount;

	// loop through each list item and set heart to empty or full based on the
	// number of lives
	for ( let i = 0; i < numHearts; i++ ) {
		let heart = hearts.children[ i ];
		if ( i < lives ) {
			heart.innerHTML = '<i class="fa fa-heart red-heart"></i>';
		} else {
			heart.innerHTML = '<i class="fa fa-heart-o red-heart"></i>';
		}
	}

}

/*******************************************************************************
 *
 * Global variables
 *		allEnemies 	- array to hold active enemy instances
 *		enemyImg		-	images to use for the Enemy.  If you want to add enemies to
 *									the game, make sure to add them here as well
 *		enemyMaxY		- calculated maximum vertical position for an Enemy
 *		enemyMinY		- calculated minimum vertical position for an Enemy
 *		gameLevel		- current game level
 *		lives				- number of lives currently left
 *	 	maxHeight 	- maximum canvas height - adjust if you want to add more rows
 *		maxLives		- maximum number of lives the user can have
 *		maxWidth 		- maximum canvas field width - adjust if you want to add more
 *									columns
 *		moveX				- fraction of tile to move the Player - can adjust to make
 * 									game easier or harder
 *		moveY				- fraction of tile to move the Player - can adjust to make
 *									game easier or harder
 *		nCols				- number of columns the canvas supports
 *		nRows				- number of rows the canvas supports
 *		playerImg		- image to use for the Player
 *		speedMax		- maximum speed for Enemy movement - can adjust to make game
 *									easier or harder
 *		speedMin		- minimum speed for Enemy movement - can adjust to make game
 *									easier or harder
 *		startX			- calculated center of screen to place Player at start of
 *									each level
 *		startY 			- calculate vertical position of Player at start of each level
 *		tileHeight	- tile height.  TODO: figure out how to calculate this
 *	 	tileWidth		- calculated tile width
 *
 ******************************************************************************/

var maxWidth = 505;
var maxHeight = 606;
var nRows = 6;
var nCols = 5;
var tileWidth = maxWidth / nCols;
var tileHeight = 83;
var allEnemies = [];
var startX;
var startY = tileHeight * ( nRows - 1 );
var gameLevel = 1;
var lives = 0;
var maxLives = 5;
var enemyMinY = tileHeight + 10;
var enemyMaxY = ( tileHeight * 4 ) - 20;
var speedMin = 50;
var speedMax = 150;
var moveX = tileWidth / 3;
var moveY = tileHeight / 3;
var playerImg = 'images/char-boy.png'
var enemyImg = [ 'images/char-cat-girl.png', 'images/char-horn-girl.png', 'images/char-pink-girl.png', 'images/char-princess-girl.png' ]

// calculate the horizontal start position based on number of columns and tile width
if ( nCols % 2 === 0 ) {
	startX = ( nCols / 2 ) * tileWidth - ( Math.round( tileWidth / 2 ) );
} else {
	startX = ( Math.round( nCols / 2 ) - 1 ) * tileWidth;
}

// create the player
const player = new Player( startX, startY, moveX, moveY, playerImg );

// create the sounds used in the game in advance
const boing = new Sound( "sounds/boing.wav" );
const gameOverVoice = new Sound( "sounds/gameover.mp3" );
const walking = new Sound( "sounds/walking.wav" );
const success = new Sound( "sounds/success.wav" );

// initialize the game
newGame();

// Add Event Listener for user input.  This listens for key presses and sends
//the keys to the Player.handleInput() method.
// TODO: consider allowing user to also key u, d, l, r.
/*
document.addEventListener( 'keyup', function ( e ) {
	var allowedKeys = {
		37: 'left',
		38: 'up',
		39: 'right',
		40: 'down'
	};

	player.handleInput( allowedKeys[ e.keyCode ] );
} );

*/

// Add Event LIstener for restart button and re-initializes the game
/*document.getElementById( 'restart' ).addEventListener( 'click', newGame () {
	newGame();
} );
*/
document.getElementById( 'restart' ).addEventListener( 'click', newGame );
