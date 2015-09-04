var things = new Array();
var guns = new Array();
var enemies = new Array();

var INTERVAL = 30;
var RELOADTIME = 300;
var ENEMYRELOAD = 6000;
var FLOORLEVEL;

var running = false;
var score = 0;
var numGames = 0;
var gameover = false;

var autopause = true;
var autoresume = false;
var frombutton = true;

var chartctx;
var scorechart;
var data;

var best = Number.NEGATIVE_INFINITY;
var worst = Number.POSITIVE_INFINITY;
var average = 0;
var timeplayed = 0;
var gameTime = 0;

var chartvisible = false;
var displayStats = "Best: -<br/>Worst: -<br/>Average: -<br/>Games: 0<br/>Time Played: 00:00:00<br/>";

var main = function()
{
	var canvas = document.getElementById("canvas");
	FLOORLEVEL = canvas.height;// - 25;
	
	// Get rid of annoying text select
	canvas.addEventListener("selectstart", function(e)
	{
		e.preventDefault();
		return false;
	}, false);
	
	// Click to fire
	canvas.addEventListener("click", function(e)
	{
		if (!running)
			return;
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
		if (found && found.reload >= RELOADTIME)
		{
			found.launch((x - found.x) * 20, (y - found.y) * 20);
			found.reload = 0;
			score -= 1000;
		}
	});
	
	$(".header").click(function()
	{
		$header = $(this);
		$content = $header.next();
		if ($header.attr("id") == "chartheader")
		{
			chartvisible = false;
			document.getElementById("stats").innerHTML = "";
		}
		$content.slideToggle(500, function()
		{
			
			if ($header.attr("id") == "chartheader" && $content.is(":visible"))
			{
				chartvisible = true;
				document.getElementById("stats").innerHTML = displayStats;
				showchart();
			}
		});
	});
		
	guns.push(new Gun(canvas.width/2, FLOORLEVEL/2, 30));	
	update(true);
	
	setTimeout(callback, INTERVAL-1);
}


function callback()
{
	collisionCheck();
	setTimeout(callback, INTERVAL-1);
}

function update(firstTime)
{
	var ctx = getContext();
	ctx.fillStyle = "rgb(150,150,150)";
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	
	for (var i = 0; i < things.length;)
	{
		var thing = things[i];
		
		if (running && thing.lifetime != "nonexpire")
		{
			if (thing.lifetime > 0)
				thing.lifetime -= INTERVAL;
			if (thing.lifetime <= 0)
			{
				things.splice(things.indexOf(thing), 1);
				continue;
			}
		}
		thing.draw(ctx);
		i++;
	}
	
	for (var i in guns)
	{
		var gun = guns[i];
		if (running && gun.reload < RELOADTIME)
			gun.reload += INTERVAL;
		gun.draw(ctx);
	}
	
	for (var i in enemies)
	{
		var enemy = enemies[i];
		if (running && enemy.reload < ENEMYRELOAD)
			enemy.reload += INTERVAL;
		enemy.draw(ctx);
	}
	
	ctx.clearRect(0, FLOORLEVEL, canvas.width, canvas.height - FLOORLEVEL);
	ctx.strokeStyle = "rgb(0,0,0)";
	ctx.strokeRect(0, 0, canvas.width, FLOORLEVEL);
	
	ctx.fillStyle = "rgb(0,0,0)";
	ctx.font = "bold 16px Arial,sans-serif";
	ctx.fillText("Score: " + score, 5, canvas.height - 5);
	if (gameover)
	{
		ctx.font = "bold 30px Arial,sans-serif";
		ctx.fillText("GAME OVER", (canvas.width - ctx.measureText("GAME OVER").width)/2, FLOORLEVEL/2);
		ctx.font = "bold 16px Arial,sans-serif";
		ctx.fillText("SCORE: " + score, (canvas.width - ctx.measureText("SCORE: " + score).width)/2, FLOORLEVEL/2 + 20);
	}
	else if (!running && !firstTime)
	{
		ctx.font = "bold 30px Arial,sans-serif";
		ctx.fillText("PAUSED", (canvas.width - ctx.measureText("PAUSED").width)/2, FLOORLEVEL/2);
	}
	if (chartvisible)
	{
		if (best == Number.NEGATIVE_INFINITY)
			displayStats = "Best: -<br/>Worst: -<br/>Average: -<br/>Games: 0<br/>Time Played: " + (("" + Math.floor((timeplayed + gameTime)/1000)).toHHMMSS()) + "<br/>";
		else
			displayStats = "Best: " + best + "<br/>Worst: " + worst + "<br/>Average: " + average + "<br/>Games: " + numGames + "<br/>Time Played: " + (("" + Math.floor((timeplayed + gameTime)/1000)).toHHMMSS()) + "<br/>";
		document.getElementById("stats").innerHTML = displayStats;
	}
	else
		document.getElementById("stats").innerHTML = "";
	ctx.font = "14px sans-serif";
}

