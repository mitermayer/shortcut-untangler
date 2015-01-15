define([],
function() {
    'use strict';

    /**
     * Prints a debugging console message for a shortcut
     *
     * @param {Shortcut} shortcut - shortcut object
     */
    var printDebugConsoleMessage = function(shortcut) {
        console.log('Shortcut "' + shortcut.name + '" triggered with key "' + shortcut.key + '"', shortcut);
    };

    return {
        printMessage: printDebugConsoleMessage
    };
});
