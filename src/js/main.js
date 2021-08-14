/*
 * Functions
 */

/* Function to render matrix rain */
function render(canvas, context, fontSize, characters, columnYs) {
  // Function constants
  const textColor = window.getComputedStyle(canvas).getPropertyValue("color");
  const font = window.getComputedStyle(canvas).getPropertyValue("font");
  const resetChance = 0.025;  // probability of resetting column
                              // after traveling screen height

  // Matrix background is partially transparent to show a trail
  context.fillStyle = "rgba(0, 0, 0, 0.05)";
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Set text properties
  context.fillStyle = textColor;
  context.font = font;

  // Draw a character for each column
  columnYs.forEach((yIndex, xIndex, arrRef) => {
    // Get a random character
    const character = characters[Math.floor(Math.random() * characters.length)];
    const xDraw = xIndex * fontSize;
    const yDraw = yIndex * fontSize;

    context.fillText(character, xDraw, yDraw);

    // Randomly reset y-coordinate after reaching bottom of screen
    if (yDraw > canvas.height && Math.random() < resetChance) arrRef[xIndex] = 0;

    ++arrRef[xIndex];
  });
}

/* Function to load display text and set up scene changes */
function setupScenes(messages) {
  // Remove initializing message
  const temp = document.getElementById("temp");
  temp.addEventListener("animationend", () => temp.outerHTML = "");

  // Stage to house scenes
  let stage = document.getElementById("main-stage");

  // Create scenes using messages
  messages.forEach((message) => {
    // Outer scene div
    const divScene = document.createElement("div");
    divScene.className = "scene";

    // Inner question div
    const divQuestion = document.createElement("div");
    divQuestion.className = "question";

    // Question header text
    const question = document.createElement("h1");
    question.innerHTML = message;

    // Place divs inside each other
    divQuestion.appendChild(question);
    divScene.appendChild(divQuestion);
    stage.appendChild(divScene);
  });

  // Set up scene transitions
  let scenes = stage.getElementsByClassName("scene");
  const sendToBack = e => { if (e.animationName === "fade") stage.appendChild(scenes[0]); };
  for (let i = 0; i < scenes.length; ++i) {
    // when the animation ends, move the current first element to
    // the back of the sets (since that's what appendChild does
    // when an existing node is appended)
    scenes[i].addEventListener("animationend", sendToBack);
  }
}

/* 
 * Main script execution
 */

/* Set up matrix rain */

// Get canvas and context (where things are rendered)
const matrixId = "matrix";
let matrixCanvas = document.getElementById(matrixId);
let ctx = matrixCanvas.getContext("2d");

// Canvas size matches window size
matrixCanvas.height = window.innerHeight;
matrixCanvas.width = window.innerWidth;

// Characters to display
// https://scifi.stackexchange.com/questions/137575/is-there-a-list-of-the-symbols-shown-in-the-matrixthe-symbols-rain-how-many
const charsUnsplit = "日ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ012345789ZTHEMATRIX:・.\"=*+-<>¦｜ｸ";
const chars = charsUnsplit.split('');

// Use page font size to set matrix dimensions
/* fontSize from document body: 
 * https://newbedev.com/how-can-i-get-default-font-size-in-pixels-by-using-javascript-or-jquery 
 */
const fontSize = Number(window.getComputedStyle(matrixCanvas).getPropertyValue('font-size').match(/\d+/)[0]);
const numCols = Math.ceil(matrixCanvas.width / fontSize);
let yCoords = Array(numCols).fill(1); // initial y coordinate

// Render characters
const delay = 50; // milliseconds
setInterval(render, delay,
  // arguments to render function
  matrixCanvas, ctx, fontSize, chars, yCoords);

/* Get messages to display and create scenes */
let xhr = new XMLHttpRequest();
xhr.open("GET", "/messages", true);
xhr.onload = function () {
  const messages = xhr.response;
  setupScenes(messages.split('\n'));
};
xhr.send(null);
