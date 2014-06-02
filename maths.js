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
