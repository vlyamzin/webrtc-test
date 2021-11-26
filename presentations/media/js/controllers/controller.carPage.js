var includes = [
"lib/global_autolaunch.js",
"components/component.tools.js",
"lib/config.js",
"lib/viview.js",
"vendor/jquery-1.9.1.min.js",
"components/component.navigator.js"
];

for(var i=0;i<includes.length;i++) {
    document.write('<script src="media/js/' + includes[i] + '" type="text/javascript"></script>');
}
var carPageController;
/**
 * Initialise les composants de la page
 */
function Initialize() {
     carPageController = new CarPageController();
    carPageController.initialize();
    
    var navigator = new Navigator();
    navigator.initialize();
}

/******************************************************************************/
/******************************************************************************/
/******************************************************************************/

/**
 * CONSTRUCTEUR : Controlleur de la page "voiture"
 */
function CarPageController() {
    this.background = null;
    this.car = null;
    this.bubbles = null;
}

/**
 * Initialise l'objet et ses composants
 */
CarPageController.prototype.initialize = function() {
    // Init des composants
    this.initializeBackground();
    this.initializeCar();
    this.initializeBubbles();
    // On démarre la voiture
    var self = this;
    setTimeout(function(_event) {
        self.animateBackground();
    }, 1000);
}

/**
 * Initialise le composant "fond"
 */
CarPageController.prototype.initializeBackground = function() {
    this.background = document.getElementById("fond");
}

/**
 * Initialise le composant "voiture"
 */
CarPageController.prototype.initializeCar = function() {
    this.car = document.getElementById("voiture");
    this.car.classList.remove("off");
}

/**
 * Initialise le composant "bulles"
 */
CarPageController.prototype.initializeBubbles = function() {
    this.bubbles = document.getElementsByClassName("bubble");
}

/**
 * Affiche (ou cache) le composant "bulles"
 * @param _boolean
 */
CarPageController.prototype.displayBubbles = function(_boolean) {
    for(var i=0;i<this.bubbles.length;i++) {
        if(_boolean) {
            this.bubbles[i].classList.remove("off");
        } else {
            this.bubbles[i].classList.add("off");
        }
    }
}

/**
 * Démarre l'animation de la fumée sortant de la cheminée
 * @param _boolean
 */
CarPageController.prototype.startFlueSmokeAnimation = function(_boolean) {
	var big_smoke;
	var index = 0;
	while(undefined!= (big_smoke = document.getElementById("big_smoke"+ index))) {
		big_smoke.style.webkitAnimationPlayState = (_boolean) ? "running" : "paused";
		index++;	
	}
    document.getElementById("big_smoke_container").className = (_boolean) ? "" : "off";
}

/**
 * Démarre l'animation des roues de la voiture
 * @param _boolean
 */
CarPageController.prototype.startCarWheelsAnimation = function(_boolean) {
	document.getElementById("left_wheel").style.webkitAnimationPlayState = (_boolean) ? 'running' : 'paused';
	document.getElementById("right_wheel").style.webkitAnimationPlayState = (_boolean) ? 'running' : 'paused';
}

/**
 * Démarre l'animation de tremblement de la voiture
 * @param _boolean
 */
CarPageController.prototype.startCarShakingAnimation = function(_boolean) {
	document.getElementById("car").style.webkitAnimationPlayState = (_boolean) ? 'running' : 'paused';
}
/**
 * Change l'animation de tremblement de la voiture
 */
CarPageController.prototype.changeCarShakingAnimation = function() {
	document.getElementById("car").className = (document.getElementById("car").className == "big_shake") ? "small_shake" : "big_shake";
}
/**
 * Démarre l'animation de la croix de la pharmacie
 * @param _boolean
 */
CarPageController.prototype.startCrossAnimation = function(_boolean) {
	document.getElementById("cross").style.webkitAnimationPlayState = (_boolean) ? 'running' : 'paused';
    document.getElementById("cross_container").className = (_boolean) ? "" : "off";
}

/**
 * Lance l'animation du fond
 */
CarPageController.prototype.animateBackground = function() {
    // On n'écoute plus la voiture
    this.car.onclick = null;
    // On pose un écouteur sur la fin de transition
    this.bindAnimationEndListener(true);
    // On affecte la classe qui va mouvoir le fond
    this.background.classList.add("move_fond");
    // On affecte la classe qui va mouvoir le bloc de pollen
    document.getElementById("pollen_container").className = "move_pollen_container";
}

/**
 * Pose (ou enleve) les écouteurs de fin de transition
 * @param _boolean
 */
CarPageController.prototype.bindAnimationEndListener = function(_boolean) {
    if(_boolean) {
        var self = this;
        this.background.addEventListener("webkitTransitionEnd", function(_event) {
            self.animationEndHandler(_event);
        }, false);
    } else {
        this.background.removeEventListener("webkitTransitionEnd");
    }
}

/**
 * Réagis à la fin de la transition du fond
 * @param _event
 */
CarPageController.prototype.animationEndHandler = function(_event) {
    if(_event != undefined) {
        _event.preventDefault();
    }
    
    // On affiche les bulles
    this.displayBubbles(true);
	// On démarre la fumée de la cheminée
	this.startFlueSmokeAnimation(true);
	// On arrête l'animation des roues de la voiture
	this.startCarWheelsAnimation(false);
	// On démarre l'animation de la croix de la pharmacie
	this.startCrossAnimation(true);
    
    return false;
}