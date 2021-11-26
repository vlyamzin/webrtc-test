/**
 * Controleur de l'index
 */
function IndexController() {
    this.tree = null;
    this.house = null;
    this.car = null;
    
    this.bubbles = null;
}

/******************************************************************************
 ********************************************************* INITIALISATEURS
 ******************************************************************************/
/**
 * Initialise le controleur et ses composants
 */
IndexController.prototype.initialize = function() {
    this.initializeTree();
    this.initializeHouse();
    this.initializeCar();
    this.initializeBubbles();
    
    this.displayElements(true);
    
    this.bindListeners(true);
}

/**
 * Initialise le composant "arbre"
 */
IndexController.prototype.initializeTree = function() {
    this.tree = document.getElementById("tree");
}

/**
 * Initialise le composant "maison"
 */
IndexController.prototype.initializeHouse = function() {
    this.house = document.getElementById("house");
}

/**
 * Initialise le composant "voiture"
 */
IndexController.prototype.initializeCar = function() {
    this.car = document.getElementById("car");
}

/**
 * Initialise le composant "bulles"
 */
IndexController.prototype.initializeBubbles = function() {
    this.bubbles = document.getElementsByClassName("bubble");
}

/******************************************************************************
 ********************************************************* AFFICHEURS
 ******************************************************************************/
/**
 * Affiche (ou cache) les elements de la page
 * @param _boolean
 */
IndexController.prototype.displayElements = function(_boolean) {
    if(_boolean) {
        this.tree.classList.remove("transparent");
        this.house.classList.remove("transparent");
        this.car.classList.remove("transparent");
    } else {
        this.tree.classList.add("transparent");
        this.house.classList.add("transparent");
        this.car.classList.add("transparent");
    }
    
    this.displayBubbles(_boolean);
}

/**
 * Affiche (ou cache) les bulles
 * @param _boolean
 */
IndexController.prototype.displayBubbles = function(_boolean) {
    if(_boolean) {
        for(var i=0;i<this.bubbles.length;i++){
            this.bubbles[i].classList.remove("transparent");
        }
    } else {
        for(var i=0;i<this.bubbles.length;i++){
            this.bubbles[i].classList.remove("finder");
            this.bubbles[i].classList.add("transparent");
        }
    }
}

/**
 * Realise un fondu avant de rediriger vers une page
 * @param _href page de destination
 */
IndexController.prototype.goWithFadeOut = function(_href) {
    document.getElementById("screen-container").classList.add("transparent");
    setTimeout(function(){location.href = _href;}, 1000);
}

/******************************************************************************
 ********************************************************* ECOUTEURS
 ******************************************************************************/
/**
 * Pose (ou enleve) les ecouteurs
 * @param _boolean
 */
IndexController.prototype.bindListeners = function(_boolean) {
    var self = this;
    for(var i=0;i<this.bubbles.length;i++){
        this.bubbles[i].onmouseup = (_boolean) ? function(_event) {self.bubbleHandler(_event);} : null;
        this.bubbles[i].ontouchend = (_boolean) ? function(_event) {self.bubbleHandler(_event);} : null;
    }
}

/******************************************************************************
 ********************************************************* HANDLERS
 ******************************************************************************/
/**
 * Reagi au clic sur une bulle
 * @param _event
 */
IndexController.prototype.bubbleHandler = function(_event) {
    if(_event != undefined) {
        _event.preventDefault();
    }
    
    // On cache les bulles
    this.displayBubbles(false);
    
    // On n'écoute plus les bulles
    this.bindListeners(false);
    
    // On agit en fonction de la bulle cliquée
    var bubbleString  = _event.currentTarget.id.replace("content", "");
    if(bubbleString == "3") {
        this.treeHandler();
    } else if(bubbleString == "4") {
        this.houseHandler();
    } else if(bubbleString == "5") {
        this.carHandler();
    }
    
    return false;
}

/******************************************************************************
 ********************************************************* CLIC SUR ARBRE
 ******************************************************************************/
/**
 * Reagi au clic sur la bulle "arbre"
 */
IndexController.prototype.treeHandler = function() {
    // On pose des écouteurs sur la fin de transition
    this.bindTreeTransitionEndListener(true);
    // On déplace tous les éléments du décor vers la droite
    var decor = document.getElementById("decor");
    decor.classList.add("move_elements");
    this.car.classList.add("move_elements");
    this.house.classList.add("move_elements");
    this.tree.classList.add("move_elements");
}

/**
 * Ecoute la fin de transition de l'arbre
 */
IndexController.prototype.bindTreeTransitionEndListener = function(_boolean) {
    var self = this;
    if(_boolean) {
        this.tree.addEventListener("webkitTransitionEnd", function(_event) {self.treeTransitionEndHandler(_event);}, false);
    } else {
        this.tree.removeEventListener("webkitTransitionEnd");
    }
}

/**
 * Reagi apres la transition de l'arbre
 */
IndexController.prototype.treeTransitionEndHandler = function(_event) {
    if(_event != undefined) {
        _event.preventDefault();
    }
    // On n'écoute plus la transition
    this.bindTreeTransitionEndListener(false);
    // On va a la page "arbre"
    this.goWithFadeOut("tree.html");
    
    return false;
}

/******************************************************************************
 ********************************************************* CLIC SUR MAISON
 ******************************************************************************/
/**
 * Reagi au clic sur la bulle "maison"
 */
IndexController.prototype.houseHandler = function() {
    // On va a la page "maison"
    this.goWithFadeOut("house.html");
}

/******************************************************************************
 ********************************************************* CLIC SUR VOITURE
 ******************************************************************************/
/**
 * Reagi au clic sur la bulle "voiture"
 */
IndexController.prototype.carHandler = function() {
    // On pose des écouteurs sur la fin de transition
    this.bindCarTransitionEndListener(true);
    // On deplace la voiture
    this.car.classList.add("animate_car");
}

/**
 * Ecoute la fin de transition de la voiture
 */
IndexController.prototype.bindCarTransitionEndListener = function(_boolean) {
    var self = this;
    if(_boolean) {
        this.car.addEventListener("webkitTransitionEnd", function(_event) {self.carTransitionEndHandler(_event);}, false);
    } else {
        this.car.removeEventListener("webkitTransitionEnd");
    }
}

/**
 * Reagi apres la transition de la voiture
 */
IndexController.prototype.carTransitionEndHandler = function(_event) {
    if(_event != undefined) {
        _event.preventDefault();
    }
    // On n'écoute plus la transition
    this.bindCarTransitionEndListener(false);
    // On fait un fondu sur la screen-container
    this.goWithFadeOut("car.html");
    
    return false;
}