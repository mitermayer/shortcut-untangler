define([],
function() {
    'use strict';

    return function() {
        var pressedKeys = {};

        /**
         * converts all currently pressed keys into a single unique string
         *
         * @return {String}
         */
        this.getKeys = function() {
            return Object.keys(pressedKeys).sort().join("+");
        };

        /**
         * register a currently pressed key
         *
         * @param {String} key - key pressed
         */
        this.keyDown = function(key) {
            pressedKeys[key] = true;
        };

        /**
         * removes pressed key
         *
         * @param key - key released
         */
        this.keyUp = function(key) {
            delete pressedKeys[key];
        };

        /**
         * clears all pressed keys
         */
        this.clear = function() {
            pressedKeys = {};
        };
    };
});
