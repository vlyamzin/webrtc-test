var jSon;
/************* FUNCTION UTILITAIRES ***********/
function isIPAD() {
	return (navigator.platform.toLowerCase().indexOf("ipad") >= 0);
}
/************* Fonctions Proxys ***********/
function onVisitTemplatePopupSelected_ex(aData) {
	var aVisitId=aData.id;
	var aVisitNom=aData.name;
	var aCurrentVisitArray=aData.modules;
	if (undefined==aCurrentVisitArray) aCurrentVisitArray=new Array();
	var aAppEditMode=(aData.locked=='FALSE');

	onVisitTemplatePopupSelected(aVisitId, aVisitNom, aCurrentVisitArray, aAppEditMode);
}
if (isIPAD()) {
	window["GetContentTree"]= function (){
	 
		var iframe = document.createElement("IFRAME");
		iframe.setAttribute("src","viview:getContentTree");
		document.documentElement.appendChild(iframe);
		iframe.parentNode.removeChild(iframe);
		iframe = null;
		
		return jSon; 
	}
	window["GetVisits"]= function (){
		var iframe = document.createElement("IFRAME");  
		iframe.setAttribute("src","viview:getVisits");
		document.documentElement.appendChild(iframe);
		iframe.parentNode.removeChild(iframe);
		iframe = null;


		return jSon; 
	}

	window["ShowCustomInterface"]= function () {
		var iframe = document.createElement("IFRAME");  
		iframe.setAttribute("src","viview:showCustomInterface");
		document.documentElement.appendChild(iframe);
		iframe.parentNode.removeChild(iframe);
		iframe = null;
	}
	

	window["ReadFullBibliography"]= function (){
		var iframe = document.createElement("IFRAME");      
		iframe.setAttribute("src","viview:readFullBibliography");
		document.documentElement.appendChild(iframe);
		iframe.parentNode.removeChild(iframe);
		iframe = null;

	}
	window["ShowPhysiciansPopup"]= function (){
		var iframe = document.createElement("IFRAME");  
		var command ="viview:showPhysiciansPopup";
		iframe.setAttribute("src",command);
		document.documentElement.appendChild(iframe);
		iframe.parentNode.removeChild(iframe);
		iframe = null;
	}

	window["ShowVisitTemplatePopup"]= function (){
		var iframe = document.createElement("IFRAME");  
		var command ="viview:showVisitTemplatePopup";
		iframe.setAttribute("src",command);
		document.documentElement.appendChild(iframe);
		iframe.parentNode.removeChild(iframe);
		iframe = null;
	}
	window["GetVariable"]=function(_variableName){
		jSon="";
		var iframe = document.createElement("IFRAME");  
		var command ="viview:getVariable:"+_variableName;
		iframe.setAttribute("src",command);
		document.documentElement.appendChild(iframe);
		iframe.parentNode.removeChild(iframe);
		iframe = null;
		return jSon;

	}
	window["SetVariable"]=function(_variableName, _value){
		var _valueEncoded=JSON.stringify(_value).replace(/:/g,"0x3a").replace(/\\/g,"0x5c");
		var iframe = document.createElement("IFRAME");  
		var command ="viview:setVariable:"+_variableName+":"+_valueEncoded;
		iframe.setAttribute("src",command);
		document.documentElement.appendChild(iframe);
		iframe.parentNode.removeChild(iframe);
		iframe = null;

		return jSon;
	}
}	

function ShowDefaultVisit(){
    var iframe = document.createElement("IFRAME");  
    iframe.setAttribute("src","viview:showDefaultVisit");
    document.documentElement.appendChild(iframe);
    iframe.parentNode.removeChild(iframe);
    iframe = null;
}

function ShowVisitById(id){
    var iframe = document.createElement("IFRAME");  
    iframe.setAttribute("src","viview:showVisitById:"+id);
    document.documentElement.appendChild(iframe);
    iframe.parentNode.removeChild(iframe);
    iframe = null;
}

