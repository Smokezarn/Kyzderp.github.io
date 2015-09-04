var submitForm = function()
{
	var input = document.getElementById("inputtext").value;
	var result = parse(input);
	if (result != "")
	{
		var prefix = document.getElementById("tellraw").checked;
		if (prefix)
			result = "/tellraw @a " + result;
		document.getElementById("outputtext").innerHTML = result;
		document.getElementById("outputtext").select();
	}
};

function parse(input)
{
	var strings = input.replace(/\n|\r/g, "").split("&");
	var result = "";
	if (strings[0] != "")
		result = "{text:\"" + strings[0] + "\"},";
	var carryover = "";
	for (var i = 1; i < strings.length; i++)
	{
		var curr = strings[i];
		if (curr == "")
		{
			logMessage("You derp, you're not allowed to have two &'s in a row!");
			return "";
		}
		
		var text = curr.substr(1, curr.length - 1);
		var chr = curr.charAt(0);
		if (chr.match(/[0-9a-f]/))
			out = ",color:" + findColor(chr);
		else
		{
			var rtn = findFormat(chr);
			if (rtn == "")
			{
				logMessage("Invalid input! '" + curr.charAt(0) + "' is not a valid format code.")
				return "";
			}
			out = "," + rtn + ":true";
		}
		
		
		
		if (text == "") //This means there is only format code, so needs to carry over to next one
		{
			carryover += out;
		}
		else
		{
			result += "{text:\"" + text + "\"" + carryover + out + "},";
			carryover = "";
		}
	}
	result = "[" + result.replace(/,$/, "") + "]";
	return result;
}
//[{text:"Blargh ",color:dark_purple},{text:"zzz",color:dark_red}]
//{text:"Hello",underlined:true,strikethrough:true,obfuscated:true}
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

function findFormat(c)
{
	switch (c)
	{
		case 'k': return "obfuscated";
		case 'l': return "bold";
		case 'm': return "strikethrough";
		case 'n': return "underlined";
		case 'o': return "italic"; // IDK WHICH ONE THIS IS
		default: return "";
	}
}

function logMessage(msg)
{
	document.getElementById("message").innerHTML = msg;
	document.getElementById("message").style.color = "#FF4444";
}

//TODO: preview maybe?