var referencePopup;

window.onload = function (){
    BlockElasticScroll();
    PreInitialize();
    startpage();
}

function onViewAppearingHandler(_event) {
    if(_event != undefined) {
        _event.preventDefault();
    }
    PreInitialize();
}

function onViewAppearedHandler(_event) {
    if(_event != undefined) {
        _event.preventDefault();
    }
    startpage();
}

function onViewDisappearedHandler(_event){
    if(_event != undefined) {
        _event.preventDefault();
    }
    
    try {
        stoppage();
    } catch(_exception) {
    //
    }
}

/**
 * permet une eventuelle initialisation de la slide au chargement avant d'�tre affich�. 
 * La callback PreInitializeEx ne doit en aucun cas etre utilis�e pour d�clencher des animations
 */
function PreInitialize(){
    //si detection du div correspondant au bouclier anim�, gestion de l'anim
    if(undefined != document.getElementById("animated-shield")){
        HandleShieldAnimation();	
    }
    //calback invoqu�e pour du fine tuning sur l'affichage des zooms
    if(typeof(PreInitializeEx) == 'function'){
        PreInitializeEx();
    }
    //calback invoqu�e pour l'affichage de la popup methodo avec accordeon
    if(typeof(InitializeRichPopup) == 'function'){
        InitializeRichPopup();
    }
	
    //calback invoqu�e pour du fine tuning sur l'affichage des zooms
    if(typeof(InitializeNavigationBar) == 'function'){
        InitializeNavigationBar();
    }
}

function BlockElasticScroll(){
    var body = document.getElementsByTagName("body")[0];
    body.ontouchmove = this.BlockElasticScrollHandler;
    body.onmousemove = this.BlockElasticScrollHandler;
}

function ReleaseElasticScroll(){
    //console.log( "ReleaseElasticScroll" ) ;
    var body = document.getElementsByTagName("body")[0];
    body.ontouchmove = null;
    body.onmousemove = null;
}

function BlockElasticScrollHandler(e){
    e.preventDefault();
    return false;
}

function IsUnderIpad(){
    var underIpad = navigator.userAgent.indexOf("iPad") != -1 ;
    return underIpad;
}

function IsIOSPopup(){
    var body = document.getElementsByTagName("body")[0];
    var isIOSPopup = "popup-ios"==body.id;
    return isIOSPopup;
}

function startpage(){
    if(!alreadyInitialized){
        alreadyInitialized = true;
        SetWebkitParameters();
        HandleRelatedButton();
        InitReferences();
        InitZooms();
        InitExternalPopups();
        InitRedirections();
        HandleAutomaticApparitions();
        InitializeTapAnimation();
        if(IsIOSPopup()){
            BlockElasticScroll();
        }
        if(typeof(Initialize) == 'function'){
            Initialize();
        }
        //calback invoqu�e pour verifier si la page courante est une page mandatory
        if(typeof(CheckIfPageIsMandatory) == 'function'){
            CheckIfPageIsMandatory();
        }
        if(!IsUnderIpad() || IsIOSPopup()){
            testpage();
        }
    }
}

function SetWebkitParameters(){
    document.documentElement.style.webkitTouchCallout = "none";
    document.documentElement.style.webkitTapHighlightColor = "rgba(0,0,0,0)";
}

function HandleRelatedButton(){
    var relatedButton = document.getElementsByClassName("related")[0];
    if(undefined != relatedButton){
        relatedButton.style.display = DISABLE_RELATED_BUTTON ? "none" : "block";
    }
}

/**
 * gestion des bouton de zoom
 */
function InitZooms(){
    var index = 0;
    var zoomButton, zoomPopup;
    while(undefined != (zoomButton=document.getElementById(ZOOM_BUTTON_PREFIX+index)) && undefined != (zoomPopup=document.getElementById(ZOOM_POPUP_PREFIX+index))){
        zoomPopup.style.width = PAGE_WIDTH + "px";
        zoomPopup.style.height = PAGE_HEIGHT + "px";
        if(IsUnderIpad()){
            zoomButton.ontouchstart = SaveTouchPosition; 
            zoomButton.ontouchmove = TouchMoveHandler; 
            zoomButton.ontouchend = ShowZoom; 
            zoomPopup.ontouchend = HideZoom;	
        }
        else{
            zoomButton.onmousedown = SaveTouchPosition; 
            zoomButton.onmouseup = ShowZoom; 
            zoomPopup.onmouseup = HideZoom;	
        }
        zoomPopup.style.zIndex = -1;
        savedPopupClasses[zoomPopup.id] = zoomPopup.className;
        index++;
    }
}