function SaveCurrentVisit_ex(array){
    var jString = JSON.stringify(array);
    var iframe = document.createElement("IFRAME");  
    var command ="viview:saveCurrentVisit:"+jString;
    iframe.setAttribute("src",command);
    document.documentElement.appendChild(iframe);
    iframe.parentNode.removeChild(iframe);
    iframe = null;
}
function SaveCurrentVisit(_array){
	if (undefined==_array || null==_array) _array=new Array();
	var _intArray=new Array();
	for(var i=0;i<_array.length;i++) {
		_intArray.push(parseInt(_array[i]));
	}
	SaveCurrentVisit_ex({"modules":_intArray});
}
function ShowCurrentVisit(){
    var iframe = document.createElement("IFRAME");  
    var command ="viview:showCurrentVisit";
    iframe.setAttribute("src",command);
    document.documentElement.appendChild(iframe);
    iframe.parentNode.removeChild(iframe);
    iframe = null;
}



function GetModuleStatusForCurrentPhysician(moduleId){
    var iframe = document.createElement("IFRAME");  
    var command ="viview:getModuleStatusForCurrentPhysician:"+moduleId;
    iframe.setAttribute("src",command);
    document.documentElement.appendChild(iframe);
    iframe.parentNode.removeChild(iframe);
    iframe = null;

    return status;
}

function PreviewModule(moduleId){
    var iframe = document.createElement("IFRAME");  
    var command ="viview:previewModule:"+moduleId;
    iframe.setAttribute("src",command);
    document.documentElement.appendChild(iframe);
    iframe.parentNode.removeChild(iframe);
    iframe = null;
}

function GoBack(){
	if (isIPAD()) {
		var iframe = document.createElement("IFRAME");  
		var command ="viview:goBack";
		iframe.setAttribute("src",command);
		document.documentElement.appendChild(iframe);
		iframe.parentNode.removeChild(iframe);
		iframe = null;
	}
	else{
		location.href = "home.html";
	}
}
function GoHome(){
	GoBack();
}
function SetDefaultPDFCategory(id){
    var iframe = document.createElement("IFRAME");  
    var command ="viview:setDefaultPDFCategory:"+id;
    iframe.setAttribute("src",command);
    document.documentElement.appendChild(iframe);
    iframe.parentNode.removeChild(iframe);
    iframe = null;
    return oldId;
}

function ShowPopup(fileName,width,height,fitPage){
    var iframe = document.createElement("IFRAME");  
    var command ="viview:showPopup:"+fileName+":"+width+":"+height+":"+fitPage;
    iframe.setAttribute("src",command);
    document.documentElement.appendChild(iframe);
    iframe.parentNode.removeChild(iframe);
    iframe = null;
}

function ShowFullScreenPopup(fileName,width,height,fitPage){
    var iframe = document.createElement("IFRAME");  
    var command ="viview:showFullScreenPopup:"+fileName+":"+width+":"+height+":"+fitPage;
    iframe.setAttribute("src",command);
    document.documentElement.appendChild(iframe);
    iframe.parentNode.removeChild(iframe);
    iframe = null;
}

function ClosePopup(){
    var iframe = document.createElement("IFRAME");  
    var command ="viview:closePopup";
    iframe.setAttribute("src",command);
    document.documentElement.appendChild(iframe);
    iframe.parentNode.removeChild(iframe);
    iframe = null;
}

function ShowView(id){
	var iframe = document.createElement("IFRAME");  
	var command ="viview:showView:"+id;
	iframe.setAttribute("src",command);
	document.documentElement.appendChild(iframe);
	iframe.parentNode.removeChild(iframe);
	iframe = null;

}
function GoToPage(fileName){
//	if (isIPAD()) {
//		var iframe = document.createElement("IFRAME");  
//		var command ="viview:goToPage:"+fileName;
//		iframe.setAttribute("src",command);
//		document.documentElement.appendChild(iframe);
//		iframe.parentNode.removeChild(iframe);
//		iframe = null;
//	}
//	else{
		location.href = fileName;
//	}
}