function collisionCheck()
{
	if (running)
	{
		if (!document.hasFocus() && autopause)
		{
			frombutton = false;
			stop();
		}
		for (var i in things)
		{
			var thing = things[i];
			
			// Now actually add velocities onto the coords
			thing.y += thing.vY * INTERVAL / 1000;
			thing.x += thing.vX * INTERVAL / 1000;
			
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
				}
			}

			if (thing.type != "bullet")
			{
				for (var j in guns)
				{
					if (thing.collides(guns[j]) > 0)
						game();
				}
			}
			
			// WALL CHECKS //
			if (thing.y + thing.size >= FLOORLEVEL)
			{
				thing.y = FLOORLEVEL - thing.size;
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
			
			for (var j in things)
			{
				things[j].exclude = [];
			}
		}
		
		for (var i in enemies)
		{
			var enemy = enemies[i];
			// Fire new one every 6 secs
			if (enemy.reload >= ENEMYRELOAD)
			{
				enemy.launch();
				enemy.reload = 0;
			}
		}
		
		if (score < INTERVAL && enemies.length == 0)
			enemies.push(new Enemy(30, 30, "200,100,100", 30));
		else if (enemies.length == 1 && score < 30000 + INTERVAL && score >= 30000)
			enemies.push(new Enemy(canvas.width - 30, FLOORLEVEL - 30, "200,200,100", 30));
		else if (enemies.length == 2 && score < 60000 + INTERVAL && score >= 60000)
			enemies.push(new Enemy(canvas.width - 30, 30, "100,200,200", 30));
		else if (enemies.length == 3 && score < 90000 + INTERVAL && score >= 90000)
			enemies.push(new Enemy(30, FLOORLEVEL - 30, "200,100,200", 30));
		
		score += INTERVAL;
		gameTime += INTERVAL;
		update(false);
	}
	else
	{
		if (document.hasFocus() && autoresume && !frombutton && !gameover)
		{
			frombutton = false;
			start();
		}
	}
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

function moveunstuck(thing1, thing2)
{
	var dx = thing1.x - thing2.x;
	var dy = thing1.y - thing2.y;
	var dist = Math.sqrt(Math.pow(thing1.x - thing2.x, 2) + Math.pow(thing1.y - thing2.y, 2));
	var r = thing1.size + thing2.size;
	var fraction = (r - dist)/r;
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
	
}

function unstuck(thing1, thing2)
{
	console.log("unstuck");
	if (Math.abs(thing1.vX) < 50 && Math.abs(thing2.vX) < 50 && Math.abs(thing1.vY) < 50 && Math.abs(thing2.vY) < 50)
	{
		moveunstuck(thing1, thing2);
		return;
	}
	do
	{
		thing1.x -= thing1.vX/INTERVAL/10;
		thing1.y -= thing1.vY/INTERVAL/10;
		thing2.x -= thing2.vX/INTERVAL/10;
		thing2.y -= thing2.vY/INTERVAL/10;
	} while (thing1.collides(thing2) > 1);
	console.log("exit unstuck");
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

var game = function()
{
	timeplayed += gameTime;
	gameTime = 0;
	gameover = true;
	running = false;
	fromButton = true;
	document.getElementById("control").value = "Try Again";

	if (score > best)
		best = score;
	if (score < worst)
		worst = score;
	average = (average * numGames + score) / (numGames + 1);
	
	numGames++;
	addScore("Game " + numGames, score);
	if (chartvisible)
		displayStats = "Best: " + best + "<br/>Worst: " + worst + "<br/>Average: " + average + "<br/>Games: " + numGames + "<br/>Time Played: " + (("" + Math.floor((timeplayed + gameTime)/1000)).toHHMMSS()) + "<br/>";
}

//////////////////
// THING OBJECT //
//////////////////
function Thing(x, y, size, color, lifetime, type)
{
	this.x = x;
	this.y = y;
	this.size = size;
	this.color = color;
	this.lifetime = lifetime;
	this.type = type;
	this.vX = 0;
	this.vY = 0;
	this.xOffset = 0;
	this.yOffset = 0;
	this.exclude = [];
}

Thing.prototype.draw = function(ctx)
{
	var path = new Path2D();
	path.arc(this.x, this.y, this.size, 0, 360);
	ctx.fillStyle = "rgba(" + this.color + ",0.8)";
	ctx.fill(path);
}

Thing.prototype.contains = function(x, y)
{
	return (Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2) <= this.size * this.size);
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

////////////////
// GUN OBJECT //
////////////////
function Gun(x, y, size)
{
	this.x = x;
	this.y = y;
	this.size = size;
	this.reload = RELOADTIME;
}

Gun.prototype.draw = function(ctx)
{
	ctx.fillStyle = "rgba(100,100,100,0.8)";
	var path = new Path2D();
	path.arc(this.x, this.y, this.size, 0, 2*Math.PI);
	ctx.fill(path);
	path = new Path2D();
	path.arc(this.x, this.y, 5, 0, 360);
	ctx.fill(path);
	
	path = new Path2D();
	path.moveTo(this.x, this.y);
	path.lineTo(this.x, this.y - this.size);
	if (this.reload < RELOADTIME)
		path.arc(this.x, this.y, this.size, -Math.PI/2, 2*Math.PI*this.reload/RELOADTIME - Math.PI/2, true);
	ctx.fill(path);
}

Gun.prototype.launch = function(vX, vY)
{
	var newThing = new Thing(this.x, this.y, 10, "100,100,100", 5000, "bullet");
	newThing.vX = vX;
	newThing.vY = vY;
	things.push(newThing);
}

Gun.prototype.contains = function(x, y)
{
	return (Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2) <= this.size * this.size);
}

