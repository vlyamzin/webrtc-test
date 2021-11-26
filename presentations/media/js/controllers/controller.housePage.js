var includes = [
    "lib/global_autolaunch.js",
    "components/component.tools.js",
    "lib/config.js",
    "lib/viview.js",
    "vendor/jquery-1.9.1.min.js",
    "components/component.navigator.js",
    "components/component.cube.js",
    "components/component.transform-helper.js"
    ];

for(var i=0;i<includes.length;i++) {
    document.write('<script src="media/js/' + includes[i] + '" type="text/javascript"></script>');
}

var initialScores = {
    0: 0,
    1: 0,
    2: 0,
    3: 0
};

var totalBubblesPerFace = {
    0: 4,
    1: 4,
    2: 3,
    3: 4
};

/**
 * Initialise les composants
 */
function Initialize() {    
    var navigator = new Navigator();
    navigator.initialize();
    
    var housePageController = new HousePageController(cube);
    housePageController.initialize();
}

/******************************************************************************/
/******************************************************************************/
/******************************************************************************/

/**
 * CONSTRUCTEUR : Controlleur de la page "maison"
 */
function HousePageController() {
    this.cube = null;
    this.bullets = null;
    this.popups = null;
    this.scores = null;
}

/**
 * Initialise l'objet et ses composants
 */
HousePageController.prototype.initialize = function() {
    this.initializeScores();
    this.initializeCube();
    this.initializeBullets();
    this.initializePopups();
    this.bindListeners(true);
}

HousePageController.prototype.bindListeners = function(_boolean) {
    var self = this;
    
    // Nav cube
    var prev = document.getElementById("previousFace");
    var next = document.getElementById("nextFace");
    prev.onmouseup = (_boolean) ? function(_event) { self.cube.PreviousFace(); } : null;
    prev.ontouchend = (_boolean) ? function(_event) { self.cube.PreviousFace(); } : null;
    next.onmouseup = (_boolean) ? function(_event) { self.cube.NextFace(); } : null;
    next.ontouchend = (_boolean) ? function(_event) { self.cube.NextFace(); } : null;
    
    // Bulles
    var bubbles = document.getElementsByClassName("bubble");
    
    for(var i=0;i<bubbles.length;i++) {
        bubbles[i].onmouseup = (_boolean) ? function(_event) {self.bubblesHandler(_event);} : null;
        bubbles[i].ontouchend = (_boolean) ? function(_event) {self.bubblesHandler(_event);} : null;
    }
}

/**
 * Initialise le composant "cube"
 */
HousePageController.prototype.initializeCube = function() {
    var cubeParameters = {
        "useVerticalRotationAxis": true,
        "faceWidth" : 450,
        "facePrefix" : "face",
        "useAutomaticAnimation" : true,
        "externalElementsPrefixes" : [],
        "replayAnimations" : true,
        "structureAlreadyCreated" : false,
        "dontUseCallBackOnInit" : true,
        "context" : HousePageController
    };
    var cubeContainer = document.getElementById("cube") ;
    var cube = new Cube(cubeContainer, cubeParameters);
    this.cube = cube;
    cubeContainer.style.opacity = 1;
}

/**
 * Initialise le composant "bullets"
 */
HousePageController.prototype.initializeBullets = function() {
    var bulletsContainer = document.getElementById("bullets");
    var bullets = bulletsContainer.getElementsByClassName("bullet");
    this.bullets = bullets;
}

/**
 * Initialise le composant "popups"
 */
HousePageController.prototype.initializePopups = function() {
    var popupsContainer = document.getElementById("popup-zoom0");
    var popups = popupsContainer.getElementsByTagName("img");
    this.popups = popups;
}

/**
 * Initialise le composant "scores"
 */
HousePageController.prototype.initializeScores = function() {
    this.scores = initialScores;
}


/**
 * Quand on entre une face du cube
 * @param _faceIndex index de la face (de 0 à 3)
 */
HousePageController.prototype.cubeFaceIn = function(_faceIndex) {
    this.initializeFace(_faceIndex);
}

/**
 * Quand on sort d'une face du cube
 * @param _faceIndex index de la face (de 0 à 3)
 */
HousePageController.prototype.cubeFaceOut = function(_faceIndex) {
    this.resetFace(_faceIndex);
}

/**
 * Initialise une face
 * @param _faceIndex index de la face (de 0 à 3)
 */
