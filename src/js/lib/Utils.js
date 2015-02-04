/**
 * General helpers and constants
 *
 * @return {Utils} general helpers
 */
define([], function(){
    'use scrict';

    /**
     * Register event listener
     *
     * @return {undefined}
     */
    var addEvent = function(element, type, callback) {
        element.addEventListener(type, callback, false);
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
     * Checks to see if element is text-accepting element
     *
     * @param {htmlElement} element
     * @return {Boolean}
     */
    var isTextAcceptingElement = function(element) {
        return  /textarea|input|select/i.test(element.nodeName) || element.getAttribute('contentEditable');
    };

    return {
        addEvent: addEvent,
        hasRequiredArguments: hasRequiredArguments,
        isArray: isArray,
        isNumber: isNumber,
        isString: isString,
        isTextAcceptingElement: isTextAcceptingElement
    };
});
