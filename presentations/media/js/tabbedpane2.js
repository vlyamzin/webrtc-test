var includes = [
    "lib/global_autolaunch.js",
    "components/component.tools.js",
    "lib/config.js",
    "lib/viview.js",
    "vendor/jquery-1.9.1.min.js",
    "lib/cursor.js"
];

var apparitionDurations = {"content0" : 1};
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


function Initialize() {
    FindControls();
    BindListeners();
    DisplayBarApparition();
    
    var closeIframeBtn = document.getElementById('bt-home');
    $(closeIframeBtn).on(Tools.getEventsString("click"), function(_event){
        _event.preventDefault();
        Tools.addTransitionEndListener(document.getElementById("content0"), function(){
			if(typeof(window.parent.closeIframe) == 'function'){
				window.parent.closeIframe(2);
			}
		}, true);
		document.getElementById("content0").className = "out-bottom";
    });
}

function DisplayBarApparition(){
    window.setTimeout(DisplayBarApparitionTimer, 250);
}

function DisplayBarApparitionTimer(){
    document.getElementById("bar3").addEventListener("webkitTransitionEnd", DisplayBarApparitionComplete);
    $(".barre").removeClass("animated");
}

function DisplayBarApparitionComplete(){
    document.getElementById("bar3").removeEventListener("webkitTransitionEnd", DisplayBarApparitionComplete);
    InitInteraction();
    SetBarAnimated(false);
}

function FindControls(){
    tutorial = document.getElementById("tutorial");
    validate = document.getElementById("bt-validate");
    answer = document.getElementById("answer");
}

function BindListeners(){
    $(validate).one(Tools.getEventsString("mouseup"), ValidateHandler);
}


var BAR_GOOD_OFFSETS = [130, 135, 80, 194];
var BAR_MAX_OFFSET = 294;
var BAR_MIN_OFFSET = 0;
var BAR_INITIAL_OFFSET = 250;
var ANIMATION_DURATION = "0.75s";
var barre, barreSensitive;
var touchY, initialPosition;
var dragging;

/**
 * Initialisation des elements utilisés pour l'interaction
 */
function InitInteraction(){
    var index = 0;
    var barre;
    while(undefined != (barre=document.getElementById("bar"+index))){
        barre.style.webkitTransform = "translate3D(0, " + BAR_INITIAL_OFFSET + "px, 0)";
        index++;
    }
    PoseListeners(true);	
}

/**
 * Pose les evenements
 */
function PoseListeners(_Value){
    if(_Value){
        var index = 0;
        var barreSensitive;
        while(undefined != (barreSensitive=document.getElementById("sensitive"+index))){
            if(IsUnderIpad()){
                barreSensitive.ontouchstart = BarTouchStartHandler;
                barreSensitive.ontouchmove = BarTouchMoveHandler;
				
            //evenements souris
            } else {
                barreSensitive.onmousedown = BarTouchStartHandler;
                barreSensitive.onmousemove = BarTouchMoveHandler;
            }
            index++;
        }
        if(IsUnderIpad()){
            document.ontouchend = BarTouchEndHandler;
			
        } else {
            document.onmouseup = BarTouchEndHandler;
        }
		
		
    }
    else {
        var index = 0;
        var barreSensitive;
        while(undefined != (barreSensitive=document.getElementById("sensitive"+index))){
            if( IsUnderIpad() ){
                barreSensitive.ontouchstart = null;
                barreSensitive.ontouchmove = null;
            } else {
                //evenements souris
                barreSensitive.onmousedown = null;
                barreSensitive.onmousemove = null;
            }
            index++;
        }
        //evenements touch
		
        document.onmouseup = null;
		
	   
    }
}

function SetBarAnimated(_Value){
    var index = 0;
    var barre;
    while(undefined != (barre=document.getElementById("bar"+index))){
        barre.style.webkitTransitionDuration = _Value ? "0.5s" : "0s";
        barre.style.webkitTransitionDelay = "0s";
        index++;
    }
}

function BarTouchStartHandler(e){	
    dragging = true;
    barreSensitive = e.currentTarget;
    var index = barreSensitive.id.substr(9);
    barre = document.getElementById("bar"+ index);
    touchY = e.clientY || e.touches[0].clientY;
    initialPosition = GetBarCurrentPosition();
    return false;
}

/**
 * La position courante de la barre
 */
function GetBarCurrentPosition(){
    var translationMatrix = new WebKitCSSMatrix(window.getComputedStyle(barre).webkitTransform);
    var currentPosition = translationMatrix.m42;
    return currentPosition;
}

function BarTouchMoveHandler(e){
    if(dragging){
		
        var barPosition = UpdateBarPosition(e);
    }
    e.preventDefault();
    e.stopPropagation();
    return false;
}

/**
 * Met à jour la position de la barre
 */
function UpdateBarPosition(e){
    var position = initialPosition;
    if(null != e){
        position = ComputePosition(e);
        barre.style.webkitTransform = "translate3d(0, " + position + "px, 0)";
    }
    return position;
}

/**
 * Calcule la nouvelle position de la barre
 */
function ComputePosition(e){
    var currentY = e.clientY || e.touches[0].clientY;
    var dy = touchY - currentY;
    var position = initialPosition - dy;
    position = Math.min(BAR_MAX_OFFSET, position);
    position = Math.max(BAR_MIN_OFFSET, position);
    return position;
}

function BarTouchEndHandler(e){
    dragging = false;
    e.preventDefault();
    e.stopPropagation();
    return false;
}

/**
 * Au moment où l'utilisateur valide, on fait apparaitre la reponse
 */
function ValidateHandler(e){
    PoseListeners(false);
    MoveBarToGoodPosition();
    DisplayAnswer();
    return false;
}

/**
 * Fait disparaitre la réponse
 */
function DisplayAnswer(){	
    validate.style.webkitTransitionDelay = "0s";
    validate.style.webkitTransitionDuration = ANIMATION_DURATION + "s";
    validate.className = "off";
	
    answer.style.webkitTransitionDuration = ANIMATION_DURATION + "s";
    answer.style.webkitTransitionDelay = (ANIMATION_DURATION) + "s";
    answer.className = "";
	
    tutorial.className = "transparent";
}

function MoveBarToGoodPosition(){
    var index = 0;
    var barre, value;
    SetBarAnimated(true);
    while(undefined != (barre=document.getElementById("bar"+index))){
        barre.style.webkitTransform = "translate3d(0, " + BAR_GOOD_OFFSETS[index] + "px, 0)";
        barre.className = "barre";
        index++;
    }
}

function MoveBarToOldPosition(){
    var index = 0;
    var barre, value;
    SetBarAnimated(false);
    while(undefined != (barre=document.getElementById("bar"+index))){
        barre.style.webkitTransform = "translate3d(0, "+BAR_INITIAL_OFFSET+"px, 0)";
        barre.className = "barre";
        index++;
    }
}

function RestoreInitialState() {

    var _answer = document.getElementById( "answer" ) ;
    document.getElementById( "btnAnswers" ).style.display = "block" ;
    var _keepedTime = _answer.style.webkitTransitionDuration ;
    _answer.style.webkitTransitionDuration = "0s";
    _answer.className = "layer-off";
    _answer.style.webkitTransitionDuration = _keepedTime + "s";
	
    MoveBarToOldPosition() ;
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
