let DEBUG = true; // set to false to disable debugging
let old_console_log = console.log;
console.log = function() {
    if ( DEBUG ) {
        old_console_log.apply(this, arguments);
    }
}

export function disableLogging() {
    DEBUG = false;
}

export function enableLogging() {
    DEBUG = true;
}

