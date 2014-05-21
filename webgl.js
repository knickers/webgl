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

function createBuffer(GL_BUFFER, data, itemSize, numItems) {
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

function drawScene() {
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
	
	gl.uniform1i(shaderProgram.showSpecularHighlightsUniform, lighting.specularHighlights);
	
	gl.uniform1i(shaderProgram.useLightingUniform, lighting.enabled);
	lighting.draw();
	
	gl.uniform1i(shaderProgram.useTexturesUniform, false);
	gl.uniform1i(shaderProgram.samplerUniform, 0);
	gl.uniform1f(shaderProgram.materialShininessUniform, 0.0);
	
	mat4.identity(mvMatrix);
	camera.transform(mvMatrix);
	
	//teapot.draw();
	axis.draw();
	
	gl.uniform1f(shaderProgram.materialShininessUniform, parseFloat(document.getElementById('shininess').value));
	var texture = document.getElementById('texture').value;
	gl.uniform1i(shaderProgram.useTexturesUniform, texture != 'none');
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
var lighting;
var camera;
var mouse;
var teapot;
var sphere;
var ellipse;
var axis;
function webGLStart() {
	var canvas = document.getElementById('canvas');
	initGL(canvas);
	initShaders();
	
	earthTexture = createTexture('earth.jpg');
	galvanizedTexture = createTexture('arroway.de_metal+structure+06_d100_flat.jpg');
	
	keyboard = new Keyboard(canvas, tick);
	lighting = new Lighting();
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
