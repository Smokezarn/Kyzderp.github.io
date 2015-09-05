var players = []; //TODO: say

var INTERVAL = 30;
var FLOORLEVEL;
var MULTIPLIER = 500;
var FRICTION = 50;

var dragOffX = 0;
var dragOffY = 0;
var dragging = false;
var currentPlayer;

var mouseX = 0;
var mouseY = 0;
var mouseX2 = 0;
var mouseY2 = 0;
var mouseTime = 0;
var mouseTime2 = 0;

function main()
{
	// Just for being able to press enter inside the textbox
	FLOORLEVEL = document.getElementById("canvas").height;
	$("#name").keyup(function(e)
	{
		if (e.keyCode == 13)
			$("#submit").click();
	});
	
	// Get rid of annoying text select
	canvas.addEventListener("selectstart", function(e)
	{
		e.preventDefault();
		return false;
	}, false);
	
	// Look if you're clicking on something, start dragging
	canvas.addEventListener("mousedown", function(e)
	{
		var x = e.pageX - canvas.offsetLeft;
		var y = e.pageY - canvas.offsetTop;
		var found;
		for (var i in players)
		{
			if (players[i].contains(x, y))
			{
				found = players[i];
				break;
			}
		}
		if (found)
		{
			dragging = true;
			dragOffX = x - found.x;
			dragOffY = y - found.y;
			currentPlayer = found;
		}
	});
	
	// Dragging handler
	canvas.addEventListener("mousemove", function(e)
	{
		if (!dragging)
			return;
		var x = e.pageX - canvas.offsetLeft;
		var y = e.pageY - canvas.offsetTop;
		currentPlayer.x = x - dragOffX;
		currentPlayer.y = y - dragOffY;
		mouseX = mouseX2;
		mouseY = mouseY2;
		mouseX2 = x;
		mouseY2 = y;
		mouseTime = mouseTime2;
		mouseTime2 = (new Date()).getTime();
	});
	
	// If mouse moves outside
	canvas.addEventListener("mouseout", function(e)
	{
		if (!dragging || currentPlayer == null)
			return;
		var x = e.pageX - canvas.offsetLeft;
		var y = e.pageY - canvas.offsetTop;
		
		// Get the last mouse velocity
		currentPlayer.vX = 100 * (x - mouseX) / ((new Date()).getTime() - mouseTime);
		currentPlayer.vY = 100 * (y - mouseY) / ((new Date()).getTime() - mouseTime);
		dragging = false;
		currentPlayer = null;
	});
	
	
	// Release the thing, stop drawing?
	canvas.addEventListener("mouseup", function(e)
	{
		if (!dragging || currentPlayer == null)
			return;
		var x = e.pageX - canvas.offsetLeft;
		var y = e.pageY - canvas.offsetTop;
		
		// Get the last mouse velocity
		currentPlayer.vX = 100 * (x - mouseX) / ((new Date()).getTime() - mouseTime);
		currentPlayer.vY = 100 * (y - mouseY) / ((new Date()).getTime() - mouseTime);
		dragging = false;
		currentPlayer = null;
	});
	
	setInterval(update, INTERVAL);
}

function update()
{
	for (var i in players)
	{
		var player = players[i];
		
		if (player == currentPlayer)
			continue;

		// Now actually add velocities onto the coords
		player.y += player.vY * INTERVAL / 1000;
		player.x += player.vX * INTERVAL / 1000;

		// GRAVITY //
		player.vY += MULTIPLIER * INTERVAL / 1000;
		
		// Friction! But only if on the ground
		if (player.y == FLOORLEVEL - 28)
		{
			if (player.vX > 0)
			{
				player.vX -= FRICTION;
				if (player.vX < 0)
					player.vX = 0;
			}
			else if (player.vX < 0)
			{
				player.vX += FRICTION;
				if (player.vX > 0)
					player.vX = 0;
			}
		}
		
		// WALL CHECKS //
		if (player.y + 28 >= FLOORLEVEL)
		{
			player.y = FLOORLEVEL - 28;
			player.vY = -player.vY * 0.5;
			if (Math.abs(player.vY) < 40)
				player.vY = 0;
		}
		else if (player.y - 4 <= 0)
		{
			player.y = 4;
			player.vY = -player.vY * 0.5;
		}
		if (player.x + 4 >= canvas.width)
		{
			player.x = canvas.width - 4;
			player.vX = -player.vX * 0.8;
		}
		else if (player.x - 4 <= 0)
		{
			player.x = 4;
			player.vX = -player.vX * 0.8;
		}
		
		// Player Position
		if (player.y + 28 < FLOORLEVEL - 3)
			player.mode = 1;
		else
			player.mode = 0;
	}
	drawCanvas();
}

