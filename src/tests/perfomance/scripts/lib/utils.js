define(function() {

    var MODIFIER_KEY_CODES = {
        alt: 18,
        shift: 16,
        ctrl: 17
    };

    function addModifier(event, modifierArray) {
        if (Array.isArray(modifierArray)) {
            for (var i = 0, len = modifierArray.length; i < len; i++) {
                var modifier = modifierArray[i];

                if (MODIFIER_KEY_CODES[modifier]) {
                    event[modifier.toLowerCase() + "Key"] = true;
                }
            }
        }

        return event;
    }

    function triggerKeyDown(keyCode, el, modifier) {
        el = el || document.getElementsByTagName('body')[0];

        var eventObj = document.createEventObject ? document.createEventObject() : document.createEvent('Events');

        if (eventObj.initEvent) {
            eventObj.initEvent('keydown', true, true);
        }

        keyCode = typeof keyCode === 'number' ? keyCode : keyCode.toUpperCase().charCodeAt(0);

        eventObj.keyCode = keyCode;
        eventObj.which = keyCode;

        eventObj = addModifier(eventObj, modifier);

        el.dispatchEvent ? el.dispatchEvent(eventObj) : el.fireEvent('onkeydown', eventObj);
    }

    function triggerKeyUp(keyCode, el, modifier) {
        el = el || document.getElementsByTagName('body')[0];

        var eventObj = document.createEventObject ? document.createEventObject() : document.createEvent('Events');

        if (eventObj.initEvent) {
            eventObj.initEvent('keyup', true, true);
        }

        keyCode = typeof keyCode === 'number' ? keyCode : keyCode.toUpperCase().charCodeAt(0);

        eventObj.keyCode = keyCode;
        eventObj.which = keyCode;

        eventObj = addModifier(eventObj, modifier);

        el.dispatchEvent ? el.dispatchEvent(eventObj) : el.fireEvent('onkeyup', eventObj);
    }

    function triggerNativeBlurOnElement(el) {
        el = el || document.getElementsByTagName('body')[0];

        var eventObj = document.createEventObject ? document.createEventObject() : document.createEvent('Events');

        if (eventObj.initEvent) {
            eventObj.initEvent('blur', true, true);
        }

        el.dispatchEvent ? el.dispatchEvent(eventObj) : el.fireEvent('onblur', eventObj);
    }

    function triggerNativeKeyHotkey(keyCode, el, modifier) {
        triggerKeyDown(keyCode, el, modifier);
        triggerKeyUp(keyCode, el, modifier);
    }

    return {
        triggerKeyUp: triggerKeyUp,
        triggerKeyDown: triggerKeyDown,
        triggerNativeKeyHotkey: triggerNativeKeyHotkey,
        triggerNativeBlurOnElement: triggerNativeBlurOnElement
    };
});
