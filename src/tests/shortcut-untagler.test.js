describe('Shortcut Untangler tests', function() {
    var shortcutUntangler;

    beforeEach(function() {
        shortcutUntangler = ShortcutUntangler();
    });

    afterEach(function() {
        shortcutUntangler = null;
    });

    describe('Interface API', function() {
        it('should provide a method for enable debug mode', function() {
            expect(typeof shortcutUntangler.enableDebug).toBe('function');
        });

        it('should provide a method for change environment', function() {
            expect(typeof shortcutUntangler.changeEnvironment).toBe('function');
        });

        it('should provide a method for creating a context', function() {
            expect(typeof shortcutUntangler.createContext).toBe('function');
        });

        it('should provide a method for creating a shortcut', function() {
            expect(typeof shortcutUntangler.createShortcut).toBe('function');
        });

        it('should provide a method for generating json', function() {
            expect(typeof shortcutUntangler.toJSON).toBe('function');
        });

        it('should provide a method for retriving the active environment', function() {
            expect(typeof shortcutUntangler.toJSON).toBe('function');
        });

        it('should provide a method for adding context to an existing environment', function() {
            expect(typeof shortcutUntangler.toJSON).toBe('function');
        });
    });

    describe('Initialization', function() {
        beforeEach(function() {
            var shortcutUntangler = ShortcutUntangler();
        });

        afterEach(function() {
            var shortcutUntangler = null;
        });

        it('should have a main environment active when initialized', function() {
            var activeEnvironmentName = shortcutUntangler.getActiveEnvironment();

            expect(activeEnvironmentName).toEqual('main');
        });

        it('should be able to create a shortcut without specifying a context since it should be added to the main context and main environment', function() {
            var shortcut = jasmine.createSpy();

            shortcutUntangler.createShortcut({
                key: 'e',
                callback: shortcut
            });

            triggerNativeKeyHotkey('e');

            expect(shortcut).toHaveBeenCalled();
        });

        it('should return an empty object when the active environment has no shortcuts attached to it', function() {
            var environmentJson = shortcutUntangler.toJSON();

            expect(environmentJson).toEqual({});
        });
    });

    describe('Create Context', function() {
        it('should throw an exception when creating context without arguments', function() {
            expect(shortcutUntangler.createContext).toThrow();
        });

        it('should throw an exception when creating context without a name', function() {
            expect(function() {
                shortcutUntangler.createContext({
                    description: 'lorem ipsum'
                });
            }).toThrow();
        });

        it('should throw an exception when creating context without a description', function() {
            expect(function() {
                shortcutUntangler.createContext({
                    name: 'foo'
                });
            }).toThrow();
        });

        it('should not throw an exception when creating context with name and description', function() {
            expect(function() {
                shortcutUntangler.createContext({
                    name: 'lorem',
                    description: 'lorem ipsum'
                });
            }).not.toThrow();
        });

        it('should throw an exception when trying to create a context with a name that already exists', function() {

            shortcutUntangler.createContext({
                name: 'lorem',
                description: 'lorem ipsum'
            });

            expect(function() {
                shortcutUntangler.createContext({
                    name: 'lorem',
                    description: 'lorem ipsum'
                });
            }).toThrow();
        });
    });

    describe('Create Environment', function() {
        it('should throw an exception when creating environment without arguments', function() {
            expect(shortcutUntangler.createEnvironment).toThrow();
        });

        it('should throw an exception when creating environment without a name', function() {
            expect(function() {
                shortcutUntangler.createEnvironment({
                    description: 'lorem ipsum'
                });
            }).toThrow();
        });

        it('should throw an exception when creating environment without a description', function() {
            expect(function() {
                shortcutUntangler.createEnvironment({
                    name: 'foo'
                });
            }).toThrow();
        });

        it('should not throw an exception when creating environment with name and description', function() {
            expect(function() {
                shortcutUntangler.createEnvironment({
                    name: 'lorem',
                    description: 'lorem ipsum'
                });
            }).not.toThrow();
        });

        it('should throw an exception when trying to create an environment with a name that already exists', function() {

            shortcutUntangler.createEnvironment({
                name: 'lorem',
                description: 'lorem ipsum'
            });

            expect(function() {
                shortcutUntangler.createEnvironment({
                    name: 'lorem',
                    description: 'lorem ipsum'
                });
            }).toThrow();
        });

        it('should have active environment name set to "lorem" when creating a new environment and updating to it', function() {
            shortcutUntangler.createEnvironment({
                name: 'lorem',
                description: 'lorem ipsum'
            });

            shortcutUntangler.changeEnvironment('lorem');

            expect(shortcutUntangler.getActiveEnvironment()).toBe('lorem');
        });
    });

    describe('Create Shortcut', function() {
        it('should throw an exception when creating shortcut without arguments', function() {
            expect(shortcutUntangler.createShortcut).toThrow();
        });

        it('should throw an exception when creating shortcut without a callback', function() {
            expect(function() {
                shortcutUntangler.createShortcut({
                    key: 'e'
                });
            }).toThrow();
        });

        it('should throw an exception when creating shortcut without a key', function() {
            expect(function() {
                shortcutUntangler.createShortcut({
                    callback: function(){}
                });
            }).toThrow();
        });

        it('should not throw an exception when creating shortcut with key and callback', function() {
            expect(function() {
                shortcutUntangler.createShortcut({
                    key: 'e',
                    callback: function(){}
                });
            }).not.toThrow();
        });

        it('should throw an exception when trying to create a shortcut with an already existent key', function() {

            shortcutUntangler.createShortcut({
                key: 'e',
                callback: function(){}
            });

            expect(function() {
                shortcutUntangler.createShortcut({
                    key: 'e',
                    callback: function(){}
                });
            }).toThrow();
        });

        it('should add a shortcut to the flattened json representation of the current active environment', function() {
            shortcutUntangler.createShortcut({
                name: 'My shortcut',
                description: 'My shortcut description',
                key: 'e',
                callback: function(){}
            });

            var environmentJson = shortcutUntangler.toJSON();

            triggerNativeKeyHotkey('e');

            expect(environmentJson['e'].name).toEqual('My shortcut');
        });
    });
});

function triggerNativeKeyHotkey(keyCode, el) {
    var eventObj = document.createEventObject ?  document.createEventObject() : document.createEvent('Events');

    el = el || document.getElementsByTagName('body')[0];

    if(eventObj.initEvent){
      eventObj.initEvent('keypress', true, true);
    }

    keyCode = keyCode.charCodeAt(0);

    eventObj.keyCode = keyCode;
    eventObj.which = keyCode;

    el.dispatchEvent ? el.dispatchEvent(eventObj) : el.fireEvent('onkeydown', eventObj);
}
