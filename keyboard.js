function Keyboard(animate) {
	this.pressed = {};
	this.animate = animate;
	this.downHandlers = [];
	this.upHandlers = [];
	this.handlers = [];
}

Keyboard.prototype.keyDown = function(event) {
	this.pressed[event.keyCode] = true;
	//console.log(event.keyCode);
	
	for (var i=0; i<this.downHandlers.length; i++) {
		this.downHandlers[i](this.pressed);
	}
	
	event.stopPropagation();
	requestAnimFrame(this.animate);
};

Keyboard.prototype.keyUp = function(event) {
	delete this.pressed[event.keyCode];
	
	for (var i=0; i<this.upHandlers.length; i++) {
		this.upHandlers[i](this.pressed);
	}
	
	event.stopPropagation();
};

Keyboard.prototype.update = function() {
	console.log('updating keys');
	for (var i=0; i<this.handlers.length; i++) {
		this.handlers[i](this.pressed);
	}
	if (this.pressed[189]) { // -
		//z += 0.05;
	}
	if (this.pressed[187]) { // = (use for +)
		//z -= 0.05;
	}
	
	return this.pressed.length > 0;
};

Keyboard.prototype.addDownHandler = function(handler) {
	if (handler) {
		this.downHandlers.push(handler);
	}
};

Keyboard.prototype.addUpHandler = function(handler) {
	if (handler) {
		this.upHandlers.push(handler);
	}
};

Keyboard.prototype.addHandler = function(handler) {
	if (handler) {
		this.handlers.push(handler);
	}
};
