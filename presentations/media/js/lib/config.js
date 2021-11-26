// global.js
var DEFAULT_ANIMATION_DURATION = 0.5;
var DEFAULT_POPUP_DISPARITION_CLASS = "miniaturized";
var DEFAULT_ANIMATION_DELAY = 0;
var ZOOM_BUTTON_PREFIX = "bt_zoom";
var ZOOM_POPUP_PREFIX = "popup-zoom";
var ANIMATED_CONTENT_PREFIX = "content";
var LAYER_SHOWN_ZINDEX = 10;
var TOP_ZINDEX = 10;
var DISABLE_RELATED_BUTTON = true;
var PAGE_WIDTH = 1024;
var PAGE_HEIGHT = 768;

// global vars
var popupReferences;
var animatedContentInitialClasses;
var savedPopupClasses = {};
var currentZoomedPopup;
var alreadyInitialized = false;

// global objects
var tools = new Tools();