/**
 * @author aserra 
 * Initialise le comportement du cube
 * _CubeContainer div contenant tous les elements du cube
 * _Parameters objet contenant un ensemble de proprietes facultatives
 *			useVerticalRotationAxis : boolean qui indique si l'axe de rotation du cube est vertical. Valeur par defaut true
 *			faceWidth : int qui indique la dimension du cube en pixel. Valeur par defaut indiquée par la constante DEFAULT_FACE_WIDTH
 *			facePrefix : string qui indique le prefixe utilisé pour l'id des faces du cube. Valeur par defaut indiquée par la constante DEFAULT_FACE_PREFIX
 *			faceContainerName : string qui indique le nom du div qui englobe toutes les faces du cube. Valeur par defaut indiqué par la constante FACE_CONTAINER_DIV_NAME 
 * 			useAutomaticAnimation: boolean qui indique si le cube prend en charge automatiquement les animations des faces. Valeur par defaut true
 *			externalElementsPrefixes: tableau de prefixes. Ces prefixes sont utilisés en complement de l'index de la face courante du cube pour afficher/masquer des elements du dom (display block/none). Valeur par defaut []
 *          replayAnimations: boolean qui indique si le cube rembobine les animations d'une face a la sortie de l'affichage. Valeur par defaut true
 *          structureAlreadyCreated: boolean qui indique si la structure HTML necessaire au fonctionnement du cube existe dans la face HTML PRECISER Valeur par defaut false
 * 
 * Exemple d'utilisation:
 * var cubeContainer = document.getElementById("cube-container");
 * var parameters = {
 * 		"useVerticalRotationAxis": true,
 * 		"faceWidth" : 400,
 * 		"facePrefix" : "face",
 *		"useAutomaticAnimation" : true,
 *      "externalElementsPrefixes" : [],
 *      "replayAnimations" : true,
 *		"structureAlreadyCreated" : false
 *	};
 *	var cube = new Cube(cubeContainer, parameters);
 *
 * Ouverture du code:
 * - la fonction CubeFaceOut(_FaceIndex) est invoquée si elle existe lorsqu'un ajustement des positions des faces se termine. _FaceIndex est l'index de la face qui vient de sortir de l'affichage
 * - la fonction CubeFaceIn(_FaceIndex) est invoquée si elle existe lorsqu'un ajustement des positions des faces se termine. _FaceIndex est l'index de la face qui vient vient d'être affichée
 * - L'animation automatique est basée sur les id des div. Pour la face INDEX, les elements animés doivent avoir pour ID [facePrefix][INDEX]_[ANIMATED_CONTENT_PREFIX]0, [facePrefix][INDEX]_[ANIMATED_CONTENT_PREFIX]1, [facePrefix][INDEX]_[ANIMATED_CONTENT_PREFIX]2...
 */
