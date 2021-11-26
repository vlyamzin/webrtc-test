function Podium(_Parameters){
	//******************************************
	//Attributs
	//******************************************
	var areas, buttons;
	var attachedElements;
	var btValidate;
	var dragging, draggingElement, draggingElementIndex;
	var touchX, touchY, currentPosition;
	var parameters = {};
	this.Start = Start;
	this.Stop = Stop;
	
	//******************************************
	//Methodes
	//******************************************
	
	ExtractParameters(_Parameters);
	Initialize();
	
	/*
	 * Extract all the parameters needed for the podium
	 * @param _Parameters : the array that contains all the parameters
	 */
	function ExtractParameters(_Parameters){
		parameters = (_Parameters != undefined) ? _Parameters : {};
		parameters.areasIdPrefix = ((_Parameters != undefined)&& (_Parameters.areasIdPrefix)) ? _Parameters.areasIdPrefix : "";
		parameters.buttonsIdPrefix = ((_Parameters != undefined)&& (_Parameters.buttonsIdPrefix)) ? _Parameters.buttonsIdPrefix : "";
		parameters.targets = ((_Parameters != undefined)&& (_Parameters.targets)) ? _Parameters.targets : [];
		parameters.elementIndexInArea = ((_Parameters != undefined)&& (_Parameters.elementIndexInArea)) ? _Parameters.elementIndexInArea : [];
		parameters.podiumSucceededCallback = typeof(_Parameters.podiumSucceededCallback) == 'function' ? _Parameters.podiumSucceededCallback : DefaultPodiumSucceededCallbackHandler;
	}
	
	/*
	 * The default function called when the podium is validate
	 */
	function DefaultPodiumSucceededCallbackHandler(){
		console.log("DefaultPodiumSucceededCallbackHandler");
	}
	
	/*
	 * Initialize the podium elements
	 */
	function Initialize(){
		FindControls();
	}
	
	/*
	 * Look for the controllers and set the elements associated
	 */
	function FindControls(){
		FindOtherControls();
		PrepareButtonsForDragAndDrop();
	}
	
	/*
	 * Find the principals controllers (validate button, areas and draggables buttons)
	 */
	function FindOtherControls(){
		btValidate = document.getElementById("bt-validate");
		areas = []; buttons = [];
		attachedElements = [];
		var index = 0;
		var area;
		while(undefined != (area = document.getElementById(parameters.areasIdPrefix + index))){
			areas.push(area);
			attachedElements.push(undefined);
			index++;	
		}
		index = 0;
		while(undefined != (button = document.getElementById(parameters.buttonsIdPrefix + index))){
			buttons.push(button);
			index++;	
		}
	}
	
	/*
	 * Initialize the draggables buttons for the drag and drop
	 */
	function PrepareButtonsForDragAndDrop(){
		var button;
		for(var i=0; i<buttons.length; i++){
			button = buttons[i];
			button.style.webkitTransform = "translate3d(0, 0, 0)";
			button.style.webkitTransitionDelay = "0s";
			SetTransitionWithDuration(button, false);
		}		
	}
	
	/*
	 * Set the transition duration for the button
	 * @param _Button : the button concerned
	 * @param _UseDurationForTransition : boolean if false set the duration to 0s
	 */
	function SetTransitionWithDuration(_Button, _UseDurationForTransition){
		_Button.style.webkitTransitionDuration = _UseDurationForTransition ? "0.75s" : "0s";
	}
	
	/*
	 * Start the podium drag and drop
	 */
	function Start(){
		PoseListeners(true);	
	}
	
	/*
	 * Stop the podium drag and drop
	 */
	function Stop(){
		PoseListeners(false);
		ReleaseAllElements();
	}
	
	/*
	 * Send all the elements on the podium to their initial position
	 */
	function ReleaseAllElements() {		
		for(var i=0; i<areas.length; i++){
			area = areas[i];
			if(AlreadyOccupied(area)){
				SendBackElementAttached(area);	
			}
		}
	}
	
	/*
	 * (Un)Bind the listeners on the draggables buttons and the validate button
	 * @param _Value : if true bind the listeners otherwise unbind them
	 */
	function PoseListeners(_Value){
		var button;
		for(var i=0; i<buttons.length; i++){
			button = buttons[i];
			if(IsUnderIpad()){
				button.ontouchstart = _Value ? StartDragHandler : null;
				document.ontouchmove = _Value ? UpdateHandler : null;
				document.ontouchend = _Value ? StopDragHandler : null;;
			}
			else{
				button.onmousedown = _Value ? StartDragHandler : null;
				document.onmousemove = _Value ? UpdateHandler : null;
				document.onmouseup = _Value ? StopDragHandler : null;
			}
			if(IsUnderIpad()){
				btValidate.ontouchend = _Value ? ValidateHandler : null;	
			}
			else{
				btValidate.onmouseup = _Value ? ValidateHandler : null;
			}
		}
		
	}
	
	/*
	 * Function called when a button star to be dragged
	 */
	function StartDragHandler(e){
		e.preventDefault();
		dragging = true;
		SaveDraggingElementInformations(e);
		DetachElement(draggingElement);
		return false;	
	}
	
	/*
	 * Save the information on the element dragged
	 */
	function SaveDraggingElementInformations(e){
		draggingElement = e.currentTarget;
		draggingElement.style.zIndex = 1;
		draggingElementIndex = parseInt(draggingElement.id.replace(parameters.buttonsIdPrefix, ""));
		touchX = e.clientX || e.touches[0].clientX;
		touchY = e.clientY || e.touches[0].clientY;
		currentPosition = GetElementPosition(draggingElement);
		SetTransitionWithDuration(draggingElement, false);
	}
	
	/*
	 * Detach the element
	 * @param _Element : the element to detach
	 */
	function DetachElement(_Element){
		for(var i=0; i<attachedElements.length; i++){
			if(_Element==attachedElements[i]){
				attachedElements[i] = undefined;
			}
		}
	}
	
	/*
	 * Retun the position of the element
	 * @param _Element : the element concerned
	 * @return : an array with the position X and Y of the element
	 */
	function GetElementPosition(_Element){
		var translationMatrix = new WebKitCSSMatrix(window.getComputedStyle(_Element).webkitTransform);
		var position = {"x": translationMatrix.m41 , "y": translationMatrix.m42};
		return position;
	}
	
	/*
	 * Function called when a button is dragged
	 */
	function UpdateHandler(e){
		e.preventDefault();
		if(dragging){
			UpdateDraggingElementPosition(e);
		}
		return false;	
	}
	
	/*
	 * Update the position of element dragged 
	 */
	function UpdateDraggingElementPosition(e){
		var position = currentPosition;
		if(null != e){
			position = ComputePosition(e);
			var szTransform = "translate3d(" + position.x + "px, " + position.y + "px, 0)";
			draggingElement.style.webkitTransform = szTransform;
		}
		return position;
	}
	
	/*
	 * Retun the computed position of the element
	 */
	function ComputePosition(e){
		var currentX = e.clientX || e.touches[0].clientX;
		var currentY = e.clientY || e.touches[0].clientY;
		var dx = touchX - currentX;
		var dy = touchY - currentY;
		var position = {"x" : currentPosition.x - dx, "y" : currentPosition.y - dy};
		return position;
	}
	
	/*
	 * Function called when the dragging is stoped
	 */
	function StopDragHandler(e){
		e.preventDefault();
		if(dragging){
			DropButton();
			draggingElement.style.zIndex = 0;
			dragging = false;
			draggingElement = undefined;
			draggingElementIndex = undefined;
		}
		return false;	
	}
	
	/*
	 * Drop the element to an area if one is near, otherwise to its initial position
	 */
	function DropButton(){
		var collisionArea;
		if(undefined != (collisionArea = CollidesWithArea(draggingElement))){
			if(AlreadyOccupied(collisionArea)){
				SendBackElementAttached(collisionArea);	
			}
			AttachElement(draggingElement, collisionArea);
		}
		else{
			BackToInitialPosition(draggingElement);
		}
		CheckIfShouldDisplayValidateButton();
	}
	
	/*
	 * Return if an element collide with an area
	 * @param _Element : the element concerned
	 * @return : true if there is collision, flase otherwise
	 */
	function CollidesWithArea(_Element){
		currentPosition = GetElementPosition(_Element);
        var centerX = currentPosition.x + _Element.offsetWidth/2 + _Element.offsetLeft;
		var centerY = currentPosition.y + _Element.offsetHeight/2 + _Element.offsetTop;
		var area, areaMinX, areaMinY, areaMaxX, areaMaxY;
		for(var i=0; i<areas.length; i++){
			area = areas[i];
			areaMinX = area.offsetLeft;
			areaMinY = area.offsetTop;
			areaMaxX = areaMinX + area.offsetWidth;
			areaMaxY = areaMinY + area.offsetHeight;
			 if(((centerX>=areaMinX) && (centerX<=areaMaxX)) && ((centerY>=areaMinY) && (centerY<=areaMaxY))){
				return area;
			}
		}
        return undefined;       
	}
	
	/*
	 * Return if an area is already occupied
	 * @param _Area : the area concerned
	 * @return : true if the area has an element on it
	 */
	function AlreadyOccupied(_Area){
		var areaIndex = parseInt(_Area.id.replace(parameters.areasIdPrefix, ""));
		var alreadyOccupied = (undefined != attachedElements[areaIndex]);
		return alreadyOccupied;
	}
	
	/*
	 * Send to its initial position the element attached to the area
	 * @param _Area : the area concerned
	 */
	function SendBackElementAttached(_Area){
		var areaIndex = parseInt(_Area.id.replace(parameters.areasIdPrefix, ""));
		var attachedElement = attachedElements[areaIndex];
		attachedElements[areaIndex] = undefined;
		BackToInitialPosition(attachedElement);
	}
	
	/*
	 * Attach an element to an area
	 * @param _Element : the element to attach
	 * @param _Area : the area concerned
	 */
	function AttachElement(_Element, _Area){
		var areaIndex = parseInt(_Area.id.replace(parameters.areasIdPrefix, ""));
		var elementIndex = parseInt(_Element.id.replace(parameters.buttonsIdPrefix, ""));
		attachedElements[areaIndex] = _Element;
		_Element.addEventListener("webkitTransitionEnd", function(){
			_Element.removeEventListener("webkitTransitionEnd");			
		});
		MoveElementToTarget(_Element, areaIndex);
	}
	
	/*
	 * Move an element to the target position
	 * @param _Element : the element to move
	 * @param _TargetIndex : the index of the targetted area inside the parameters.targets arrays
	 */
	function MoveElementToTarget(_Element, _TargetIndex){
		var targetPosition = parameters.targets[_TargetIndex];
		var destinationX = targetPosition.x - _Element.offsetLeft ;
		var destinationY = targetPosition.y - _Element.offsetTop ;
		_Element.style.webkitTransform = "translate3d(" + destinationX + "px, " + destinationY + "px, 0)";
		SetTransitionWithDuration(_Element, true);
	}
	
	/*
	 * Move an element to its initial position
	 * @param _Element : the element to move
	 */
	function BackToInitialPosition(_Element){
		var elementIndex = parseInt(_Element.id.replace(parameters.buttonsIdPrefix, ""));
		SetTransitionWithDuration(_Element, true);
		_Element.style.webkitTransform = "translate3d(0, 0, 0)";
		DetachElement(_Element);
	}
	
	/*
	 * Check if the button validate should be displayed or not and display it accordingly
	 */
	function CheckIfShouldDisplayValidateButton(){
		DisplayValidateButton(ShouldDisplayValidateButton());
	}
	
	/*
	 * Return if the validation button should be displayed or not
	 */
	function ShouldDisplayValidateButton(){
		var shouldDisplay = true;	
		for(var i=0; i<attachedElements.length; i++){
			if(undefined==attachedElements[i]){
				shouldDisplay = false;
				break;
			}
		}
		return shouldDisplay;
	}
	
	/*
	 * Display/Hide the validation button
	 * @prama _Value : if set to true display the button otherwise hide it
	 */
	function DisplayValidateButton(_Value){
		document.getElementById("bt-validate").className = _Value ? "" : "";
	}
	
	/*
	 * Function called when the validate button is pushed
	 */
	function ValidateHandler(e){
		e.preventDefault();
		PoseListeners(false);
		CheckGoodAnswers();
		parameters.podiumSucceededCallback ();
		return false;
	}
	
	/*
	 * Check if it's the podium wanted and display the good answer
	 */
	function CheckGoodAnswers(){
		var checkedPositions = CheckButtonPositions();
		SetPodium(checkedPositions);
		HideOthersElements();
	}
	
	/*
	 * Check if the podium's elements are the good ones
	 * @return : an array with the result booleans for each position
	 */
	function CheckButtonPositions(){
		var checkedPositions = [];
		for(var i=0; i<	attachedElements.length; i++){
			var elementIndex = (attachedElements[i] != undefined) ? parseInt(attachedElements[i].id.replace(parameters.buttonsIdPrefix, "")) : attachedElements[i];
			checkedPositions.push(parameters.elementIndexInArea[i]==elementIndex);
		}
		return checkedPositions;
	}
	
	/*
	 * Display the right elements on the podium
	 * @param _CheckedPositions :  an array of booleans used to know if some areas havve already the good elements on them
	 */
	function SetPodium(_CheckedPositions){
		for(var i=0; i<	areas.length; i++){
			if(!_CheckedPositions[i]) {
				AttachElement(document.getElementById(parameters.buttonsIdPrefix + parameters.elementIndexInArea[i]), areas[i]);
			}
		}
	}
	
	/*
	 * Hide all the elements that are not on the podium
	 */
	function HideOthersElements() {		
		for(var i=0; i<	buttons.length; i++){
			button = buttons[i];
			if(NotOnPodium(button)) {
				button.className = "off";
			}
		}
	}
	
	/*
	 * Return if an element should not be on the podium
	 * @prama _Element : the element concerned
	 * @return : true if should NOT be on the podium, false if it should be on it
	 */
	function NotOnPodium(_Element) {
		var result = true;
		var elementIndex = _Element.id.replace(parameters.buttonsIdPrefix, "");
		for(var i=0; i<	parameters.elementIndexInArea.length; i++){
			result = (elementIndex!= parameters.elementIndexInArea[i]) ? result : false;
		}
		return result;
	}
}