class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.gl = canvas.getContext('webgl');

        if (!this.gl) {
            throw new Error('WebGL not supported');
        }

        this.program = this.createProgram();
        this.setupGeometry();
        this.rotation = 0;

        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    createShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('Shader compilation error:', this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    createProgram() {
        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);

        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);

        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.error('Program linking error:', this.gl.getProgramInfoLog(program));
            return null;
        }

        return program;
    }

    setupGeometry() {
        // Create a simple spinner (triangle segments arranged in a circle)
        const segments = 8;
        const vertices = [];

        for (let i = 0; i < segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const nextAngle = ((i + 1) / segments) * Math.PI * 2;

            // Inner triangle vertex (closer to center)
            vertices.push(
                Math.cos(angle) * 0.3,
                Math.sin(angle) * 0.3,
                // Outer vertices
                Math.cos(angle) * 0.5,
                Math.sin(angle) * 0.5,
                Math.cos(nextAngle) * 0.5,
                Math.sin(nextAngle) * 0.5
            );
        }

        this.vertexCount = vertices.length / 2;

        const buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);

        const positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
        this.gl.enableVertexAttribArray(positionLocation);
        this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);
    }

    resizeCanvas() {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }

    render() {
        // Clear canvas
        this.gl.clearColor(0.1, 0.1, 0.1, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        // Use program
        this.gl.useProgram(this.program);

        // Update rotation
        this.rotation += 0.02;

        // Set uniforms
        const rotationLocation = this.gl.getUniformLocation(this.program, 'u_rotation');
        this.gl.uniform1f(rotationLocation, this.rotation);

        const colorLocation = this.gl.getUniformLocation(this.program, 'u_color');
        this.gl.uniform3f(colorLocation, 0.3, 0.7, 1.0);

        // Draw
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertexCount);
    }
}
