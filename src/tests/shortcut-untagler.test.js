var module = window.ShortcutUntangler;

describe('Interface API', function() {
    it('should provide a method for enable debug mode', function() {
        expect(typeof module.enableDebug).toBe('function');
    });

    it('should provide a method for change environment', function() {
        expect(typeof module.changeEnvironment).toBe('function');
    });

    it('should provide a method for creating a context', function() {
        expect(typeof module.createContext).toBe('function');
    });

    it('should provide a method for creating a shortcut', function() {
        expect(typeof module.createShortcut).toBe('function');
    });

    it('should provide a method for generating json', function() {
        expect(typeof module.toJSON).toBe('function');
    });

    it('should provide a method for retriving the active environment', function() {
        expect(typeof module.toJSON).toBe('function');
    });

    it('should provide a method for adding context to an existing environment', function() {
        expect(typeof module.toJSON).toBe('function');
    });
});

describe('Defaults', function() {
    it('should be able to create a shortcut without specifying a context since it should be added to the main context and main environment', function() {
        var shortcut = jasmine.createSpy('whatAmI');

        module.createShortcut({
            key: 'e',
            callback: shortcut
        });

        triggerNativeKeyHotkey('e');

        expect(shortcut).toHaveBeenCalled();
    });


    // by default we or environment, that should always default to main context / main environment
    // by default it should already provide a default context and environment
    // by default we should provide a context called main
    // by default we should provide and environment called main
});

describe('Create Context', function() {
    it('should throw an exception when creating context without arguments', function() {
        expect(module.createContext).toThrow('InvalidArguments');
    });

    it('should throw an exception when creating context without a name', function() {
        expect(function() {
            module.createContext({
                description: 'lorem ipsum'
            });
        }).toThrow('InvalidArguments');
    });

    it('should throw an exception when creating context without a description', function() {
        expect(function() {
            module.createContext({
                name: 'foo'
            });
        }).toThrow('InvalidArguments');
    });

    it('should not throw an exception when creating context with name and description', function() {
        expect(function() {
            module.createContext({
                name: 'lorem',
                description: 'lorem ipsum'
            });
        }).not.toThrow('InvalidArguments');
    });
});

describe('Create Environment', function() {
    it('should throw an exception when creating environment without arguments', function() {
        expect(module.createEnvironment).toThrow('InvalidArguments');
    });

    it('should throw an exception when creating environment without a name', function() {
        expect(function() {
            module.createEnvironment({
                description: 'lorem ipsum',
                context: []
            });
        }).toThrow('InvalidArguments');
    });

    it('should throw an exception when creating environment without a description', function() {
        expect(function() {
            module.createEnvironment({
                name: 'foo',
                context: []
            });
        }).toThrow('InvalidArguments');
    });

});

describe('Create Shortcut', function() {
    it('should throw an exception when creating shortcut without arguments', function() {
        expect(module.createShortcut).toThrow('InvalidArguments');
    });

    it('should throw an exception when creating shortcut without a callback', function() {
        expect(function() {
            module.createShortcut({
                key: 'e'
            });
        }).toThrow('InvalidArguments');
    });

    it('should throw an exception when creating shortcut without a key', function() {
        expect(function() {
            module.createShortcut({
                callback: function(){}
            });
        }).toThrow('InvalidArguments');
    });

    it('should not throw an exception when creating shortcut with key and callback', function() {
        expect(function() {
            module.createShortcut({
                key: 'e',
                callback: function(){}
            });
        }).not.toThrow('InvalidArguments');
    });
});

function triggerNativeKeyHotkey(keyCode, el) {
    var eventObj = document.createEventObject ?  document.createEventObject() : document.createEvent("Events");

    el = el || document.getElementsByTagName('body')[0];

    if(eventObj.initEvent){
      eventObj.initEvent("keypress", true, true);
    }

    keyCode = keyCode.charCodeAt(0);

    eventObj.keyCode = keyCode;
    eventObj.which = keyCode;

    el.dispatchEvent ? el.dispatchEvent(eventObj) : el.fireEvent("onkeydown", eventObj);
}
