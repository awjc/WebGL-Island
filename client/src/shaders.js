const vertexShaderSource = `
    attribute vec2 a_position;
    uniform float u_rotation;

    void main() {
        float s = sin(u_rotation);
        float c = cos(u_rotation);
        mat2 rotation = mat2(c, s, -s, c);
        vec2 rotatedPosition = rotation * a_position;
        gl_Position = vec4(rotatedPosition, 0.0, 1.0);
    }
`;

const fragmentShaderSource = `
    precision mediump float;
    uniform vec3 u_color;

    void main() {
        gl_FragColor = vec4(u_color, 1.0);
    }
`;
