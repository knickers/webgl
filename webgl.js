var gl;
function initGL(canvas) {
	try {
		gl = canvas.getContext('experimental-webgl');
	} catch (e) {
	}
	if (!gl) {
		alert('Could not initialise WebGL, sorry :-(');
	}
}

function getShader(gl, id) {
	var shaderScript = document.getElementById(id);
	if (!shaderScript) {
		return null;
	}
	
	var str = '';
	var k = shaderScript.firstChild;
	while (k) {
		if (k.nodeType == 3) {
			str += k.textContent;
		}
		k = k.nextSibling;
	}
	
	var shader;
	if (shaderScript.type == 'x-shader/x-fragment') {
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	} else if (shaderScript.type == 'x-shader/x-vertex') {
		shader = gl.createShader(gl.VERTEX_SHADER);
	} else {
		return null;
	}
	
	gl.shaderSource(shader, str);
	gl.compileShader(shader);
	
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert(gl.getShaderInfoLog(shader));
		return null;
	}
	
	return shader;
}

var shaderProgram;
function initShaders() {
	var fragmentShader = getShader(gl, 'per-fragment-lighting-fs');
	var vertexShader = getShader(gl, 'per-fragment-lighting-vs');
	
	shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);
	
	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert('Could not initialise shaders');
	}
	
	gl.useProgram(shaderProgram);
	
	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
	
	shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, 'aVertexNormal');
	gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);
	
	shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, 'aTextureCoord');
	gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);
	
	shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
	gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
	
	shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, 'uPMatrix');
	shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, 'uMVMatrix');
	shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, 'uNMatrix');
	shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, 'uSampler');
	shaderProgram.materialShininessUniform = gl.getUniformLocation(shaderProgram, 'uMaterialShininess');
	shaderProgram.showSpecularHighlightsUniform = gl.getUniformLocation(shaderProgram, 'uShowSpecularHighlights');
	shaderProgram.useTexturesUniform = gl.getUniformLocation(shaderProgram, 'uUseTextures');
	shaderProgram.useLightingUniform = gl.getUniformLocation(shaderProgram, 'uUseLighting');
	shaderProgram.ambientColorUniform = gl.getUniformLocation(shaderProgram, 'uAmbientColor');
	shaderProgram.pointLightingLocationUniform = gl.getUniformLocation(shaderProgram, 'uPointLightingLocation');
	shaderProgram.pointLightingSpecularColorUniform = gl.getUniformLocation(shaderProgram, 'uPointLightingSpecularColor');
	shaderProgram.pointLightingDiffuseColorUniform = gl.getUniformLocation(shaderProgram, 'uPointLightingDiffuseColor');
}

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
	gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
	gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
	
	var normalMatrix = mat3.create();
	mat4.toInverseMat3(mvMatrix, normalMatrix);
	mat3.transpose(normalMatrix);
	gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix);
}

function degToRad(degrees) {
	return degrees * Math.PI / 180;
}

function useTextures(ok) {
	gl.uniform1i(shaderProgram.useTexturesUniform, ok);
	return ok;
}
function samplerUniform(num) {
	gl.uniform1i(shaderProgram.samplerUniform, num);
}
function materialShininess(num) {
	gl.uniform1f(shaderProgram.materialShininessUniform, num);
}

var drawHandlers = [];
function drawScene() {
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
	
	gl.uniform1i(shaderProgram.showSpecularHighlightsUniform, lighting.specularHighlights);
	
	gl.uniform1i(shaderProgram.useLightingUniform, lighting.enabled);
	lighting.draw();
	
	mat4.identity(mvMatrix);
	camera.transform(mvMatrix);
	
	samplerUniform(0);
	
	for (var i=0; i<drawHandlers.length; i++) {
		drawHandlers[i]();
	}
	
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

function resize(canvas) {
	var html = document.documentElement;
	var body = document.body;
	canvas.width = Math.max(
		body.clientWidth, body.offsetWidth,
		html.clientWidth, html.offsetWidth
	);
	canvas.height = Math.max(
		body.clientHeight, body.offsetHeight,
		html.clientHeight, html.offsetHeight
	);
	gl.viewportWidth = canvas.width;
	gl.viewportHeight = canvas.height;
}

var keyboard;
var lighting;
var camera;
var mouse;
function webGLStart() {
	var canvas = document.getElementById('canvas');
	
	initGL(canvas);
	initShaders();
	resize(canvas);
	window.addEventListener('resize', function(e) {
		resize(canvas);
		requestAnimFrame(tick);
	});
	
	var earthTexture = createTexture('earth.jpg');
	var galvanizedTexture = createTexture('arroway.de_metal+structure+06_d100_flat.jpg');
	
	keyboard = new Keyboard(canvas, tick);
	lighting = new Lighting();
	camera = new Camera([30,-30,30], [0,0,0], [0,0,1], true);
	mouse = new Mouse(canvas, tick);
	var sphere = new Sphere(5, 36, 36);
	var axis = new Axis(10);
	
	gl.clearColor(0.8, 0.8, 0.8, 1.0);
	gl.enable(gl.DEPTH_TEST);
	
	keyboard.addDownHandler(function(keys) { camera.keyboard(keys); });
	mouse.addMoveHandler(function(delta) { camera.mouse(delta); });
	mouse.addWheelHandler(function(delta) { camera.mouse(delta); });
	
	/*
	animationHandlers.push(function(elapsed) {
		earthAngle += 35/1000 * elapsed;
	});
	*/
	
	drawHandlers.push(function() {
		useTextures(false);
		materialShininess(0.0);
		axis.draw();
	});
	
	drawHandlers.push(function() {
		materialShininess(32.0);
		var texture = document.getElementById('texture').value;
		useTextures(texture != 'none');
		gl.activeTexture(gl.TEXTURE0);
		if (texture == 'earth') {
			gl.bindTexture(gl.TEXTURE_2D, earthTexture);
		} else if (texture == 'galvanized') {
			gl.bindTexture(gl.TEXTURE_2D, galvanizedTexture);
		}
		
		mat4.rotate(mvMatrix, degToRad(earthAngle), [0, 0, 1]);
			sphere.draw();
		mat4.rotate(mvMatrix, degToRad(-earthAngle), [0, 0, 1]);
	});
	
	tick();
	setTimeout(tick, 250);
}
