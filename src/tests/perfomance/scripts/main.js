require.config({
    paths: {
        latestStableRelease: '../version/v1.0.0a/shortcutUntangler',
        developmentRelease: '../version/shortcutUntangler'
    }
});


define([
    'lib/jslitmus-amd',
    'lib/utils',
    'latestStableRelease',
    'developmentRelease'
],function(
    JSLitmus,
    Utils,
    latestStableRelease,
    developmentRelease
) {
    var latestStableRelease = new latestStableRelease();
    var developmentRelease = new developmentRelease();
    var Acalled = false;
    var Bcalled = false;

    var NUM_OF_CONTEXT = 5000;

    for(var i=0; i<NUM_OF_CONTEXT; i++) {
        latestStableRelease.createContext({
            name: 'foo' + i,
            description: 'should error since should already exit'
        });

        developmentRelease.createContext({
            name: 'foo' + i,
            description: 'should error since should already exit'
        });

        latestStableRelease.createShortcut({
          name: 'My shortcut',
          description: 'My shortcut description',
          key: 'A',
          callback: function() {
            Acalled = true;
          }
        }, 'foo' + i);

        developmentRelease.createShortcut({
          name: 'My shortcut',
          description: 'My shortcut description',
          key: 'B',
          callback: function() {
            Bcalled = true;
          }
        }, 'foo' + i);
    }

    JSLitmus.test('Testing 1.0.0a version', function() {
      Utils.triggerNativeKeyHotkey('A');
      while(Acalled !== true) {}
      Acalled = false;
    });

    JSLitmus.test('Testing dev version', function() {
      Utils.triggerNativeKeyHotkey('B');
      while(Bcalled !== true) {}
      Bcalled = false;
    });
});
