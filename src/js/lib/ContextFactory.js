/**
 * Creates Contexts
 *
 * @return {ContextFactory}
 */
define([
    'lib/Utils'
],
function(
    Utils
) {
    'use strict';

    /**
     * Check what is the index for context based on the context name
     *
     * @param {Array[Context]} contextArr - list of existing contexts for the target environment
     * @param {String} contextName
     * @return {Number|0} - returns the index of a context or 0
     */
    var getContextIndex = function(contextArr, contextName) {
        var targetContextIndex = 0; // defaults to 0 since there will always be at least one context
        var _context;

            for( var i=0, len=contextArr.length; i<len; i++) {
            _context = contextArr[i];

            if(_context.name === contextName){
                targetContextIndex = i;
                break;
            }
        }

        return targetContextIndex;
    };

    var Context = {
        getContextIndex: getContextIndex,
        validate: function(option, targetEnvironment) {
            var targetEnvContext = targetEnvironment.context[getContextIndex(targetEnvironment.context, option.name)];

            if(targetEnvContext && targetEnvContext.name === option.name) { // we already have a context with that name
                throw new Error('Context name "' + option.name + '" is already set on environment "' +  targetEnvironment.name + '"');
            }

            if (!option || !Utils.hasRequiredArguments(['name'], option)) {
                throw new Error('InvalidArguments');
            }

            return true;
        },
        create: function(option) {
            var context = {
                'shortcut': {},
                'name': option.name,
                'weight': option.weight || 0
            };

            Object.defineProperty(context, 'toggleDisabledState', {
                    value : function(state, shortcut) {
                        var scut;

                        if (Utils.isArray(shortcut)) { // disable context in array
                            for(var i=0, len=shortcut.length; i<len; i++) {
                                scut = this.shortcut[shortcut[i]];

                                if(typeof scut !== 'undefined') {
                                    scut.toggleDisabledState(state);
                                }
                            }
                        } else if(Utils.isString(shortcut)) { // disable a single context
                            scut = this.shortcut[shortcut];

                            if(typeof scut !== 'undefined') {
                                scut.toggleDisabledState(state);
                            }
                        } else { // disable all shortcuts
                            for(scut in this.shortcut) {
                                this.shortcut[scut].toggleDisabledState(state);
                            }
                        }
                    },
                    writable: false,
                    enumerable: false,
                    configurable: false
            });

            return context;
        }
    };

    return Context;
});

