function Tools() {}

Tools.prototype.Maths = {
    getRandomInt: function(_min, _max) {
        return (Math.floor(Math.random() * (_max - _min + 1)) + _min);
    }
}

Tools.prototype.File = {
    includeJS: function(_path) {
        document.write('<script type="text/javascript" src="' + _path + '"></script>');
    }
}

Tools.prototype.LocalStorage = {
    set: function(_key, _value) {
        localStorage.setItem(_key, _value);
    },
    
    get: function(_key) {
        var theItem = localStorage.getItem(_key);
        if(theItem == undefined || theItem == null || theItem == "null" || theItem == "") {
            theItem = null;
        }
        return theItem;
    }
}

Tools.isUnderIpad = function (){
	var underIpad = navigator.userAgent.toLowerCase().indexOf("ipad") != -1 ;
	return underIpad;
}


Tools.getEventsString = function(_type){
	switch(_type){
		case "click":
		case "mouseup":
		case "touchend":
			return Tools.isUnderIpad() ? "touchend" : "mouseup";
			break;
		case "mousedown":
		case "touchstart":
			return Tools.isUnderIpad() ? "touchstart" : "mousedown";
			break;
		case "mousemove":
		case "touchmove":
			return Tools.isUnderIpad() ? "touchmove" : "mousemove";
			break;
		case "mouseout":
			return Tools.isUnderIpad() ? "touchend" : "mouseup mouseleave mouseout";
			break;
		default:
			return "";
			break;
	}
}
Tools.addTransitionEndListener = function(_element, _callback, _onlyOnce){
	var transition = "transitionend msTransitionEnd webkitTransitionEnd oTransitionEnd";
	if(_onlyOnce){
		$(_element).one(transition, _callback);
	} else {
		$(_element).on(transition, _callback);
	}
}
