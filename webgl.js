var gl;

function initGL(canvas) {
try {
	gl = canvas.getContext('experimental-webgl');
} catch (e) {
}
if (!gl) {
	alert('Could not initialise WebGL, sorry :-(');
}

gl.mvMatrixStack = [];
gl.mvMatrix = mat4.create();
gl.pMatrix = mat4.create();
gl.drawHandlers = [];
gl.animationHandlers = [];
gl.lastAnimationTime = 0;

gl.getShader = function(id) {
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
};

gl.initShaders = function() {
	var fragmentShader = gl.getShader('per-fragment-lighting-fs');
	var vertexShader = gl.getShader('per-fragment-lighting-vs');
	
	gl.shaderProgram = gl.createProgram();
	gl.attachShader(gl.shaderProgram, vertexShader);
	gl.attachShader(gl.shaderProgram, fragmentShader);
	gl.linkProgram(gl.shaderProgram);
	
	if (!gl.getProgramParameter(gl.shaderProgram, gl.LINK_STATUS)) {
		alert('Could not initialise shaders');
	}
	
	gl.useProgram(gl.shaderProgram);
	
	gl.shaderProgram.vertexPositionAttribute = gl.getAttribLocation(gl.shaderProgram, 'aVertexPosition');
	gl.enableVertexAttribArray(gl.shaderProgram.vertexPositionAttribute);
	
	gl.shaderProgram.vertexNormalAttribute = gl.getAttribLocation(gl.shaderProgram, 'aVertexNormal');
	gl.enableVertexAttribArray(gl.shaderProgram.vertexNormalAttribute);
	
	gl.shaderProgram.textureCoordAttribute = gl.getAttribLocation(gl.shaderProgram, 'aTextureCoord');
	gl.enableVertexAttribArray(gl.shaderProgram.textureCoordAttribute);
	
	gl.shaderProgram.vertexColorAttribute = gl.getAttribLocation(gl.shaderProgram, "aVertexColor");
	gl.enableVertexAttribArray(gl.shaderProgram.vertexColorAttribute);
	
	gl.shaderProgram.pMatrixUniform = gl.getUniformLocation(gl.shaderProgram, 'uPMatrix');
	gl.shaderProgram.mvMatrixUniform = gl.getUniformLocation(gl.shaderProgram, 'uMVMatrix');
	gl.shaderProgram.nMatrixUniform = gl.getUniformLocation(gl.shaderProgram, 'uNMatrix');
	gl.shaderProgram.samplerUniform = gl.getUniformLocation(gl.shaderProgram, 'uSampler');
	gl.shaderProgram.materialShininessUniform = gl.getUniformLocation(gl.shaderProgram, 'uMaterialShininess');
	gl.shaderProgram.showSpecularHighlightsUniform = gl.getUniformLocation(gl.shaderProgram, 'uShowSpecularHighlights');
	gl.shaderProgram.useTexturesUniform = gl.getUniformLocation(gl.shaderProgram, 'uUseTextures');
	gl.shaderProgram.useLightingUniform = gl.getUniformLocation(gl.shaderProgram, 'uUseLighting');
	gl.shaderProgram.ambientColorUniform = gl.getUniformLocation(gl.shaderProgram, 'uAmbientColor');
	gl.shaderProgram.pointLightingLocationUniform = gl.getUniformLocation(gl.shaderProgram, 'uPointLightingLocation');
	gl.shaderProgram.pointLightingSpecularColorUniform = gl.getUniformLocation(gl.shaderProgram, 'uPointLightingSpecularColor');
	gl.shaderProgram.pointLightingDiffuseColorUniform = gl.getUniformLocation(gl.shaderProgram, 'uPointLightingDiffuseColor');
};

gl.buildTexture = function(imgSrc) {
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
};

gl.buildBuffer = function(GL_BUFFER, data, itemSize) {
	var buf = gl.createBuffer();
	gl.bindBuffer(GL_BUFFER, buf);
	gl.bufferData(GL_BUFFER, data, gl.STATIC_DRAW);
	
	buf.itemSize = itemSize;
	buf.numItems = data.length / itemSize;
	
	return buf;
};

gl.pushMatrix = function() {
	var copy = mat4.create();
	mat4.set(gl.mvMatrix, copy);
	gl.mvMatrixStack.push(copy);
};

gl.popMatrix = function() {
	if (gl.mvMatrixStack.length == 0) {
		throw 'Invalid popMatrix!';
	}
	gl.mvMatrix = gl.mvMatrixStack.pop();
};

gl.setMatrixUniforms = function() {
	var normalMatrix = mat3.create();
	mat4.toInverseMat3(gl.mvMatrix, normalMatrix);
	mat3.transpose(normalMatrix);
	
	gl.uniformMatrix4fv(
		gl.shaderProgram.pMatrixUniform,
		false, gl.pMatrix
	);
	gl.uniformMatrix4fv(
		gl.shaderProgram.mvMatrixUniform,
		false, gl.mvMatrix
	);
	gl.uniformMatrix3fv(
		gl.shaderProgram.nMatrixUniform,
		false, normalMatrix
	);
};

gl.materialShininess = function(num) {
	gl.uniform1f(gl.shaderProgram.materialShininessUniform, num);
};
gl.samplerUniform = function(num) {
	gl.uniform1i(gl.shaderProgram.samplerUniform, num);
};
gl.useTextures = function(ok) {
	gl.uniform1i(gl.shaderProgram.useTexturesUniform, ok);
};
gl.setTexture = function(texture) {
	gl.useTextures(!!texture);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture);
};

gl.draw = function() {
	gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	mat4.perspective(
		45,
		gl.drawingBufferWidth / gl.drawingBufferHeight,
		0.1, 100.0,
		gl.pMatrix
	);
	
	gl.uniform1i(
		gl.shaderProgram.showSpecularHighlightsUniform,
		gl.lighting.specularHighlights
	);
	gl.uniform1i(
		gl.shaderProgram.useLightingUniform,
		gl.lighting.enabled
	);
	gl.lighting.draw();
	
	mat4.identity(gl.mvMatrix);
	gl.camera.transform(gl.mvMatrix);
	
	gl.samplerUniform(0);
	
	for (var i=0; i<gl.drawHandlers.length; i++) {
		gl.drawHandlers[i]();
	}
};

gl.animate = function() {
	var now = new Date().getTime();
	if (gl.lastAnimationTime != 0) {
		var elapsed = now - gl.lastAnimationTime;
		
		for (var i=0; i<gl.animationHandlers.length; i++) {
			gl.animationHandlers[i](elapsed);
		}
	}
	gl.lastAnimationTime = now;
};

gl.tick = function() {
	//requestAnimFrame(tick);
	if (gl.animationHandlers.length || gl.keyboard.update()) {
		requestAnimFrame(gl.tick);
	}
	
	gl.animate();
	gl.draw();
};

gl.keyboard = new Keyboard(canvas, gl.tick);
gl.lighting = new Lighting();
gl.camera = new Camera([30,-30,30], [0,0,0], [0,0,1], true);
gl.mouse = new Mouse(canvas, gl.tick);

gl.initShaders();

gl.keyboard.addDownHandler(function(keys) { gl.camera.keyboard(keys);});
gl.mouse.addMoveHandler(function(delta) { gl.camera.mouse(delta); });
gl.mouse.addWheelHandler(function(delta) { gl.camera.mouse(delta); });

gl.clearColor(0.8, 0.8, 0.8, 1.0);
gl.enable(gl.DEPTH_TEST);

function dtor(degrees) { return degrees * Math.PI / 180; }
function rtod(radians) { return radians / Math.PI * 180; }
