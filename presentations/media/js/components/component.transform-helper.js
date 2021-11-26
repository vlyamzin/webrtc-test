var RotationAxis = {
	X_AXIS : "X_AXIS",
	Y_AXIS : "Y_AXIS",
	Z_AXIS : "Z_AXIS"
};

function GetRotationX(_DomElement){
	return 	GetRotation(_DomElement, RotationAxis.X_AXIS);
}

function GetRotationY(_DomElement){
	return 	GetRotation(_DomElement, RotationAxis.Y_AXIS);
}

function GetRotationZ(_DomElement){
	return GetRotation(_DomElement, RotationAxis.Z_AXIS);
}

function GetRotation(_DomElement, _RotationAxis){
	_RotationAxis = (undefined == _RotationAxis) ? RotationAxis.Z_AXIS : _RotationAxis;
	var computedStyles = window.getComputedStyle(_DomElement, null);
	var szTransformationMatrix = computedStyles.getPropertyValue("-webkit-transform");
	var transformationMatrix = ParseMatrix(szTransformationMatrix);
	var cosinus = GetCosinusFromMatrix(transformationMatrix, _RotationAxis);
	var negativeSinus = GetNegativeSinusFromMatrix(transformationMatrix, _RotationAxis);	
	var angle = Math.round(Math.atan2(cosinus, negativeSinus) * (180/Math.PI));
	//console.log("GetRotation _DomElement:" + _DomElement.id + " _RotationAxis:" + _RotationAxis + " angle:" + angle);
	return angle;
}

/**
 * @returns un tableau contenant toutes les valeurs de la matrice passée en parametre
 */
function ParseMatrix(_SZMatrix){
	var matrix = _SZMatrix.split('(')[1];
	matrix = matrix.split(')')[0];
	matrix = matrix.split(',');
	//console.log("ParseMatrix ret:" + matrix);
	return matrix;
}


function GetCosinusFromMatrix(_TransformationMatrix, _RotationAxis){
	var cosinus = 0;
	switch(_RotationAxis){
		case RotationAxis.X_AXIS:
			break;
		case RotationAxis.Y_AXIS:
			cosinus = _TransformationMatrix[2];
			break;
		case RotationAxis.Z_AXIS:
			cosinus = _TransformationMatrix[1];
			break;
		default :
			console.log("GetCosinusFromMatrix _RotationAxis not well defined : " + _RotationAxis);
			break;
	}
	return cosinus;
}

function GetNegativeSinusFromMatrix(_TransformationMatrix, _RotationAxis){
	var negativeSinus = 0;
	switch(_RotationAxis){
		case RotationAxis.X_AXIS:
			break;
		case RotationAxis.Y_AXIS:
			negativeSinus = _TransformationMatrix[0];
			break;
		case RotationAxis.Z_AXIS:
			negativeSinus = _TransformationMatrix[0];
			break;
		default :
			console.log("GetNegativeSinusFromMatrix _RotationAxis not well defined : " + _RotationAxis);
			break;
	}
	return negativeSinus;
}