HousePageController.prototype.initializeFace = function(_faceIndex) {
    _faceIndex = _faceIndex % 4;
    if(_faceIndex < 0) _faceIndex = 4 + _faceIndex;
    // On allume la bullet correspondante
    this.displayBullet(true, _faceIndex);
    // On charge la popup correspondante
    this.loadPopup(true, _faceIndex);
    // On affiche le score et on l'affiche
    this.displayScore(true, _faceIndex);
}

/**
 * Remet une face à 0
 * @param _faceIndex index de la face (de 0 à 3)
 */
HousePageController.prototype.resetFace = function(_faceIndex) {
    _faceIndex = _faceIndex % 4;
    if(_faceIndex < 0) _faceIndex = 4 + _faceIndex;
    // On éteint la bullet correspondante
    this.displayBullet(false, _faceIndex);
    // On décharge la popup correspondante
    this.loadPopup(false, _faceIndex);
    // On cache le score
    this.displayScore(false, _faceIndex);
//    // On n'ecoute plus les bulles de la face
//    var faceDiv = document.getElementById("face" + _faceIndex);
//    var faceBubbles = faceDiv.getElementsByClassName("bubble");
//    this.bindBubbles(false, faceBubbles);
//    // On les remet en hidden
//    for(var i=0; i<faceBubbles.length; i++) {
//        faceBubbles[i].classList.add("hidden");
//    }
}

/**
 * Affiche le score de la face
 * @param _boolean
 * @param _faceIndex index de la face (de 0 à 3)
 */
HousePageController.prototype.displayScore = function(_boolean, _faceIndex) {
    if(this.scores == undefined) this.initializeScores();
    
    this.refreshScore(_faceIndex);
    
    this.hideAllScore();
    
    var scoreDiv = document.getElementById("score" + _faceIndex);
    if(_boolean) {
        scoreDiv.classList.remove("transparent");
    } else {
        scoreDiv.classList.add("transparent");
    }
}

/**
 * (Dés)Active la bullet correspondante
 * @param _boolean
 * @param _faceIndex index de la face (de 0 à 3)
 */
HousePageController.prototype.displayBullet = function(_boolean, _faceIndex) {
    this.hideAllBullets();
    var bulletCoreId = "bulletcore" + _faceIndex;
    var bulletCore = document.getElementById(bulletCoreId);
    if(_boolean) {
        bulletCore.classList.remove("off");
    } else {
        bulletCore.classList.add("off");
    }
}

/**
 * (Dés)Active la bullet correspondante
 */
HousePageController.prototype.hideAllScore = function() {
    var scores = document.getElementsByClassName("score");
    for(var i=0; i<scores.length; i++) {
        scores[i].classList.add("transparent");
    }
}

/**
 * (Dés)Active la bullet correspondante
 */
HousePageController.prototype.hideAllBullets = function() {
    var bulletCores = document.getElementsByClassName("bulletcore");
    for(var i=0; i<bulletCores.length; i++) {
        bulletCores[i].classList.add("off");
    }
}

/**
 * (Dés)Active la popup correspondante
 * @param _boolean
 * @param _faceIndex index de la face (de 0 à 3)
 */
HousePageController.prototype.loadPopup = function(_boolean, _faceIndex) {
    var popupId = "popup" + _faceIndex;
    var popup = document.getElementById(popupId);
    if(_boolean) {
        popup.classList.remove("hidden");
    } else {
        popup.classList.add("hidden");
    }
}

/**
 * Réagi au clic sur une bulle
 * @param _event
 * @param _faceIndex index de la face (de 0 à 3)
 */
HousePageController.prototype.bubblesHandler = function(_event) {
    if(_event != undefined) {
        _event.preventDefault();
    }
    
    // On n'écoute plus la bulle cliquée
    var bubble = _event.currentTarget;
    bubble.ontouchend = null;
    bubble.onmouseup = null;
    
    //on incrémente le score
    var faceIndex = parseInt(bubble.id[4]);
    this.scores[faceIndex]++;
    this.refreshScore(faceIndex);
    
    // On fait apparaitre la bulle
    document.getElementById(_event.currentTarget.id).classList.remove("hidden");
    
    return false;
}

/**
 * Réagi au clic sur une bulle
 * @param _faceIndex index de la face (de 0 à 3)
 */
HousePageController.prototype.refreshScore = function(_faceIndex) {
    var scoreDiv = document.getElementById("score" + _faceIndex);
    var score = this.scores[_faceIndex];
    var totalDiv = document.getElementById("total" + _faceIndex);
    var total = totalBubblesPerFace[_faceIndex];
    scoreDiv.innerHTML = score;
    totalDiv.innerHTML = "/" + total;
    scoreDiv.appendChild(totalDiv);
}