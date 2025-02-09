const playButton = document.getElementById('playButton');
const generateButton = document.getElementById('generateButton');
const solveButton = document.getElementById('solveButton');
const uploadButton = document.getElementById('uploadButton');
const editButton = document.getElementById('editButton');
const gridContainer = document.getElementById('grid-container');

const playMenu = document.getElementById('play-menu');
const generateMenu = document.getElementById('generate-menu');
const solveMenu = document.getElementById('solve-menu');
const uploadMenu = document.getElementById('upload-menu');
const editMenu = document.getElementById('edit-menu');
const defaultMessage = document.getElementById('default-message');

function hideAllMenus() {
    playMenu.style.display = 'none';
    generateMenu.style.display = 'none';
    solveMenu.style.display = 'none';
    uploadMenu.style.display = 'none';
    editMenu.style.display = 'none';
    defaultMessage.style.display = 'none';
}

playButton.addEventListener('click', () => {
    hideAllMenus();
    playMenu.style.display = 'block';
});

generateButton.addEventListener('click', () => {
    hideAllMenus();
    generateMenu.style.display = 'block';
    const sizeInput = document.getElementById('size'); // Get input inside the handler
    sizeInput.addEventListener('change', () => {
        console.log("New Grid Size:", sizeInput.value);
    });
});

solveButton.addEventListener('click', () => {
    hideAllMenus();
    solveMenu.style.display = 'block';
});

uploadButton.addEventListener('click', () => {
    hideAllMenus();
    uploadMenu.style.display = 'block';
    const fileElem = document.getElementById("fileElem");
    fileElem.addEventListener("change", handleFiles, false);
    function handleFiles(e) {
      const fileList = e.target.files;
      console.log(fileList);
    }
});

editButton.addEventListener('click', () => {
    hideAllMenus();
    editMenu.style.display = 'block';
});

// Initial state: Show the default message
hideAllMenus();
defaultMessage.style.display = 'block';
