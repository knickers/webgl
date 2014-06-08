/******************************************************************************/
/**************************** Math Helper Functions ***************************/
/******************************************************************************/

function dtor(degrees) { return degrees * Math.PI / 180; }
function rtod(radians) { return radians / Math.PI * 180; }

// Law Of Cosines, angle
// Returns the radian angle of angleA (accross from sideA)
function LOCangle(sideA, sideB, sideC) {
	return Math.acos(
		(sideB*sideB + sideC*sideC - sideA*sideA) / (2 * sideB * sideC)
	);
}

// Law Of Cosines, side
// Returns the length of sideA (accross from angleA)
function LOCside(angleA, sideB, sideC) {
	return Math.sqrt(
		sideB*sideB + sideC*sideC - 2 * sideB * sideC * Math.cos(angleA)
	);
}

// Distance between two points
// The points can either be arrays or objects with x, y and z properties
function pointDist(p1, p2) {
	var a=0, b=0, c=0;
	if (p1 instanceof Array) {
		a = p1[0] - p2[0];
		b = p1[1] - p2[1];
		c = p1[2] - p2[2];
	} else { // if (p1 instanceof Object) {
		a = p1.x - p2.x;
		b = p1.y - p2.y;
		c = p1.z - p2.z;
	}
	return Math.sqrt(a*a + b*b + c*c);
}

/******************************************************************************/
/************************** General Helper Functions **************************/
/******************************************************************************/

// Returns a new object with the merged obj1 and obj2 values
// Favors obj2's values over obj1's
function merge(obj1, obj2) {
	var obj = {};
	for (var key in obj1) { obj[key] = obj1[key]; }
	for (var key in obj2) { obj[key] = obj2[key]; }
	return obj;
}

// Overwrites obj1's values with obj2's
function extend(obj1, obj2) {
	for (var key in obj2) { obj1[key] = obj2[key]; }
}

// Returns the first argument that is defined
function or() {
	for (var i=0; i<arguments.length; i++) {
		if (typeof(arguments[i]) !== 'undefined') {
			return arguments[i];
		}
	}
}
