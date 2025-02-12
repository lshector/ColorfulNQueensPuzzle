let DEBUG = true; // set to false to disable debugging
let old_console_log = console.log;

console.log = function() {
  if (DEBUG) {
    const error = new Error();
    const stackLines = error.stack.split('\n');

    // Find the first line that isn't related to the logger itself.  
    // This is a bit brittle and may need adjustment depending on your
    // environment (e.g., minified code, different browsers).
    let callerLine = null;
    for (let i = 1; i < stackLines.length; i++) {
        if (!stackLines[i].includes("at console.log") && !stackLines[i].includes("at Object.<anonymous>")) { // Adjust as needed
            callerLine = stackLines[i];
            break;
        }
    }


    const args = Array.from(arguments); // Convert arguments to an array
    if (callerLine) {
        args.unshift(`[${callerLine.trim()}]`); // Add the caller info to the beginning
    }

    old_console_log.apply(this, args);
  }
};

export function disableLogging() {
  DEBUG = false;
}

export function enableLogging() {
  DEBUG = true;
}