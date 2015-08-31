var things = new Array();
var guns = new Array();
var dragging = false;
var dragOffX;
var dragOffY;
var currentThing;

var messages = ["ow", "stahp", "such bounce", "much wow", "balls", "oi", "ouch", "stop it", "omg", "u w0t", "m8 stahp", "wot", "wait", "pls", "u nub", "nub", "crab"];

var mouseX = 0;
var mouseY = 0;
var mouseX2 = 0;
var mouseY2 = 0;
var mouseTime = 0;
var mouseTime2 = 0;

var INTERVAL = 30;
var MULTIPLIER = 500;
var FRICTION = 5;
var CHAOS = 1000;

var FLOORLEVEL;

var lastThing;
var gravityEnabled = true;

var main = function()
{
	console.log("Entered main.");
	var canvas = document.getElementById("canvas");
	FLOORLEVEL = canvas.height;// - 100;
	
	// Get rid of annoying text select
	canvas.addEventListener("selectstart", function(e)
	{
		e.preventDefault();
		return false;
	}, false);
	
	// Click to fire
	canvas.addEventListener("click", function(e)
	{
		var x = e.pageX - canvas.offsetLeft;
		var y = e.pageY - canvas.offsetTop;
		var found;
		for (var i in guns)
		{
			if (guns[i].contains(x, y))
			{
				found = guns[i];
				break;
			}
		}
		if (found)
		{
			found.launch((x - found.x) * 50, (y - found.y) * 50)
		}
	});
	
	// Look if you're clicking on something, start dragging
	canvas.addEventListener("mousedown", function(e)
	{
		var x = e.pageX - canvas.offsetLeft;
		var y = e.pageY - canvas.offsetTop;
		var found;
		for (var i in things)
		{
			if (things[i].contains(x, y))
			{
				found = things[i];
				break;
			}
		}
		if (found)
		{
			dragging = true;
			dragOffX = x - found.x;
			dragOffY = y - found.y;
			currentThing = found;
		}
	});
	
	// Dragging handler
	canvas.addEventListener("mousemove", function(e)
	{
		if (!dragging)
			return;
		var x = e.pageX - canvas.offsetLeft;
		var y = e.pageY - canvas.offsetTop;
		currentThing.x = x - dragOffX;
		currentThing.y = y - dragOffY;
		mouseX = mouseX2;
		mouseY = mouseY2;
		mouseX2 = x;
		mouseY2 = y;
		mouseTime = mouseTime2;
		mouseTime2 = (new Date()).getTime();
		update();
	});
	
	// If mouse moves outside
	canvas.addEventListener("mouseout", function(e)
	{
		if (!dragging || currentThing == null)
			return;
		var x = e.pageX - canvas.offsetLeft;
		var y = e.pageY - canvas.offsetTop;
		
		// Get the last mouse velocity
		currentThing.vX = 100 * (x - mouseX) / ((new Date()).getTime() - mouseTime);
		currentThing.vY = 100 * (y - mouseY) / ((new Date()).getTime() - mouseTime);
		dragging = false;
		currentThing = null;
	});
	
	
	// Release the thing, stop drawing?
	canvas.addEventListener("mouseup", function(e)
	{
		if (!dragging || currentThing == null)
			return;
		var x = e.pageX - canvas.offsetLeft;
		var y = e.pageY - canvas.offsetTop;
		
		// Get the last mouse velocity
		currentThing.vX = 100 * (x - mouseX) / ((new Date()).getTime() - mouseTime);
		currentThing.vY = 100 * (y - mouseY) / ((new Date()).getTime() - mouseTime);
		dragging = false;
		currentThing = null;
	});
	
	// Adding thing
	canvas.addEventListener("dblclick", function(e)
	{
		var x = e.pageX - canvas.offsetLeft;
		var y = e.pageY - canvas.offsetTop;
		var color = "rgba(";
		color += Math.floor((Math.random() * 200 + 55)) + ",";
		color += Math.floor((Math.random() * 200 + 55)) + ",";
		color += Math.floor((Math.random() * 200 + 55)) + ",0.8)";
		console.log("Added new thing at " + x + " " + y);
		lastThing = new Thing(x, y, 20, color, true, -1);
		things.push(lastThing);
		update();
	});
	
	guns.push(new Gun(canvas.width/2, FLOORLEVEL/2, 30));	
	setInterval(function() { collisionCheck(); }, INTERVAL);
}

