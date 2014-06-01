function resize() {
	var html = document.documentElement;
	var body = document.body;
	gl.canvas.width = Math.max(
		body.clientWidth, body.offsetWidth,
		html.clientWidth, html.offsetWidth
	);
	gl.canvas.height = Math.max(
		body.clientHeight, body.offsetHeight,
		html.clientHeight, html.offsetHeight
	);
}

function webGLStart() {
	initGL(document.getElementById('canvas'));
	
	resize();
	window.addEventListener('resize', function(e) {
		resize();
		requestAnimFrame(gl.tick);
	});
	
	var textures = {
		'earth': gl.buildTexture('earth.jpg'),
		'galvanized': gl.buildTexture('galvanized.jpg')
	};
	var earthAngle = 0;
	var sphere = new Sphere(5, 36, 36);
	var axis = new Axis(10);
	
	/*
	var amount = dtor(35);
	animationHandlers.push(function(elapsed) {
		earthAngle += amount / 1000 * elapsed;
	});
	*/
	
	gl.drawHandlers.push(function() {
		gl.useTextures(false);
		gl.materialShininess(0.0);
		axis.draw();
		
		gl.setTexture(textures[document.getElementById('texture').value]);
		gl.materialShininess(32.0);
		mat4.rotate(gl.mvMatrix, earthAngle, [0, 0, 1]);
			sphere.draw();
		mat4.rotate(gl.mvMatrix, -earthAngle, [0, 0, 1]);
	});
	
	gl.tick();
	setTimeout(gl.tick, 250);
}
