function Keyboard(canvas) {
	this.pressed = {};
	this.updateHandlers = [];
	this.downHandlers = [];
	this.upHandlers = [];
	this.updated = true;
	
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
	this.updated = true;
};

Keyboard.prototype.keyUp = function(event) {
	delete this.pressed[event.keyCode];
	
	for (var i=0; i<this.upHandlers.length; i++) {
		this.upHandlers[i](this.pressed);
	}
	
	event.stopPropagation();
	this.updated = true;
};

Keyboard.prototype.update = function() {
	for (var i=0; i<this.updateHandlers.length; i++) {
		this.updateHandlers[i](this.pressed);
	}
	
	var updated = this.updated;
	this.updated = false;
	return updated || this.pressed.length > 0;
};
