function Mouse(canvas) {
	this.x = null;
	this.y = null;
	this.dist = null;
	this.down = false;
	this.downHandlers = [];
	this.upHandlers = [];
	this.moveHandlers = [];
	this.wheelHandlers = [];
	this.updated = true;
	
	var self = this;
	// Standard mouse inputs
	canvas.onmousedown = function(e) { self.buttonDown(e); };
	document.onmouseup = function(e) { self.buttonUp(e); };
	document.onmousemove = function(e) { self.move(e); };
	canvas.onmousewheel = function(e) { self.wheel(e); };
	canvas.DOMMouseScroll = function(e) { self.wheel(e); }; // Poor Firefox
	
	// Touch screen inputs
	canvas.addEventListener('touchstart', function(e) {
		e.preventDefault();
		self.buttonDown(e);
	});
	document.addEventListener('touchmove', function(e) {
		e.preventDefault();
		self.move(e);
	});
	document.addEventListener('touchend', function(e) {
		e.preventDefault();
		self.buttonUp(e);
	});
	document.addEventListener('touchcancel', function(e) {
		e.preventDefault();
		self.buttonUp(e);
	});
}

Mouse.prototype.touchDist = function(touches) {
	if (touches && touches.length > 1) {
		return pointDist(
			[touches[0].pageX, touches[0].pageY, 0],
			[touches[1].pageX, touches[1].pageY, 0]
		);
	}
	return null;
};

Mouse.prototype.buttonDown = function(event) {
	if (event.touches) {
		if (event.touches.length === 1) {
			event.clientX = event.touches[0].pageX;
			event.clientY = event.touches[0].pageY;
		} else if (event.touches.length === 2) {
			this.dist = this.touchDist(event.touches);
		} else {
			return;
		}
	}
	
	this.down = true;
	this.x = event.clientX;
	this.y = event.clientY;
	
	for (var i=0; i<this.downHandlers.length; i++) {
		this.downHandlers[i]({x: this.x, y: this.y});
	}
	
	this.updated = true;
};

Mouse.prototype.buttonUp = function(event) {
	if (event.touches) {
		if (event.touches.length === 0) {
		} else if (event.touches.length === 1) {
			this.x = event.touches[0].pageX;
			this.y = event.touches[0].pageY;
			this.dist = null;
			return;
		} else {
			return;
		}
	}
	
	this.down = false;
	
	for (var i=0; i<this.upHandlers.length; i++) {
		this.upHandlers[i]();
	}
	
	this.updated = true;
};

Mouse.prototype.move = function(event) {
	if (event.touches) {
		if (event.touches.length === 1) { // regular mouse move event
			event.clientX = event.touches[0].pageX;
			event.clientY = event.touches[0].pageY;
		} else if (event.touches.length === 2) { // pinch to zoom
			this.wheel(event);
			return;
		} else {
			return;
		}
	}
	
	if (!this.down) {
		return;
	}
	
	var delta = {
		x: event.clientX - this.x,
		y: event.clientY - this.y
	};
	
	this.x = event.clientX;
	this.y = event.clientY;
	
	for (var i=0; i<this.moveHandlers.length; i++) {
		this.moveHandlers[i](delta);
	}
	
	this.updated = true;
};

Mouse.prototype.wheel = function(event) {
	if (event.touches) {
		if (event.touches.length === 2) {
			var dist = this.touchDist(event.touches);
			if (this.dist == null) {
				this.dist = dist;
			}
			event.wheelDelta = (dist - this.dist) * 10;
			this.dist = dist;
		} else {
			return;
		}
	}
	
	var delta = event.wheelDelta || -event.detail; // firefox is weird
	
	for (var i=0; i<this.wheelHandlers.length; i++) {
		this.wheelHandlers[i](delta);
	}
	
	this.updated = true;
};

Mouse.prototype.update = function() {
	var updated = this.updated;
	this.updated = false;
	return updated;
};
