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
	var sphere = new Sphere(5, 36, 36);
	var earthAngle = dtor(-180);
	var earthSpeed = dtor(35) / 1000;
	var textures = {
		'earth': gl.buildTexture('earth.jpg'),
		'galvanized': gl.buildTexture('galvanized.jpg')
	};
	
/*	gl.animationHandlers.push(function(elapsed) {
		earthAngle += earthSpeed * elapsed;
	});*/
	
	gl.drawHandlers.push(function() {
		gl.useTextures(false);
		gl.materialShininess(0.0);
		axis.draw();
		
		gl.setTexture(textures[document.getElementById('texture').value]);
		gl.materialShininess(32.0);
		gl.rotate(earthAngle, [0, 0, 1]);
			sphere.draw();
		gl.rotate(-earthAngle, [0, 0, 1]);
	});
	
	gl.tick();
	setTimeout(gl.tick, 250);
}
