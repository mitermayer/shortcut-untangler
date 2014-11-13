describe('Shortcut Untangler tests', function() {
    var shortcutUntangler;

    beforeEach(function() {
        shortcutUntangler = new ShortcutUntangler();
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
            expect(typeof shortcutUntangler.getActiveEnvironment).toBe('function');
        });
    });

    describe('Debug support', function() {
        beforeEach(function() {
            shortcutUntangler = new ShortcutUntangler();
            shortcutUntangler.enableDebug();
        });

        afterEach(function() {
            shortcutUntangler.enableDebug(false);
            shortcutUntangler = null;
        });

        it('should call "console.log" when debug is enabled', function() {
            spyOn(console, 'log');

            shortcutUntangler.createShortcut({
                key: 'e',
                callback: function(){}
            });

            triggerNativeKeyHotkey('e');

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

        it('should return a list of flattened environments when passing a list of environment', function() {

            shortcutUntangler.createEnvironment({
                name: 'other',
                description: 'bar'
            });

            shortcutUntangler.changeEnvironment('other');

            shortcutUntangler.createShortcut({
                name: 'shortcut1',
                key: 'f',
                callback: function(){}
            });

            shortcutUntangler.createEnvironment({
                name: 'foo',
                description: 'bar'
            });

            shortcutUntangler.changeEnvironment('foo');

            shortcutUntangler.createShortcut({
                name: 'shortcut2',
                key: 'f',
                callback: function(){}
            });

            var environmentJson = shortcutUntangler.toJSON(['other', 'foo']);

            expect(environmentJson[0]['f'].name).toBe('shortcut1');
            expect(environmentJson[1]['f'].name).toBe('shortcut2');
        });

        it('should return list with all flattened environments when passing "true" as param', function() {
            shortcutUntangler.createShortcut({
                name: 'shortcut0',
                key: 'f',
                callback: function(){}
            });

            shortcutUntangler.createEnvironment({
                name: 'other',
                description: 'bar'
            }, false);

            shortcutUntangler.changeEnvironment('other');

            shortcutUntangler.createShortcut({
                name: 'shortcut1',
                key: 'f',
                callback: function(){}
            });

            shortcutUntangler.createEnvironment({
                name: 'foo',
                description: 'bar'
            }, false);

            shortcutUntangler.changeEnvironment('foo');

            shortcutUntangler.createShortcut({
                name: 'shortcut2',
                key: 'f',
                callback: function(){}
            });

            var environmentJson = shortcutUntangler.toJSON(true);

            expect(environmentJson[0]['f'].name).toBe('shortcut0');
            expect(environmentJson[1]['f'].name).toBe('shortcut1');
            expect(environmentJson[2]['f'].name).toBe('shortcut2');
        });
    });

    describe('Context', function() {
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

        it('should add context to the context array after the the first item of lower weight', function() {
            var shortcut = jasmine.createSpy();

            shortcutUntangler.createContext({
                name: 'ipsum',
                description: 'lorem ipsum',
                weight: 2
            });

            shortcutUntangler.createContext({
                name: 'lorem',
                description: 'lorem ipsum',
                weight: 1
            });

            shortcutUntangler.createShortcut({
                name: 'foo',
                description: 'My shortcut description',
                key: 'e',
                callback: function(){}
            }, 'lorem');

            shortcutUntangler.createShortcut({
                name: 'bar',
                description: 'My shortcut description',
                key: 'e',
                callback: shortcut
            }, 'ipsum');

            shortcutUntangler.createShortcut({
                name: 'three',
                description: 'My shortcut description',
                key: 'e',
                callback: function(){}
            });

            triggerNativeKeyHotkey('e');

            expect(shortcut).toHaveBeenCalled();
        });
    });

    describe('Environment', function() {
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

        it('should have active environment name set to "main" when trying to change environment to a non existent one', function() {
            shortcutUntangler.changeEnvironment('lorem');

            expect(shortcutUntangler.getActiveEnvironment()).toBe('main');
        });

        it('should add all active shortcuts of the main environment to the new main context of the new environment', function() {
            shortcutUntangler.createShortcut({
                name: 'bar',
                key: 'e',
                callback: function(){}
            });

            shortcutUntangler.createEnvironment({
                name: 'lorem',
                description: 'lorem ipsum'
            });

            shortcutUntangler.changeEnvironment('lorem');

            expect(shortcutUntangler.toJSON()['e'].name).toEqual('bar');
        });

        it('should allow new environment to be created based on another environment', function() {
            shortcutUntangler.createEnvironment({
                name: 'lorem',
                description: 'lorem ipsum'
            });

            // create a new shortcut for the environment lorem
            shortcutUntangler.changeEnvironment('lorem');
            shortcutUntangler.createShortcut({
                name: 'bar',
                key: 'e',
                callback: function(){}
            });

            shortcutUntangler.createEnvironment({
                name: 'bar',
                description: 'lorem ipsum'
            }, 'lorem');

            expect(shortcutUntangler.toJSON('bar')['e'].name).toEqual('bar');
        });

        it('should allow new environment to be created bare without being based on another environment', function() {
            shortcutUntangler.createEnvironment({
                name: 'lorem',
                description: 'lorem ipsum'
            });

            // create a new shortcut for the environment lorem
            shortcutUntangler.changeEnvironment('lorem');
            shortcutUntangler.createShortcut({
                name: 'bar',
                key: 'e',
                callback: function(){}
            });

            shortcutUntangler.createEnvironment({
                name: 'bar',
                description: 'lorem ipsum'
            }, false);

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

        it('should throw an exception when trying to create a shortcut with an already existent key on the same context', function() {
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

            expect(environmentJson['e'].name).toEqual('My shortcut');
        });

        it('should a shortcut has the same key bindings on a particular environment the one with higher weight should be represented on the flattened json representation of the current active environment', function() {
            shortcutUntangler.createContext({
                name: 'ipsum',
                description: 'lorem ipsum',
                weight: 2
            });

            shortcutUntangler.createContext({
                name: 'lorem',
                description: 'lorem ipsum',
                weight: 1
            });

            shortcutUntangler.createShortcut({
                name: 'foo',
                description: 'My shortcut description',
                key: 'e',
                callback: function(){}
            }, 'lorem');

            shortcutUntangler.createShortcut({
                name: 'bar',
                description: 'My shortcut description',
                key: 'e',
                callback: function(){}
            }, 'ipsum');

            shortcutUntangler.createShortcut({
                name: 'three',
                description: 'My shortcut description',
                key: 'e',
                callback: function(){}
            });

            var environmentJson = shortcutUntangler.toJSON();

            expect(environmentJson['e'].name).toEqual('bar');
        });

        it('should a shortcut has the same key bindings on a particular environment and the context has the same weight the one that the context was added last should be represented on the flattened json representation of the current active environment', function() {
            shortcutUntangler.createContext({
                name: 'ipsum',
                description: 'lorem ipsum',
                weight: 2
            });

            shortcutUntangler.createContext({
                name: 'lorem',
                description: 'lorem ipsum',
                weight: 2
            });

            shortcutUntangler.createShortcut({
                name: 'foo',
                description: 'My shortcut description',
                key: 'e',
                callback: function(){}
            }, 'lorem');

            shortcutUntangler.createShortcut({
                name: 'bar',
                description: 'My shortcut description',
                key: 'e',
                callback: function(){}
            }, 'ipsum');

            shortcutUntangler.createShortcut({
                name: 'three',
                description: 'My shortcut description',
                key: 'e',
                callback: function(){}
            });

            var environmentJson = shortcutUntangler.toJSON();

            expect(environmentJson['e'].name).toEqual('foo');
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
