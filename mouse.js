function Mouse(animate) {
	this.animate = animate;
	this.x = null;
	this.y = null;
	this.down = false;
	this.downHandlers = [];
	this.upHandlers = [];
	this.moveHandlers = [];
}

Mouse.prototype.buttonDown = function(event) {
	this.down = true;
	this.x = event.clientX;
	this.y = event.clientY;
	
	for (var i=0; i<this.downHandlers.length; i++) {
		this.downHandlers[i]({x: this.x, y: this.y});
	}
	
	requestAnimFrame(this.animate);
};

Mouse.prototype.buttonUp = function(event) {
	this.down = false;
	
	for (var i=0; i<this.upHandlers.length; i++) {
		this.upHandlers[i]();
	}
	
	requestAnimFrame(this.animate);
};

Mouse.prototype.move = function(event) {
	if (!this.down) {
		return;
	}
	
	var delta = {
		x: event.clientX - this.x,
		y: event.clientY - this.y
	}
	
	this.x = event.clientX
	this.y = event.clientY;
	
	for (var i=0; i<this.moveHandlers.length; i++) {
		this.moveHandlers[i](delta);
	}
	
	requestAnimFrame(this.animate);
};

Mouse.prototype.wheel = function(event) {
	var delta = event.wheelDelta || -event.detail; // firefox is weird
	
	for (var i=0; i<this.wheelHandlers.length; i++) {
		this.wheelHandlers[i](delta);
	}
	
	requestAnimFrame(this.animate);
};

Mouse.prototype.addDownHandler = function(handler) {
	if (handler) {
		this.downHandlers.push(handler);
	}
};

Mouse.prototype.addUpHandler = function(handler) {
	if (handler) {
		this.upHandlers.push(handler);
	}
};

Mouse.prototype.addMoveHandler = function(handler) {
	if (handler) {
		this.moveHandlers.push(handler);
	}
};

Mouse.prototype.addWheelHandler = function(handler) {
	if (handler) {
		this.wheelHandlers.push(handler);
	}
};

