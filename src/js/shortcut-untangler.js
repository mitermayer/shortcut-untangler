(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('shortcutUntangler', [], factory);
    } else {
        root.shortcutUntangler = factory();
    }
}(this, function () {

    var Shortcut = function(options) {
        this.key = options.key;
        this.description = options.description;
        this.name = options.name;
        this.callback = options.callback;
    };

    var Context = function(options) {
        this.description = options.description;
        this.element = options.element;
        this.name = options.name;
        this.shortcuts = [];
        this.weight = options.weight;
    };

    var Environment = function(options) {
        this.active = false;
        this.context = [];
    };

    var ShortcutUntanglerFactory = {
        enableDebug: function(){},
        changeEnvironment: function(){},
        createContext: function(){},
        createEnvironment: function(){},
        createShortcut: function(){},
        toJSON: function(){}
    };

    return ShortcutUntanglerFactory;
}));
