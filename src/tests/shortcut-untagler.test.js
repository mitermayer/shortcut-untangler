var MODIFIER_KEY_CODES = {
    alt: 18,
    shift: 16,
    ctrl: 17
};

describe('Shortcut Untangler tests', function() { var shortcutUntangler;

    beforeEach(function() {
        shortcutUntangler = new ShortcutUntangler();
    });

    afterEach(function() {
        shortcutUntangler = null;
    });

    describe('Interface API', function() {
        it('should provide a method for enable debug mode', function() {
            expect(typeof shortcutUntangler.debugMode).toBe('function');
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
            expect(typeof shortcutUntangler.getActiveEnvironment).toBe('function');
        });

        it('should provide a method for toggle enabling state', function() {
            expect(typeof shortcutUntangler.debugMode).toBe('function');
        });

        it('should provide a method for enabling debug modet', function() {
            expect(typeof shortcutUntangler.debugMode).toBe('function');
        });
    });

    describe('Initialization', function() {
        var body = document.getElementsByTagName('body')[0];
        var initialBodyContent = body.innerHTML;

        afterEach(function() {
            shortcutUntangler.debugMode(false);
            body.innerHTML = initialBodyContent;
        });

        it('should allow to overwritte the default environment name', function() {
            shortcutUntangler = new ShortcutUntangler({
                mainEnvironment: 'foo'
            });

            shortcutUntangler.createShortcut({
                key: 'E',
                callback: function(){}
            });

            var environmentJson = shortcutUntangler.toJSON('foo');

            expect(environmentJson).not.toEqual({});
        });

        it('should allow to overwritte the default context name', function() {
            shortcutUntangler = new ShortcutUntangler({
                mainContext: 'foo'
            });

            expect(function() {
                shortcutUntangler.createContext({
                    name: 'foo',
                    description: 'should error since should already exit'
                });
            }).toThrow();
        });

        it('should allow to overwritte the default rootElement', function() {
            var shortcut = jasmine.createSpy();
            var shortcut2 = jasmine.createSpy();
            var shortcutBoundDiv;

            body.innerHTML = '<div id="shortcutBoundDiv"></div>';

            shortcutBoundDiv = document.getElementById('shortcutBoundDiv');

            shortcutUntangler = new ShortcutUntangler({
                rootElement: shortcutBoundDiv
            });

            shortcutUntangler.createShortcut({
                name: 'My shortcut',
                description: 'My shortcut description',
                key: 'E',
                callback: shortcut
            });

            shortcutUntangler.createShortcut({
                name: 'shortcut2',
                description: 'My shortcut description',
                key: 'F',
                callback: shortcut2
            });

            triggerNativeKeyHotkey('E', body);
            triggerNativeKeyHotkey('F', shortcutBoundDiv);

            expect(shortcut).not.toHaveBeenCalled();
            expect(shortcut2).toHaveBeenCalled();
        });

        it('should allow to overwritte the debug enabled state', function() {
            shortcutUntangler = new ShortcutUntangler({
                debug: true
            });

            spyOn(console, 'log');

            shortcutUntangler.createShortcut({
                key: 'E',
                callback: function(){}
            });

            triggerNativeKeyHotkey('E');

            expect(console.log).toHaveBeenCalled();
        });
    });

    describe('Debug support', function() {
        afterEach(function() {
            shortcutUntangler.debugMode(false);
        });

        it('should call "console.log" when debug is enabled', function() {
            shortcutUntangler.debugMode();

            spyOn(console, 'log');

            shortcutUntangler.createShortcut({
                key: 'E',
                callback: function(){}
            });

            triggerNativeKeyHotkey('E');

            expect(console.log).toHaveBeenCalled();
        });
    });

    describe('Initialization', function() {
        it('should have a main environment active when initialized', function() {
            var activeEnvironmentName = shortcutUntangler.getActiveEnvironment();

            expect(activeEnvironmentName).toEqual('main');
        });

        it('should be able to create a shortcut without specifying a context since it should be added to the main context and main environment', function() {
            var shortcut = jasmine.createSpy();

            shortcutUntangler.createShortcut({
                key: 'E',
                callback: shortcut
            });

            triggerNativeKeyHotkey('E');

            expect(shortcut).toHaveBeenCalled();
        });

        it('should return an empty object when the active environment has no shortcuts attached to it', function() {
            var environmentJson = shortcutUntangler.toJSON();

            expect(environmentJson).toEqual({});
        });

        it('should return a list of flattened environments when passing a list of environment', function() {

            shortcutUntangler.createEnvironment({
                name: 'other'
            });

            shortcutUntangler.changeEnvironment('other');

            shortcutUntangler.createShortcut({
                name: 'shortcut1',
                key: 'F',
                callback: function(){}
            });

            shortcutUntangler.createEnvironment({
                name: 'foo'
            });

            shortcutUntangler.changeEnvironment('foo');

            shortcutUntangler.createShortcut({
                name: 'shortcut2',
                key: 'F',
                callback: function(){}
            });

            var environmentJson = shortcutUntangler.toJSON(['other', 'foo']);

            expect(environmentJson[0]['F'].name).toBe('shortcut1');
            expect(environmentJson[1]['F'].name).toBe('shortcut2');
        });

        it('should return list with all flattened environments when passing "true" as param', function() {
            shortcutUntangler.createShortcut({
                name: 'shortcut0',
                key: 'F',
                callback: function(){}
            });

            shortcutUntangler.createEnvironment({
                name: 'other'
            }, false);

            shortcutUntangler.changeEnvironment('other');

            shortcutUntangler.createShortcut({
                name: 'shortcut1',
                key: 'F',
                callback: function(){}
            });

            shortcutUntangler.createEnvironment({
                name: 'foo'
            }, false);

            shortcutUntangler.changeEnvironment('foo');

            shortcutUntangler.createShortcut({
                name: 'shortcut2',
                key: 'F',
                callback: function(){}
            });

            var environmentJson = shortcutUntangler.toJSON(true);

            expect(environmentJson[0]['F'].name).toBe('shortcut0');
            expect(environmentJson[1]['F'].name).toBe('shortcut1');
            expect(environmentJson[2]['F'].name).toBe('shortcut2');
        });
    });

    describe('Context', function() {
        it('should throw an exception when creating context without arguments', function() {
            expect(shortcutUntangler.createContext).toThrow();
        });

        it('should throw an exception when creating context without a name', function() {
            expect(function() {
                shortcutUntangler.createContext({
                    'invalid': true
                });
            }).toThrow();
        });

        it('should not throw an exception when creating context with name and description', function() {
            expect(function() {
                shortcutUntangler.createContext({
                    name: 'lorem'
                });
            }).not.toThrow();
        });

        it('should throw an exception when trying to create a context with a name that already exists', function() {

            shortcutUntangler.createContext({
                name: 'lorem'
            });

            expect(function() {
                shortcutUntangler.createContext({
                    name: 'lorem'
                });
            }).toThrow();
        });

        it('should add context to the context array after the the first item of lower weight', function() {
            var shortcut = jasmine.createSpy();

            shortcutUntangler.createContext({
                name: 'ipsum',
                weight: 2
            });

            shortcutUntangler.createContext({
                name: 'lorem',
                weight: 1
            });

            shortcutUntangler.createShortcut({
                name: 'foo',
                description: 'My shortcut description',
                key: 'E',
                callback: function(){}
            }, 'lorem');

            shortcutUntangler.createShortcut({
                name: 'bar',
                description: 'My shortcut description',
                key: 'E',
                callback: shortcut
            }, 'ipsum');

            shortcutUntangler.createShortcut({
                name: 'three',
                description: 'My shortcut description',
                key: 'E',
                callback: function(){}
            });

            triggerNativeKeyHotkey('E');

            expect(shortcut).toHaveBeenCalled();
        });
    });

    describe('Environment', function() {
        it('should throw an exception when creating environment without arguments', function() {
            expect(shortcutUntangler.createEnvironment).toThrow();
        });

        it('should throw an exception when creating environment without name', function() {
            expect(function() {
                shortcutUntangler.createEnvironment({
                    'invalid': 'lorem'
                });
            }).toThrow();
        });

        it('should not throw an exception when creating environment with name and description', function() {
            expect(function() {
                shortcutUntangler.createEnvironment({
                    name: 'lorem'
                });
            }).not.toThrow();
        });

        it('should throw an exception when trying to create an environment with a name that already exists', function() {
            shortcutUntangler.createEnvironment({
                name: 'lorem'
            });

            expect(function() {
                shortcutUntangler.createEnvironment({
                    name: 'lorem'
                });
            }).toThrow();
        });

        it('should have active environment name set to "lorem" when creating a new environment and updating to it', function() {
            shortcutUntangler.createEnvironment({
                name: 'lorem'
            });

            shortcutUntangler.changeEnvironment('lorem');

            expect(shortcutUntangler.getActiveEnvironment()).toBe('lorem');
        });

        it('should have active environment name set to "main" when trying to change environment to a non existent one', function() {
            shortcutUntangler.changeEnvironment('lorem');

            expect(shortcutUntangler.getActiveEnvironment()).toBe('main');
        });

        it('should add all active shortcuts of the main environment to the new main context of the new environment', function() {
            shortcutUntangler.createShortcut({
                name: 'bar',
                key: 'E',
                callback: function(){}
            });

            shortcutUntangler.createEnvironment({
                name: 'lorem'
            });

            shortcutUntangler.changeEnvironment('lorem');

            expect(shortcutUntangler.toJSON()['E'].name).toEqual('bar');
        });

        it('should allow new environment to be created based on another environment', function() {
            shortcutUntangler.createEnvironment({
                name: 'lorem'
            });

            // create a new shortcut for the environment lorem
            shortcutUntangler.changeEnvironment('lorem');
            shortcutUntangler.createShortcut({
                name: 'bar',
                key: 'E',
                callback: function(){}
            });

            shortcutUntangler.createEnvironment({
                name: 'bar'
            }, 'lorem');

            expect(shortcutUntangler.toJSON('bar')['E'].name).toEqual('bar');
        });

        it('should allow new environment to be created bare without being based on another environment', function() {
            shortcutUntangler.createEnvironment({
                name: 'lorem'
            });

            // create a new shortcut for the environment lorem
            shortcutUntangler.changeEnvironment('lorem');
            shortcutUntangler.createShortcut({
                name: 'bar',
                key: 'E',
                callback: function(){}
            });

            shortcutUntangler.createEnvironment({
                name: 'bar'
            }, false);

            expect(shortcutUntangler.toJSON('bar')).toEqual({});
        });

        it('should create a bare environment when a non existent context to base the environment from', function() {
            shortcutUntangler.createEnvironment({
                name: 'lorem'
            });

            // create a new shortcut for the environment lorem
            shortcutUntangler.changeEnvironment('lorem');
            shortcutUntangler.createShortcut({
                name: 'bar',
                key: 'E',
                callback: function(){}
            });

            shortcutUntangler.createEnvironment({
                name: 'bar'
            }, "nonexistent");

            expect(shortcutUntangler.toJSON('bar')).toEqual({});
        });
    });

    describe('Shortcut', function() {
        it('should throw an exception when creating shortcut without arguments', function() {
            expect(shortcutUntangler.createShortcut).toThrow();
        });

        it('should throw an exception when creating shortcut without a callback', function() {
            expect(function() {
                shortcutUntangler.createShortcut({
                    key: 'E'
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
                    key: 'E',
                    callback: function(){}
                });
            }).not.toThrow();
        });

        it('should throw an exception when trying to create a shortcut with an already existent key on the same context', function() {
            shortcutUntangler.createShortcut({
                key: 'E',
                callback: function(){}
            });

            expect(function() {
                shortcutUntangler.createShortcut({
                    key: 'E',
                    callback: function(){}
                });
            }).toThrow();
        });

        it('should add a shortcut to the flattened json representation of the current active environment', function() {
            shortcutUntangler.createShortcut({
                name: 'My shortcut',
                description: 'My shortcut description',
                key: 'E',
                callback: function(){}
            });

            var environmentJson = shortcutUntangler.toJSON();

            expect(environmentJson['E'].name).toEqual('My shortcut');
        });

        it('should a shortcut has the same key bindings on a particular environment the one with higher weight should be represented on the flattened json representation of the current active environment', function() {
            shortcutUntangler.createContext({
                name: 'ipsum',
                weight: 2
            });

            shortcutUntangler.createContext({
                name: 'lorem',
                weight: 1
            });

            shortcutUntangler.createShortcut({
                name: 'foo',
                description: 'My shortcut description',
                key: 'E',
                callback: function(){}
            }, 'lorem');

            shortcutUntangler.createShortcut({
                name: 'bar',
                description: 'My shortcut description',
                key: 'E',
                callback: function(){}
            }, 'ipsum');

            shortcutUntangler.createShortcut({
                name: 'three',
                description: 'My shortcut description',
                key: 'E',
                callback: function(){}
            });

            var environmentJson = shortcutUntangler.toJSON();

            expect(environmentJson['E'].name).toEqual('bar');
        });

        it('should a shortcut has the same key bindings on a particular environment and the context has the same weight the one that was added last should be represented on the flattened json of the current active environment', function() {
            shortcutUntangler.createContext({
                name: 'ipsum',
                weight: 2
            });

            shortcutUntangler.createContext({
                name: 'lorem',
                weight: 2
            });

            shortcutUntangler.createShortcut({
                name: 'foo',
                description: 'My shortcut description',
                key: 'E',
                callback: function(){}
            }, 'lorem');

            shortcutUntangler.createShortcut({
                name: 'bar',
                description: 'My shortcut description',
                key: 'E',
                callback: function(){}
            }, 'ipsum');


            shortcutUntangler.createShortcut({
                name: 'three',
                description: 'My shortcut description',
                key: 'E',
                callback: function(){}
            });

            var environmentJson = shortcutUntangler.toJSON();

            expect(environmentJson['E'].name).toEqual('foo');
        });
    });

    describe('Combo', function() {
        it('should throw an exception when trying to create a shortcut with same key bidings placed on different order', function() {
            shortcutUntangler.createShortcut({
                key: 'SHIFT ALT',
                callback: function(){}
            });

            expect(function() {
                shortcutUntangler.createShortcut({
                    key: 'ALT SHIFT',
                    callback: function(){}
                });
            }).toThrow();
        });

        it('should throw an exception when trying to create a shortcut with same key bidings placed on different order and with diffent type case', function() {
            shortcutUntangler.createShortcut({
                key: 'SHIFT ALT',
                callback: function(){}
            });

            expect(function() {
                shortcutUntangler.createShortcut({
                    key: 'alt shift',
                    callback: function(){}
                });
            }).toThrow();
        });

        it('should not be triggered when there are other keys pressed at the same time that are not part of the combo', function() {
            var shortcut = jasmine.createSpy();

            shortcutUntangler.createShortcut({
                key: 'E',
                callback: shortcut
            });


            triggerKeyDown('F');
            triggerKeyDown('E');

            expect(shortcut).not.toHaveBeenCalled();
        });

        it('should be triggered when there are other keys pressed at the same time that are part of the combo', function() {
            var shortcut = jasmine.createSpy();

            shortcutUntangler.createShortcut({
                key: 'e f',
                callback: shortcut
            });

            triggerKeyDown('E');
            triggerKeyDown('F');

            expect(shortcut).toHaveBeenCalled();
        });

        it('should be triggered when there are other keys pressed at the same time in a different order that are part of the combo', function() {
            var shortcut = jasmine.createSpy();

            shortcutUntangler.createShortcut({
                key: 'e f',
                callback: shortcut
            });

            triggerKeyDown('F');
            triggerKeyDown('E');

            expect(shortcut).toHaveBeenCalled();
        });

        it('should be triggered when pressing key modifier down and normal key combo', function() {
            var shortcut = jasmine.createSpy();

            shortcutUntangler.createShortcut({
                key: 'ctrl f',
                callback: shortcut
            });

            triggerKeyDown(MODIFIER_KEY_CODES.ctrl);
            triggerKeyDown('f');

            expect(shortcut).toHaveBeenCalled();
        });

        it('should be triggered when using key modifier and normal key combo pressed in different order', function() {
            var shortcut = jasmine.createSpy();

            shortcutUntangler.createShortcut({
                key: 'ctrl f',
                callback: shortcut
            });

            triggerKeyDown('f');
            triggerKeyDown(MODIFIER_KEY_CODES.ctrl);

            expect(shortcut).toHaveBeenCalled();
        });

        it('should be triggered when using multiple key modifier and normal key combo', function() {
            var shortcut = jasmine.createSpy();

            shortcutUntangler.createShortcut({
                key: 'ctrl alt f',
                callback: shortcut
            });

            triggerKeyDown(MODIFIER_KEY_CODES.ctrl);
            triggerKeyDown(MODIFIER_KEY_CODES.alt);
            triggerKeyDown('f');

            expect(shortcut).toHaveBeenCalled();
        });

        it('should be triggered when key modifier are part of the event when using a combo', function() {
            var shortcut = jasmine.createSpy();

            shortcutUntangler.createShortcut({
                key: 'ctrl f',
                callback: shortcut
            });

            triggerNativeKeyHotkey('f', null, ["ctrl"]);

            expect(shortcut).toHaveBeenCalled();
        });

        it('should be triggered when using multiple key modifier are part of the event when using a combo', function() {
            var shortcut = jasmine.createSpy();

            shortcutUntangler.createShortcut({
                key: 'ctrl alt f',
                callback: shortcut
            });

            triggerNativeKeyHotkey('f', null, ["ctrl", "alt"]);

            expect(shortcut).toHaveBeenCalled();
        });

        it('should be able to trigger shortcuts using modifier keys by themselves', function() {
            var shortcut = jasmine.createSpy();

            shortcutUntangler.createShortcut({
                key: 'ctrl',
                callback: shortcut
            });

            triggerNativeKeyHotkey(MODIFIER_KEY_CODES.ctrl);

            expect(shortcut).toHaveBeenCalled();
        });

        it('should be able to trigger shortcuts using multiple modifier keys by themselves', function() {
            var shortcut = jasmine.createSpy();

            shortcutUntangler.createShortcut({
                key: 'ctrl alt',
                callback: shortcut
            });

            triggerKeyDown(MODIFIER_KEY_CODES.alt);
            triggerKeyDown(MODIFIER_KEY_CODES.ctrl);

            expect(shortcut).toHaveBeenCalled();
        });
    });

    describe('Controls', function() {
        it('should not trigger a shortcut in any environment when calling toggleDisabledState with no arguments', function() { var shortcut = jasmine.createSpy();

            shortcutUntangler.createShortcut({
                name: 'My shortcut',
                description: 'My shortcut description',
                key: 'E',
                callback: shortcut
            });

            shortcutUntangler.createEnvironment({
                name: 'other'
            }, false);

            shortcutUntangler.changeEnvironment('other');

            shortcutUntangler.createShortcut({
                name: 'shortcut1',
                key: 'E',
                callback: shortcut
            });

            shortcutUntangler.toggleDisabledState();

            triggerNativeKeyHotkey('E');

            shortcutUntangler.changeEnvironment('main');

            triggerNativeKeyHotkey('E');

            expect(shortcut).not.toHaveBeenCalled();
        });

        it('should not disable any environment when calling toggleDisabledState with an invalid "environment param', function() {
            var shortcut = jasmine.createSpy();
            var shortcut2 = jasmine.createSpy();

            shortcutUntangler.createShortcut({
                name: 'My shortcut',
                description: 'My shortcut description',
                key: 'E',
                callback: shortcut
            });

            shortcutUntangler.createEnvironment({
                name: 'foo'
            }, false);

            shortcutUntangler.changeEnvironment('foo');

            shortcutUntangler.createShortcut({
                name: 'shortcut2',
                key: 'E',
                callback: shortcut2
            });

            shortcutUntangler.toggleDisabledState(true, 'invalid');

            triggerNativeKeyHotkey('E');

            shortcutUntangler.changeEnvironment('main');

            triggerNativeKeyHotkey('E');

            expect(shortcut).toHaveBeenCalled();
            expect(shortcut2).toHaveBeenCalled();
        });

        it('should just disable the shortcuts in "foo" and "bar" when calling toggleDisabledState with ["foo", "bar"] as an environment param', function() {
            var shortcut = jasmine.createSpy();
            var shortcut2 = jasmine.createSpy();
            var shortcut3 = jasmine.createSpy();

            shortcutUntangler.createShortcut({
                name: 'My shortcut',
                description: 'My shortcut description',
                key: 'E',
                callback: shortcut
            });

            shortcutUntangler.createEnvironment({
                name: 'foo'
            }, false);

            shortcutUntangler.changeEnvironment('foo');

            shortcutUntangler.createShortcut({
                name: 'shortcut2',
                key: 'E',
                callback: shortcut2
            });

            shortcutUntangler.createEnvironment({
                name: 'bar'
            }, false);

            shortcutUntangler.changeEnvironment('bar');

            shortcutUntangler.createShortcut({
                name: 'shortcut3',
                key: 'E',
                callback: shortcut3
            });

            shortcutUntangler.toggleDisabledState(true, ['foo', 'bar']);

            triggerNativeKeyHotkey('E');

            shortcutUntangler.changeEnvironment('foo');

            triggerNativeKeyHotkey('E');

            shortcutUntangler.changeEnvironment('main');

            triggerNativeKeyHotkey('E');

            expect(shortcut).toHaveBeenCalled();
            expect(shortcut2).not.toHaveBeenCalled();
            expect(shortcut3).not.toHaveBeenCalled();
        });

        it('should not disable the shortcuts on any environment if calling toggleDisabledState with invalid ["invalid", "invalid2"] names as environment param', function() {
            var shortcut = jasmine.createSpy();
            var shortcut2 = jasmine.createSpy();
            var shortcut3 = jasmine.createSpy();

            shortcutUntangler.createShortcut({
                name: 'My shortcut',
                description: 'My shortcut description',
                key: 'E',
                callback: shortcut
            });

            shortcutUntangler.createEnvironment({
                name: 'foo'
            }, false);

            shortcutUntangler.changeEnvironment('foo');

            shortcutUntangler.createShortcut({
                name: 'shortcut2',
                key: 'E',
                callback: shortcut2
            });

            shortcutUntangler.createEnvironment({
                name: 'bar'
            }, false);

            shortcutUntangler.changeEnvironment('bar');

            shortcutUntangler.createShortcut({
                name: 'shortcut3',
                key: 'E',
                callback: shortcut3
            });

            shortcutUntangler.toggleDisabledState(true, ['invalid1', 'invalid2']);

            triggerNativeKeyHotkey('E');

            shortcutUntangler.changeEnvironment('foo');

            triggerNativeKeyHotkey('E');

            shortcutUntangler.changeEnvironment('main');

            triggerNativeKeyHotkey('E');

            expect(shortcut).toHaveBeenCalled();
            expect(shortcut2).toHaveBeenCalled();
            expect(shortcut3).toHaveBeenCalled();
        });

        it('should disabled context instead of the whole environments when passing a context name as a param', function() {
            var shortcut = jasmine.createSpy();
            var shortcut2 = jasmine.createSpy();

            shortcutUntangler.createShortcut({
                name: 'My shortcut',
                description: 'My shortcut description',
                key: 'E',
                callback: shortcut
            });

            shortcutUntangler.createContext({
                name: 'other',
                weight: 1
            });

            shortcutUntangler.createShortcut({
                name: 'My shortcut',
                description: 'My shortcut description',
                key: 'E',
                callback: shortcut2
            }, 'other');

            shortcutUntangler.toggleDisabledState(true, 'main', 'other');

            triggerNativeKeyHotkey('E');

            expect(shortcut2).not.toHaveBeenCalled();
            expect(shortcut).toHaveBeenCalled();
        });

        it('should not disabled context any context when passing an invalid context name as a param', function() {
            var shortcut = jasmine.createSpy();
            var shortcut2 = jasmine.createSpy();

            shortcutUntangler.createShortcut({
                name: 'My shortcut',
                description: 'My shortcut description',
                key: 'E',
                callback: shortcut
            });

            shortcutUntangler.createContext({
                name: 'other',
                weight: 1
            });

            shortcutUntangler.createShortcut({
                name: 'My shortcut',
                description: 'My shortcut description',
                key: 'E',
                callback: shortcut2
            }, 'other');

            shortcutUntangler.toggleDisabledState(true, 'main', 'invalid');

            triggerNativeKeyHotkey('E');

            expect(shortcut2).toHaveBeenCalled();
            expect(shortcut).not.toHaveBeenCalled();
        });

        it('should disabled context in list instead of the whole environments when passing a context name as a param', function() {
            var shortcut = jasmine.createSpy();
            var shortcut2 = jasmine.createSpy();
            var shortcut3 = jasmine.createSpy();

            shortcutUntangler.createShortcut({
                name: 'My shortcut',
                description: 'My shortcut description',
                key: 'E',
                callback: shortcut
            });

            shortcutUntangler.createContext({
                name: 'other',
                weight: 1
            });

            shortcutUntangler.createContext({
                name: 'foo',
                weight: 2
            });

            shortcutUntangler.createShortcut({
                name: 'shortcut2',
                description: 'My shortcut description',
                key: 'E',
                callback: shortcut2
            }, 'other');

            shortcutUntangler.createShortcut({
                name: 'shortcut3',
                description: 'My shortcut description',
                key: 'E',
                callback: shortcut2
            }, 'foo');

            shortcutUntangler.toggleDisabledState(true, 'main', ['other', 'foo']);

            triggerNativeKeyHotkey('E');

            expect(shortcut3).not.toHaveBeenCalled();
            expect(shortcut2).not.toHaveBeenCalled();
            expect(shortcut).toHaveBeenCalled();
        });

        it('should be able to disable a single shortcut from a context', function() {
            var shortcut = jasmine.createSpy();
            var shortcut2 = jasmine.createSpy();

            shortcutUntangler.createContext({
                name: 'other',
                weight: 1
            });

            shortcutUntangler.createShortcut({
                name: 'My shortcut',
                description: 'My shortcut description',
                key: 'E',
                callback: shortcut
            }, 'other');

            shortcutUntangler.createShortcut({
                name: 'My shortcut 2',
                description: 'My shortcut description',
                key: 'F',
                callback: shortcut2
            }, 'other');

            shortcutUntangler.toggleDisabledState(true, 'main', 'other', 'E');

            triggerNativeKeyHotkey('E');
            triggerNativeKeyHotkey('F');

            expect(shortcut).not.toHaveBeenCalled();
            expect(shortcut2).toHaveBeenCalled();
        });

        it('should not disable any shortcut from a context when passing an invalid shorcut key', function() {
            var shortcut = jasmine.createSpy();
            var shortcut2 = jasmine.createSpy();

            shortcutUntangler.createContext({
                name: 'other',
                weight: 1
            });

            shortcutUntangler.createShortcut({
                name: 'My shortcut',
                description: 'My shortcut description',
                key: 'E',
                callback: shortcut
            }, 'other');

            shortcutUntangler.createShortcut({
                name: 'My shortcut 2',
                description: 'My shortcut description',
                key: 'F',
                callback: shortcut2
            }, 'other');

            shortcutUntangler.toggleDisabledState(true, 'main', 'other', 'invalid');

            triggerNativeKeyHotkey('E');
            triggerNativeKeyHotkey('F');

            expect(shortcut).toHaveBeenCalled();
            expect(shortcut2).toHaveBeenCalled();
        });

        it('should not disable any shortcut from a context when passing an invalid list of shorcut keys', function() {
            var shortcut = jasmine.createSpy();
            var shortcut2 = jasmine.createSpy();

            shortcutUntangler.createContext({
                name: 'other',
                weight: 1
            });

            shortcutUntangler.createShortcut({
                name: 'My shortcut',
                description: 'My shortcut description',
                key: 'E',
                callback: shortcut
            }, 'other');

            shortcutUntangler.createShortcut({
                name: 'My shortcut 2',
                description: 'My shortcut description',
                key: 'F',
                callback: shortcut2
            }, 'other');

            shortcutUntangler.toggleDisabledState(true, 'main', 'other', ['invalid1', 'invalid2']);

            triggerNativeKeyHotkey('E');
            triggerNativeKeyHotkey('F');

            expect(shortcut).toHaveBeenCalled();
            expect(shortcut2).toHaveBeenCalled();
        });

        it('should be able to disable a list of shortcuts from a context', function() {
            var shortcut = jasmine.createSpy();
            var shortcut2 = jasmine.createSpy();

            shortcutUntangler.createContext({
                name: 'other',
                weight: 1
            });

            shortcutUntangler.createShortcut({
                name: 'My shortcut',
                description: 'My shortcut description',
                key: 'E',
                callback: shortcut
            }, 'other');

            shortcutUntangler.createShortcut({
                name: 'My shortcut 2',
                description: 'My shortcut description',
                key: 'F',
                callback: shortcut2
            }, 'other');

            shortcutUntangler.toggleDisabledState(true, 'main', 'other', ['E', 'F']);

            triggerNativeKeyHotkey('E');
            triggerNativeKeyHotkey('F');

            expect(shortcut).not.toHaveBeenCalled();
            expect(shortcut2).not.toHaveBeenCalled();
        });

        it('should toggle disabled state when calling it again with no state as param', function() {
            var shortcut = jasmine.createSpy();

            shortcutUntangler.createShortcut({
                name: 'My shortcut',
                description: 'My shortcut description',
                key: 'E',
                callback: shortcut
            });

            shortcutUntangler.toggleDisabledState();
            shortcutUntangler.toggleDisabledState();

            triggerNativeKeyHotkey('E');

            expect(shortcut).toHaveBeenCalled();
        });
    });
});

