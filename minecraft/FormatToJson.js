var submitForm = function()
{
	var input = document.getElementById("inputtext").value;
	var result = parse(input);
	document.getElementById("outputtext").innerHTML = result;
};

function parse(input)
{
	var strings = input.split("&");
	var result = "";
	if (strings[0] != "")
		result = "{text:\"" + strings[0] + "\"},";
	for (var i = 1; i < strings.length; i++)
	{
		var curr = strings[i];
		var out = "{text:\"" + curr.substr(1, curr.length - 1) + "\"";
		var color = findColor(curr.charAt(0));
		if (color == "")
		{
			logMessage("Invalid input! '" + curr.charAt(0) + "' is not a valid format code.")
			return "";
		}
		out += ",color:" + color;
		out += "},";
		result += out;
	}
	result = "[" + result.replace(/,$/, "") + "]";
	return result;
}
//[{text:"Blargh ",color:dark_purple},{text:"zzz",color:dark_red}]
//&8[&bAnnouncer&8]&7=&8[&6MrLobaLoba&8] &6Booooombastic!

function findColor(c)
{
	switch (c)
	{
		case '0': return "black";
		case '1': return "dark_blue";
		case '2': return "dark_green";
		case '3': return "dark_aqua";
		case '4': return "dark_red";
		case '5': return "dark_purple";
		case '6': return "gold";
		case '7': return "gray";
		case '8': return "dark_gray";
		case '9': return "blue";
		case 'a': return "green";
		case 'b': return "aqua";
		case 'c': return "red";
		case 'd': return "light_purple";
		case 'e': return "yellow";
		case 'f': return "white";
		default: return "";
	}
}

function logMessage(msg)
{
	document.getElementById("message").innerHTML = msg;
	document.getElementById("message").style.color = "#FF4444";
}