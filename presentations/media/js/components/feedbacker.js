function Feedbacker() {
    this.container = null;
    
    this.positiveZone = null;
    this.neutralZone = null;
    this.negativeZone = null;
	
	   this.positiveZone = null;
    this.neutralZone = null;
    this.negativeZone = null;
}

Feedbacker.prototype.initialize = function() {
    this.initializeContainer();
    this.initializePositiveZone();
    this.initializeNeutralZone();
    this.initializeNegativeZone();
    
    this.bindListeners(true);
}

Feedbacker.prototype.initializeContainer = function() {
    this.container = document.getElementById("screen-container");
}

Feedbacker.prototype.initializePositiveZone = function() {
    var positiveZone = document.createElement("div");
    positiveZone.id = this.DefaultValues.positiveZone.id;
    positiveZone.style.width = this.DefaultValues.positiveZone.width;
    positiveZone.style.height = this.DefaultValues.positiveZone.height;
    positiveZone.style.left = this.DefaultValues.positiveZone.left;
    positiveZone.style.top = this.DefaultValues.positiveZone.top;
	
	var positiveVisual = document.createElement("img");
    positiveVisual.src = this.DefaultValues.positiveZone.src;
	positiveVisual.className = "feedback-out";
	
    this.container.appendChild(positiveZone);
    positiveZone.appendChild(positiveVisual);
    this.positiveZone = positiveZone;
    this.positiveVisual = positiveVisual;
}

Feedbacker.prototype.initializeNeutralZone = function() {
    var neutralZone = document.createElement("div");
    neutralZone.id = this.DefaultValues.neutralZone.id;
    neutralZone.style.width = this.DefaultValues.neutralZone.width;
    neutralZone.style.height = this.DefaultValues.neutralZone.height;
    neutralZone.style.left = this.DefaultValues.neutralZone.left;
    neutralZone.style.top = this.DefaultValues.neutralZone.top;
	
	var neutralVisual = document.createElement("img");
    neutralVisual.src = this.DefaultValues.neutralZone.src;
	neutralVisual.className = "feedback-out";
    
    this.container.appendChild(neutralZone);
	neutralZone.appendChild(neutralVisual);
    this.neutralZone = neutralZone;
    this.neutralVisual = neutralVisual;
}

Feedbacker.prototype.initializeNegativeZone = function() {
    var negativeZone = document.createElement("div");
    negativeZone.id = this.DefaultValues.negativeZone.id;
    negativeZone.style.width = this.DefaultValues.negativeZone.width;
    negativeZone.style.height = this.DefaultValues.negativeZone.height;
    negativeZone.style.left = this.DefaultValues.negativeZone.left;
    negativeZone.style.top = this.DefaultValues.negativeZone.top;
	
	var negativeVisual = document.createElement("img");
    negativeVisual.src = this.DefaultValues.negativeZone.src;
	negativeVisual.className = "feedback-out";
    
    this.container.appendChild(negativeZone);
	negativeZone.appendChild(negativeVisual);
    this.negativeZone = negativeZone;
    this.negativeVisual = negativeVisual;
}

Feedbacker.prototype.bindListeners = function(_boolean) {
    if(_boolean) {
        var self = this;
        this.positiveZone.onclick = function(_event) { self.positiveZoneHandler(_event); };
        this.neutralZone.onclick = function(_event) { self.neutralZoneHandler(_event); };
        this.negativeZone.onclick = function(_event) { self.negativeZoneHandler(_event); };
    } else {
        this.positiveZone.onclick = null;
        this.neutralZone.onclick = null;
        this.negativeZone.onclick = null;
    }
}

Feedbacker.prototype.positiveZoneHandler = function(_event) {
    if(_event != undefined) {
        _event.preventDefault();
    }
    console.log("positive feedback");
	this.positiveVisual.addEventListener("webkitAnimationEnd", this.animationComplete);
	this.positiveVisual.className = "feedback-appear";
    window.parent.updateFeedback('POSI');
    return false;
}


Feedbacker.prototype.neutralZoneHandler = function(_event) {
    if(_event != undefined) {
        _event.preventDefault();
    }
    console.log("neutral feedback");
	this.neutralVisual.addEventListener("webkitAnimationEnd", this.animationComplete);
	this.neutralVisual.className = "feedback-appear";
    window.parent.updateFeedback('NONE');
    return false;
}

Feedbacker.prototype.animationComplete = function(_event) {
	_event.currentTarget.className = "feedback-out";;
}

Feedbacker.prototype.negativeZoneHandler = function(_event) {
    if(_event != undefined) {
        _event.preventDefault();
    }
    console.log("negative feedback");
	this.negativeVisual.addEventListener("webkitAnimationEnd", this.animationComplete);
	this.negativeVisual.className = "feedback-appear";
    window.parent.updateFeedback('NEGA');
    return false;
}

Feedbacker.prototype.DefaultValues = {
    positiveZone: {
        id: "positiveZone",
		src: "media/images/feedback_positive.png",
        width: "80px",
        height: "256px",
        left: "0px",
        top: "0px"
    },
    
    neutralZone: {
        id: "neutralZone",
		src: "media/images/feedback_neutral.png",
        width: "80px",
        height: "256px",
        left: "0px",
        top: "256px"
    },
    
    negativeZone: {
        id: "negativeZone",
		src: "media/images/feedback_negative.png",
        width: "80px",
        height: "256px",
        left: "0px",
        top: "512px"
    }
}