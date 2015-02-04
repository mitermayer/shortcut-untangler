define([
        'lib/Utils',
        'lib/debug/Tools',
        'lib/keyboard/Keys',
        'lib/keyboard/Manager',
        'lib/factory/Shortcut',
        'lib/factory/Context',
        'lib/factory/Environment'
    ],
    function(
        Utils,
        DebugTools,
        Keys,
        KeyboardManager,
        Shortcut,
        Context,
        Environment
    ) {
        'use strict';

        return function(option) {
            option = option || {};

            var KEY_MODIFIERS = Keys.KEY_MODIFIERS;
            var MODFIER_KEY_CODES = Keys.MODFIER_KEY_CODES;
            var keyHandler = new KeyboardManager();


            var defaultEnvironmentName = option.mainEnvironment || 'main';
            var defaultContextName = option.mainContext || 'main';
            var active_environment = defaultEnvironmentName;
            var debug = false || option.debug;
            var rootElement = option.rootElement || document.getElementsByTagName('body')[0];
            var _environments = {};
            var CACHE = {
                ENVIRONMENT: {}
            };

            /**
             * Update the active environment to the target environment
             *
             * @param environmentName - name of the target environment
             * @return {undefined}
             */
            this.changeEnvironment = function(environmentName) {
                if (_environments[environmentName]) {
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

                if (Utils.isArray(environment)) {
                    for (var i = 0, len = environment.length; i < len; i++) {
                        env = _environments[environment[i]];

                        if (typeof env !== 'undefined') {
                            env.toggleDisabledState(state, context, shortcut);
                            CACHE.ENVIRONMENT[env.name] = this.toJSON(env.name);
                        }
                    }
                } else if (Utils.isString(environment)) {
                    env = _environments[environment];

                    if (typeof env !== 'undefined') {
                        env.toggleDisabledState(state, context, shortcut);
                        CACHE.ENVIRONMENT[env.name] = this.toJSON(env.name);
                    }
                } else {
                    for (env in _environments) {
                        _environments[env].toggleDisabledState(state, context, shortcut);
                        CACHE.ENVIRONMENT[env] = this.toJSON(env);
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
                var flattenEnvironment = Environment.flattenEnvironment;

                if (Utils.isString(match)) { // particular env
                    ret = typeof _environments[match] !== 'undefined' ? flattenEnvironment(_environments[match]) : ret;
                } else if (Utils.isArray(match)) { // we have a list of envs
                    ret = [];

                    for (var i = 0, len = match.length; i < len; i++) {
                        ret.push(flattenEnvironment(_environments[match[i]]));
                    }
                } else if (match === true) { // we assume we want all envs
                    ret = [];

                    for (var env in _environments) {
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

                contextArr.splice(Context.getContextPlacementIndex(contextArr, newContext), 0, newContext);

                CACHE.ENVIRONMENT[targetEnvironment.name] = this.toJSON(targetEnvironment.name);
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

                if (rootEnv !== false) { // we will base the environment on another environment unless we explicit say we want a bare environment
                    // main will always be the first context
                    newEnv.context[0].shortcut = this.toJSON(rootEnv);
                }

                CACHE.ENVIRONMENT[newEnv.name] = this.toJSON(newEnv.name);
            };

            this.createShortcut = function(option, contextName, environmentName) {
                var targetEnvironment = _environments[environmentName || this.getActiveEnvironment()];
                var targetContextIndex = Context.getContextIndex(targetEnvironment.context, contextName);
                var shortcutContext = targetEnvironment.context[targetContextIndex].shortcut;

                // allows support for multiple keys, and make sure that the order of keys pressed won't matter
                option.key = Shortcut.getKeyName(option.key);

                // check for unique and required params
                Shortcut.validate(option, shortcutContext);

                shortcutContext[option.key] = Shortcut.create(option);

                CACHE.ENVIRONMENT[targetEnvironment.name] = this.toJSON(targetEnvironment.name);
            };

            // create a new environment
            this.createEnvironment({
                'name': active_environment
            });

            //  we need to make sure that we clear the keys once we no longer are focused on the rootelement
            Utils.addEvent(rootElement, 'blur', function() {
                keyHandler.clear();
            });

            Utils.addEvent(rootElement, 'keyup', function(e) {
                var key = e.keyCode ? e.keyCode : e.which;
                var shortcutKey = typeof MODFIER_KEY_CODES[key] !== 'undefined' ? MODFIER_KEY_CODES[key].toUpperCase() : String.fromCharCode(key);

                for (var k = 0, len = KEY_MODIFIERS.length; k < len; k++) {
                    var keymod = KEY_MODIFIERS[k];
                    if (!e[keymod + 'Key']) {
                        keyHandler.keyUp(keymod.toUpperCase());
                    }
                }

                keyHandler.keyUp(shortcutKey);
            }, false);

            Utils.addEvent(rootElement, 'keydown', function(e) {
                var key = e.keyCode ? e.keyCode : e.which;
                var shortcutKey = typeof MODFIER_KEY_CODES[key] !== 'undefined' ? MODFIER_KEY_CODES[key].toUpperCase() : String.fromCharCode(key);
                var activeEnvironment = CACHE.ENVIRONMENT[active_environment];
                var shortcut;
                var _shortcut;

                keyHandler.keyDown(shortcutKey);

                if (KEY_MODIFIERS.indexOf(shortcutKey.toLowerCase()) === -1) {
                    for (var k = 0, len = KEY_MODIFIERS.length; k < len; k++) {
                        var keymod = KEY_MODIFIERS[k];
                        if (e[keymod + 'Key']) {
                            keyHandler.keyDown(keymod.toUpperCase());
                        }
                    }
                }

                shortcut = keyHandler.getKeys();

                _shortcut = activeEnvironment[shortcut];

                if (_shortcut && (e.target === rootElement || !Utils.isTextAcceptingElement(e.target))) {
                    e.preventDefault();
                    e.stopPropagation();

                    if (debug) {
                        DebugTools.printMessage(_shortcut);
                    }

                    _shortcut.callback(e, arguments);
                }
            }, false);
        };

    });
