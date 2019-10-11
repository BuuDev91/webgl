attribute vec2 aVertexPosition;
attribute vec2 aVertexTextureCoord ;

attribute vec3 color;

varying vec3 vColor;
varying vec2 vTextureCoord;

void main () {
    gl_Position = vec4(aVertexPosition, 0, 1);
    //vColor = color;

    vTextureCoord = aVertexTextureCoord;
}