function submitForm()
{
	var name = document.getElementById("name").value;
	var skin = "http://skins.minecraft.net/MinecraftSkins/" + name + ".png";	
	setTimeout(function()
	{
		console.log("b");
		players.push(new Player(name, skin));
		drawCanvas();
	}, 1000);

}

function drawCanvas()
{
	var canvas = document.getElementById("canvas");
	var ctx = canvas.getContext("2d");
	ctx.fillStyle = "rgb(100,100,100)";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	for (var i = players.length - 1; i >= 0; i--)
	{
		players[i].draw(ctx);
	}
}

function crop(ctx, skin, x, y, width, height, playerX, playerY, finalwidth, finalheight)
{
	//console.log("crop at " + x + " " + y + " w/h " + width + " " + height + " pxy " + playerX + " " + playerY);
	ctx.drawImage(skin, x, y, width, height, playerX, playerY, finalwidth, finalheight);
}


//// PLAYER ////

function Player(name, skin)
{ // player's x and y is center of face
	this.name = name;
	this.skin = new Image();
	this.skin.src = skin;
	this.mode = 0;
	this.x = 100;
	this.y = 100;
	this.vX = 0;
	this.vY = 0;
}

Player.prototype.draw = function(ctx)
{ // mode 0: normal standing, mode 1: jump
	crop(ctx, this.skin, 8, 8, 8, 8, this.x - 4, this.y - 4, 8, 8); // head bottom layer
	crop(ctx, this.skin, 40, 8, 8, 8, this.x - 4, this.y - 4, 8, 8); // head top layer
	crop(ctx, this.skin, 20, 20, 8, 12, this.x - 4, this.y + 4, 8, 12); // body
	
	if (this.mode == 0) // Standing
	{
		crop(ctx, this.skin, 44, 20, 4, 12, this.x - 8, this.y + 4, 4, 12); // left arm
		crop(ctx, this.skin, 4, 20, 4, 12, this.x - 4, this.y + 16, 4, 12); // left leg
		
		ctx.save();
		ctx.scale(-1, 1);
		crop(ctx, this.skin, 44, 20, 4, 12, -this.x - 8, this.y + 4, 4, 12); // right arm
		crop(ctx, this.skin, 4, 20, 4, 12, -this.x - 4, this.y + 16, 4, 12); // right leg
		ctx.restore();
	}
	else if (this.mode == 1) // Jumping
	{
		// left arm
		ctx.save();
		ctx.translate(this.x - 6, this.y + 6);
		ctx.rotate(Math.PI/180*120);
		ctx.translate(-this.x + 6, -this.y - 6);
		crop(ctx, this.skin, 44, 20, 4, 12, this.x - 8, this.y + 4, 4, 12);
		ctx.restore();
		// left leg
		ctx.save();
		ctx.translate(this.x - 2, this.y + 16);
		ctx.rotate(Math.PI/180*20);
		ctx.translate(-this.x + 2, -this.y - 16);
		crop(ctx, this.skin, 4, 20, 4, 12, this.x - 4, this.y + 16, 4, 12);
		ctx.restore();
		// right arm
		ctx.save();
		ctx.translate(this.x + 6, this.y + 6);
		ctx.rotate(-Math.PI/180*120);
		ctx.translate(-this.x - 6, - this.y - 5);
		ctx.scale(-1, 1);
		crop(ctx, this.skin, 44, 20, 4, 12, -this.x - 8, this.y + 4, 4, 12);
		ctx.restore();
		// right leg
		ctx.save();
		ctx.translate(this.x + 2, this.y + 16);
		ctx.rotate(-Math.PI/180*20);
		ctx.translate(-this.x - 2, -this.y - 16);
		ctx.scale(-1, 1);
		crop(ctx, this.skin, 4, 20, 4, 12, -this.x - 4, this.y + 16, 4, 12);
		ctx.restore();
	}
}

Player.prototype.contains = function(x, y)
{
	// just basic bounding box for now. head to toe, shoulder to shoulder when standing still
	if (x < this.x - 4 || x > this.x + 4 || y < this.y - 4 || y > this.y + 28)
		return false;
	return true;
}