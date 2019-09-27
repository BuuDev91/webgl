attribute vec2 aVertexPosition;
attribute vec3 color;
varying vec3 vColor;

void main () {
    gl_Position = vec4(aVertexPosition, 0, 1);
    vColor = color;
}