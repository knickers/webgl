function Camera(eye, at, up, simpleTransform) {
	this.simple = simpleTransform;
	
	if (this.simple) {
		this.distance = 40;
		this.upAngle = -Math.PI / 3;
		this.panAngle = -Math.PI / 4;
		this.panAmount = Math.PI / 16;
	} else {
		this.matrix = mat4.create();
		this.eye = vec3.create(eye); // Interpret as Point
		this.at = vec3.create(at); // Interpret as Point
		this.up = vec3.create(up);
	}
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

Camera.prototype.transform = function(matrix) {
	if (this.simple) {
		mat4.translate(matrix, [0, 0, -this.distance]);
			mat4.rotate(matrix, this.upAngle, [1, 0, 0]);
				mat4.rotate(matrix, this.panAngle, [0, 0, 1]);
	} else {
		mat4.multiply(matrix, this.matrix, this.matrix);
	}
};

Camera.prototype.keyboard = function(keys) {
	if (keys[37]) { // Left cursor key
		if (this.simple) {
			this.panAngle += this.panAmount;
		}
	}
	if (keys[38]) { // Up cursor key
		if (this.simple) {
			this.upAngle += this.panAmount;
		}
	}
	if (keys[39]) { // Right cursor key
		if (this.simple) {
			this.panAngle -= this.panAmount;
		}
	}
	if (keys[40]) { // Down cursor key
		if (this.simple) {
			this.upAngle -= this.panAmount;
		}
	}
	if (keys[189]) { // -
		if (this.simple) {
			this.distance += this.panAmount * 10;
		}
	}
	if (keys[187]) { // = (use for +)
		if (this.simple) {
			this.distance -= this.panAmount * 10;
		}
	}
};

Camera.prototype.mouse = function(delta) {
	if (typeof delta === 'number') {
		if (this.simple) {
			this.distance -= delta / 100;
		}
	} else {
		if (this.simple) {
			this.upAngle += delta.y * this.distance / 1000;
			this.panAngle += delta.x * this.distance / 1000;
		} else {
			var rotationMatrix = mat4.create();
			mat4.identity(rotationMatrix);
			
			mat4.rotate(rotationMatrix, degToRad(delta.x / 10), [0, 0, 1]);
			mat4.rotate(rotationMatrix, degToRad(delta.y / 10), [1, 0, 0]);
			
			mat4.multiply(rotationMatrix, this.matrix, this.matrix);
		}
	}
};
