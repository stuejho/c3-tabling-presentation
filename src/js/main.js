/*
 * Global variables
 */
var gMessagesRaw = ""; // Messages in unsplit string form

function setMessagesRaw(messagesRaw) {
  gMessagesRaw = messagesRaw;
}

function getMessagesRaw() {
  return gMessagesRaw;
}

/*
 * Functions
 */

/* Render matrix rain */
function render(canvas, context, fontSize, characters, columnYs) {
  // Function constants
  const textColor = window.getComputedStyle(canvas).getPropertyValue("color");
  const font = window.getComputedStyle(canvas).getPropertyValue("font");
  const resetChance = 0.020;  // probability of resetting column
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

/* Delete all current scenes */
function destructScenes() {
  // Current scenes
  let stage = document.getElementById("main-stage");
  let scenes = stage.getElementsByClassName("scene");

  if (scenes.length > 0) {
    // Remove all subsequent scenes in reverse order since length will keep
    // changing (i.e., length can't be used as boundary condition)
    for (let i = scenes.length - 1; i >= 0; --i) {
      scenes[i].outerHTML = "";
    }
  }
}

/* Load display text and set up scene changes */
function constructScenes() {
  // Stage to house scenes
  let stage = document.getElementById("main-stage");

  // Create scenes using messages
  const messageList = getMessagesRaw().split('\n');
  messageList.forEach((message) => {
    // Outer scene div
    const divScene = document.createElement("div");
    divScene.className = "scene";

    // Inner question div
    const divMessage = document.createElement("div");
    divMessage.className = "message";

    // Message header text
    const messageH1 = document.createElement("h1");
    messageH1.innerText = message;

    // Place divs inside each other
    divMessage.appendChild(messageH1);
    divScene.appendChild(divMessage);
    stage.appendChild(divScene);
  });

  // Set up scene transitions
  let scenes = stage.getElementsByClassName("scene");
  const sendToBack = e => { if (e.animationName === "fade") stage.appendChild(scenes[0]); };
  for (let scene of scenes) {
    scene.addEventListener("animationend", sendToBack);
  }
}

/* Show message editor if 'E' is pressed */
function keydownHandler(e) {
  let editor = document.getElementById("editor");
  if ((e.key === 'E' || e.key === 'e') && 
      window.getComputedStyle(editor, null).display === "none") {
    document.getElementById("message-textarea").value = getMessagesRaw();
    openEditor();
  }
  else if (e.key === "Escape" &&
      window.getComputedStyle(editor, null).display === "block") {
    closeEditor();
  }
}

/* Open editor by setting display to block */
function openEditor() {
  document.getElementById("editor").style.display = "block";
}

/* Close editor by setting display to none */
function closeEditor() {
  document.getElementById("editor").style.display = "none";
}

/* Updates the displayed scenes by removing old ones and creating new ones */
function updateScenes(messagesRaw) {
  setMessagesRaw(messagesRaw);
  destructScenes();
  constructScenes();
}

function init() {
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

  // Start rendering characters
  const delay = 50; // milliseconds
  setInterval(render, delay,
    // arguments to render function
    matrixCanvas, ctx, fontSize, chars, yCoords);

  /* Set initial loading messages */
  updateScenes(["......", "Press 'E' to open the Message Editor."].join('\n'));

  /* Get messages to display and create scenes */
  let xhr = new XMLHttpRequest();
  xhr.open("GET", "/messages", true);
  xhr.onload = function () {
    const messagesRaw = xhr.response;
    updateScenes(messagesRaw);
  };
  xhr.send(null);

  let cancelBtn = document.getElementById("cancelBtn");
  cancelBtn.onclick = e => { closeEditor(); };

  let messageEditorForm = document.getElementById("message-editor-form");
  messageEditorForm.onsubmit = () => {
    const messagesRaw = document.getElementById("message-textarea").value;
    updateScenes(messagesRaw);
    closeEditor();
    return false;
  }
}

/* 
 * Event listeners
 */

// Display message editor when the user presses 'E' and
// hide message editor when the user presses 'Esc'
document.addEventListener("keydown", keydownHandler);

window.onload = () => {
  init();
}