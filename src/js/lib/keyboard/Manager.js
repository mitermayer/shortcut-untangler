define([
        'lib/keyboard/Keys'
    ],
    function(
       Keys
    ) {
        'use strict';

    var KEY_WHEN_PRESSING_SHIFT = Keys.KEY_WHEN_PRESSING_SHIFT;

    return function() {
        var pressedKeys = {};

        /**
         * converts all currently pressed keys into a single unique string
         *
         * @return {String}
         */
        this.getKeys = function() {
            var keysPressedArray = Object.keys(pressedKeys);
            var ret;

            // we only consider a shift modief combo key if there were only 2 keys pressed, the modifier and the target key
            if(pressedKeys.SHIFT && keysPressedArray.length === 2) {
                var nonShiftKeyIndex = keysPressedArray.indexOf("SHIFT") === 0 ? 1 : 0;

                ret = KEY_WHEN_PRESSING_SHIFT[keysPressedArray[nonShiftKeyIndex]];
            }

            ret = ret || keysPressedArray.sort().join("+");

            return ret;
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
