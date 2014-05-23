function Shader(GL) {
	var fragmentShader = this.getShader(GL, 'per-fragment-lighting-fs');
	var vertexShader = this.getShader(GL, 'per-fragment-lighting-vs');
	
	this.program = GL.createProgram();
	GL.attachShader(this.program, vertexShader);
	GL.attachShader(this.program, fragmentShader);
	GL.linkProgram(this.program);
	
	if (!GL.getProgramParameter(this.program, GL.LINK_STATUS)) {
		alert('Could not initialise shaders');
	}
	
	GL.useProgram(this.program);
	
	this.program.vertexPositionAttribute = GL.getAttribLocation(this.program, 'aVertexPosition');
	GL.enableVertexAttribArray(this.program.vertexPositionAttribute);
	
	this.program.vertexNormalAttribute = GL.getAttribLocation(this.program, 'aVertexNormal');
	GL.enableVertexAttribArray(this.program.vertexNormalAttribute);
	
	this.program.textureCoordAttribute = GL.getAttribLocation(this.program, 'aTextureCoord');
	GL.enableVertexAttribArray(this.program.textureCoordAttribute);
	
	this.program.pMatrixUniform = GL.getUniformLocation(this.program, 'uPMatrix');
	this.program.mvMatrixUniform = GL.getUniformLocation(this.program, 'uMVMatrix');
	this.program.nMatrixUniform = GL.getUniformLocation(this.program, 'uNMatrix');
	this.program.samplerUniform = GL.getUniformLocation(this.program, 'uSampler');
	this.program.materialShininessUniform = GL.getUniformLocation(this.program, 'uMaterialShininess');
	this.program.showSpecularHighlightsUniform = GL.getUniformLocation(this.program, 'uShowSpecularHighlights');
	this.program.useTexturesUniform = GL.getUniformLocation(this.program, 'uUseTextures');
	this.program.useLightingUniform = GL.getUniformLocation(this.program, 'uUseLighting');
	this.program.ambientColorUniform = GL.getUniformLocation(this.program, 'uAmbientColor');
	this.program.pointLightingLocationUniform = GL.getUniformLocation(this.program, 'uPointLightingLocation');
	this.program.pointLightingSpecularColorUniform = GL.getUniformLocation(this.program, 'uPointLightingSpecularColor');
	this.program.pointLightingDiffuseColorUniform = GL.getUniformLocation(this.program, 'uPointLightingDiffuseColor');
}

Shader.prototype.getShader = function(GL, id) {
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
		shader = GL.createShader(GL.FRAGMENT_SHADER);
	} else if (shaderScript.type == 'x-shader/x-vertex') {
		shader = GL.createShader(GL.VERTEX_SHADER);
	} else {
		return null;
	}
	
	GL.shaderSource(shader, str);
	GL.compileShader(shader);
	
	if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {
		alert(GL.getShaderInfoLog(shader));
		return null;
	}
	
	return shader;
}

