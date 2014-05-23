var gl;
function initGL(canvas) {
	try {
		gl = canvas.getContext('experimental-webgl');
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
	} catch (e) {
	}
	if (!gl) {
		alert('Could not initialise WebGL, sorry :-(');
	}
}

var shader;

function createTexture(imgSrc) {
	var texture = gl.createTexture();
	texture.image = new Image();
	texture.image.onload = function () {
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
		gl.generateMipmap(gl.TEXTURE_2D);
		
		gl.bindTexture(gl.TEXTURE_2D, null);
	}
	texture.image.src = imgSrc;
	return texture;
}

function createBuffer(GL_BUFFER, data, itemSize) {
	var buf = gl.createBuffer();
	gl.bindBuffer(GL_BUFFER, buf);
	gl.bufferData(GL_BUFFER, data, gl.STATIC_DRAW);
	
	buf.itemSize = itemSize;
	buf.numItems = data.length / itemSize;
	
	return buf;
}

var mvMatrix = mat4.create();
var mvMatrixStack = [];
var pMatrix = mat4.create();
function mvPushMatrix() {
	var copy = mat4.create();
	mat4.set(mvMatrix, copy);
	mvMatrixStack.push(copy);
}

function mvPopMatrix() {
	if (mvMatrixStack.length == 0) {
		throw 'Invalid popMatrix!';
	}
	mvMatrix = mvMatrixStack.pop();
}

function setMatrixUniforms() {
	gl.uniformMatrix4fv(shader.program.pMatrixUniform, false, pMatrix);
	gl.uniformMatrix4fv(shader.program.mvMatrixUniform, false, mvMatrix);
	
	var normalMatrix = mat3.create();
	mat4.toInverseMat3(mvMatrix, normalMatrix);
	mat3.transpose(normalMatrix);
	gl.uniformMatrix3fv(shader.program.nMatrixUniform, false, normalMatrix);
}

function degToRad(degrees) {
	return degrees * Math.PI / 180;
}

function drawScene() {
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
	
	var specularHighlights = document.getElementById('specular').checked;
	gl.uniform1i(shader.program.showSpecularHighlightsUniform, specularHighlights);
	
	var lighting = document.getElementById('lighting').checked;
	gl.uniform1i(shader.program.useLightingUniform, lighting);
	if (lighting) {
		gl.uniform3f(
			shader.program.ambientColorUniform,
			parseFloat(document.getElementById('ambientR').value),
			parseFloat(document.getElementById('ambientG').value),
			parseFloat(document.getElementById('ambientB').value)
		);
		
		gl.uniform3f(
			shader.program.pointLightingLocationUniform,
			parseFloat(document.getElementById('positionX').value),
			parseFloat(document.getElementById('positionY').value),
			parseFloat(document.getElementById('positionZ').value)
		);
		
		gl.uniform3f(
			shader.program.pointLightingSpecularColorUniform,
			parseFloat(document.getElementById('specularR').value),
			parseFloat(document.getElementById('specularG').value),
			parseFloat(document.getElementById('specularB').value)
		);
		
		gl.uniform3f(
			shader.program.pointLightingDiffuseColorUniform,
			parseFloat(document.getElementById('diffuseR').value),
			parseFloat(document.getElementById('diffuseG').value),
			parseFloat(document.getElementById('diffuseB').value)
		);
	}
	
	gl.uniform1i(shader.program.useTexturesUniform, false);
	gl.uniform1i(shader.program.samplerUniform, 0);
	gl.uniform1f(shader.program.materialShininessUniform, 0.0);
	
	mat4.identity(mvMatrix);
	camera.transform(mvMatrix);
	
	//teapot.draw();
	axis.draw();
	
	gl.uniform1f(shader.program.materialShininessUniform, parseFloat(document.getElementById('shininess').value));
	var texture = document.getElementById('texture').value;
	gl.uniform1i(shader.program.useTexturesUniform, texture != 'none');
	gl.activeTexture(gl.TEXTURE0);
	if (texture == 'earth') {
		gl.bindTexture(gl.TEXTURE_2D, earthTexture);
	} else if (texture == 'galvanized') {
		gl.bindTexture(gl.TEXTURE_2D, galvanizedTexture);
	}
	
	mat4.rotate(mvMatrix, degToRad(earthAngle), [0, 0, 1]);
		sphere.draw();
	mat4.rotate(mvMatrix, degToRad(-earthAngle), [0, 0, 1]);
	//ellipse.draw();
}

var animationHandlers = [];
var earthAngle = 0;
var lastTime = 0;
function animate() {
	var timeNow = new Date().getTime();
	if (lastTime != 0) {
		var elapsed = timeNow - lastTime;
		
		for (var i=0; i<animationHandlers.length; i++) {
			animationHandlers[i](elapsed);
		}
	}
	lastTime = timeNow;
}

function tick() {
	//requestAnimFrame(tick);
	if (keyboard.update()) {
		requestAnimFrame(tick);
	}
	animate();
	
	drawScene();
}

var earthTexture;
var galvanizedTexture;

var keyboard;
var camera;
var mouse;
var teapot;
var sphere;
var ellipse;
var axis;
function webGLStart() {
	var canvas = document.getElementById('canvas');
	initGL(canvas);
	shader = new Shader(gl);
	
	earthTexture = createTexture('earth.jpg');
	galvanizedTexture = createTexture('arroway.de_metal+structure+06_d100_flat.jpg');
	
	keyboard = new Keyboard(canvas, tick);
	camera = new Camera([30,-30,30], [0,0,0], [0,0,1], true);
	mouse = new Mouse(canvas, tick);
	//teapot = new Teapot(180);
	ellipse = new Ellipse(7, 4, 10, [0,0,0]);
	sphere = new Sphere(5, 36, 36);
	axis = new Axis(10);
	
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);
	
	keyboard.addDownHandler(function(keys) { camera.keyboard(keys); });
	mouse.addMoveHandler(function(delta) { camera.mouse(delta); });
	mouse.addWheelHandler(function(delta) { camera.mouse(delta); });
	
	animationHandlers.push(function(elapsed) {
		//earthAngle += 35/1000 * elapsed;
		//teapot.animate(elapsed);
	});
	
	tick();
	setTimeout(tick, 250);
}
