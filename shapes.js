function draw(GL_SHAPE, obj) {
	gl.bindBuffer(gl.ARRAY_BUFFER, obj.vertexBuffer);
	gl.vertexAttribPointer(
		gl.shaderProgram.vertexPositionAttribute,
		obj.vertexBuffer.itemSize,
		gl.FLOAT, false, 0, 0
	);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, obj.normalBuffer);
	gl.vertexAttribPointer(
		gl.shaderProgram.vertexNormalAttribute,
		obj.normalBuffer.itemSize,
		gl.FLOAT, false, 0, 0
	);
	
	if (obj.textureBuffer) {
		gl.bindBuffer(gl.ARRAY_BUFFER, obj.textureBuffer);
		gl.vertexAttribPointer(
			gl.shaderProgram.textureCoordAttribute,
			obj.textureBuffer.itemSize,
			gl.FLOAT, false, 0, 0
		);
	}
	
	if (obj.colorBuffer) {
		gl.bindBuffer(gl.ARRAY_BUFFER, obj.colorBuffer);
		gl.vertexAttribPointer(
			gl.shaderProgram.vertexColorAttribute,
			obj.colorBuffer.itemSize,
			gl.FLOAT, false, 0, 0
		);
	}
	
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexBuffer);
	gl.setMatrixUniforms();
	gl.drawElements(GL_SHAPE, obj.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}

function makeBuffers(obj) {
	obj.vertexBuffer = gl.buildBuffer(
		gl.ARRAY_BUFFER, new Float32Array(obj.vertices), 3
	);
	obj.normalBuffer = gl.buildBuffer(
		gl.ARRAY_BUFFER, new Float32Array(obj.normals), 3
	);
	if (obj.textures) {
		obj.textureBuffer = gl.buildBuffer(
			gl.ARRAY_BUFFER, new Float32Array(obj.textures), 2
		);
	}
	if (obj.colors) {
		obj.colorBuffer = gl.buildBuffer(
			gl.ARRAY_BUFFER, new Float32Array(obj.colors), 4
		);
	}
	obj.indexBuffer = gl.buildBuffer(
		gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(obj.indices), 1
	);
}

function buildFromJSON(self, obj) {
	self.vertices = obj.vertices;
	self.normals = obj.normals;
	self.textures = obj.textures;
	self.colors = obj.colors;
	self.indices = obj.indices;
	makeBuffers(self);
}

function Line(points, colors) {
	var l = points.length;
	var n = l / 3;
	if (l < 6 || l % 3 !== 0) { return null; }
	this.vertices = points;
	this.normals = [];
	while (l > this.normals.length) {
		this.normals.push(0,0,0); // TODO what is the normal of a line?
	}
	this.textures = [];
	this.colors = colors;
	this.indices = [];
	for (var i=0; i<n; i++) {
		var j = i / (n-1);
		this.textures.push(j, j);
		this.indices.push(i);
	}
	while (n > this.colors.length / 4) {
		this.colors = this.colors.concat(colors);
	}
	makeBuffers(this);
}
Line.prototype.draw = function() { draw(gl.LINE_STRIP, this); };

function Axis(length) {
	this.origin = [0,0,0];
	this.axis = [
		new Line(this.origin.concat([length,0,0]), [1,0,0,1]),
		new Line(this.origin.concat([0,length,0]), [0,1,0,1]),
		new Line(this.origin.concat([0,0,length]), [0,0,1,1]),
	];
}
Axis.prototype.draw = function() {
	for (var i=0; i<this.axis.length; i++) {
		this.axis[i].draw();
	}
};

function Ellipse(rX, rY, res, center) {
	this.normals = [0,0,1];
	this.vertices = center;
	this.textures = [0.5, 0.5];
	this.colors = [1,1,1,1];
	this.indices = [0];
	var origin = [0,0,0];
	
	for (var i=0; i<=res; i++) {
		var theta = i/res * 2 * Math.PI;
		var sin = Math.sin(theta);
		var cos = Math.cos(theta);
		
		var topR = pointDist(origin, [center[0]*cos, center[1]*sin, 0]);
		var botR = pointDist(origin, [rX*cos, rY*sin, 0]);
		var tilt = Math.atan2(center[2], topR - botR);
		var sinT = Math.sin(tilt);
		
		this.normals.push(cos*sinT, sin*sinT, Math.cos(tilt));
		this.vertices.push(rX*cos, rY*sin, 0);
		this.textures.push(cos/2 + 0.5, sin/2 + 0.5);
		this.colors.push(1,1,1,1);
		this.indices.push(i+1);
	}
	
	makeBuffers(this);
}
Ellipse.prototype.draw = function() { draw(gl.TRIANGLE_FAN, this); };

function Circle(r, res) {
	this.__proto__ = new Ellipse(r, r, res, [0,0,0]);
}

