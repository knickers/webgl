function Camera(eye, at, up, simpleTransform) {
	this.simple = simpleTransform;
	this.matrix = mat4.create();
	this.eye = vec3.create(eye); // Interpret as Point
	this.at = vec3.create(at); // Interpret as Point
	this.up = vec3.create(up);
	
	if (this.simple) {
		this.upAngle = 0;
		this.panAngle = 0;
		this.panAmount = Math.PI / 16;
		console.log(this.panAngle);
	} else {
	}
		console.log(this.panAngle);
	mat4.identity(this.matrix);
	mat4.translate(this.matrix, [0, 0, -40]);
	mat4.rotate(this.matrix, degToRad(-65), [1, 0, 0]);
	mat4.rotate(this.matrix, degToRad(-45), [0, 0, 1]);
};
Camera.prototype.move = function() {
};
/*
Camera.prototype.spherePoint = function() {
	double temp  = radius*cos(upAngle);
	point_out[0] = temp*cos(panAngle);
	point_out[1] = temp*sin(panAngle);
	point_out[2] = radius*sin(upAngle);
};
*/
Camera.prototype.transform = function() {
	if (this.simple) {
	} else {
		mat4.multiply(mvMatrix, this.matrix, this.matrix);
	}
};
Camera.prototype.keyboard = function(keys) {
	if (keys[37]) { // Left cursor key
		if (this.simple) {
			this.panAngle -= this.panAmount;
		}
	}
	if (keys[39]) { // Right cursor key
		if (this.simple) {
			this.panAngle += this.panAmount;
		}
	}
	if (keys[38]) { // Up cursor key
		if (this.simple) {
			this.upAngle += this.panAmount;
		}
	}
	if (keys[40]) { // Down cursor key
		if (this.simple) {
			this.upAngle -= this.panAmount;
		}
	}
	console.log('camera key handler', keys, this.panAngle);
};
Camera.prototype.mouse = function(delta) {
	if (delta) {
		if (this.simple) {
		} else {
			var rotationMatrix = mat4.create();
			mat4.identity(rotationMatrix);
			
			mat4.rotate(rotationMatrix, degToRad(delta.x / 10), [0, 0, 1]);
			mat4.rotate(rotationMatrix, degToRad(delta.y / 10), [1, 0, 0]);
			
			mat4.multiply(rotationMatrix, this.matrix, this.matrix);
		}
	}
};
