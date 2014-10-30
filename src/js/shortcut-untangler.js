(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('shortcutUntangler', [], factory);
    } else {
        root.ShortcutUntangler = factory();
    }
}(this, function() {

    //var extend = typeof jQuery !== 'undefined' ? jQuery.extend : function(out) {
    //    out = out || {};
    //    for (var i = 1; i < arguments.length; i++) {
    //        if (!arguments[i])
    //            continue;

    //        for (var key in arguments[i]) {
    //            if (arguments[i].hasOwnProperty(key))
    //                out[key] = arguments[i][key];
    //        }
    //    }

    //    return out;
    //};

    // primayKey: key
    var Shortcut = function(options) {
        this.key = options.key;
        this.description = options.description;
        this.name = options.name;
        this.callback = options.callback;
    };

    // primayKey: name
    var Context = function(options) {
        this.description = options.description;
        this.name = options.name;
        this.shortcuts = [];
        this.weight = options.weight;
    };

    // primayKey: name
    var Environment = function(options) {
        this.active = false;
        this.context = [];
        this.description = options.description;
        this.name = options.name;
    };

    var _environments = {
        'main': {
            'active': true,
            'description': 'Default shortcuts environment',
            'name': 'main',
            'context': [{
                'description': 'Default shortcuts context',
                'name': 'main',
                'weight': 0,
                'shortcut': {}
            }]
        }
    };

    var hasRequiredArguments = function(required, option) {
        return required.every(function(key) {
            return typeof option[key] !== 'undefined';
        });
    };

    var ShortcutUntanglerFactory = function() {
        var default_active_envirionment = "main";

        document.getElementsByTagName("body")[0].addEventListener("keypress", function(e) {
            var key = e.keyCode ? e.keyCode : e.which;
            var shortcut = String.fromCharCode(key);

            var activeEnvironment = _environments[default_active_envirionment];

            // loop in all context backwards searching for the key
            for (var i = activeEnvironment.context.length; i > 0; --i) {
                var _shortcut = activeEnvironment.context[i -1].shortcut[shortcut];
                if(_shortcut)  {
                    _shortcut.callback(arguments);
                    break;
                }
            }
}, false);

        return {
            changeEnvironment: function() {},
            enableDebug: function() {},
            getActiveEnvironment: function() {},
            createContext: function(option) {
                var required = ['name', 'description'];

                if (!option || !hasRequiredArguments(required, option)) {
                    throw new Error("InvalidArguments");
                }
            },
            createEnvironment: function(option) {
                var required = ['name', 'description'];

                if (!option || !hasRequiredArguments(required, option)) {
                    throw new Error("InvalidArguments");
                }
            },
            createShortcut: function(option) {
                var required = ['key', 'callback'];

                if (!option || !hasRequiredArguments(required, option)) {
                    throw new Error("InvalidArguments");
                }

                _environments.main.context[0].shortcut[option.key] = option;
            },
            toJSON: function() {}
        };
    };

    // todo ShortcutUntanglerFactory should be initialized

    return new ShortcutUntanglerFactory();
}));
