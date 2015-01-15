/**
 * Creates shortcuts
 *
 * @return {Shortcut}
 */
define([
        'lib/Utils',
        'lib/keyboard/Keys'
    ],
    function(
        Utils,
        Keys
    ) {
        'use strict';

        var createShortcut = function(option) {
            var shortcut = {
                key: option.key,
                description: option.description || 'Keyboard shortcut handler triggered by key: ' + option.key,
                name: option.name || 'Shortcut for: ' + option.key,
                callback: option.callback,
                toggleDisabledState: function(state) {
                    state = typeof state !== 'undefined' ? state : !this.disabled;

                    if (state) {
                        this.disabled = true;
                    } else {
                        delete this.disabled;
                    }
                }
            };

            return shortcut;
        };

        var generateKeyName = function(key) {
            if (Utils.isNumber(key)) {
                key = Keys.MODFIER_KEY_CODES[key] || String.fromCharCode(key);
            } else if (key.indexOf(' ') !== -1) { // cleans multiple spaces and makes sure that multiple keys have same unique key idependently of the order they pass as arguments
                key = key.toLowerCase().split(' ').filter(function(e) {
                    // removes 0, null, undefined, ''
                    return e;
                }).sort().join('+');
            }

            return key.toUpperCase();

        };

        var validateShortcut = function(option, shortcutContext) {
            if (shortcutContext[option.key]) {
                throw new Error('Shortcut key "' + option.key + '" is already set on context this context');
            }

            if (!option || !Utils.hasRequiredArguments(['key', 'callback'], option)) {
                throw new Error('InvalidArguments');
            }

            return true;
        };

        return {
            create: createShortcut,
            getKeyName: generateKeyName,
            validate: validateShortcut
        };
    });
