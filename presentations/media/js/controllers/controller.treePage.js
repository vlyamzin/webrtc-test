var includes = [
    "lib/global_autolaunch.js",
    "components/component.tools.js",
    "lib/config.js",
    "lib/viview.js",
    "vendor/jquery-1.9.1.min.js",
    "vendor/jquery.wipetouch.upgraded.js",
    "vendor/shake.js",
    "components/component.navigator.js"
];

for(var i=0;i<includes.length;i++) {
    document.write('<script src="media/js/' + includes[i] + '" type="text/javascript"></script>');
}

var winterPlayed = false;
/**
 * Initialise les composants
 */
function Initialize() {    
    var treePageController = new TreePageController();
    treePageController.initialize();
    
    var navigator = new Navigator();
    navigator.initialize();
}

/******************************************************************************/
/******************************************************************************/
/******************************************************************************/

/**
 * CONSTRUCTEUR : Controlleur de la page "maison"
 */
function TreePageController() {
    this.basicTree = null;
    this.summerTree = null;
    this.autumnTree = null,
    this.springTree = null;
    this.winterTree = null;
    
    this.reloadIcon = null;
}

TreePageController.prototype.displayReloadIcon = function(_boolean) {
    if(_boolean) {
        this.reloadIcon.classList.remove("off");
        // On ecoute l'arbre
        this.bindReloadListener(true);
    } else {
        this.reloadIcon.classList.add("off");
        // On n'ecoute plus l'arbre
        this.bindReloadListener(false);
    }
}

/******************************************************************************/
/************************************************************** INITIALISATIONS
/******************************************************************************/
/**
 * Initialise l'objet et ses composants
 */
TreePageController.prototype.initialize = function() {
    // Initialisation des arbres
    this.initializeBasicTree();
    this.initializeSummerTree();
    this.initializeAutumnTree();
    this.initializeSpringTree();
    this.initializeWinterTree();
    // Icon reload
    this.reloadIcon = document.getElementById("reload");
    // On affiche l'arbre initial
    this.basicTree.show(true);
    this.basicTree.showText(true);
    // On pose les écouteurs de saison
    this.bindListeners(true);
}

/**
 * Initialise comopsant "arbre initial"
 */
TreePageController.prototype.initializeBasicTree = function() {
    var container = document.getElementById("tree_base");
    this.basicTree = {
        container: container,
        text: document.getElementById("text_basic"),
        trunk: document.getElementById("trunk_base"),
        foliage: document.getElementById("foliage_base"),
        leaves: container.getElementsByClassName("leaf"),
        show: function(_boolean) {
            if(_boolean) {
                this.container.classList.remove("off");
                this.trunk.classList.remove("off");
                this.foliage.classList.remove("off");
                for(var i=0;i<this.leaves.length;i++) {
                    this.leaves[i].classList.remove("off");
                }
            } else {
                //this.trunk.classList.add("off");
                this.foliage.classList.add("off");
                for(var i=0;i<this.leaves.length;i++) {
                    this.leaves[i].classList.add("off");
                }
            }
        },
		
        showText : function(_boolean) {
            if(_boolean) {
                this.text.classList.remove("off");
            } else {
                this.text.classList.add("off");
            }
        },
        
        looseLeaves: function() {
            for(var i=0;i<this.leaves.length;i++) {
                if(this.leaves[i].id == "leaf0") {
                    this.leaves[i].classList.add("off");
                } else {
                    var randomClassSuffix = tools.Maths.getRandomInt(1, 3);
                    var randomDelay = tools.Maths.getRandomInt(200, 1000);
                    this.leaves[i].style.webkitAnimationDelay = randomDelay + "ms";
                    var randomDuration = tools.Maths.getRandomInt(500, 2000);
                    this.leaves[i].style.webkitAnimationDuration= randomDuration + "ms";
                    this.leaves[i].classList.add("fallingLeave_" + randomClassSuffix);
                }
            }
        },
        
        displayFoliage: function(_boolean) {
            if(_boolean) {
                this.foliage.classList.remove("off");
            } else {
                this.foliage.classList.add("off");
            }
        },
        
        displayLeaves: function(_boolean) {
            if(_boolean) {
                for(var i=0;i<this.leaves.length;i++) {
                    this.leaves[i].classList.remove("off");
                }
            } else {
                for(var i=0;i<this.leaves.length;i++) {
                    this.leaves[i].classList.add("off");
                }
            }
        },
        
        reset: function() {
            this.showText(true);
            for(var i=0;i<this.leaves.length;i++) {
                this.leaves[i].classList.add("off");
                this.leaves[i].classList.remove("fallingLeave_1");
                this.leaves[i].classList.remove("fallingLeave_2");
                this.leaves[i].classList.remove("fallingLeave_3");
            }
        }
    }
}

