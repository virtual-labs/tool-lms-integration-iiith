class Bubble_sort{
  constructor(){
    this.iterator1 = 0;
    this.iterator2 = 0;
    this.finished = false;
    this.numOfCards = 8;
    this.action = 0;
    this.fn_name = "";
    this.card;
    this.comparisons = 0;
    this.swaps = 0;
    this.operation = "";
    this.interval = 0;
    this.num = [];
  };
};
let bubble_artefact = new Bubble_sort();
function main_functions()
{ 
  randomise();
  start_sort();
  handlers();
};
document.body.onload = function() {main_functions();}
    function handlers(){
    document.getElementById("next").onclick = function() {check_next();};
    document.getElementById("swap").onclick = function() {check_swap();};
    document.getElementById("reset").onclick = function() {reload();};
    };


function randomise()
{ 
  var classToFill = document.getElementById("cards");
    for (var i = 0; i < bubble_artefact.numOfCards; i++){
        bubble_artefact.num[i] = Math.floor(Math.random() * 90 + 10);
        var temp = document.createElement("div");
        temp.className = "card";
        temp.innerHTML = bubble_artefact.num[i];
        temp.style.fontStyle = "normal";
        temp.style.color = "white";
        classToFill.appendChild(temp);
    }
};



function compare(i, j)
{
  bubble_artefact.comparisons++;
  for(var n = 0; n < bubble_artefact.numOfCards; n++)
  {
    if(n == i || n == j) { bubble_artefact.card[n].style.backgroundColor = "#a4c652"; } else { bubble_artefact.card[n].style.backgroundColor = "#288ec8"; }
  }
  if(eval(bubble_artefact.card[j].innerHTML) < eval(bubble_artefact.card[i].innerHTML))
    return true;
  else
    return false;
};



function swap(i, j)
{
  bubble_artefact.swaps++;
  var temp;
  document.getElementById("ins").innerHTML += "<p>Swapping " + bubble_artefact.card[i].innerHTML + " and " + bubble_artefact.card[j].innerHTML + "</p>";
  temp = eval(bubble_artefact.card[j].innerHTML);
  bubble_artefact.card[j].innerHTML = eval(bubble_artefact.card[i].innerHTML);
  bubble_artefact.card[i].innerHTML = temp;
};

var n = 0;


function bubble()
{
  if(bubble_artefact.iterator1 < bubble_artefact.numOfCards-2)
  {
    bubble_artefact.iterator1++;
    bubble_artefact.iterator2++;
  }
  else
  {
    if(bubble_artefact.finished)
    {
      document.getElementById("ins").innerHTML = "<h3>The sort is complete</h3>";
      document.getElementById("next").style.backgroundColor = "grey";
      document.getElementById("next").disabled = true;
      document.getElementById("swap").style.backgroundColor = "grey";
      document.getElementById("swap").disabled = true;
    }
    else
    {
      bubble_artefact.finished = true;
      n++;
      bubble_artefact.iterator1 = 0;
      bubble_artefact.iterator2 = 1;
    }
  }
};



function check_swap(){
  var temp = compare(bubble_artefact.iterator1, bubble_artefact.iterator2);
  if(temp == 1)
  {
    swap(bubble_artefact.iterator1, bubble_artefact.iterator2);
    document.getElementById("ins").innerHTML = "Correct!";
    window[bubble_artefact.fn_name]();
    compare(bubble_artefact.iterator1, bubble_artefact.iterator2);
  }else
    document.getElementById("ins").innerHTML = "Incorrect, Think again!";    
  if(n!=bubble_artefact.numOfCards-1)
    bubble_artefact.finished = false;
  else
    bubble_artefact.finished = true;
};


function check_next(){
  var temp = compare(bubble_artefact.iterator1, bubble_artefact.iterator2);
  if(temp == 1)
    document.getElementById("ins").innerHTML = "Incorrect, Think again! Do we need to swap here?"; 
  else
  {
    document.getElementById("ins").innerHTML = "Correct!";
    window[bubble_artefact.fn_name]();
    compare(bubble_artefact.iterator1, bubble_artefact.iterator2);
  }
  if(n!=bubble_artefact.numOfCards-1)
    bubble_artefact.finished = false;
  else
    bubble_artefact.finished = true;
};


function start_sort()
{
  document.getElementById("comment-box-smaller").style.visibility = "visible";
  bubble_artefact.card = document.querySelectorAll('.card');
  bubble_artefact.action = 1;
  bubble_artefact.finished = true;
  bubble_artefact.comparisons = 0;
  bubble_artefact.swaps = 0;
  bubble_artefact.fn_name = "bubble";

  bubble_artefact.iterator1 = 0;
  bubble_artefact.iterator2 = 1;
  bubble_artefact.operation = "Swap";
  compare(bubble_artefact.iterator1, bubble_artefact.iterator2);

  document.getElementById("swap").style.visibility = "visible";
  document.getElementById("next").style.visibility = "visible";

  document.getElementById("swap").onclick = function() { check_swap(); };
  document.getElementById("next").onclick = function() { check_next(); };

  document.getElementById("next").disabled = false;
};

function reload(){
  location.reload(true);
};