function addModifier(event, modifierArray) {
    if(Array.isArray(modifierArray)) {
        for(var i=0, len=modifierArray.length; i<len; i++) {
            var modifier = modifierArray[i];

            if(MODIFIER_KEY_CODES[modifier]) {
                event[modifier.toLowerCase() + "Key"] = true;
            }
        }
    }

    return event;
}

function triggerKeyDown(keyCode, el, modifier) {
    el = el || document.getElementsByTagName('body')[0];

    var eventObj = document.createEventObject ?  document.createEventObject() : document.createEvent('Events');

    if(eventObj.initEvent){
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

    var eventObj = document.createEventObject ?  document.createEventObject() : document.createEvent('Events');

    if(eventObj.initEvent){
      eventObj.initEvent('keyup', true, true);
    }

    keyCode = typeof keyCode === 'number' ? keyCode : keyCode.toUpperCase().charCodeAt(0);

    eventObj.keyCode = keyCode;
    eventObj.which = keyCode;

    eventObj = addModifier(eventObj, modifier);

    el.dispatchEvent ? el.dispatchEvent(eventObj) : el.fireEvent('onkeyup', eventObj);
}

function triggerNativeKeyHotkey(keyCode, el, modifier) {
    triggerKeyDown(keyCode, el, modifier);
    triggerKeyUp(keyCode, el, modifier);
}
