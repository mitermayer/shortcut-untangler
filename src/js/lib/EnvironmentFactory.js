/**
 * Creates Environment
 *
 * @return {EnvironmentFactory}
 */
define([
    'lib/Utils'
],
function(
    Utils
) {
    'use strict';

    var Environment = {
        validate: function(option, environments) {
            if(environments[option.name]) {
                throw new Error('Environment name "' + option.name + '" is already set');
            }

            if (!option || !Utils.hasRequiredArguments(['name'], option)) {
                throw new Error('InvalidArguments');
            }

            return true;
        },
        create: function(option) {
            var environment = {
                'context': [],
                'name': option.name
            };

            Object.defineProperty(environment, 'toggleDisabledState', {
                    value : function(state, context, shortcut) {
                        var ctx;

                        if (Utils.isArray(context)) { // disable context in array
                            for(var i=0, len=this.context.length; i<len; i++) {
                                ctx = this.context[i];

                                if(context.indexOf(ctx.name) !== -1) {
                                    ctx.toggleDisabledState(state, shortcut);
                                }
                            }
                        } else if(Utils.isString(context)) { // disable a single context
                            for(var k=0, klen=this.context.length; k<klen; k++) {
                                ctx = this.context[k];

                                if(ctx.name === context) {
                                    ctx.toggleDisabledState(state, shortcut);
                                }
                            }
                        } else { // disable all contexts
                            for(var j=0, jlen=this.context.length; j<jlen; j++) {
                                ctx = this.context[j];
                                ctx.toggleDisabledState(state, shortcut);
                            }
                        }
                    },
                    writable: false,
                    enumerable: false,
                    configurable: false
            });

            return environment;
        }
    };

    return Environment;
});