/**
 * Initialise comopsant "arbre ete"
 */
TreePageController.prototype.initializeSummerTree = function() {
    var container = document.getElementById("tree_summer");
    this.summerTree = {
        container: container,
        text: document.getElementById("text_summer"),
        fixedApples: document.getElementById("apple_fix"),
        apples: container.getElementsByClassName("apple"),
        /**
         * Joue l'anim d'été
         */
        show: function(_boolean) {
            if(_boolean) {
                this.text.classList.remove("off");
                this.container.classList.remove("off");
                this.fixedApples.classList.remove("off");
                for(var i=0;i<this.apples.length;i++) {
                    var randomDelay = tools.Maths.getRandomInt(200, 1000);
                    this.apples[i].style.webkitTransitionDelay = randomDelay + "ms";
                    this.apples[i].classList.remove("off");
                }
            } else {
                this.text.classList.add("off");
                this.container.classList.add("off");
                this.fixedApples.classList.add("off");
                for(var i=0;i<this.apples.length;i++) {
                    this.apples[i].style.webkitTransitionDelay = "0ms";
                    this.apples[i].classList.add("off");
                }
            }
        },
        
        looseApples: function() {
            for(var i=0;i<this.apples.length;i++) {
                var randomDelay = tools.Maths.getRandomInt(200, 2000);
                this.apples[i].style.webkitTransitionDelay = randomDelay + "ms";
                var randomDuration = tools.Maths.getRandomInt(200, 500);
                this.apples[i].style.webkitTransitionDuration = randomDuration + "ms";
                if(this.apples[i].id == "apple5" || this.apples[i].id == "apple4") {
                    this.apples[i].classList.add("falling_apple_further");
                } else {
                    this.apples[i].classList.add("falling_apple");
                }
            }
        },
        
        reset: function() {
            this.show(false);
            for(var i=0;i<this.apples.length;i++) {
                this.apples[i].style.webkitTransitionDelay = "0ms";
                this.apples[i].classList.remove("falling_apple_further");
                this.apples[i].classList.remove("falling_apple");
            }
        }
    }
}

/**
 * Initialise comopsant "arbre automne"
 */
TreePageController.prototype.initializeAutumnTree = function() {
    var container = document.getElementById("tree_autumn");
    this.autumnTree = {
        container: container,
        text: document.getElementById("text_autumn"),
        fiolage: document.getElementById("feuillage_autumn"),
        leaves: document.getElementById("feuilles_autumn"),
        /**
         * Joue l'anim d'été
         */
        show: function(_boolean) {
            if(_boolean) {
                this.text.classList.remove("off");
                this.container.classList.remove("off");
                this.fiolage.classList.remove("off");
                this.leaves.classList.remove("off");
            } else {
                this.text.classList.add("off");
                this.container.classList.add("off");
                this.fiolage.classList.add("off");
                this.leaves.classList.add("off");
            }
        },
        
        reset: function() {
            this.show(false);
        }
    }
}

/**
 * Initialise comopsant "arbre printemps"
 */
TreePageController.prototype.initializeSpringTree = function() {
    var container = document.getElementById("tree_spring");
    this.springTree = {
        container: container,
        text: document.getElementById("text_spring"),
        fiolage: document.getElementById("fleurs"),
        flowers: container.getElementsByClassName("pousse"),
        /**
         * Joue l'anim du printemps
         */
        show: function(_boolean) {
            if(_boolean) {
                this.text.classList.remove("off");
                this.container.classList.remove("off");
                this.fiolage.classList.remove("off");
                for(var i=0;i<this.flowers.length;i++) {
                    var randomDelay = tools.Maths.getRandomInt(200, 1000);
                    var randomDuration = tools.Maths.getRandomInt(200, 1000);
                    this.flowers[i].style.webkitTransitionDelay = randomDelay + "ms";
                    this.flowers[i].style.webkitTransitionDuration = randomDuration + "ms";
                    this.flowers[i].classList.remove("noheight");
                }
            } else {
                this.text.classList.add("off");
                this.container.classList.add("off");
                this.fiolage.classList.add("off");
                for(var i=0;i<this.flowers.length;i++) {
                    this.flowers[i].style.webkitTransitionDelay = "0ms";
                    this.flowers[i].style.webkitTransitionDuration = "0ms";
                    this.flowers[i].classList.add("noheight");
                }
            }
        },
        
        reset: function() {
            this.show(false);
        }
    }
}

