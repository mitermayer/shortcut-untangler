/**
 * Creates Contexts
 *
 * @return {Context}
 */
define([
        'lib/Utils'
    ],
    function(
        Utils
    ) {
        'use strict';

        var createContext = function(option) {
            var context = {
                shortcut: {},
                name: option.name,
                weight: option.weight || 0,
                toggleDisabledState: function(state, shortcut) {
                    var scut;

                    if (Utils.isArray(shortcut)) { // disable context in array
                        for (var i = 0, len = shortcut.length; i < len; i++) {
                            scut = this.shortcut[shortcut[i].toUpperCase()];

                            if (typeof scut !== 'undefined') {
                                scut.toggleDisabledState(state);
                            }
                        }
                    } else if (Utils.isString(shortcut)) { // disable a single context
                        scut = this.shortcut[shortcut.toUpperCase()];

                        if (typeof scut !== 'undefined') {
                            scut.toggleDisabledState(state);
                        }
                    } else { // disable all shortcuts
                        for (scut in this.shortcut) {
                            this.shortcut[scut].toggleDisabledState(state);
                        }
                    }
                }
            };

            return context;
        };

        var getContextIndex = function(contextArr, contextName) {
            var targetContextIndex = 0; // defaults to 0 since there will always be at least one context
            var _context;

            for (var i = 0, len = contextArr.length; i < len; i++) {
                _context = contextArr[i];

                if (_context.name === contextName) {
                    targetContextIndex = i;
                    break;
                }
            }

            return targetContextIndex;
        };

        var getContextPlacementIndex = function(contextArr, newContext) {
            var placementIndex = contextArr.length; // defaults to push it to the end
            var newContextWeight = newContext.weight;
            var _curContext;

            for (var i = contextArr.length - 1; i >= 0; i--) {
                _curContext = contextArr[i];

                if (newContextWeight === _curContext.weight) {
                    // if current context has the same weight
                    // we return one index greater to insert the new item after it
                    placementIndex = i + 1;
                    break;
                } else if (newContextWeight < _curContext.weight) {
                    // if current context has greater weight
                    // we return the current index to insert the new item before it
                    placementIndex = i;
                    break;
                }
            }

            return placementIndex;
        };

        var validateContext = function(option, targetEnvironment) {
            var targetEnvContext = targetEnvironment.context[getContextIndex(targetEnvironment.context, option.name)];

            if (targetEnvContext && targetEnvContext.name === option.name) { // we already have a context with that name
                throw new Error('Context name "' + option.name + '" is already set on environment "' + targetEnvironment.name + '"');
            }

            if (!option || !Utils.hasRequiredArguments(['name'], option)) {
                throw new Error('InvalidArguments');
            }

            return true;
        };

        return {
            /**
             * Creates a new context
             *
             * @param option
             * @return {Context}
             */
            create: createContext,

            /**
             * Check what is the index for context based on the context name
             *
             * @param {Array[Context]} contextArr - list of existing contexts for the target environment
             * @param {String} contextName
             * @return {Number|0} - returns the index of a context or 0
             */
            getContextIndex: getContextIndex,

            /**
             * Checks what should be the context placement index based on the context weight
             *
             * The index returned is meant to be used with Array.splice
             *
             * @param {Array[Context]} contextArr - list of existing contexts for the target environment
             * @param {Context} newContext - context that is being created
             * @return {Number} - index for newContext placement on contextArr
             */
            getContextPlacementIndex: getContextPlacementIndex,

            /**
             * Validates the params passed for the environment creation
             *
             *  - check that environment has all required params
             *  - check that environment is unique based on the name
             *
             * @param option
             * @param targetEnvironment
             * @return {Boolean}
             */
            validate: validateContext
        };
    });
