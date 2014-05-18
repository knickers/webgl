function Mouse() {
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
};

Mouse.prototype.buttonUp = function(event) {
	this.down = false;
	
	for (var i=0; i<this.upHandlers.length; i++) {
		this.upHandlers[i]();
	}
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

