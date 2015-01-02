/**
 * General helpers and constants
 *
 * @return {Utils} general helpers
 */
define([], function(){

    'use scrict';

    // not supporting meta at the moment
    var KEY_MODIFIERS = ['alt', 'ctrl', 'shift'];

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

    /**
     * Register event listener
     *
     * @return {undefined}
     */
    var addEvent = function(element, type, callback) {
        element.addEventListener(type, callback, false);
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
     * Checks to see if Object is of type string
     *
     * @param {Object} match
     * @return {Boolean}
     */
    var isNumber = function(match) {
        return typeof match === 'number';
    };

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
     * Checks to see if object has defined all the required params
     *
     * @param {Array} required - list of required params to be checked
     * @param {Object} option - object to be checked
     * @return {Boolean}
     */
    var hasRequiredArguments = function(required, option) {
        // TODO: rename this function to be called hasDefinedProperty
        return required.every(function(key) {
            return typeof option[key] !== 'undefined';
        });
    };

    return {
        KEY_MODIFIERS: KEY_MODIFIERS,
        MODFIER_KEY_CODES: MODFIER_KEY_CODES,
        addEvent: addEvent,
        isString: isString,
        isArray: isArray,
        isNumber: isNumber,
        hasRequiredArguments: hasRequiredArguments
    };
});
