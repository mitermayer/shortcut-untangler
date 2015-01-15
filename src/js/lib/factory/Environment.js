/**
 * Creates Environment
 *
 * @return {Environment}
 */
define([
        'lib/Utils'
    ],
    function(
        Utils
    ) {
        'use strict';

        var createEnvironment = function(option) {
            var environment = {
                context: [],
                name: option.name,
                toggleDisabledState: function(state, context, shortcut) {
                    var ctx;

                    if (Utils.isArray(context)) { // disable context in array
                        for (var i = 0, len = this.context.length; i < len; i++) {
                            ctx = this.context[i];

                            if (context.indexOf(ctx.name) !== -1) {
                                ctx.toggleDisabledState(state, shortcut);
                            }
                        }
                    } else if (Utils.isString(context)) { // disable a single context
                        for (var k = 0, klen = this.context.length; k < klen; k++) {
                            ctx = this.context[k];

                            if (ctx.name === context) {
                                ctx.toggleDisabledState(state, shortcut);
                            }
                        }
                    } else { // disable all contexts
                        for (var j = 0, jlen = this.context.length; j < jlen; j++) {
                            ctx = this.context[j];
                            ctx.toggleDisabledState(state, shortcut);
                        }
                    }
                }
            };

            return environment;
        };

        /**
         * Get the shortcuts that are active for a particular envionment
         * by taking in consideration the context weight and the disabled status on shortcuts
         *
         * @param {String} env - environment name to be flattened
         * @return {Object} - return a tree of the active shortcuts
         */
        var flattenEnvironment = function(env) {
            var flattenedEnv = {};

            for (var i = env.context.length - 1; i >= 0; i--) {
                var _context = env.context[i].shortcut;
                var _shortcut;

                for (_shortcut in _context) {
                    var shortcutInfo = _context[_shortcut];

                    if (flattenedEnv[_shortcut] || shortcutInfo.disabled) {
                        // we want to make sure only one shortcut exists per key and
                        // also making sure it is not disabled
                        continue;
                    }

                    flattenedEnv[_shortcut] = shortcutInfo;
                }
            }

            return flattenedEnv;
        };

        var validateEnvironment = function(option, environments) {
            if (environments[option.name]) {
                throw new Error('Environment name "' + option.name + '" is already set');
            }

            if (!option || !Utils.hasRequiredArguments(['name'], option)) {
                throw new Error('InvalidArguments');
            }

            return true;
        };

        return {
            create: createEnvironment,
            flattenEnvironment: flattenEnvironment,
            validate: validateEnvironment
        };
    });
