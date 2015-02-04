/*
The MIT License

Copyright (c) 2014-2015 mitermayer reis

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else {
        root.ShortcutUntangler = factory();
    }
}(this, function () {
/**
 * General helpers and constants
 *
 * @return {Utils} general helpers
 */
var lib_Utils, lib_debug_Tools, lib_keyboard_Keys, lib_keyboard_Manager, lib_factory_Shortcut, lib_factory_Context, lib_factory_Environment, main;
lib_Utils = function () {
  'use scrict';
  /**
   * Register event listener
   *
   * @return {undefined}
   */
  var addEvent = function (element, type, callback) {
    element.addEventListener(type, callback, false);
  };
  /**
   * Checks to see if object has defined all the required params
   *
   * @param {Array} required - list of required params to be checked
   * @param {Object} option - object to be checked
   * @return {Boolean}
   */
  var hasRequiredArguments = function (required, option) {
    // TODO: rename this function to be called hasDefinedProperty
    return required.every(function (key) {
      return typeof option[key] !== 'undefined';
    });
  };
  /**
   * Checks to see if match is an array
   *
   * @param {Object} match
   * @return {Boolean}
   */
  var isArray = function (match) {
    return Array.isArray(match);
  };
  /**
   * Checks to see if Object is of type string
   *
   * @param {Object} match
   * @return {Boolean}
   */
  var isNumber = function (match) {
    return typeof match === 'number';
  };
  /**
   * Checks to see if Object is of type string
   *
   * @param {Object} match
   * @return {Boolean}
   */
  var isString = function (match) {
    return typeof match === 'string';
  };
  /**
   * Checks to see if element is text-accepting element
   *
   * @param {htmlElement} element
   * @return {Boolean}
   */
  var isTextAcceptingElement = function (element) {
    return /textarea|input|select/i.test(element.nodeName) || element.getAttribute('contentEditable');
  };
  return {
    addEvent: addEvent,
    hasRequiredArguments: hasRequiredArguments,
    isArray: isArray,
    isNumber: isNumber,
    isString: isString,
    isTextAcceptingElement: isTextAcceptingElement
  };
}();
lib_debug_Tools = function () {
  /**
   * Prints a debugging console message for a shortcut
   *
   * @param {Shortcut} shortcut - shortcut object
   */
  var printDebugConsoleMessage = function (shortcut) {
    console.log('Shortcut "' + shortcut.name + '" triggered with key "' + shortcut.key + '"', shortcut);
  };
  return { printMessage: printDebugConsoleMessage };
}();
lib_keyboard_Keys = function () {
  // not supporting meta at the moment
  var KEY_MODIFIERS = [
    'alt',
    'ctrl',
    'shift'
  ];
  // modifiers used for keydown and keyup
  var MODFIER_KEY_CODES = {
    8: 'backspace',
    9: 'tab',
    10: 'return',
    13: 'return',
    16: 'shift',
    17: 'ctrl',
    18: 'alt',
    19: 'pause',
    20: 'capslock',
    27: 'esc',
    32: 'space',
    33: 'pageup',
    34: 'pagedown',
    35: 'end',
    36: 'home',
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down',
    45: 'insert',
    46: 'del',
    59: ';',
    61: '=',
    96: '0',
    97: '1',
    98: '2',
    99: '3',
    100: '4',
    101: '5',
    102: '6',
    103: '7',
    104: '8',
    105: '9',
    106: '*',
    107: '+',
    109: '-',
    110: '.',
    111: '/',
    112: 'f1',
    113: 'f2',
    114: 'f3',
    115: 'f4',
    116: 'f5',
    117: 'f6',
    118: 'f7',
    119: 'f8',
    120: 'f9',
    121: 'f10',
    122: 'f11',
    123: 'f12',
    144: 'numlock',
    145: 'scroll',
    173: '-',
    186: ';',
    187: '=',
    188: ',',
    189: '-',
    190: '.',
    191: '/',
    192: '`',
    219: '[',
    220: '\\',
    221: ']',
    222: '\''
  };
  return {
    KEY_MODIFIERS: KEY_MODIFIERS,
    MODFIER_KEY_CODES: MODFIER_KEY_CODES
  };
}();
lib_keyboard_Manager = function () {
  var pressedKeys = {};
  /**
   * converts all currently pressed keys into a single unique string
   *
   * @return {String}
   */
  this.getKeys = function () {
    return Object.keys(pressedKeys).sort().join('+');
  };
  /**
   * register a currently pressed key
   *
   * @param {String} key - key pressed
   */
  this.keyDown = function (key) {
    pressedKeys[key] = true;
  };
  /**
   * removes pressed key
   *
   * @param key - key released
   */
  this.keyUp = function (key) {
    delete pressedKeys[key];
  };
  /**
   * clears all pressed keys
   */
  this.clear = function () {
    pressedKeys = {};
  };
};
lib_factory_Shortcut = function (Utils, Keys) {
  var createShortcut = function (option) {
    var shortcut = {
      key: option.key,
      description: option.description || 'Keyboard shortcut handler triggered by key: ' + option.key,
      name: option.name || 'Shortcut for: ' + option.key,
      callback: option.callback,
      toggleDisabledState: function (state) {
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
  var generateKeyName = function (key) {
    if (Utils.isNumber(key)) {
      key = Keys.MODFIER_KEY_CODES[key] || String.fromCharCode(key);
    } else if (key.indexOf(' ') !== -1) {
      // cleans multiple spaces and makes sure that multiple keys have same unique key idependently of the order they pass as arguments
      key = key.toLowerCase().split(' ').filter(function (e) {
        // removes 0, null, undefined, ''
        return e;
      }).sort().join('+');
    }
    return key.toUpperCase();
  };
  var validateShortcut = function (option, shortcutContext) {
    if (shortcutContext[option.key]) {
      throw new Error('Shortcut key "' + option.key + '" is already set on context this context');
    }
    if (!option || !Utils.hasRequiredArguments([
        'key',
        'callback'
      ], option)) {
      throw new Error('InvalidArguments');
    }
    return true;
  };
  return {
    create: createShortcut,
    getKeyName: generateKeyName,
    validate: validateShortcut
  };
}(lib_Utils, lib_keyboard_Keys);
lib_factory_Context = function (Utils) {
  var createContext = function (option) {
    var context = {
      shortcut: {},
      name: option.name,
      weight: option.weight || 0,
      toggleDisabledState: function (state, shortcut) {
        var scut;
        if (Utils.isArray(shortcut)) {
          // disable context in array
          for (var i = 0, len = shortcut.length; i < len; i++) {
            scut = this.shortcut[shortcut[i].toUpperCase()];
            if (typeof scut !== 'undefined') {
              scut.toggleDisabledState(state);
            }
          }
        } else if (Utils.isString(shortcut)) {
          // disable a single context
          scut = this.shortcut[shortcut.toUpperCase()];
          if (typeof scut !== 'undefined') {
            scut.toggleDisabledState(state);
          }
        } else {
          // disable all shortcuts
          for (scut in this.shortcut) {
            this.shortcut[scut].toggleDisabledState(state);
          }
        }
      }
    };
    return context;
  };
  var getContextIndex = function (contextArr, contextName) {
    var targetContextIndex = 0;
    // defaults to 0 since there will always be at least one context
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
  var getContextPlacementIndex = function (contextArr, newContext) {
    var placementIndex = contextArr.length;
    // defaults to push it to the end
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
  var validateContext = function (option, targetEnvironment) {
    var targetEnvContext = targetEnvironment.context[getContextIndex(targetEnvironment.context, option.name)];
    if (targetEnvContext && targetEnvContext.name === option.name) {
      // we already have a context with that name
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
}(lib_Utils);
lib_factory_Environment = function (Utils) {
  var createEnvironment = function (option) {
    var environment = {
      context: [],
      name: option.name,
      toggleDisabledState: function (state, context, shortcut) {
        var ctx;
        if (Utils.isArray(context)) {
          // disable context in array
          for (var i = 0, len = this.context.length; i < len; i++) {
            ctx = this.context[i];
            if (context.indexOf(ctx.name) !== -1) {
              ctx.toggleDisabledState(state, shortcut);
            }
          }
        } else if (Utils.isString(context)) {
          // disable a single context
          for (var k = 0, klen = this.context.length; k < klen; k++) {
            ctx = this.context[k];
            if (ctx.name === context) {
              ctx.toggleDisabledState(state, shortcut);
            }
          }
        } else {
          // disable all contexts
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
  var flattenEnvironment = function (env) {
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
  var validateEnvironment = function (option, environments) {
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
}(lib_Utils);
main = function (Utils, DebugTools, Keys, KeyboardManager, Shortcut, Context, Environment) {
  return function (option) {
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
    var CACHE = { ENVIRONMENT: {} };
    /**
     * Update the active environment to the target environment
     *
     * @param environmentName - name of the target environment
     * @return {undefined}
     */
    this.changeEnvironment = function (environmentName) {
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
    this.debugMode = function (state) {
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
    this.toggleDisabledState = function (state, environment, context, shortcut) {
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
    this.getActiveEnvironment = function () {
      return active_environment;
    };
    /**
     * Return a json representation of the flattened environment
     *
     * @param {String|Array[String]} match - name of the environment to be flattened defaults to current environment
     * @return {JSON}
     */
    this.toJSON = function (match) {
      var ret = {};
      var flattenEnvironment = Environment.flattenEnvironment;
      if (Utils.isString(match)) {
        // particular env
        ret = typeof _environments[match] !== 'undefined' ? flattenEnvironment(_environments[match]) : ret;
      } else if (Utils.isArray(match)) {
        // we have a list of envs
        ret = [];
        for (var i = 0, len = match.length; i < len; i++) {
          ret.push(flattenEnvironment(_environments[match[i]]));
        }
      } else if (match === true) {
        // we assume we want all envs
        ret = [];
        for (var env in _environments) {
          ret.push(flattenEnvironment(_environments[env]));
        }
      } else {
        ret = flattenEnvironment(_environments[active_environment]);
      }
      return ret;
    };
    this.createContext = function (option, environment) {
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
    this.createEnvironment = function (option, targetBaseEnv) {
      var newEnv;
      var rootEnv = typeof targetBaseEnv !== 'undefined' ? targetBaseEnv : defaultEnvironmentName;
      Environment.validate(option, _environments);
      newEnv = Environment.create(option);
      // add the new environment
      _environments[option.name] = newEnv;
      //we make sure each new environment has a main context
      this.createContext({ name: defaultContextName }, option.name);
      if (rootEnv !== false) {
        // we will base the environment on another environment unless we explicit say we want a bare environment
        // main will always be the first context
        newEnv.context[0].shortcut = this.toJSON(rootEnv);
      }
      CACHE.ENVIRONMENT[newEnv.name] = this.toJSON(newEnv.name);
    };
    this.createShortcut = function (option, contextName, environmentName) {
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
    this.createEnvironment({ 'name': active_environment });
    //  we need to make sure that we clear the keys once we no longer are focused on the rootelement
    Utils.addEvent(rootElement, 'blur', function () {
      keyHandler.clear();
    });
    Utils.addEvent(rootElement, 'keyup', function (e) {
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
    Utils.addEvent(rootElement, 'keydown', function (e) {
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
}(lib_Utils, lib_debug_Tools, lib_keyboard_Keys, lib_keyboard_Manager, lib_factory_Shortcut, lib_factory_Context, lib_factory_Environment);    return main;
}));