/**
 * Initialise comopsant "arbre hiver"
 */
TreePageController.prototype.initializeWinterTree = function() {
    var container = document.getElementById("tree_winter");
    this.winterTree = {
        container: container,
        text: document.getElementById("text_winter"),
        snow: document.getElementById("neige"),
        flakes: container.getElementsByClassName("flocon"),
        /**
         * Joue l'anim du printemps
         */
        show: function(_boolean) {
            if(_boolean) {
                this.text.classList.remove("off");
                this.container.classList.remove("off");
            } else {
                this.text.classList.add("off");
                this.container.classList.add("off");
            }
        },
        
        showSnow: function(_boolean) {
            if(_boolean) {
                this.snow.classList.remove("off");
            } else {
                this.snow.classList.add("off");
            }
        },
        
        dropSnowflakes: function(_boolean) {
            if(_boolean) {
                for(var i=0;i<this.flakes.length;i++) {
                    var randomClassSuffix = tools.Maths.getRandomInt(1, 3);
                    var randomDelay = tools.Maths.getRandomInt(500, 3000);
                    var randomDuration = tools.Maths.getRandomInt(3000, 10000);
                    this.flakes[i].style.webkitAnimationDelay = randomDelay + "ms";
                    this.flakes[i].style.webkitAnimationDuration = randomDuration + "ms";
                    this.flakes[i].classList.remove("off");
                    this.flakes[i].classList.add("flocon_tombe_" + randomClassSuffix);
                }
            } else {
                for(var i=0;i<this.flakes.length;i++) {
                    this.flakes[i].style.webkitAnimationDelay = "0ms";
                    this.flakes[i].style.webkitAnimationDuration = "0ms";
                    this.flakes[i].classList.add("off");
                    this.flakes[i].classList.remove("flocon_tombe_1");
                    this.flakes[i].classList.remove("flocon_tombe_2");
                    this.flakes[i].classList.remove("flocon_tombe_3");
                }
            }
        },
        
        reset: function() {
            this.show(false);
            this.showSnow(false);
            this.dropSnowflakes(false);
        }
    }
}

/******************************************************************************/
/************************************************************** ECOUTEURS
/******************************************************************************/
/**
 * Pose (ou enlève) écouteur des saisons
 * @param _boolean
 */
TreePageController.prototype.bindListeners = function(_boolean) {
    var self = this;
    
    this.bindStandardListeners(_boolean);
    this.bindInteractiveListeners(_boolean);
}

/**
 * Pose (ou enlève) écouteurs standards (non intéractif)
 * @param _boolean
 */
TreePageController.prototype.bindStandardListeners = function(_boolean) {
    var self = this;
    
    if(_boolean) {
        $(document).wipetouch({
            tapToClick: true,
            wipeLeft: function(_result) {
                self.summerHandler();
            },
            wipeRight: function(_result) {
                self.autumnHandler();
            },
            wipeUp: function(_result) {
                self.springHandler();
            },
            wipeDown: function(_result) {
                self.winterHandler();
            }
        });
    } else {
        $(document).wipetouch({
            remove:true
        });
    }
}

/**
 * Pose (ou enlève) écouteurs intéractifs
 * @param _boolean
 */
TreePageController.prototype.bindInteractiveListeners = function(_boolean) {
    var self = this;
    
    // Ete : Shake
    if(_boolean) {
        $(window).on('shake', function(_event) {
            var event = _event.originalEvent;
            self.summerHandler(event);
        });
    } else {
        $(window).off('shake');
    }
    
    // Winter : upside-down
    var angle;
    if(_boolean) {
        window.ondeviceorientation = function(_event) {
            var event = _event.originalEvent;
            if(winterPlayed) {
                winterPlayed = false;
                angle = 0;
            } else {
                angle = _event.alpha;
            }
            
            var isUpsideDown = (angle >= 150 && angle <= 190);
            
            if(isUpsideDown) {
                self.winterHandler(event);
            }
        };
    } else {
        window.ondeviceorientation = null;
    }
}

