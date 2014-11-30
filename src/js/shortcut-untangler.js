(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('ShortcutUntangler', [], factory);
    } else {
        root.ShortcutUntangler = factory();
    }
}(this, function() {

    'use scrict';

    /**
     * Checks to see if Object is of type string
     *
     * @param {Object} match
     * @return {Boolean}
     */
    var isString = function(match) {
        return typeof match === 'string';
    };

    /**
     * Checks to see if match is an array
     *
     * @param {Object} match
     * @return {Boolean}
     */
    var isArray = function(match) {
        return Array.isArray(match);
    };

    /**
     * Checks to see if object has defined all the required params
     *
     * @param {Array} required - list of required params to be checked
     * @param {Object} option - object to be checked
     * @return {Boolean}
     */
    var hasRequiredArguments = function(required, option) {
        return required.every(function(key) {
            return typeof option[key] !== 'undefined';
        });
    };

    /**
     * Prints a debugging console message for a shortcut
     *
     * @param {Shortcut} shortcut - shortcut object
     */
    var printDebugConsoleMessage = function(shortcut) {
        console.log('Shortcut "' + shortcut.name + '" triggered with key "' + shortcut.key + '"', shortcut);
    };

    /**
     * Checks what should be the context placement index based on the context weight
     *
     * The index returned is meant to be used with Array.splice
     *
     * @param {Array[Context]} contextArr - list of existing contexts for the target environment
     * @param {Context} newContext - context that is being created
     * @return {Number} - index for newContext placement on contextArr
     */
    var getContextPlacementIndex = function(contextArr, newContext) {
        var placementIndex = contextArr.length; // defaults to push it to the end
        var newContextWeight = newContext.weight;
        var _curContext;

        for (var i = contextArr.length -1; i >= 0; i--) {
            _curContext = contextArr[i];

            if(newContextWeight === _curContext.weight) {
                // if current context has the same weight
                // we return one index greater to insert the new item after it
                placementIndex = i+1;
                break;
            } else if(newContextWeight < _curContext.weight) {
                // if current context has greater weight
                // we return the current index to insert the new item before it
                placementIndex = i;
                break;
            }
        }

        return placementIndex;
    };

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
            var _shotcut;

            for (_shortcut in _context) {
                var shortcutInfo = _context[_shortcut];

                if(flattenedEnv[_shortcut] || shortcutInfo.disabled ) {
                    // we want to make sure only one shortcut exists per key and
                    // also making sure it is not disabled
                    continue;
                }

                flattenedEnv[_shortcut] = shortcutInfo;
            }
        }

        return flattenedEnv;
    };

    var Shortcut = {
        getKeyName: function(key) {
            if(key.indexOf(' ') !== -1) { // cleans multiple spaces and makes sure that multiple keys have same unique key idependently of the order they pass as arguments
                key = key.toUpperCase().split(" ").filter(function(e) {
                    // removes 0, null, undefined, ""
                    return e;
                }).sort().join("+");
            }

            return key;
        },
        validate: function(option, shortcutContext) {
            if(shortcutContext[option.key]) {
                throw new Error('Shortcut key "' + option.key + '" is already set on context this context');
            }

            if (!option || !hasRequiredArguments(['key', 'callback'], option)) {
                throw new Error('InvalidArguments');
            }

            return true;
        },
        create: function(option) {
            var shortcut = {
                'key': option.key,
                'description': option.description || 'Keyboard shortcut handler triggered by key: ' + option.key,
                'name': option.name || 'Shortcut for: ' + option.key,
                'callback': option.callback
            };

            Object.defineProperty(shortcut, 'toggleDisabledState', {
                    value : function(state) {
                        state = typeof state !== 'undefined' ? state : !this.disabled;

                        if(state) {
                            this.disabled = true;
                        } else {
                            delete this.disabled;
                        }
                    },
                    writable: false,
                    enumerable: false,
                    configurable: false
            });

            return shortcut;
        }
    };

    var Context = {
        validate: function(option, targetEnvironment) {
            var targetEnvContext = targetEnvironment.context[getContextIndex(targetEnvironment.context, option.name)];

            if(targetEnvContext && targetEnvContext.name === option.name) { // we already have a context with that name
                throw new Error('Context name "' + option.name + '" is already set on environment "' +  targetEnvironment.name + '"');
            }

            if (!option || !hasRequiredArguments(['name'], option)) {
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

                        if (isArray(shortcut)) { // disable context in array
                            for(var i=0, len=shortcut.length; i<len; i++) {
                                scut = this.shortcut[shortcut[i]];

                                if(typeof scut !== 'undefined') {
                                    scut.toggleDisabledState(state);
                                }
                            }
                        } else if(isString(shortcut)) { // disable a single context
                            scut = this.shortcut[shortcut];

                            if(typeof scut !== 'undefined') {
                                scut.toggleDisabledState(state);
                            }
                        } else { // disable all shortcuts
                            for(var shortcutKey in this.shortcut) {
                                this.shortcut[shortcutKey].toggleDisabledState(state);
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

    var Environment = {
        validate: function(option, environments) {
            if(environments[option.name]) {
                throw new Error('Environment name "' + option.name + '" is already set');
            }

            if (!option || !hasRequiredArguments(['name'], option)) {
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

                        if (isArray(context)) { // disable context in array
                            for(var i=0, len=this.context.length; i<len; i++) {
                                ctx = this.context[i];

                                if(context.indexOf(ctx.name) !== -1) {
                                    ctx.toggleDisabledState(state, shortcut);
                                }
                            }
                        } else if(isString(context)) { // disable a single context
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

    return function ShortcutUntangler(option) {
        option = option || {};

        var defaultEnvironmentName = option.mainEnvironment || 'main';
        var defaultContextName = option.mainContext || 'main';
        var active_environment = defaultEnvironmentName;
        var debug = false || option.debug;
        var rootElement = option.rootElement || document.getElementsByTagName('body')[0];
        var _environments = {};

        /**
         * Update the active environment to the target environment
         *
         * @param environmentName - name of the target environment
         * @return {undefined}
         */
        this.changeEnvironment = function(environmentName) {
            if(_environments[environmentName]) {
                active_environment = environmentName;
            }
        };

        /**
         * Set up debugging mode.
         *
         * While enabled messages will be printed to the console
         *
         * @param state
         * @return {undefined}
         */
        this.debugMode = function(state) {
            debug = typeof state !== 'undefined' ? state : true;
        };

        /**
         * Disables environment, contexts and shortcuts
         *
         * @param {Boolean} state - optinal defaults to toggle
         * @param {String|Array[String]} environment - optional defaults to all environments
         * @param {String|Array[String]} context - optional defaults to all contexts of environment
         * @param {String|Array[String]} shortcut - optinal deafaults to all shortcuts of context
         */
        this.toggleDisabledState = function(state, environment, context, shortcut) {
            var env;

            if (isArray(environment)) {
                for(var i=0, len = environment.length; i<len; i++) {
                    env = _environments[environment[i]];

                    if(typeof env !== 'undefined') {
                        env.toggleDisabledState(state, context, shortcut);
                    }
                }
            } else if(isString(environment)) {
                env = _environments[environment];

                if(typeof env !== 'undefined') {
                    env.toggleDisabledState(state, context, shortcut);
                }
            } else {
                for(env in _environments) {
                    _environments[env].toggleDisabledState(state, context, shortcut);
                }
            }
        };

        /**
         * Return the name of the current active environment
         *
         * @return {undefined}
         */
        this.getActiveEnvironment = function() {
            return active_environment;
        };

        /**
         * Return a json representation of the flattened environment
         *
         * @param {String|Array[String]} match - name of the environment to be flattened defaults to current environment
         * @return {JSON}
         */
        this.toJSON = function(match) {
            var ret = {};

            if (isString(match)) { // particular env
                ret = typeof _environments[match] !== 'undefined' ? flattenEnvironment(_environments[match]) : ret;
            } else if (isArray(match)) { // we have a list of envs
                ret = [];

                for(var i=0, len=match.length; i<len; i++) {
                    ret.push(flattenEnvironment(_environments[match[i]]));
                }
            } else if (match === true) { // we assume we want all envs
                ret = [];

                for(var env in _environments) {
                    ret.push(flattenEnvironment(_environments[env]));
                }
            } else {
                ret = flattenEnvironment(_environments[active_environment]);
            }

            return ret;
        };

        this.createContext = function(option, environment) {
            var targetEnvironment = _environments[environment] || _environments[this.getActiveEnvironment()];
            var newContext;
            var contextArr;

            // check for unique and required params
            Context.validate(option, targetEnvironment);

            contextArr = targetEnvironment.context;
            newContext = Context.create(option);

            contextArr.splice(getContextPlacementIndex(contextArr, newContext), 0, newContext);
        };

        this.createEnvironment = function(option, targetBaseEnv) {
            var newEnv;
            var rootEnv = typeof targetBaseEnv !== 'undefined' ? targetBaseEnv : defaultEnvironmentName;

            Environment.validate(option, _environments);

            newEnv = Environment.create(option);

            // add the new environment
            _environments[option.name] = newEnv;

             //we make sure each new environment has a main context
            this.createContext({
                name: defaultContextName
            }, option.name);

            if(rootEnv !== false) { // we will base the environment on another environment unless we explicit say we want a bare environment
                // main will always be the first context
                newEnv.context[0].shortcut = this.toJSON(rootEnv);
            }
        };

        this.createShortcut = function(option, contextName) {
            var activeEnvironment = _environments[this.getActiveEnvironment()];
            var targetContextIndex = getContextIndex(activeEnvironment.context, contextName);
            var shortcutContext = activeEnvironment.context[targetContextIndex].shortcut;

            // allows support for multiple keys, and make sure that the order of keys pressed won't matter
            option.key = Shortcut.getKeyName(option.key);

            // check for unique and required params
            Shortcut.validate(option, shortcutContext);

            shortcutContext[option.key] = Shortcut.create(option);
        };

        // create a new environment
        this.createEnvironment({
            'name': active_environment
        });

        rootElement.addEventListener('keypress', function(e) {
            var key = e.keyCode ? e.keyCode : e.which;
            var shortcut = String.fromCharCode(key);
            var activeEnvironment = _environments[active_environment];

            // loop in all context backwards searching for the key
            for (var i = activeEnvironment.context.length - 1; i >= 0; i--) {
                var _shortcut = activeEnvironment.context[i].shortcut[shortcut];

                if(_shortcut && !_shortcut.disabled)  {
                    if(debug) {
                        printDebugConsoleMessage(_shortcut);
                    }

                    _shortcut.callback(arguments);
                    break;
                }
            }
        }, false);
    };
}));