//////////////////
// ENEMY OBJECT //
//////////////////

function Enemy(x, y, color, size)
{
	this.x = x;
	this.y = y;
	this.color = color;
	this.size = size;
	this.reload = ENEMYRELOAD - 3000;
}

Enemy.prototype.draw = function(ctx)
{
	ctx.fillStyle = "rgba(" + this.color + ",0.6)";
	var path = new Path2D();
	path.arc(this.x, this.y, this.size, 0, 360);
	ctx.fill(path);

	path = new Path2D();
	path.moveTo(this.x, this.y);
	path.lineTo(this.x, this.y - this.size);
	if (this.reload < ENEMYRELOAD)
		path.arc(this.x, this.y, this.size, -Math.PI/2, 2*Math.PI*this.reload/ENEMYRELOAD - Math.PI/2, true);
	ctx.fillStyle = "rgb(" + this.color + ")";
	ctx.fill(path);
}

Enemy.prototype.launch = function()
{
	var x = 1, y = 1;
	if (this.x > canvas.width/2)
		x = -1;
	if (this.y > canvas.height/2)
		y = -1;
	var newThing = new Thing(this.x, this.y, 20, this.color, "nonexpire", "enemyball");
	newThing.vX = x * (Math.random() * 20 + 100);
	newThing.vY = y * (Math.random() * 20 + 50);
	things.push(newThing);
}


////////////////////


var stop = function()
{
	running = false;
	document.getElementById("control").value = "Resume";
	update();
};

var start = function()
{
	if (gameover)
	{
		delete things;
		things = new Array();
		delete enemies;
		enemies = new Array();
		score = 0;
		gameover = false;
	}
	running = true;
	document.getElementById("control").value = "Pause";
};

var toggle = function()
{
	frombutton = true;
	if (running)
		stop();
	else
		start();
};

var focusOptions = function()
{
	autopause = document.getElementById("autopause").checked;
	autoresume = document.getElementById("autoresume").checked;
};

String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    var time    = hours+':'+minutes+':'+seconds;
    return time;
}


//// SETTINGS ////
function changeFPS()
{
	INTERVAL = parseInt(document.getElementById("fps").value);
	document.getElementById("fpsdisplay").innerHTML = INTERVAL + "ms (~" + Math.floor(1000/INTERVAL) + " fps)";
}

//// CHART ////
function initchart()
{
	data = {
		labels: [],
		datasets: [
			{
				label: "Scores",
				fillColor: "rgba(220,220,220,0.2)",
				strokeColor: "rgba(220,220,220,1)",
				pointColor: "rgba(50,100,0,1)",
				pointStrokeColor: "#fff",
				pointHighlightFill: "#fff",
				pointHighlightStroke: "rgba(220,220,220,1)",
				data: []
			}
		]
	};

	chartctx = document.getElementById("scorechart").getContext("2d");	
	showchart();
}

function showchart()
{
	var chartcanvas = document.getElementById("scorechart");
	chartcanvas.height = 500;
	chartcanvas.width = 1000;
	if (data.labels.length == 0)
	{
		chartctx.fillStyle = "rgb(255,255,255)";
		chartctx.font = "14px sans-serif";
		chartctx.fillText("Start playing to see your scores!", 10, 30);
	}
	else
	{
		if (typeof scorechart !== "undefined")
			scorechart.destroy();
		scorechart = new Chart(chartctx).Line(data, {bezierCurve: false, scaleFontColor: "#FFF", scaleLineColor: "rgba(200,200,200,1)"});
	}
}

function addScore(label, score)
{
	data.labels.push(label);
	data.datasets[0].data.push(score);
	if (chartvisible)
		showchart();
}