function Cone(r, h, res) {
	this.__proto__ = new Ellipse(r, r, res, [0,0,h]);
}

function EllipticalCylinder(botRX, botRY, topRX, topRY, h, res, solid) {
	this.solid = solid;
	this.height = h;
	this.normals = [];
	this.vertices = [];
	this.textures = [];
	this.colors = [];
	this.indices = [];
	var origin = [0,0,0];
	
	if (this.solid) {
		this.botCap = new Ellipse(botRX, botRY, res, origin);
		this.topCap = new Ellipse(topRX, topRY, res, origin);
	}
	
	for (var i=0; i<=res; i++) {
		var theta = i/res * 2 * Math.PI;
		var sin = Math.sin(theta);
		var cos = Math.cos(theta);
		
		var topR = pointDist(origin, [topRX*cos, topRY*sin, 0]);
		var botR = pointDist(origin, [botRX*cos, botRY*sin, 0]);
		var tilt = Math.atan2(h, topR - botR);
		var sinT = Math.sin(tilt);
		
		for (var j=0; j<2; j++) { // 0 = bottom, 1 = top
			var x = j ? topRX : botRX;
			var y = j ? topRY : botRY;
			this.normals.push(cos*sinT, sin*sinT, Math.cos(tilt));
			this.vertices.push(x*cos, y*sin, j*h);
			this.textures.push(i/res, j);
			this.colors.push(1,1,1,1);
			this.indices.push(i*2 + j);
		}
	}
	
	makeBuffers(this);
}
EllipticalCylinder.prototype.draw = function() {
	if (this.solid) {
		this.botCap.draw();
		// TODO the top cap is incorrectly the same shape as the bottom cap
		gl.translate([0, 0, this.height]);
			this.topCap.draw();
		gl.translate([0, 0, -this.height]);
	}
	draw(gl.TRIANGLE_STRIP, this);
};

function Cylinder(r, h, res, solid) {
	this.__proto__ = new EllipticalCylinder(r, r, r, r, h, res, solid);
}

function Sphere(r, lats, lngs) {
	this.normals = [];
	this.vertices = [];
	this.textures = [];
	this.colors = [];
	this.indices = [];
	for (var lat=0; lat<=lats; lat++) {
		var theta = lat * Math.PI / lats;
		var sinTheta = Math.sin(theta);
		var cosTheta = Math.cos(theta);
		
		for (var lng=0; lng<=lngs; lng++) {
			var phi = lng * 2 * Math.PI / lngs;
			var sinPhi = Math.sin(phi);
			var cosPhi = Math.cos(phi);
			
			var x = cosPhi * sinTheta;
			var y = sinPhi * sinTheta;
			var z = cosTheta;
			this.normals.push(x, y, z);
			this.vertices.push(r*x, r*y, r*z);
			this.textures.push(lng/lngs, 1-(lat/lats));
			this.colors.push(1,1,1,1);
			
			if (lat < lats && lng < lngs) {
				var first = (lat * (lngs + 1)) + lng;
				var second = first + lngs + 1;
				this.indices.push(first, second, first + 1);
				this.indices.push(second, second + 1, first + 1);
			}
		}
	}
	
	makeBuffers(this);
}
Sphere.prototype.draw = function() { draw(gl.TRIANGLES, this); };

function Lathe(outline, radians, res) {
	this.normals = [];
	this.vertices = [];
	this.textures = [];
	this.colors = [];
	this.indices = [];
	
	var size = outline.length;
	var inc = radians / res;
	for (var i=0; i<size; i+=2 ) {
		var p1 = [outline[i], outline[i+1]];
		var p2 = [outline[i+2], outline[i+3]];
		
		var theta;
		if (i==0) {
			theta = Math.atan2(p2[1]-p1[1], p2[0]-p1[0]);
		} else if (i == size-1) {
		}
		var sinTheta = Math.sin(theta);
		var cosTheta = Math.cos(theta);
		
		for (var phi=0; phi<=radians; phi+=inc) {
			var sinPhi = Math.sin(phi);
			var cosPhi = Math.cos(phi);
			
			var x = cosPhi * sinTheta;
			var y = sinPhi * sinTheta;
			var z = p1[1];
			this.normals.push(x, y, z);
			this.vertices.push(r*x, r*y, r*z);
			
			var u = 1 - (phi / radians);
			var v = 1 - (i / size);
			this.textures.push(u, v);
			this.colors.push(1,1,1,1);
			
			if (lat < lats && lng < lngs) {
				var first = (lat * (lngs + 1)) + lng;
				var second = first + lngs + 1;
				this.indices.push(first, second, first + 1);
				this.indices.push(second, second + 1, first + 1);
			}
		}
	}
}
Lathe.prototype.draw = function() { draw(gl.TRIANGLES, this); };

