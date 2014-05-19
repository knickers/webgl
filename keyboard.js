function Keyboard(canvas, animate) {
	this.animate = animate;
	this.pressed = {};
	this.downHandlers = [];
	this.upHandlers = [];
	this.handlers = [];
	
	var self = this;
	/* Not working :-(
	canvas.addEventListener('keydown', function(e) { self.keyDown(e); }, true);
	canvas.addEventListener('keyup', function(e) { self.keyUp(e); }, true);
	*/
	document.onkeydown = function(e) { self.keyDown(e); };
	document.onkeyup = function(e) { self.keyUp(e); };
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
	for (var i=0; i<this.handlers.length; i++) {
		this.handlers[i](this.pressed);
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
