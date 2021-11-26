var includes = [
    "lib/global_autolaunch.js",
    "components/component.tools.js",
    "lib/config.js",
    "lib/viview.js",
    "vendor/jquery-1.9.1.min.js",
    "lib/cursor.js"
];

for(var i=0;i<includes.length;i++) {
    document.write('<script src="media/js/' + includes[i] + '" type="text/javascript"></script>');
}

const CURSOR_SELECTION_MAX_WIDTH = 688;
const CURSOR_SELECTION_MIN_WIDTH = 15;
const GOOD_ANSWER_PERCENTAGE = 0.9;
var cursor;
var cursorSelection, answerBar;
var tutorial;
var validate;
var answer;
var apparitionDurations = {"content0" : 1};


function Initialize() {
    FindControls();
    BindListeners();
    InitCursor();
    
    var closeIframeBtn = document.getElementById('bt-home');
    $(closeIframeBtn).on(Tools.getEventsString("click"), function(_event){
        _event.preventDefault();
        Tools.addTransitionEndListener(document.getElementById("content0"), function(){
			if(typeof(window.parent.closeIframe) == 'function'){
				window.parent.closeIframe(1);
			}
		}, true);
		document.getElementById("content0").className = "out-bottom";
    });
}

function FindControls(){
    cursorSelection = document.getElementById("progression");
    answerBar = document.getElementById("answer-bar");
    tutorial = document.getElementById("tutorial");
    validate = document.getElementById("bt-validate");
    answer = document.getElementById("answer");
}

function BindListeners(){
    $(validate).one(Tools.getEventsString("mouseup"), ValidateHandler);
}

function InitCursor(){
    //currentValue = document.getElementById("current-value");
    //cursorSelection = document.getElementById("cursor-selection");
    cursor = new Cursor(document.getElementById("cursor"), {
        isVerticalOriented: false,
        isContinuous: true, 
        steps : [0, 609, 687], 
        CursorMoving: ValueChangedHandler
    });
}

function ValueChangedHandler(e){
    var valueInPercentage = e.percentage;
    cursorSelection.style.width = CURSOR_SELECTION_MIN_WIDTH + valueInPercentage * CURSOR_SELECTION_MAX_WIDTH + "px";		
}

function ValidateHandler(e){
    DisplayQuestionDisparition();
    MoveCursorToCorrectPosition();
    DisplayAnswer();
}

function DisplayQuestionDisparition(){
    validate.className = "transparent";
    tutorial.className = "transparent";
    cursorSelection.className = "transparent";
    answerBar.className = "";
}

function MoveCursorToCorrectPosition(){
    cursor.SetAnimated(true);
    cursor.SetStep(1);
    cursor.Kill();
}

function DisplayAnswer(){
    answer.style.webkitTransitionDelay = "0.25s";
    answer.className = "";
}

function RedirectHandlerEx(redirectionButton){
    if("bt-home" == redirectionButton.id){
        var tab = document.getElementById("content0");
        tab.addEventListener("webkitTransitionEnd", TabTransitionComplete);
        tab.className = "out-bottom";
    }
}

function TabTransitionComplete(){
    ChangeSlide(redirections["bt-home"]);	
}

function RestoreInitialState() { 
}