function update()
{
	var ctx = getContext();
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.strokeStyle = "rgb(0,0,0)";
	var path = new Path2D();
	path.moveTo(0, FLOORLEVEL);
	path.lineTo(canvas.width, FLOORLEVEL);
	ctx.stroke(path);

	for (var i in things)
	{
		var thing = things[i];
		if (thing.msgCD > 0)
			thing.msgCD--;
		if (thing.lifetime > 0)
			thing.lifetime--;
		if (thing.lifetime == 0)
		{
			things.splice(things.indexOf(thing), 1);
			continue;
		}
		thing.draw(ctx);
	}
	
	for (var i in guns)
	{
		guns[i].draw(ctx);
	}
}

function collisionCheck()
{
//	if (lastThing)
//		console.log(lastThing.vX + " " + lastThing.vY);
	for (var i in things)
	{
		var thing = things[i];
		if (thing == currentThing)
			continue;
		//console.log(i + " " + thing.vX + " " + thing.vY);

		
		// Now actually add velocities onto the coords
		thing.y += thing.vY * INTERVAL / 1000;
		thing.x += thing.vX * INTERVAL / 1000;

		// GRAVITY //
		if (gravityEnabled)
			thing.vY += MULTIPLIER * INTERVAL / 1000;
		
		// Friction! But only if on the ground
		if (thing.y == FLOORLEVEL - thing.size)
		{
			if (thing.vX > 0)
			{
				thing.vX -= FRICTION;
				if (thing.vX < 0)
					thing.vX = 0;
			}
			else if (thing.vX < 0)
			{
				thing.vX += FRICTION;
				if (thing.vX > 0)
					thing.vX = 0;
			}
		}
		
		// COLLISION WITH OTHER OBJECTS
		for (var j in things)
		{
			var thing2 = things[j];
			if (i == j || thing.exclude.indexOf(thing2) != -1)
				continue;
			var collidetype = thing.collides(thing2);
			if (collidetype > 0)
			{
				thing.exclude.push(thing2);
				if (collidetype == 2)
					unstuck(thing, thing2);
				
				collide(thing, thing2);
				/*
				var velX1 = (thing.vX * (thing.size - thing2.size) + (2 * thing2.size * thing2.vX)) / (thing.size + thing2.size);
				var velY1 = (thing.vY * (thing.size - thing2.size) + (2 * thing2.size * thing2.vY)) / (thing.size + thing2.size);
				var velX2 = (thing2.vX * (thing2.size - thing.size) + (2 * thing.size * thing.vX)) / (thing.size + thing2.size);
				var velY2 = (thing2.vY * (thing2.size - thing.size) + (2 * thing.size * thing.vY)) / (thing.size + thing2.size);

				thing.vX = velX1;
				thing.vY = velY1;
				thing2.vX = velX2;
				thing2.vY = velY2;
				*/
			}
		}		
		
		// WALL CHECKS //
		if (thing.y + thing.size >= FLOORLEVEL)
		{
			thing.y = FLOORLEVEL - thing.size;
			thing.vY = -thing.vY * 0.5;
			if (Math.abs(thing.vY) < 40)
				thing.vY = 0;
			else
				thing.say();
		}
		else if (thing.y - thing.size <= 0)
		{
			thing.y = thing.size;
			thing.vY = -thing.vY * 0.5;
			thing.say();
		}
		if (thing.x + thing.size >= canvas.width)
		{
			thing.x = canvas.width - thing.size;
			thing.vX = -thing.vX * 0.8;
			if (Math.abs(thing.vX) > 20)
				thing.say();
		}
		else if (thing.x - thing.size <= 0)
		{
			thing.x = thing.size;
			thing.vX = -thing.vX * 0.8;
			if (Math.abs(thing.vX) > 20)
				thing.say();
		}
		
		for (var j in things)
		{
			things[j].exclude = [];
		}
	}
	update();
}

function collide(thing1, thing2)
{
	var dx = thing1.x - thing2.x;
	var dy = thing1.y - thing2.y;
	var angle = Math.atan2(dy, dx);
	var m1 = Math.sqrt(thing1.vX * thing1.vX  + thing1.vY * thing1.vY);
	var m2 = Math.sqrt(thing2.vX * thing2.vX  + thing2.vY * thing2.vY);
	var dir1 = Math.atan2(thing1.vY, thing1.vX);
	var dir2 = Math.atan2(thing2.vY, thing2.vX);
	var vx1 = m1 * Math.cos(dir1 - angle);
	var vy1 = m1 * Math.sin(dir1 - angle);
	var vx2 = m2 * Math.cos(dir2 - angle);
	var vy2 = m2 * Math.sin(dir2 - angle);
	var fvx1 = ((thing1.size - thing2.size) * vx1 + (thing2.size + thing2.size) * vx2) / (thing1.size + thing2.size);
	var fvx2 = ((thing2.size - thing1.size) * vx2 + (thing1.size + thing1.size) * vx1) / (thing1.size + thing2.size);
	thing1.vX = Math.cos(angle) * fvx1 + Math.cos(angle + Math.PI/2) * vy1;
	thing1.vY = Math.sin(angle) * fvx1 + Math.sin(angle + Math.PI/2) * vy1;
	thing2.vX = Math.cos(angle) * fvx2 + Math.cos(angle + Math.PI/2) * vy2;
	thing2.vY = Math.sin(angle) * fvx2 + Math.sin(angle + Math.PI/2) * vy2;
}

