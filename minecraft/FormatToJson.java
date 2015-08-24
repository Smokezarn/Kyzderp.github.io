import java.util.*;

public class FormatToJson
{
  public static void main(String[] args)
  {
    String all = "";
    Scanner reader = new Scanner(System.in);
    while(reader.hasNext())
    {
      all = reader.nextLine();
      System.out.println(all);
      
      String[] result = new String[all.length()];
      int resultIndex = 0;
      String color = "";
      String text = "text:\"";
      int nextOp = 0; // 0 = just read, 1 = read color
      for (int i = 0; i < all.length(); i++)
      {
        char curr = all.charAt(i);
        if (nextOp == 1)
        {
          if (!findColor(curr).equals(""))
            color = ",color:" + findColor(curr);
          nextOp = 0;
        }
        else if (nextOp == 0) // regular reading
        {
          if (curr == '&') // close the previous, start new
          {
            result[resultIndex] = "{" + text + "\"" + color + "}";
            resultIndex++;
            color = "";
            text = "text:\"";
            nextOp = 1;
          }
          else
          {
            text += curr;
            nextOp = 0;
          }
        }
      }
      result[resultIndex] = "{" + text + "\"" + color + "}";
      String out = "[";
      for (int i = 1; i < result.length; i++)
      {
        String segment = result[i];
        if (segment == null)
          break;
        out += segment + ",";
      }
      System.out.println(out.substring(0, out.length() - 1) + "]");
      break;
    }
  }
  
  private static String findColor(char c)
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
    }
    return "";
  }
}