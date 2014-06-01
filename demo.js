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
	var canvas = document.getElementById('canvas');
	
	initGL(canvas);
	
	resize();
	window.addEventListener('resize', function(e) {
		resize();
		requestAnimFrame(gl.tick);
	});
	
	var earthTexture = gl.buildTexture('earth.jpg');
	var galvanizedTexture = gl.buildTexture('arroway.de_metal+structure+06_d100_flat.jpg');
	
	var sphere = new Sphere(5, 36, 36);
	var axis = new Axis(10);
	
	var earthAngle = 0;
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
		
		var texture = document.getElementById('texture').value;
		gl.useTextures(texture != 'none');
		gl.activeTexture(gl.TEXTURE0);
		if (texture == 'earth') {
			gl.bindTexture(gl.TEXTURE_2D, earthTexture);
		} else if (texture == 'galvanized') {
			gl.bindTexture(gl.TEXTURE_2D, galvanizedTexture);
		}
		
		gl.materialShininess(32.0);
		mat4.rotate(gl.mvMatrix, earthAngle, [0, 0, 1]);
			sphere.draw();
		mat4.rotate(gl.mvMatrix, -earthAngle, [0, 0, 1]);
	});
	
	gl.tick();
	setTimeout(gl.tick, 250);
	
	
	// testing grounds
	
}