function unstuck(thing1, thing2)
{
	//console.log("unstick");
	
	var dx = thing1.x - thing2.x;
	var dy = thing1.y - thing2.y;
	var dist = Math.sqrt(Math.pow(thing1.x - thing2.x, 2) + Math.pow(thing1.y - thing2.y, 2));
	var r = thing1.size + thing2.size;
	var fraction = (r - dist)/r;
	//console.log("r: " + r + " fraction: " + fraction);
	if (dx > 0)
	{
		var xoff = (r * fraction + 1) * (dx/Math.abs(dx));
		if (thing1.x + xoff < thing1.size || thing1.x + xoff > canvas.width - thing1.size)
			thing2.x -= xoff;
		else
			thing1.x += xoff;
	}
	if (dy > 0)
		thing1.y += (r * fraction + 1) * (dy/Math.abs(dy));
	//console.log("x: " + thing1.x + "y: " + thing1.y);
	
}

function getContext()
{
	var canvas = document.getElementById("canvas");
	if (canvas.getContext)
	{
		var ctx = canvas.getContext("2d");
		ctx.font = "14px sans-serif"
		return ctx;
	}
	return "";
}

//////////////////
// THING OBJECT //
//////////////////
function Thing(x, y, size, color, canSay, lifetime)
{
	this.x = x;
	this.y = y;
	this.size = size;
	this.color = color;
	this.canSay = canSay;
	this.lifetime = lifetime;
	this.vX = 0;
	this.vY = 0;
	this.msg = "";
	this.msgCD = 0;
	this.xOffset = 0;
	this.yOffset = 0;
	this.exclude = [];
}

Thing.prototype.draw = function(ctx)
{
	var path = new Path2D();
	path.arc(this.x, this.y, this.size, 0, 360);
	ctx.fillStyle = this.color;
	ctx.fill(path);
	if (this.msgCD > 0)
	{
		ctx.fillStyle = "rgba(0,0,0,0.9)";
		ctx.fillText(this.msg, this.x - this.xOffset, this.y - this.yOffset);
	}
}

Thing.prototype.contains = function(x, y)
{
	return (Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2) <= this.size * this.size);
}

Thing.prototype.say = function()
{
	if (!this.canSay)
		return;
	this.msg = messages[Math.floor(Math.random() * messages.length)];
	this.msgCD = 100;
	this.xOffset = Math.floor(Math.random() * this.size * 2);
	this.yOffset = Math.floor(Math.random() * this.size * 2 - this.size)
}

/**
 * 0 = no collide, 1 = just touching, 2 = too close
 */
Thing.prototype.collides = function(thing)
{
	var dist = Math.sqrt(Math.pow(thing.x - this.x, 2) + Math.pow(thing.y - this.y, 2));
	var r = thing.size + this.size;
	if (dist < r - 2)
		return 2;
	else if (dist < r)
		return 1;
	return 0;
}

//////////////////

////////////////
// GUN OBJECT //
////////////////
function Gun(x, y, size)
{
	this.x = x;
	this.y = y;
	this.size = size;
}

Gun.prototype.draw = function(ctx)
{
	ctx.fillStyle = "rgba(100,100,100,0.5)";
	var path = new Path2D();
	path.arc(this.x, this.y, this.size, 0, 360);
	ctx.fill(path);
}

Gun.prototype.launch = function(vX, vY)
{
	var newThing = new Thing(this.x, this.y, 10, "rgba(100,100,100,0.8)", false, 200);
	newThing.vX = vX;
	newThing.vY = vY;
	things.push(newThing);
}

Gun.prototype.contains = function(x, y)
{
	return (Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2) <= this.size * this.size);
}

////////////////////

var gravity = function()
{
	gravityEnabled = document.getElementById("gravity").checked;
};

var reset = function()
{
	things = new Array();
};

var chaos = function()
{
	var hrng = [-1, 1];
	for (var i in things)
	{
		var thing = things[i];
		thing.vX += hrng[Math.floor(Math.random() * 2)]*Math.floor(Math.random() * CHAOS + CHAOS);
		thing.vY += hrng[Math.floor(Math.random() * 2)]*Math.floor(Math.random() * CHAOS + CHAOS);
	}
};