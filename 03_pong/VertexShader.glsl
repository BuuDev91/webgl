attribute vec2 aVertexPosition;
attribute vec3 color;

uniform mat3 projectionMat;
uniform mat3 modelMat;

varying vec3 vColor;

void main () {
    vec3 projectedPosition = projectionMat * modelMat * vec3(aVertexPosition, 1);
    gl_Position = vec4(vec2(projectedPosition[0], projectedPosition[1]), 0, projectedPosition[2]);

    vColor = color;
}