/**
 * Pose (ou enlève) écouteur de réinitialisation
 * @param _boolean
 */
TreePageController.prototype.bindReloadListener = function(_boolean) {
    var self = this;
    var resetButton = document.getElementById("reset_button")
    if(IsUnderIpad()) {
        resetButton.ontouchend = (_boolean) ? function(_event) {
            self.reloadHandler(_event);
        } : null;
    } else {
        resetButton.onmouseup = (_boolean) ? function(_event) {
            self.reloadHandler(_event);
        } : null;
    }
}

/******************************************************************************/
/************************************************************** HANDLERS
/******************************************************************************/
/**
 * Réagis à l'action pour déclencher l'été
 * @param _event
 */
TreePageController.prototype.summerHandler = function(_event) {
    if(_event != undefined) {
        _event.preventDefault();
    }
    this.bindListeners(false);
    this.basicTree.showText(false);
    this.animateToSummer();
    
    return false;
}

/**
 * Réagis à l'action pour déclencher l'automne
 * @param _event
 */
TreePageController.prototype.autumnHandler = function(_event) {
    if(_event != undefined) {
        _event.preventDefault();
    }
    this.bindListeners(false);
    this.basicTree.showText(false);
    this.animateToAutumn();
    
    return false;
}

/**
 * Réagis à l'action pour déclencher le printemps
 * @param _event
 */
TreePageController.prototype.springHandler = function(_event) {
    if(_event != undefined) {
        _event.preventDefault();
    }
    this.bindListeners(false);
    this.basicTree.showText(false);
    this.animateToSpring();
    
    return false;
}

/**
 * Réagis à l'action pour déclencher l'hiver
 * @param _event
 */
TreePageController.prototype.winterHandler = function(_event) {
    this.bindListeners(false);
    this.basicTree.showText(false);
    this.animateToWinter();
    winterPlayed = true;
    return false;
}


/**
 * Réagis à la demande de réinitialisation
 * @param _event
 */
TreePageController.prototype.reloadHandler = function(_event) {
    if(_event != undefined) {
        _event.preventDefault();
    }
    // On cache l'icone
    this.displayReloadIcon(false);
    // On remet a zero les arbres de saison
    this.summerTree.reset();
    this.autumnTree.reset();
    this.springTree.reset();
    this.winterTree.reset();
    // On remet a zero et affiche l'arbre initial
    this.basicTree.reset();
    this.basicTree.show(true);
    // On réecoute les événement de saisons
    this.bindListeners(true);
    
    return false;
}

/******************************************************************************/
/************************************************************** ANIMATIONS
/******************************************************************************/
/**
 * Animation été
 */
TreePageController.prototype.animateToSummer = function() {
    // On affiche l'arbre
    this.summerTree.show(true);
    // On fait tomber les pommes (1 seconde plus tard) et on affiche le reload
    var self = this;
    setTimeout(function() {
        self.summerTree.looseApples();
        self.displayReloadIcon(true);
    }, 1000);
}

/**
 * Animation automne
 */
TreePageController.prototype.animateToAutumn = function() {
    // On fait tomber les feuilles (1 seconde plus tard) et on affiche le reload
    var self = this;
    setTimeout(function() {
        self.basicTree.looseLeaves();
        self.displayReloadIcon(true);
    }, 1000);
    setTimeout(function() {
        self.autumnTree.show(true);
    }, 2000);
}

/**
 * Animation printemps
 */
TreePageController.prototype.animateToSpring = function() {
    // On affiche l'arbre
    this.springTree.show(true);
    var self = this;
    setTimeout(function() {
        self.displayReloadIcon(true);
    }, 1000);
}

/**
 * Animation hiver
 */
TreePageController.prototype.animateToWinter = function() {
    // On affiche le texte
    this.winterTree.show(true);
    // On cache les feuilles et feuillage
    this.basicTree.displayFoliage(false);
    this.basicTree.displayLeaves(false);
    // Tombons les flocons
    this.winterTree.dropSnowflakes(true);
    // On affiche la neige sur l'arbre + icone de réinitialisation
    var self = this;
    setTimeout(function() {
        self.winterTree.showSnow(true);
        self.displayReloadIcon(true);
    }, 5000);
}