function Cube(_CubeContainer, _Parameters){
    var FACE_CONTAINER_DIV_NAME = "face-container";
    var DEFAULT_FACE_PREFIX = "face";
    var DEFAULT_FACE_WIDTH = 400;
    var CHANGE_FACE_OFFSET = 50;
    var SENSITIVITY = 0.2;
	
    //******************************************
    //Attributs
    //******************************************
    var faces;
    var facePrefix, faceWidth;
    var faceContainerName;
    var useVerticalRotationAxis;
    var useAutomaticAnimation, replayAnimations;
    var structureAlreadyCreated;
    var externalElementsPrefixes;
    var cubeAnimatedContentInitialClasses = {};
    var container = _CubeContainer;
    var faceContainer;
    var currentFace, lastSeenFace;
    // var lastSeenFace=-1;	
    var touchStartPosition, initialPosition, currentPosition, touchEndPosition;
    var currentRotation = 0;
    var dragging;
    var sensRotation;
    var startDragCubeAvailable = true ;
    var dontUseCallBackOnInit ;
    var context;
	
    //******************************************
    //Methodes
    //******************************************
	
    ExtractParameters(_Parameters);
    Initialize();
	
    /**
	 * Extrait les parametres optionnels passés au constructeur
	 */
    function ExtractParameters(_Parameters){
        useVerticalRotationAxis = (undefined != _Parameters.useVerticalRotationAxis) ? _Parameters.useVerticalRotationAxis : true;
        faceWidth = !isNaN(_Parameters.faceWidth) ? _Parameters.faceWidth : DEFAULT_FACE_WIDTH;
        facePrefix = (undefined != _Parameters.facePrefix) ? _Parameters.facePrefix : DEFAULT_FACE_PREFIX;
        faceContainerName = (undefined != _Parameters.faceContainerName) ? _Parameters.faceContainerName : FACE_CONTAINER_DIV_NAME;
        useAutomaticAnimation = (undefined != _Parameters.useAutomaticAnimation) ? _Parameters.useAutomaticAnimation : true;
        externalElementsPrefixes = (undefined != _Parameters.externalElementsPrefixes) ? _Parameters.externalElementsPrefixes : [];
        replayAnimations = (undefined != _Parameters.replayAnimations) ? _Parameters.replayAnimations : true;
        structureAlreadyCreated = (undefined != _Parameters.structureAlreadyCreated) ? _Parameters.structureAlreadyCreated : false;
        dontUseCallBackOnInit = (undefined != _Parameters.dontUseCallBackOnInit) ? _Parameters.useCallBackOnInit : true ;
        context = (undefined != _Parameters.context) ? _Parameters.context : null;
    }

    /**
	 * Initialise le comportement du cube
	 */
    function Initialize(){
        if(undefined != container){
            CreateAdditionalDivs();
            ApplyCSSRulesToContainer();
            FindControls();
            SaveAnimatedContentClasses();
            PlaceAllContents();
            if ( dontUseCallBackOnInit != undefined )
            {
				
                DisplayFace(0, dontUseCallBackOnInit);
            }
            else
            {
				
                DisplayFace(0);
            }
            PoseListeners(true);
            CubeStartFace(0);
        }
    }
	
    /**
	 * Commande la creation de tous les div necessaires au bon fonctionnement du cube
	 */
    function CreateAdditionalDivs(){
        if(!structureAlreadyCreated &&!StructureExists()){
            CreateFaceContainer();
        }
    }
	
    /**
	 * @returns true ssi le face container existent déjà
	 */
    function StructureExists(){
        var faceContainerExists = (undefined != document.getElementById(faceContainerName));
        //console.log("StructureExists faceContainerExists:" + faceContainerExists + " structureAlreadyCreated:" + structureAlreadyCreated);
        return (faceContainerExists);
    }
	
    function ApplyCSSRulesToContainer(){
        container.style.webkitPerspective = 800;
        container.style.webkitPerspectiveOrigin = "50% " + faceWidth/2 + "px";		
    }
	
    /**
	 * Crée un conteneur pour toutes les faces
	 */
    function CreateFaceContainer(){
        faceContainer = document.createElement("div");
        faceContainer.setAttribute("id", faceContainerName);
        faceContainer.style.webkitTransformStyle = "preserve-3d";
        faceContainer.style.width = faceWidth + "px";
        faceContainer.style.height = faceWidth + "px";
        container.appendChild(faceContainer);
    }
	
    /**
	 * Recherche les faces du cube
	 */
    function FindControls(){	
        faceContainer = document.getElementById(faceContainerName);	
        var index = 0;
        faces = [];
        while(FaceExists(index)){
            var face = document.getElementById(facePrefix + index);
            faces.push(face);	
            if(!structureAlreadyCreated){
                faceContainer.appendChild(face);		
            }
            index++;
        }
    }
	
    /**
	 * @return true ssi pour l'index passé en parametre, une face du cube existe
	 */
    function FaceExists(_Index){
        var faceExists = (undefined != document.getElementById(facePrefix + _Index));
        return faceExists;
    }
	
    /**
	 * Positionne tous les elements dans le cube en tenant compte de son orientation
	 */
    function PlaceAllContents(){
        for(var i=0; i<faces.length; i++){
            var face = faces[i];
            var rotateX = GetFaceRotateX(i);
            var rotateY = GetFaceRotateY(i);
            var translateZ = GetFaceTranslateZ(i);
            var faceTransform = "rotateY([[RY]]) translateZ([[DZ]])";
            faceTransform = faceTransform.replace("[[RX]]", rotateX);
            faceTransform = faceTransform.replace("[[RY]]", rotateY);
            faceTransform = faceTransform.replace("[[DZ]]", translateZ);
            face.style.webkitTransform = faceTransform;
            //console.log(faceTransform);
            face.style.width = faceWidth + "px";
            face.style.height = faceWidth + "px";		
            face.style.background = "white";
        }
    //container.style.webkitAnimation = "spin 8s infinite linear";
    }
	
    function GetFaceRotateX(_FaceIndex){
        var rotateX = 0;
        rotateX += "deg"
        return 	rotateX;
    }
	
    function GetFaceRotateY(_FaceIndex){
        var rotateY;
        switch(_FaceIndex % 4){
            case 0 :
                rotateY = 0;
                break;
            case 1 :
                rotateY = 90;
                break;
            case 2 :
                rotateY = 180;
                break;
            case 3 :
                rotateY = 270;
                break;
        }
        rotateY += "deg"
        return 	rotateY;
    }
	
    function GetFaceTranslateZ(_FaceIndex){
        var translateZ = faceWidth / 2;
        translateZ += "px";
        return translateZ;
    }
	
    /**
	 * Pose les ecouteurs sur les boutons et contenus
	 */
    function PoseListeners(_Value){
        if( !IsUnderIpad() ){
            faceContainer.onmousedown = _Value ? StartDrag : null ;
            document.getElementById("screen-container").onmouseup = _Value ? StopDrag : null ;
            document.getElementById("screen-container").onmousemove = _Value ? UpdateHandler : null ;
        }
        else {
            faceContainer.ontouchstart = _Value ? StartDrag : null ;
            document.getElementById("screen-container").ontouchend = _Value ? StopDrag : null ;
            document.getElementById("screen-container").ontouchmove = _Value ? UpdateHandler : null ;
        }
    }
	
    /**
	 * Affiche la face du cube dont l'id est passé en parametre et illumine le bullet oorrespondant
	 */
    function DisplayFace(_Index, _DontUseCallback){
        lastSeenFace = currentFace;
        currentFace = _Index;
        var _needValue = currentFace - lastSeenFace ;
        if ( _needValue > 0 )
            sensRotation = 1 ;
        else if ( _needValue < 0 )
            sensRotation = -1 ;
        else
            sensRotation = 0 ;
		
        DisplayContent(_Index, _DontUseCallback);
        DisplayExternalElement(_Index);
    }
	
    /**
	 * Affiche le contenu du cube correspondant à l'index passé en parametre
	 * _DontUseCallback permet de ne pas declencher d'evenement suite au positionnement du cube (reset)
	 */
    function DisplayContent(_Index, _DontUseCallback){
        var angle = -90 * _Index;
        //console.log("DisplayContent _Index:" + _Index + " angle:" + angle);
        var szTransform = useVerticalRotationAxis ? "rotateY(" + angle + "deg)" : "rotateX(" + angle + "deg)";
        if(!_DontUseCallback){
            faceContainer.addEventListener("webkitTransitionEnd", ContainerTransitionEnd);
        }
        faceContainer.style.webkitTransform = szTransform;
    }
	
    /**
	 * Fonction invoquée lorsque l'ajustement de position des faces est terminé. La face sortante et la face entrante sont notifiées de leur nouvel état
	 */
    function ContainerTransitionEnd(e){
		
        faceContainer.removeEventListener("webkitTransitionEnd", ContainerTransitionEnd);
        currentPosition = initialPosition = 0;
        if(lastSeenFace != currentFace){
            CubeStopFace(lastSeenFace);
            CubeStartFace(currentFace);
        }
        startDragCubeAvailable = true ;
    //console.log( "ContainerTransitionEnd - currentFace = " + currentFace ) ;
    }
	
    /**
	 * Affiche le titre externe correspondant à la face dont l'index est passé en parametre
	 */
    function DisplayExternalElement(_Index){
        HideAllExternalElements();
        ShowExternalElement(_Index, true);
    }
	
    function HideAllExternalElements(){
        var externalElement;
        for(var i=0; i<faces.length; i++){
            for(var j=0; j<externalElementsPrefixes.length; j++){
                externalElement = document.getElementById(externalElementsPrefixes[j] + i);
                ShowExternalElement(i, false);
            }			
        }
    }
	
    function ShowExternalElement(_ExternalElementIndex, _Value){
        var externalElement;
        for(var i=0; i<externalElementsPrefixes.length; i++){
            externalElement = document.getElementById(externalElementsPrefixes[i] + _ExternalElementIndex);
            if(undefined != externalElement){
                externalElement.style.display = _Value ? "block" : "none";
            }
        }
    }
	
	
    /**
	 * @return la coordonnées utile correspondant au point touché par l'utilisateur
	 */
    function GetTouchPosition(e){
        var _touchStartPosition;
        if(!useVerticalRotationAxis){
            _touchStartPosition = e.clientY || e.touches[0].clientY;
        }
        else{
            _touchStartPosition = e.clientX || e.touches[0].clientX;
        }
        return _touchStartPosition;
    }
	
    /**
	 * Active ou desactive les animations avec une durée non nulle
	 */
    function EnableAnimationDurations(_Value){
        faceContainer.style.webkitTransitionDuration = _Value ? "0.5s" : "0s";
    }
	
    /**
	 *@return la coordonnée utile correspondant à la position du cube
	 */
    function GetContainerPosition(){
        var translationMatrix = new WebKitCSSMatrix(window.getComputedStyle(faceContainer).webkitTransform);
        var currentPosition = useVerticalRotationAxis ? translationMatrix.m42 : translationMatrix.m41;
        return currentPosition;
    }
	
   
	
    /**
	 * Met à jour la position du conteneur
	 */
    function UpdateContainerPosition(e){
        currentPosition = initialPosition;
        if(null != e){
            currentPosition = ComputePosition(e);
            var angle = -90 * currentFace + currentPosition * SENSITIVITY;
            //angle = angle % 360;
            var szTransform = useVerticalRotationAxis ? "rotateY(" + angle + "deg)" : "rotateX(" + angle + "deg)";
            faceContainer.style.webkitTransform = szTransform;
        }
        return currentPosition;
    }
	
    /**
	 * Calcule la nouvelle position du conteneur
	 */
    function ComputePosition(e){
        var currentPosition = GetTouchPosition(e);
        var delta = touchStartPosition - currentPosition;
        var position = initialPosition - delta;
        return position;
    }
	
	
    function StartDrag(e){
        //console.log( "StartDrag" );
        e.preventDefault();
        sensRotation = 0 ;
        BlockElasticScroll();
        if ( !startDragCubeAvailable )
            return ;
		
        startDragCubeAvailable = false ;
		
        
		
		
        touchStartPosition = GetTouchPosition(e);
        EnableAnimationDurations(false);
        dragging = true;
        touchStartPosition = GetTouchPosition(e);
        touchEndPosition = GetTouchPosition(e);
        initialPosition = GetContainerPosition();
        return false;
    }
	
    function UpdateHandler(e){
        e.preventDefault();
		
        if(dragging){
            touchEndPosition = GetTouchPosition(e);
            var _needValue = touchStartPosition - touchEndPosition ;
            if ( _needValue > 0 )
                sensRotation = 1 ;
            else if ( _needValue < 0 )
                sensRotation = -1 ;
            else
                sensRotation = 0 ;
				
			
            UpdateContainerPosition(e);
        }
        return false;
    }
	
    function StopDrag(e){
        //console.log( "StopDrag" );
        //e.preventDefault();
		
        if(dragging){
            dragging = false;
            EnableAnimationDurations(true);
            MakeAdjustmentPosition();
            ReleaseElasticScroll();
        } else {
            //console.log( "StopDrag startDragCubeAvailable" );
            startDragCubeAvailable = true ;
            sensRotation = 0 ;
        }
	
    //console.log("-----------------------------" );
        return false;
    }
	
    function GetNearerRotation(){	
        var currentRotation = useVerticalRotationAxis ? GetRotationY(faceContainer) : GetRotationX(faceContainer);
        var leftBound = Math.floor(currentRotation / 90) * 90;
        var rightBound = Math.floor(1 + currentRotation / 90) * 90;
        var deltaToLeftBound = Math.abs(leftBound - currentRotation);
        var deltaToRightBound = Math.abs(rightBound - currentRotation);
        var _closerPosition = (deltaToLeftBound < deltaToRightBound) ? -1: 1;
        return _closerPosition;
    }
	
    /**
	 * @return Affiche la face la plus proche de la position actuelle du conteneur
	 */
    function MakeAdjustmentPosition(){
        //var nearerPosition = GetNearerRotation();
        var _closerPosition = GetNearerRotation();
	   
        if ( sensRotation > 0 )
        {
            if( _closerPosition == 1 )
                NextFace() ;
            else
            {
                DisplayFace(currentFace);
                sensRotation = 0 ;
            }
        } else if ( sensRotation < 0 ) {
            if ( _closerPosition == -1 )
                PreviousFace();
            else
            {
                DisplayFace(currentFace);
                sensRotation = 0 ; 
            }
        } else {
            DisplayFace(currentFace);
        }
    }
	
    /**
	 * Force le recalage sur la face courante
	 */
    function KeepOnCurrentFace(){
        DisplayFace(currentFace);
    }
	
    /**
	 * Affiche la face précédente si elle existe
	 */
    function PreviousFace(_DontUseCallback){
        if ( !dragging ){
            //console.log( 'PreviousFace' ) ;
            var previousFace = currentFace-1;
            if ( _DontUseCallback != undefined )
                DisplayFace(previousFace, _DontUseCallback);
            else
                DisplayFace(previousFace);
        }
    }
	
    /**
        * Affiche la face suivante si elle existe
        */
    function NextFace(_DontUseCallback){
        if ( !dragging ){
            //console.log( 'NextFace' ) ;
            var nextFace = (currentFace+1);
            if ( _DontUseCallback != undefined )
            {
                //console.log( "NextFace " + _DontUseCallback );
                DisplayFace(nextFace, _DontUseCallback);
            }
            else
                DisplayFace(nextFace);
        }
    }
	
    //GESTION DES ANIMATIONS AUTOMATIQUES	
    /**
	 * Callback invoquée au moment de l'affichage d'une face du cube
	 */
    function CubeStartFace(_FaceIndex){
        if(useAutomaticAnimation){
            DisplayAutomaticApparitions(_FaceIndex);
        }
        if(typeof(CubeFaceIn) == 'function'){
            CubeFaceIn(_FaceIndex);			
        }
        
        if(typeof(context.prototype.cubeFaceIn) == 'function') {
            context.prototype.cubeFaceIn(_FaceIndex);
        }
    }
	
    /**
	 * Callback invoquée au moment de la sortie d'une face du cube
	 */
    function CubeStopFace(_FaceIndex){
        if(useAutomaticAnimation && replayAnimations){
            RestoreAnimationsStates(_FaceIndex);
        }
        if(typeof(CubeFaceOut) == 'function'){
            CubeFaceOut(_FaceIndex);			
        }
        
        if(typeof(context.prototype.cubeFaceOut) == 'function') {
            context.prototype.cubeFaceOut(_FaceIndex);
        }
    }
	
    /**
	 * Sauvegarde les classes CSS associées aux éléments animés des faces du cube
	 */
    function SaveAnimatedContentClasses(){
        var index;
        var content;
        var cumulatedDuration = 0;
        for(var i=0; i<faces.length; i++){
            index = 0;
            while(undefined != (content=document.getElementById(facePrefix + i + "_" + ANIMATED_CONTENT_PREFIX + index))){
                if(undefined == cubeAnimatedContentInitialClasses[content.id]){
                    cubeAnimatedContentInitialClasses[content.id] = content.className;
                }
                index++;
            }
        }
    }
	
    /**
	 * Déclenche l'animation successivement sur les différents elements à animer sur la face dont l'index est passé en parametre
	 */
    function DisplayAutomaticApparitions(_FaceIndex){
        var index = 0;
        var content;
        var cumulatedDuration = 0;
        while(undefined != (content=document.getElementById(facePrefix + _FaceIndex + "_" + ANIMATED_CONTENT_PREFIX+index))){
            var duration = GetAnimationDuration(content.id);
            content.style.webkitTransitionDuration = duration + "s";
            content.style.webkitTransitionDelay = cumulatedDuration + GetAnimationDelay(content.id) + "s";
            content.className = GetDefaultApparitionClassName(content.id);
            cumulatedDuration += duration + GetAnimationDelay(content.id);
            if(IsLastCubeElementToAnimate(_FaceIndex, index)){
                content.addEventListener("webkitTransitionEnd", CubeAnimationComplete);
            }
            index++;
        }
    }
	
    function IsLastCubeElementToAnimate(_FaceIndex, _ContentIndex){
        var nextContent = document.getElementById(facePrefix + _FaceIndex + "_" + ANIMATED_CONTENT_PREFIX + (_ContentIndex+1));
        var isLastElement = (undefined==nextContent);
        return isLastElement;
    }
	
    function CubeAnimationComplete(e){
        e.currentTarget.removeEventListener("webkitTransitionEnd", CubeAnimationComplete);
        if(typeof(CubeFaceAnimationComplete) == 'function'){
            CubeFaceAnimationComplete(currentFace);			
        }
    }
	
    /**
	 * Restaure les classes CSS des elements animés pour leur redonner leur etat initial
	 */
    function RestoreAnimationsStates(_FaceIndex){
        var index = 0;
        var content;
        while(undefined != (content=document.getElementById(facePrefix + _FaceIndex + "_" + ANIMATED_CONTENT_PREFIX+index))){
            content.style.webkitTransitionDuration = "0s";
            content.style.webkitTransitionDelay = "0s";
            content.className = cubeAnimatedContentInitialClasses[content.id];
            index++;
        }
    }
	
    this.EnableSwipe = function(){
        PoseListeners(true);
    }
	
    this.DisableSwipe = function(){
        PoseListeners(false);
        KeepOnCurrentFace();
        dragging = false;
    }
	
    this.Reset = function(){
        DisplayFace(0, true);
        RestoreAnimationsStates(0);
    }
	
    this.DisplayFace = function( pIndex, _DontUseCallback){
        for( var i = 0 ; i < pIndex ; i++ )
        {
            console.log( "DisplayFace " +_DontUseCallback ) ;
            if ( _DontUseCallback != undefined )
            {
				
                NextFace( _DontUseCallback );
                if(typeof(CubeFaceIn) == 'function')
                    CubeFaceIn(i);	

                if(typeof(context.prototype.cubeFaceIn) == 'function') {
                    context.prototype.cubeFaceIn(i);
                }
                
                if(typeof(context.prototype.cubeFaceOut) == 'function') {
                    context.prototype.cubeFaceOut(i-1);
                }
				
            }
            else
            {
				
                NextFace();
                if(typeof(CubeFaceIn) == 'function')
                    CubeFaceIn(i);
                
                if(typeof(context.prototype.cubeFaceIn) == 'function') {
                    context.prototype.cubeFaceIn(i);
                }
                
                
                
                if(typeof(context.prototype.cubeFaceOut) == 'function') {
                    context.prototype.cubeFaceOut(i-1);
                }
            }
			
			
        }
		
    //console.log( "DisplayFace - currentFace = " + currentFace ) ;
    }
	
    this.NextFace = function(_DontUseCallback){
        if ( _DontUseCallback != undefined )
        {
            NextFace( _DontUseCallback );
        }
        else
            NextFace();
    }
	
    this.PreviousFace = function(_DontUseCallback){
        if ( _DontUseCallback != undefined )
            PreviousFace( _DontUseCallback );
        else
            PreviousFace();
    }
	
    this.Update = function(){
        FindControls();
        SaveAnimatedContentClasses();
        PlaceAllContents();
        PoseListeners(true);
        DisplayFace(0);
    }
	
    this.ChangingFace = function(){
        var delta = Math.abs(currentPosition - initialPosition);
        var changingFace = (delta >= CHANGE_FACE_OFFSET);
        return changingFace;
    }
	
    this.GetTouchStartPosition = function() {
        return touchStartPosition;
    }
	
    this.GetTouchEndPosition = function() {
        return touchEndPosition;
    }
	
/*
	this.GetCurrentLogicalFace = function (){
		var _currentFace = ( currentFace < TOTAL_FACES ) ? currentFace : ( currentFace - TOTAL_FACES ) ;
		return  _currentFace ;
	}
	
	this.GetCurrentLogicalFace = function (){
		var _lastSeenFace = ( lastSeenFace < TOTAL_FACES ) ? lastSeenFace : ( lastSeenFace - TOTAL_FACES ) ;
		return _lastSeenFace ;
	}
	*/
}