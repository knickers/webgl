function Mouse() {
	this.down = false;
	this.lastX = null;
	this.lastY = null;
}
Mouse.prototype.buttonDown = function(event) {
	this.down = true;
	this.lastX = event.clientX;
	this.lastY = event.clientY;
};
Mouse.prototype.buttonUp = function(event) {
	this.down = false;
};
Mouse.prototype.move = function(event) {
	if (!this.down) {
		return;
	}
	
	var delta = {
		x: event.clientX - this.lastX,
		y: event.clientY - this.lastY
	}
	
	this.lastX = event.clientX
	this.lastY = event.clientY;
	
	return delta;
};