var touchX, moveX;
function SaveTouchPosition(e){
    touchX = e.clientX;
    moveX = touchX;
}

function TouchMoveHandler(e){
    moveX = e.clientX || e.touches[0].clientX;
}

/**
 * au clic sur un bouton de zoom on affiche le zoom correspondant
 */
function ShowZoom(e){
    e.preventDefault();
    if(touchX == moveX){
        var popup = GetCorrespondingPopup(e.currentTarget);
        ShowZoomPopup(popup);
    }
    return false;
}

/**
 * Affiche la popup de zoom pass�e en parametre
 */
function ShowZoomPopup(_Popup){
    currentZoomedPopup = _Popup;	
    _Popup.removeEventListener("webkitTransitionEnd", HidePopupComplete);
    _Popup.style.zIndex = TOP_ZINDEX;
    _Popup.style.webkitTransitionDuration = DEFAULT_ANIMATION_DURATION + "s";
    _Popup.className = "";
    ShowLayer(true);
    ShowReferences(false);
    //calback invoqu�e pour du fine tuning sur l'affichage des zooms
    if(typeof(ShowZoomEx) == 'function'){
        ShowZoomEx(_Popup);
    }
}

/**
 * @return la popup correspondant au bouton cliqu�
 */
function GetCorrespondingPopup(_TappedButton){
    var buttonID = _TappedButton.id.substr(ZOOM_BUTTON_PREFIX.length);
    var popupID = ZOOM_POPUP_PREFIX + buttonID;
    var popup = document.getElementById(popupID);
    return popup;
}

/**
 * masque le zoom au clic sur celui-ci
 */
function HideZoom(e){
    e.preventDefault();
    var popup = e.currentTarget;
    HideZoomPopup(popup);
    return false;
}

function HideZoomPopup(_Popup){
    _Popup.addEventListener("webkitTransitionEnd", HidePopupComplete);	
    _Popup.className = GetDisparitionClass(_Popup);
    ShowLayer(false);
    //calback invoqu�e pour du fine tuning sur l'affichage des zooms
    if(typeof(HideZoomEx) == 'function'){
        HideZoomEx(_Popup);
    }
}

function HidePopupComplete(e){
    var popup = e.currentTarget;
    popup.removeEventListener("webkitTransitionEnd", HidePopupComplete);	
    popup.style.webkitTransitionDuration = "0s";
    var initialClass = DEFAULT_POPUP_DISPARITION_CLASS;
    if(undefined != savedPopupClasses[popup.id]){
        initialClass = savedPopupClasses[popup.id];
    }
    popup.className = initialClass;
    popup.style.zIndex = -1;
}

function GetDisparitionClass(_Popup){
    var disparitionClass = DEFAULT_POPUP_DISPARITION_CLASS;
    if(undefined != _Popup &&  undefined != savedPopupClasses[_Popup.id]){
        disparitionClass = savedPopupClasses[_Popup.id];
    }
    return disparitionClass;
}

/**
 * Initialise les elements li�s � l'affichage des references
 */
function InitReferences(){
    InitLayer();
    popupReferences = document.getElementById("popup-reference");
    var btReferences = document.getElementById("bt-ref");
    var referencesAvailable = (undefined != popupReferences && undefined != btReferences);
    if(referencesAvailable){	
        if(IsUnderIpad()){
            btReferences.ontouchend = showRef;
            popupReferences.ontouchend = CloseReferences;
        }
        else{
            btReferences.onmouseup = showRef;
            popupReferences.onmouseup = CloseReferences;
        }
        popupReferences.style.zIndex = -1;
        savedPopupClasses[popupReferences.id] = popupReferences.className;
    }
    else{
        delete showRef;
    }
}

/**
 * Initialise les elements li�s � l'affichage des references
 */
function InitReferencesEx(){
    InitLayer();
    var index = 0;
    var popupReferences;
    var btReferences;	
    while(undefined != (popupReferences = document.getElementById("popup-reference" + index)) && undefined != (btReferences = document.getElementById("bt-ref" + index))){
        var referencesAvailable = (undefined != popupReferences && undefined != btReferences);
        if(referencesAvailable){	
            if(IsUnderIpad()){
                btReferences.ontouchend = showRef;
                popupReferences.ontouchend = CloseReferences;
            }
            else{
                btReferences.onmouseup = showRef;
                popupReferences.onmouseup = CloseReferences;
            }
            popupReferences.style.zIndex = -1;
            savedPopupClasses[popupReferences.id] = popupReferences.className;
        }
        else{
            delete showRef;
        }
        index++;
    }
}


