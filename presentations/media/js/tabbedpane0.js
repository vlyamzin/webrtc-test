var includes = [
    "lib/global_autolaunch.js",
    "components/component.tools.js",
    "lib/config.js",
    "lib/viview.js",
    "vendor/jquery-1.9.1.min.js",
    "lib/cursor.js",
    "components/podium.js"
];

var apparitionDurations = {"content0" : 1};
for(var i=0;i<includes.length;i++) {
    document.write('<script src="media/js/' + includes[i] + '" type="text/javascript"></script>');
}

var podium;

function Initialize() {
    InitializePodium();
    podium.Start();
    
    var closeIframeBtn = document.getElementById('bt-home');
    $(closeIframeBtn).on(Tools.getEventsString("click"), function(_event){
        _event.preventDefault();
        Tools.addTransitionEndListener(document.getElementById("content0"), function(){
			if(typeof(window.parent.closeIframe) == 'function'){
				window.parent.closeIframe(0);
			}
		}, true);
		document.getElementById("content0").className = "out-bottom";
    });
}


function InitializePodium(){
    var parameters = {
        "areasIdPrefix" : "area",
        "buttonsIdPrefix" : "tree",
        "targets" : [ {
            "x": 258, 
            "y": 216
        },

        {
            "x": 392, 
            "y": 186
        },

        {
            "x": 531, 
            "y": 237
        }],
        "elementIndexInArea" : [ 0, 3, 4],
        "podiumSucceededCallback"  : PodiumValidated
    };
    podium = new Podium(parameters);
}

function PodiumValidated() {
    document.getElementById("tutorial").className = "transparent";
    document.getElementById("bt-validate").className = "transparent";
    document.getElementById("answer").className = "";
}

function TabTransitionComplete(){
    ChangeSlide(redirections["bt-home"]);	
}

function RestoreInitialState() {
    podium.Stop();    
}