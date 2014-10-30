describe('Shortcut untagler API.', function() {
    var module = window.shortcutUntangler;

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
});