/**
 * Initialise le comportement du layer s'il existe
 */
function InitLayer(){
    layer = document.getElementById("layer");
    if(undefined != layer){
        layer.style.webkitTransitionDuration = "0s";
        layer.className = "layer-off";
        if(IsUnderIpad()){
            layer.ontouchend = LayerTouchEndHandler;
        }
        else{
            layer.onmouseup = LayerTouchEndHandler;
        }
    }
}

function LayerTouchEndHandler(e){
    e.preventDefault();
    if(ReferencesDisplayed()){
        CloseReferences(e);
    }
    else{
        HideZoomPopup(currentZoomedPopup);
    }
    return false;
}

/**
 * Callback invoqu�e depuis la barre Exploria pour afficher les refs
 */
function showRef(e){
    e.preventDefault();
    ShowReferences(true, e);
    return false;
}

/**
 * @return true ssi les r�f�rences sont affich�es
 */
function ReferencesDisplayed(){
    var referencePopup = document.getElementById("popup-reference");
    var referencesDisplayed = (undefined!=referencePopup) && (referencePopup.className == "");
    return referencesDisplayed;
}

/**
 * Affiche ou masque le voile blanc
 */
function ShowLayer(_Value){
    if(undefined != layer){
        layer.style.webkitTransitionDuration = DEFAULT_ANIMATION_DURATION + "s";
        layer.style.opacity = _Value ? 0.85 : 0;
        if(_Value){
            layer.style.zIndex = LAYER_SHOWN_ZINDEX;
        }
        else {		
            //changement de z-index � la fin de l'animation sans quoi le voile disparait instantan�ment
            layer.addEventListener("webkitTransitionEnd", LayerDisparitionComplete);	
        }	
    }
}

/**
 * Repasse le voile blanc sous le background pour ne pas qu'il prenne les evenements de type touch
 */
function LayerDisparitionComplete(){
    layer.removeEventListener("webkitTransitionEnd", LayerDisparitionComplete);
    layer.style.zIndex = -1;
}

/**
 * Affiche ou masque la popup references
 */
function ShowReferences(_Value, e){
    if(_Value){
        referencePopup = document.getElementById("popup-reference");
        if(undefined != e){
            var id = e.currentTarget.id.substr(6);
            referencePopup = document.getElementById("popup-reference" + id);
        }
    }
	
    if(undefined != referencePopup){
        referencePopup.style.webkitTransitionDuration = DEFAULT_ANIMATION_DURATION + "s";
        if(_Value){
            referencePopup.style.zIndex = TOP_ZINDEX;
            referencePopup.removeEventListener("webkitTransitionEnd", HidePopupComplete);	
            referencePopup.className = "";
        }
        else{
            referencePopup.className = GetDisparitionClass(referencePopup);
            referencePopup.addEventListener("webkitTransitionEnd", HidePopupComplete);	
        }	
    }
}

/**
 * Masque le voile blanc et ferme la popup
 */
function CloseReferences(e){
    e.preventDefault();
    ShowReferences(false);
    return false;
}

function InitExternalPopups(){
    var externalButtons = document.getElementsByClassName("bt-external-popup");
    for(var i=0; i<externalButtons.length; i++){
        if(IsUnderIpad()){
            externalButtons[i].ontouchend = ShowExternalPopupHandler;
        }
        else{
            externalButtons[i].onmouseup = ShowExternalPopupHandler;
        }	
    }
}

function ShowExternalPopupHandler(e){
    e.preventDefault();
    ShowExternalPopup(e.currentTarget.id);
    return false;
}

function ShowExternalPopup(_PopupName){
    if(IsUnderIpad()){
        ShowFullScreenPopup(_PopupName,1024,768,true);
        console.log(_PopupName);
    }
    else{
        location.href = _PopupName;
    }
}

/**
 * Verifie l'existence d'un tableau associatif ([button_name] --> [id_de_slide]) de redirections pour poser les evenements
 */
function InitRedirections(){
    if(typeof(redirections) == 'object'){
        for(var buttonName in redirections){
            var button = document.getElementById(buttonName);
            if(undefined != button){
                if(IsUnderIpad()){
                    button.ontouchstart = RedirectHandler;		
                }
                else{
                    button.onmousedown = RedirectHandler;	
                }
            }
        }
    }
}

