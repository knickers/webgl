function Lighting() {
	this.enabled = true;
	this.specularHighlights = true;
	this.point = {
		position: {
			x: -50,
			y: 50,
			z: 100
		},
		specular: {
			r: 0.8,
			g: 0.8,
			b: 0.8
		},
		diffuse: {
			r: 0.8,
			g: 0.8,
			b: 0.8
		},
	};
	this.ambient = {
		color: {
			r: 0.5,
			g: 0.5,
			b: 0.5
		},
	};
}

Lighting.prototype.draw = function() {
	if (this.enabled) {
		gl.uniform3f(
			gl.shaderProgram.ambientColorUniform,
			this.ambient.color.r,
			this.ambient.color.g,
			this.ambient.color.b
		);
		
		gl.uniform3f(
			gl.shaderProgram.pointLightingLocationUniform,
			this.point.position.x,
			this.point.position.y,
			this.point.position.z
		);
		
		gl.uniform3f(
			gl.shaderProgram.pointLightingSpecularColorUniform,
			this.point.specular.r,
			this.point.specular.g,
			this.point.specular.b
		);
		
		gl.uniform3f(
			gl.shaderProgram.pointLightingDiffuseColorUniform,
			this.point.diffuse.r,
			this.point.diffuse.g,
			this.point.diffuse.b
		);
	}
};
