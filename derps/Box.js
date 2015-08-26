var things = new Array();
var dragging = false;
var dragOffX;
var dragOffY;
var currentThing;

var mouseX = 0;
var mouseY = 0;
var mouseX2 = 0;
var mouseY2 = 0;
var mouseTime = 0;
var mouseTime2 = 0;

var INTERVAL = 30;
var MULTIPLIER = 500;
var FRICTION = 5;

var main = function()
{
	console.log("Entered main.");
	var canvas = document.getElementById("canvas");
	
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
		color += Math.floor(Math.random() * 255) + ",";
		color += Math.floor(Math.random() * 255) + ",";
		color += Math.floor(Math.random() * 255) + ",0.8)";
		console.log("Added new thing at " + x + " " + y);
		things.push(new Thing(x, y, 20, color));
		update();
	});
	
	setInterval(function() { gravityCheck(); }, INTERVAL);
}

function update()
{
	var ctx = getContext();
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	for (var i in things)
	{
		var thing = things[i];
		thing.draw(ctx);
	}
}

function gravityCheck()
{
	for (var i in things)
	{
		var thing = things[i];
		if (thing == currentThing)
			continue;
		// Needs to accelerate? down is positive
		thing.vY += MULTIPLIER * INTERVAL / 1000;
		
		// Now actually add velocities onto the coords
		thing.y += thing.vY * INTERVAL / 1000;
		thing.x += thing.vX * INTERVAL / 1000;
		if (thing.y + thing.size >= canvas.height)
		{
			thing.y = canvas.height - thing.size;
			thing.vY = -thing.vY * 0.5;
		}
		else if (thing.y - thing.size <= 0)
		{
			thing.y = thing.size;
			thing.vY = -thing.vY * 0.5;
		}
		if (thing.x + thing.size >= canvas.width)
		{
			thing.x = canvas.width - thing.size;
			thing.vX = -thing.vX * 0.8;
		}
		else if (thing.x - thing.size <= 0)
		{
			thing.x = thing.size;
			thing.vX = -thing.vX * 0.8;
		}
		
		// Friction! But only if on the ground
		if (thing.y == canvas.height - thing.size)
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
	}
	update();
}

//////////////////
// THING OBJECT //
//////////////////
function Thing(x, y, size, color)
{
	this.x = x;
	this.y = y;
	this.size = size;
	this.color = color;
	this.vX = 0;
	this.vY = 0;
}

Thing.prototype.draw = function(ctx)
{
	var path = new Path2D();
	path.arc(this.x, this.y, this.size, 0, 360);
	ctx.fillStyle = this.color;
	ctx.fill(path);
}

Thing.prototype.contains = function(x, y)
{
	// just use square bounding box for now
	if (this.x - this.size > x || this.x + this.size < x || this.y - this.size > y || this.y + this.size < y)
		return false;
	return true;
}
//////////////////


function getContext()
{
	var canvas = document.getElementById("canvas");
	if (canvas.getContext)
	{
		var ctx = canvas.getContext("2d");
		return ctx;
	}
	return "";
}

function addListeners()
{
	
}