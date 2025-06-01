class Bubble_sort{
  constructor(){
    this.iterator1 = 0;
    this.iterator2 = 0;
    this.numOfCards = 6;
    this.finished = false;
    this.action = 0;
    this.fn_name = "";
    this.card;
    this.comparisons = 0;
    this.swaps = 0;
    this.operation = "";
    this.interval = 0;
    this.iterations = 0;
    this.num = [];
    this.copy_array = [];
    this.undo_array = [];
    this.undo_index = 0;
  };
};
let bubble_artefact = new Bubble_sort();

function main_functions()
{ 
  randomise();
  handlers();
};
document.body.onload = function() {main_functions();}
    function handlers(){
    document.getElementById("start").onclick = function() {start_sort();};
    document.getElementById("next").onclick = function() {start_sort();};
    document.getElementById("reset").onclick = function() {reload();};
    document.getElementById("undo").onclick = function() {undo();};    
    };

function randomise()
{
  var classToFill = document.getElementById("cards");
    for (var i = 0; i < bubble_artefact.numOfCards; i++) {
          bubble_artefact.num[i] = Math.floor(Math.random() * 90 + 10);
          bubble_artefact.copy_array[i] = bubble_artefact.num[i];
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
  document.getElementById("ins").innerHTML = "Number of iterations: "+bubble_artefact.iterations;
  for(var k = 0; k < bubble_artefact.numOfCards; k++)
  {
    if(k == i || k == j) { bubble_artefact.card[k].style.backgroundColor = "#a4c652"; } else { bubble_artefact.card[k].style.backgroundColor = "#288ec8"; }
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
  temp = bubble_artefact.num[j];
  bubble_artefact.num[j] = bubble_artefact.num[i];
  bubble_artefact.num[i] = temp;
  temp = eval(bubble_artefact.card[j].innerHTML);
  bubble_artefact.card[j].innerHTML = eval(bubble_artefact.card[i].innerHTML);
  bubble_artefact.card[i].innerHTML = temp;
};



function bubble()
{
  if(bubble_artefact.iterator1 < bubble_artefact.numOfCards-2)
  {
    bubble_artefact.iterator1++;
    bubble_artefact.iterator2++;
  }
  else
  {
    bubble_artefact.finished = true;
    bubble_artefact.iterations++;
    bubble_artefact.iterator1 = 0;
    bubble_artefact.iterator2 = 1;
  }
};


function check_swap(){
  swap(bubble_artefact.iterator1, bubble_artefact.iterator2);
  compare(bubble_artefact.iterator1, bubble_artefact.iterator2);
  bubble_artefact.undo_array[bubble_artefact.undo_index++] = 1;
  document.getElementById("ins").innerHTML = "Number of iterations: "+bubble_artefact.iterations;
};


function check_next(){
  window[bubble_artefact.fn_name]();
  compare(bubble_artefact.iterator1, bubble_artefact.iterator2);
  document.getElementById("ins").innerHTML = "Number of iterations: "+bubble_artefact.iterations;
  bubble_artefact.undo_array[bubble_artefact.undo_index++] = 2;
  if(bubble_artefact.iterations == bubble_artefact.numOfCards)
  {
    document.getElementById("next").disabled = true;
    document.getElementById("swap").disabled = true;
    document.getElementById("next").style.backgroundColor = "grey";
    document.getElementById("swap").style.backgroundColor = "grey";
  }
};

function undo(){
  if(bubble_artefact.undo_index >= 1)
  {
    var top = --bubble_artefact.undo_index;
    if(top >= -1)
    {
      if(bubble_artefact.undo_array[top] == 1)
      { 
        swap(bubble_artefact.iterator1, bubble_artefact.iterator2);
        compare(bubble_artefact.iterator1, bubble_artefact.iterator2);
      }else
      {
        if(bubble_artefact.iterator1==0)
        {
          bubble_artefact.iterator1 = bubble_artefact.numOfCards-2;
          bubble_artefact.iterator2 = bubble_artefact.numOfCards-1;
          bubble_artefact.iterations--;
         document.getElementById("ins").innerHTML = "Number of iterations: "+bubble_artefact.iterations;
         if(bubble_artefact.iterations < bubble_artefact.numOfCards)
          {
            document.getElementById("next").disabled = false;
            document.getElementById("swap").disabled = false;
            document.getElementById("next").style.backgroundColor = "#288ec8";
            document.getElementById("swap").style.backgroundColor = "#288ec8";
          }
        }else{
        bubble_artefact.iterator1--;
        bubble_artefact.iterator2--;
      }
        compare(bubble_artefact.iterator1, bubble_artefact.iterator2);
      }
    }
  }
};

function submit(){
  bubble_artefact.copy_array.sort();
  var flag=0;
  
  for(var i = 0; i < bubble_artefact.numOfCards; i++)
    if(bubble_artefact.num[i] != bubble_artefact.copy_array[i])
      flag=1;

  // Calculate partial score based on performance
  var score = 0;
  var optimalComparisons = bubble_artefact.numOfCards * (bubble_artefact.numOfCards - 1) / 2;
  var optimalSwaps = bubble_artefact.numOfCards - 1; // Best case for bubble sort
  
  if(flag == 0){
      // CORRECT SOLUTION: Base score 60% + efficiency bonus up to 40%
      score = 60; // Base score for correct solution
      
      // Efficiency calculations:
      // - Comparison efficiency: fewer comparisons = higher score
      // - Swap efficiency: fewer swaps = higher score
      var comparisonEfficiency = Math.max(0, (optimalComparisons * 2 - bubble_artefact.comparisons) / (optimalComparisons * 2));
      var swapEfficiency = Math.max(0, (optimalSwaps * 3 - bubble_artefact.swaps) / (optimalSwaps * 3));
      
      // Add efficiency bonus (up to 20 points each = 40 total)
      score += Math.round((comparisonEfficiency + swapEfficiency) * 20);
      score = Math.min(100, Math.max(60, score)); // Ensure score is between 60-100%
      
      // SCORM status based on score threshold
      setSCORMValue("cmi.core.lesson_status", score >= 80 ? "passed" : "completed");
      setSCORMValue("cmi.core.success_status", score >= 80 ? "passed" : "unknown");
      
      // Display success message with score
      document.getElementById("ins").innerHTML = 
        "<h3>Congratulations! Array sorted correctly!</h3>" +
        "<p><strong>Your Score: " + score + "%</strong></p>" +
        "<p>Comparisons: " + bubble_artefact.comparisons + " | Swaps: " + bubble_artefact.swaps + "</p>" +
        "<p>" + (score >= 80 ? "Excellent work! You passed with flying colors!" : "Good job! Try to be more efficient next time.") + "</p>";
  }
  else{
      // INCORRECT SOLUTION: Partial credit 10-40% based on progress
      var progressScore = 0;
      var correctPairs = 0;
      
      // Count adjacent pairs that are in correct order
      for(var i = 0; i < bubble_artefact.numOfCards - 1; i++) {
        if(bubble_artefact.num[i] <= bubble_artefact.num[i + 1]) {
          correctPairs++;
        }
      }
      
      // Calculate progress score: (correct pairs / total pairs) * 40%
      progressScore = Math.round((correctPairs / (bubble_artefact.numOfCards - 1)) * 40);
      score = Math.max(10, progressScore); // Minimum 10% for attempting
      
      setSCORMValue("cmi.core.lesson_status", "incomplete");
      setSCORMValue("cmi.core.success_status", "failed");
      
      // Display partial credit message
      document.getElementById("ins").innerHTML = 
        "<h3>Array not sorted correctly</h3>" +
        "<p><strong>Your Score: " + score + "%</strong></p>" +
        "<p>Comparisons: " + bubble_artefact.comparisons + " | Swaps: " + bubble_artefact.swaps + "</p>" +
        "<p>You got " + correctPairs + " out of " + (bubble_artefact.numOfCards - 1) + " adjacent pairs in correct order.</p>" +
        "<p>Keep practicing! Try again to improve your score.</p>";
  }
  
  // Always record the calculated score
  setSCORMValue("cmi.core.score.raw", score.toString());
  commitSCORM();
  
  // Update button to "Try Again" after submission
  document.getElementById("start").value = "Try Again";
  document.getElementById("start").disabled = false;
  document.getElementById("start").style.backgroundColor = "#288ec8";
  document.getElementById("start").style.visibility = "visible";
  document.getElementById("start").onclick = function() {reload();};
  
  // Disable all other buttons after submission
  document.getElementById("next").disabled = true;
  document.getElementById("swap").disabled = true;
  document.getElementById("undo").disabled = true;
  document.getElementById("next").style.backgroundColor = "grey";
  document.getElementById("swap").style.backgroundColor = "grey";
  document.getElementById("undo").style.backgroundColor = "grey";
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

  // Change Start button to Submit button
  document.getElementById("start").value = "Submit";
  document.getElementById("start").onclick = function() {submit()};
  
  // Show and enable all control buttons
  document.getElementById("swap").style.visibility = "visible";
  document.getElementById("next").style.visibility = "visible";
  document.getElementById("undo").style.visibility = "visible";
  document.getElementById("swap").disabled = false;
  document.getElementById("next").disabled = false;
  document.getElementById("undo").disabled = false;
  document.getElementById("swap").style.backgroundColor = "#288ec8";
  document.getElementById("next").style.backgroundColor = "#288ec8";
  document.getElementById("undo").style.backgroundColor = "#288ec8";

  document.getElementById("swap").onclick = function() { check_swap(); };
  document.getElementById("next").onclick = function() { check_next(); };
  document.getElementById("undo").onclick = function() { undo(); };

  document.getElementById("next").disabled = false;
};
function reload(){
  location.reload(true);
};