/**
 * Au clic sur un bouton de redirection, on redirige
 */
function RedirectHandler(e){
    e.preventDefault();
    var redirectionButton = e.currentTarget;
    var slideRedirectionID = redirections[redirectionButton.id];	
    if(typeof(RedirectHandlerEx) != 'function' || RedirectHandlerEx(redirectionButton)){
        ChangeSlide(slideRedirectionID);
    }	
    return false;
}

/**
 * Redirige vers la page dont l'id est pass� en parametre
 */
function ChangeSlide(_SlideID){
    GoToPage(_SlideID);
}

/**
 * La,ce une proc�dure d'animation auto si la slide est param�tr�e pour
 */
function HandleAutomaticApparitions(){
    if(UseAutomaticApparitionsFeature()){
        DisplayAutomaticApparitions();
    }
}

/**
 * return false ssi la slide d�finit une fonction UseAutomaticApparitions qui retourne false
 */
function UseAutomaticApparitionsFeature(){
    var useAutomaticApparitions = true;
    if(typeof(UseAutomaticApparitions) == 'function' && false==UseAutomaticApparitions()){
        useAutomaticApparitions = false;
    }
    return useAutomaticApparitions;	
}

/**
 * D�clenche l'animation successivement sur les diff�rents elements � animer
 */
function DisplayAutomaticApparitions(){
    var index = 0;
    var content;
    var cumulatedDuration = 0;
    animatedContentInitialClasses = {};
    while(undefined != (content=document.getElementById(ANIMATED_CONTENT_PREFIX+index))){
        var duration = GetAnimationDuration(content.id);
        content.style.webkitTransitionDuration = duration + "s";
        content.style.webkitTransitionDelay = cumulatedDuration + GetAnimationDelay(content.id) + "s";
        animatedContentInitialClasses[content.id] = content.className;
        content.className = GetDefaultApparitionClassName(content.id);
        cumulatedDuration += duration + GetAnimationDelay(content.id);
        if(IsLastElementToAnimate(index)){
            content.addEventListener("webkitTransitionEnd", DisplayAutomaticApparitionsComplete);
        }
        index++;
    }
}

function IsLastElementToAnimate(_Index){
    var nextElementIndex = _Index+1;
    var nextElementId = ANIMATED_CONTENT_PREFIX+nextElementIndex;
    var isLastElement = (undefined == document.getElementById(ANIMATED_CONTENT_PREFIX+nextElementIndex));
    return isLastElement;
}

function DisplayAutomaticApparitionsComplete(e){
    var lastAnimatedElement = e.currentTarget;
    lastAnimatedElement.removeEventListener("webkitTransitionEnd", DisplayAutomaticApparitionsComplete);
    if(typeof(SlideApparitionComplete) == 'function'){
        SlideApparitionComplete();
    }
}

/**
 * Classe d'animation par defaut. Par defaut la chaine vide est renvoy�e. Pour des apparitions particulieres, creer un tablea associatif ayant pour cl� l'id de l'element � animer en en valeur la classe CSS � lui attribuer
 */
function GetDefaultApparitionClassName(_ContentID){
    var defaultClassName = "";
    if(typeof(apparitionClassNames) == 'object' && undefined != apparitionClassNames[_ContentID]){
        defaultClassName = apparitionClassNames[_ContentID];
    }
    return defaultClassName;
}

function GetAnimationDuration(_ContentID){
    var duration = DEFAULT_ANIMATION_DURATION;
    if(typeof(apparitionDurations) == 'object' && undefined != apparitionDurations[_ContentID]){
        duration = apparitionDurations[_ContentID];
    }
    return duration;
}

function GetAnimationDelay(_ContentID){
    var delay = DEFAULT_ANIMATION_DELAY;
    if(typeof(apparitionDelays) == 'object' && undefined != apparitionDelays[_ContentID]){
        delay = apparitionDelays[_ContentID];
    }
    return delay;
}

