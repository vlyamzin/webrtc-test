var includes = [
    "lib/global_autolaunch.js",
    "components/component.tools.js",
    "lib/config.js",
    "lib/viview.js",
    "vendor/jquery-1.9.1.min.js",
    "controllers/controller.index.js",
    "components/feedbacker.js",
    "controllers/controller.iframe.js"
];

for(var i=0;i<includes.length;i++) {
    document.write('<script src="media/js/' + includes[i] + '" type="text/javascript"></script>');
}

var apparitionClassNames = {
    "content3" : "bubble finder", 
    "content4" : "bubble finder", 
    "content5" : "bubble finder"
};

/**
 * Initialise les composants
 */
var iframeControls = [];

function Initialize() {
    var indexController = new IndexController();
    indexController.initialize();
    var feedbacker = new Feedbacker();
    feedbacker.initialize();
    
    iframeControls[0] = new IframeControl({
        openBtnId: "tab0", 
        closeBtnId: "bt-home",
        showHideClass: "layer-off"
    });
    iframeControls[0].initialize('tabbedpane0.html');
    
    iframeControls[1] = new IframeControl({
        openBtnId: "tab1", 
        closeBtnId: "bt-home",
        showHideClass: "layer-off"
    });
    iframeControls[1].initialize('tabbedpane1.html');
    
    iframeControls[2] = new IframeControl({
        openBtnId: "tab2", 
        closeBtnId: "bt-home",
        showHideClass: "layer-off"
    });
    iframeControls[2].initialize('tabbedpane2.html');
}

/**
 * Remet à zéro les composants
 */
function RestoreInitialState() {
}

function closeIframe(_index) {
    iframeControls[_index].close();
}