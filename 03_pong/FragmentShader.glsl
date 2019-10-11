precision mediump float;
uniform vec4 uColor;
varying vec3 vColor;

void main() {
    //gl_FragColor = vec4(1,1,0,1);
    gl_FragColor = vec4(vColor, 0.5);
}