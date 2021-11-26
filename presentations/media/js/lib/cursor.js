function Cursor(_Cursor, _Parameters){
	
	//******************************************
	//Attributs
	//******************************************
	
	var cursor = _Cursor;
	var isVerticalOriented;
	var steps;
	var isContinuous;
	var CursorPositionChanged, CursorMoveStart, CursorMoving; 
	
	var touchX, touchY, currentPosition;
	var dragging=false, canDrag=true;
	var currentStep = 0;
	
	//******************************************
	//Methodes
	//******************************************
	
	ExtractParameters(_Parameters);
	Initialize();
	
	function ExtractParameters(_Parameters){
		isVerticalOriented = (undefined != _Parameters.isVerticalOriented) ? _Parameters.isVerticalOriented : false;
		isContinuous = (undefined != _Parameters.isContinuous) ? _Parameters.isContinuous : true;
		steps =  (undefined != _Parameters.steps) ? _Parameters.steps : [];
		CursorMoveStart = typeof(_Parameters.CursorMoveStart) == 'function' ? _Parameters.CursorMoveStart : DefaultCursorMoveStartHandler;
		CursorMoving = typeof(_Parameters.CursorMoving) == 'function' ? _Parameters.CursorMoving : DefaultCursorMovingHandler;
		CursorPositionChanged = typeof(_Parameters.CursorPositionChanged) == 'function' ? _Parameters.CursorPositionChanged : DefaultCursorPositionChangedHandler;
	}
	
	function Initialize(){
		if(undefined != cursor){
			InitCursor();
			PoseListeners(true);		
			SetStep(0);	
		}
	}
	
	function InitCursor(){
		cursor.style.webkitTransform = "translate3d(0, 0, 0)";
		cursor.style.webkitTransitionDuration = "0s";
		cursor.style.webkitTransitionDelay = "0s";
	}
	
	function PoseListeners(_Value){
		if(IsUnderIpad()){
			cursor.ontouchstart = _Value ? StartDrag : null;
			cursor.ontouchend = _Value ? Stopdrag : null;
			cursor.ontouchmove = _Value ? UpdateHandler : null;			
		}
		else {
			cursor.onmousedown = _Value ? StartDrag : null;
			cursor.onmouseup = _Value ? Stopdrag : null;
			cursor.onmousemove = _Value ? UpdateHandler : null;
		}
	}
	
	function StartDrag(e){
		if(canDrag){
			dragging = true;
			touchX = e.clientX || e.touches[0].clientX;
			touchY = e.clientY || e.touches[0].clientY;
			currentPosition = GetCursorPosition();
			FireEvent(CursorMoveStart);
		}
		e.preventDefault();
		return false;
	}

	function GetCursorPosition(){
		var translationMatrix = new WebKitCSSMatrix(window.getComputedStyle(cursor).webkitTransform);
		var currentPosition = isVerticalOriented ? translationMatrix.m42 : translationMatrix.m41;
		return currentPosition;
	}
	
	function UpdateHandler(e){
		if(dragging){
			UpdateCursorPosition(e);
		}
		return false;
	}
	
	function UpdateCursorPosition(e){
		var position = currentPosition;
		if(null != e){
			position = ComputePosition(e);
			var szTransform = isVerticalOriented ? "translate3d(0, " + position + "px, 0)" : "translate3d(" + position + "px, 0, 0)";
			cursor.style.webkitTransform = szTransform;
			FireEvent(CursorMoving);
		}
		return position;
	}
	
	function ComputePosition(e){
		var currentX = e.clientX || e.touches[0].clientX;
		var currentY = e.clientY || e.touches[0].clientY;
		var dx = touchX - currentX;
		var dy = touchY - currentY;
		var position = isVerticalOriented ? currentPosition - dy : currentPosition - dx;
		position = Math.min(steps[steps.length-1], position);
		position = Math.max(steps[0], position);
		return position;
	}
	
	function Stopdrag(e){
		dragging = false;
		if(!isContinuous){
			var adjustmentPosition = ComputeAdjustmentPosition();
			if(0 != adjustmentPosition){
				AdjustPosition(adjustmentPosition);	
			}				
		}
		FireEvent(CursorPositionChanged);
		return false;
	}
	
	function FireEvent(_Callback){
		_Callback({cursor: this, currentTarget: this.cursor, step: isContinuous ? 0 : currentStep, percentage: GetValueInPercentage(), position: GetCursorPosition()});
	}
	
	function ComputeAdjustmentPosition(){
		var currentPosition = GetCursorPosition();
		var dValue = Number.MAX_VALUE;
		var adjustmentPosition = 0;
		for(var i=0; i<steps.length; i++){
			var deltaposition = Math.abs(currentPosition - steps[i]);
			if(deltaposition < dValue){
				dValue = deltaposition;
				adjustmentPosition = steps[i] - currentPosition;
				currentStep = i;				
			}
		}
		return adjustmentPosition;
	}
	
	function AdjustPosition(_Offset){
		canDrag = false;
		var adjustedPosition = GetCursorPosition() + _Offset;
		cursor.style.webkitTransitionDuration = "0.25s";
		cursor.addEventListener("webkitTransitionEnd", AdjustPositionComplete);
		var szTransform = isVerticalOriented ? "translate3d(0, " + adjustedPosition + "px, 0)" : "translate3d(" + adjustedPosition + "px, 0, 0)";
		cursor.style.webkitTransform = szTransform;
	}
	
	function AdjustPositionComplete(){
		cursor.removeEventListener("webkitTransitionEnd", AdjustPositionComplete);
		cursor.style.webkitTransitionDuration = "0s";
		canDrag = true;
	}
	
	function DefaultCursorPositionChangedHandler(){
		console.log("DefaultCursorPositionChangedHandler");
	}
	
	function DefaultCursorMoveStartHandler(){
		console.log("DefaultCursorMoveStartHandler");
	}	
	
	function DefaultCursorMovingHandler(){
	}	
	
	function GetValueInPercentage(){
		var currentPosition = GetCursorPosition();
		var maxPosition = steps[steps.length - 1];
		var valueInPercentage = currentPosition / maxPosition;
		return valueInPercentage;
	}
	
	
	
	function SetStep(_StepID){
		var position = steps[_StepID];
		var szTransform = isVerticalOriented ? "translate3d(0, " + position + "px, 0)" : "translate3d(" + position + "px, 0, 0)";
		cursor.style.webkitTransform = szTransform;
		currentStep = _StepID;
		FireEvent(CursorPositionChanged);
	}
	
	this.GetStep = function(){
		return currentStep;	
	}
	this.GetPosition = GetCursorPosition;	
	this.GetValueInPercentage = GetValueInPercentage;	
	this.Kill = function(){
		PoseListeners(false);
	}
	this.SetStep = SetStep;
	this.SetAnimated = function(_Value){
		cursor.style.webkitTransitionDuration  = _Value ? "0.75s" : "0s";
	}
}