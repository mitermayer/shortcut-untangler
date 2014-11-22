(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('shortcutUntangler', [], factory);
    } else {
        root.ShortcutUntangler = factory();
    }
}(this, function() {

    'use scrict';

    var isString = function(match) {
        return typeof match === 'string';
    };

    var isArray = function(match) {
        return Array.isArray(match);
    };

    var hasRequiredArguments = function(required, option) {
        return required.every(function(key) {
            return typeof option[key] !== 'undefined';
        });
    };

    var printDebugConsoleMessage = function(shortcut) {
            console.log('Shortcut "' + shortcut.name + '" triggered with key "' + shortcut.key + '"', shortcut);
    };

    var getContextPlacementIndex = function(contextArr, newContext) {
        var placementIndex = contextArr.length; // defaults to add push it to the end
        var newContextWeight = newContext.weight;

        for( var i=0, len=contextArr.length; i<len; i++) {
            _curContext = contextArr[i];

            if(newContextWeight < _curContext.weight) {
                placementIndex = i;
                break;
            } else if(newContextWeight === _curContext.weight) {
                placementIndex = i+1;
                break;
            }
        }

        return placementIndex;
    };

    var getContextIndex = function(contextArr, contextName) {
        var targetContextIndex = 0; // defaults to main
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

    var Shortcut = {
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
                'description': option.description || 'Shortcut description',
                'name': option.name || 'Shortcut name',
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

            if (!option || !hasRequiredArguments(['name', 'description'], option)) {
                throw new Error('InvalidArguments');
            }

            return true;
        },
        create: function(option) {
            var context = {
                'shortcut': {},
                'description': option.description || 'Context description',
                'name': option.name || 'Context name',
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

            if (!option || !hasRequiredArguments(['name', 'description'], option)) {
                throw new Error('InvalidArguments');
            }

            return true;
        },
        create: function(option) {
            var environment = {
                'context': [],
                'description': option.description || 'Environment description',
                'name': option.name || 'Environment name'
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
                            for(var i=0, len=this.context.length; i<len; i++) {
                                ctx = this.context[i];

                                if(ctx.name === context) {
                                    ctx.toggleDisabledState(state, shortcut);
                                }
                            }
                        } else { // disable all contexts
                            for(var i=0, len=this.context.length; i<len; i++) {
                                ctx = this.context[i];
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

    var flattenEnvironment = function(env) {
        var flattenedEnv = {};

        for (var i = env.context.length - 1; i >= 0; i--) {
            var _context = env.context[i].shortcut;
            var _shotcut;

            for (_shortcut in _context) {
                var shortcutInfo = _context[_shortcut];

                if(flattenedEnv[_shortcut]) { // we want to preserve weight algorithm, so if a shortcut has already been set we should not add to the env
                    continue;
                }

                flattenedEnv[_shortcut] = shortcutInfo;
            }
        }

        return flattenedEnv;
    };

    var ShortcutUntangler = function() {
        var active_environment = 'main';
        var debug = false;
        var _environments = {};

        this.changeEnvironment = function(environmentName) {
            if(_environments[environmentName]) {
                active_environment = environmentName;
            }
        };

        this.debugMode = function(state) {
            debug = typeof state !== 'undefined' ? state : true;
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
            var rootEnv = typeof targetBaseEnv !== 'undefined' ? targetBaseEnv : 'main';

            Environment.validate(option, _environments);

            newEnv = Environment.create(option);

            // add the new environment
            _environments[option.name] = newEnv;

             //we make sure each new environment has a main context
            this.createContext({
                name: 'main',
                description: 'Default shortcuts environment context'
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

            // check for unique and required params
            Shortcut.validate(option, shortcutContext);

            shortcutContext[option.key] = Shortcut.create(option);
        };

        this.getActiveEnvironment = function() {
            return active_environment;
        };

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

        this.createEnvironment({
            'description': 'Default shortcuts environment',
            'name': 'main'
        });

        this.toggleDisabledState = function(state, environment, context, shortcut) {
            // context - string or array - optional
            // shortcut - string or array - optional
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

        document.getElementsByTagName('body')[0].addEventListener('keypress', function(e) {
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

    return ShortcutUntangler;
}));