function stoppage(){
    alreadyInitialized = false;
    if(UseAutomaticApparitionsFeature()){
        RestoreAnimationsStates();
    }
    if(typeof(RestoreInitialState) == 'function'){
        RestoreInitialState();
    }
    if(typeof(PoseListeners) == 'function'){
        PoseListeners(false);
    }
    ShowLayer(false);
    ShowReferences(false);
    var zoomButton, zoomPopup;
    var index = 0;
    while(undefined != (zoomButton=document.getElementById(ZOOM_BUTTON_PREFIX+index)) && undefined != (zoomPopup=document.getElementById(ZOOM_POPUP_PREFIX+index))){
        zoomPopup.className = savedPopupClasses[zoomPopup.id];
        index++;
    }
    if(!IsUnderIpad() || IsIOSPopup()){
        testpage();
    }
}

function RestoreAnimationsStates(){
    var index = 0;
    var content;
    var cumulatedDuration = 0;
    while(undefined != (content=document.getElementById(ANIMATED_CONTENT_PREFIX+index))){
        content.style.webkitTransitionDuration = "0s";
        content.style.webkitTransitionDelay = "0s";
        content.className = animatedContentInitialClasses[content.id];
        index++;
    }
}


//MANDATORY SCREENS
function DeclareMandatory(_PageName){
    if(undefined != _PageName){
        localStorage.setItem("MANDATORY", _PageName);
    }
}

function NeedMandatory(){
    var needMandatory = (undefined!=localStorage.getItem("MANDATORY"));
    return needMandatory;
}

function DisplayMandatory(){
    var mandatoryRedirectionPageName = localStorage.getItem("MANDATORY");
    ClearMandatory();
    GoToPage(mandatoryRedirectionPageName);
}

function CheckIfPageIsMandatory(){
    if(NeedMandatory()){
        var mandatoryRedirectionPageName = localStorage.getItem("MANDATORY");
        var isMandatory = (location.href.indexOf(mandatoryRedirectionPageName)>=0);
        if(isMandatory){
            ClearMandatory();
        }
    }
}

function ClearMandatory(){
    localStorage.removeItem("MANDATORY");
}

function testpage(){
//    body = document.getElementsByTagName("body")[0];
//	
//    var d = document.getElementById('test-btn');
//    if(undefined == d) {
//        var newdiv = document.createElement('div');
//    } else {
//        newdiv = d;
//    }
//    newdiv.setAttribute('id','test-btn');
//	 
//    if (alreadyInitialized) {
//        newdiv.setAttribute('onClick','stoppage()');
//        newdiv.innerHTML = 'stop';
//        newdiv.setAttribute('class','green');
//    } else {
//        newdiv.setAttribute('onClick','startpage()');
//        newdiv.innerHTML = 'start';
//        newdiv.setAttribute('class','red');
//    }
//    body.appendChild(newdiv);
}

//animation au tap
var ANIMATION_PREFIX = "tapped_animation";
var LEGEND_PREFIX = "tapped_legend";
var ANIMATION_TRIGGER_ID = "bt-anim";
var TAPPED_ANIMATION_DURATION = "0.75s";
var tappedAnimationClasses = {};

function InitializeTapAnimation(){
    var trigger = document.getElementById(ANIMATION_TRIGGER_ID);
    if(undefined != trigger){
        if( IsUnderIpad() ){
            trigger.ontouchend = PlayAnimationHandler;
        }
        else{
            trigger.onmouseup = PlayAnimationHandler;
        }
    }
}

function PlayAnimationHandler(e){
    e.preventDefault();
    PlayNextAnimationPart();
    return false;   
}

function PlayNextAnimationPart(){
    if(NextAnimationPartExists()){
        var elementToAnimate = GetNextAnimationPart();
        elementToAnimate.style.webkitTransitionDuration = TAPPED_ANIMATION_DURATION;
        tappedAnimationClasses[elementToAnimate.id] = elementToAnimate.className;
        elementToAnimate.className = "";
		
        var legendID = LEGEND_PREFIX + elementToAnimate.id.replace(ANIMATION_PREFIX, "");
        var legend;
        if(undefined !=  (legend = document.getElementById(legendID))){
            legend.className = "";
        }
    }
}

function NextAnimationPartExists(){
    var nextAnimationPartExists = false;
    var index = 0;
    var animationPart;
    while(undefined != (animationPart = document.getElementById(ANIMATION_PREFIX + index))){
        if("" != animationPart.className){
            nextAnimationPartExists = true;
            break;
        }
        index++;
    }
    return nextAnimationPartExists;
}

function GetNextAnimationPart(){
    var index = 0;
    var animationPart;
    while(undefined != (animationPart = document.getElementById(ANIMATION_PREFIX + index))){
        if("" != animationPart.className){
            break;
        }
        index++;
    }
    return animationPart;
}