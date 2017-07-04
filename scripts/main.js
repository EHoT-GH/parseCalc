var log = console.log;

function calculate() {
  var string = document.getElementById('input').value;
  var result = document.getElementById('result');
      result.value = calcString(modifyConfig(string));
}

function modifyConfig(string) {
  string = toModify(string, "-(", "-1*(");
  string = toModify(string, ")(", ")*(");
  string = toModify(string, " ", "");
  string = toModify(string, "-", "+-");
  string = toModify(string, "--", "+");
  string = toModify(string, "++", "+");
  string = toModify(string, "(+", "(");
  for (var i = 0; i < 10; i++) {
    string = toModify(string, i + "(", i + "*" + "(");
  }
  while(string.charAt(0) === "+") string = string.substr(1);
  log(string);
  return string;
}

function toModify(string, condition, replacement) {
  return string.split(condition).join(replacement);
}

function calcString(string) {
  first:
      while (stringContains(string, "(")) {
        var first = string.indexOf("(");
        var last = first + 1;
        var layer = 1;
        while (layer !== 0) {
          if (string[last] === ")") {
            layer--;
            if (layer === 0) break;
          }
          else if (string[last] === "(") {
            layer++;
          }
          last++;
          if (last > string.length) break first;
        }

        var nested = string.substr(first + 1, last - first - 1);

        if (last + 1 <= string.length) {
          if (string[last + 1] === "^") {
            string = string.substr(0, last + 1) + "&" + string.substr((last+1)+1);
          }
        }

        var calculatedString = calcString(nested);
        var preString = "(" + nested + ")";
        string = string.replace(preString, calculatedString);
      }
  while (stringContains(string, "^")) string = postFunc(string, "^", function(l, r) {
    return Math.pow(parseFloat(l),parseFloat(r));
    }, false);
  while (stringContains(string, "&")) string = postFunc(string, "&", function(l, r) {
    return Math.pow(parseFloat(l),parseFloat(r));
    });
  while (stringContains(string, "*") || stringContains(string, "/")) {
    var multiply = true;
    if (string.indexOf("*") < string.indexOf("/")) {
      multiply = (stringContains(string, "*"));
    } else {
      multiply = !(stringContains(string, "/"));
    }
    string = (multiply) ? postFunc(string, "*", function(l, r) {
      return parseFloat(l)*parseFloat(r);
    }) : postFunc(string, "/", function(l, r) {
      return parseFloat(l)/parseFloat(r);
    });
  }
  while (stringContains(string, "+")) string = postFunc(string, "+", function(l, r) {
    return parseFloat(l)+parseFloat(r);
  });
  log(' = ', string);
  return string;
}

function stringContains(string, condition) {
  return string.indexOf(condition) > -1;
}

function isNegative(num, minus) {
  return (!isNaN(num) || (num === "-" && !minus) || num === ".");
}

function getSides(string, between, direction, minus) {
  var i = between + direction;
  var term = "";
  var limit = (direction === -1) ? 0 : string.length;
  while (i * direction <= limit) {
    if (isNegative(string[i], minus)) {
      if (direction === 1) term = term + string[i];
      else term = string[i] + term;
      i += direction;
    } else { return term; }
  }
  return term;
}

function postFunc(string, symbol, post, minus) {
  minus = (typeof minus !== 'undefined');
  if (stringContains(string, symbol)) {
    var middleIndex = string.indexOf(symbol);
    var left = getSides(string, middleIndex, -1, minus);
    var right = getSides(string, middleIndex, 1, false);
    string = toModify(string, left+symbol+right, post(left, right));
  }
  return string;
}