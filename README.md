##Shortcut params to create shortcut should be
  env = "" || [] - defaults to "general"
  func = func - required, Throws no callback assign
  hotkey = "e" || [] - required, Throws shortcut already assigne and name of the shortcut
  name = "foooo" - required, Throws shortcut already exists with that name

##ShortCutManager

 - should be able to have a default environment that shortcuts will be triggered from
 - new environments should have a weight defined
 - all events should be dispatched by the same manager
 - environments should be able to overwritte the hotkeys, which means the event proxy will dispatch only to the correct one
 - if you try to generate a shortcut from the same manager it should throw an error with the name of the already assigned shortcut
 - should also be able to figure out which keys to assign based on the OS example ctrl key


#### the manager will have a subscribe and unsubscribe point

- unsubscribe should accept a key or the reference of the returned shortcut object
- subscribe adds the shortcut
- getEnvs - returns all the shortcuts
- getShortcuts - returns all the shortcuts
- getShortcut - return shortcut
- onInit - when the manager has been init callback ( also should trigger an event )
- toJson - should return string representing the shortcut current map ( could be used to build some sort of UI )

events fired

 - new env createad
 - environment deleted
 - shortcut + key created
 - shortcut + key destroyed
 - environment change
 - manager is ready and has init with all the defaults
