require.config({
    paths: {
        latestStableRelease: 'https://rawgit.com/mitermayer/shortcut-untangler/master/dist/shortcutUntangler',
        developmentVersion: '../../../../dist/shortcutUntangler'
    }
});


define([
    'lib/jslitmus-amd',
    'lib/utils',
    'latestStableRelease',
    'developmentVersion'
],function(
    JSLitmus,
    Utils,
    latestStableRelease,
    developmentVersion
) {
    var latestStableReleaseFixture = document.getElementById('latestStableRelease');
    var developmentVersionFixture = document.getElementById('developmentVersion');

    var latestStableRelease = new latestStableRelease({
        rootElement: latestStableReleaseFixture
    });
    var developmentVersion = new developmentVersion({
        rootElement: developmentVersionFixture
    });

    var Acalled = false;
    var Bcalled = false;

    var NUM_OF_CONTEXT = 5000;

    for(var i=0; i<NUM_OF_CONTEXT; i++) {
        latestStableRelease.createContext({
            name: 'foo' + i,
        });

        developmentVersion.createContext({
            name: 'foo' + i
        });

        latestStableRelease.createShortcut({
          key: 'A S D F O P',
          callback: function() {
            Acalled = true;
          }
        }, 'foo' + i);

        developmentVersion.createShortcut({
          key: 'B C N M G H',
          callback: function() {
            Bcalled = true;
          }
        }, 'foo' + i);
    }

    JSLitmus.test('Development Version', function() {
      Utils.triggerNativeKeyHotkey(['B', 'C', 'N', 'M', 'G', 'H'], developmentVersionFixture);
      while(Bcalled !== true) {}
      Bcalled = false;
    });

    JSLitmus.test('Latest Release', function() {
      Utils.triggerNativeKeyHotkey(['A', 'S', 'D', 'F', 'O', 'P'], latestStableReleaseFixture);
      while(Acalled !== true) {}
      Acalled = false;
    });
});
