function resize() {
	var body = document.body;
	gl.canvas.width = Math.max(body.clientWidth, body.offsetWidth);
	gl.canvas.height = Math.max(body.clientHeight, body.offsetHeight);
}

function webGLStart() {
	initGL(document.getElementById('canvas'));
	
	resize();
	window.addEventListener('resize', resize);
	
	var axis = new Axis(10);
	var angle = dtor(-180);
	var speed = dtor(35) / 1000;
	var shape = document.getElementById('shape');
	var shapes = {
		'sphere': new Sphere(5, 36, 36),
		'cylinder': new Cylinder(4, 8, 36, true)
	};
	var rotate = document.getElementById('rotate');
	var texture = document.getElementById('texture');
	var textures = {
		'earth': gl.buildTexture('earth.jpg'),
		'galvanized': gl.buildTexture('galvanized.jpg')
	};
	
	gl.animationHandlers.push(function(elapsed) {
		if (rotate.checked) {
			angle += speed * elapsed;
		}
		return rotate.checked;
	});
	
	gl.drawHandlers.push(function() {
		gl.useTextures(false);
		gl.materialShininess(0.0);
		axis.draw();
		
		gl.setTexture(textures[texture.value]);
		gl.materialShininess(32.0);
		gl.rotate(angle, [0, 0, 1]);
			if (shapes[shape.value]) {
				shapes[shape.value].draw();
			}
		gl.rotate(-angle, [0, 0, 1]);
	});
	
	gl.tick();
	setTimeout(gl.tick, 250);
}
