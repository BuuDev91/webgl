//
// Computer Graphics
//
// WebGL Exercises
//

// Register function to call after document has loaded
window.onload = startup;

// the gl object is saved globally
var gl;

var rectangles = [];

// we keep all local parameters for the program in a single object
var ctx = {
    shaderProgram: -1, //wird unten wieder überschrieben
    aVertexPositionId: -1,
    uColor: -1,
    vColor: -1,
    colorId: -1
};

// we keep all the parameters for drawing a specific object together
var rectangleObject = {
    bufferShape: []
};

/**
 * Startup function to be called when the body is loaded
 */
function startup() {
    "use strict";
    var canvas = document.getElementById("myCanvas");
    gl = createGLContext(canvas);
    initGL();
    draw();
}

/**
 * InitGL should contain the functionality that needs to be executed only once
 */
function initGL() {
    "use strict";
    ctx.shaderProgram = loadAndCompileShaders(gl, 'VertexShader.glsl', 'FragmentShader.glsl');
    setUpAttributesAndUniforms();
    setUpShapes();

    // set the clear color here
    gl.clearColor(0.2, 0.2, 0.2, 1); //-> damit wird alles übermalen (erst wenn clear)

    // add more necessary commands here
}

/**
 * Setup all the attribute and uniform variables
 */
function setUpAttributesAndUniforms() {
    "use strict";
    // finds the index of the variable in the program || überschreibt ctx.aVertexPositionId
    ctx.aVertexPositionId = gl.getAttribLocation(ctx.shaderProgram, "aVertexPosition");
    ctx.uColorId = gl.getUniformLocation(ctx.shaderProgram, "uColor");
    ctx.colorId = gl.getAttribLocation(ctx.shaderProgram, 'color');
}

/**
 * Setup the buffers to use. If more objects are needed this should be split in a file per object.
 */
function setUpShapes() {
    "use strict";

    var rectangle = new Rectangle([-0.4, 0.2], [0, 0.2], [0, -0.2], [-0.4, -0.2]);
    rectangle.setShapeColor([1, 0, 1, 1]);
    rectangle.setPointColor([[1, 0, 0], [0, 1, 0], [1, 0, 0], [0, 0, 1]]);
    rectangles.push(rectangle);
    rectangle = new Rectangle([0.1, 0.2], [0.2, 0.2], [0.2, -0.2], [0.1, -0.2]);
    rectangle.setShapeColor([1, 0, 0, 1]);
    rectangle.setPointColor([[1, 1, 0], [0, 1, 1], [1, 1, 0], [0, 1, 1]]);
    rectangles.push(rectangle);
}

/**
 * Draw the scene.
 */
function draw() {
    "use strict";
    console.log("Drawing");
    gl.clear(gl.COLOR_BUFFER_BIT);
    // add drawing routines here
    rectangles.forEach(rectangle => {
        rectangle.draw();
    });

    console.log("done");
}

class Rectangle {
    constructor(topLeft, topRight, bottomRight, bottomLeft) {
        this.topLeft = topLeft;
        this.topRight = topRight;
        this.bottomRight = bottomRight;
        this.bottomLeft = bottomLeft;
    }

    setShapeColor(color) {
        this.shapeColor = color;
    }

    setPointColor(color) {
        this.pointColors = color;
    }

    render(gl) {
        const shapeBuffer = gl.createBuffer();
        const verticles = [
            this.topLeft[0],
            this.topLeft[1],
            this.topRight[0],
            this.topRight[1],
            this.bottomRight[0],
            this.bottomRight[1],
            this.bottomLeft[0],
            this.bottomLeft[1]
        ];

        const colorBuffer = gl.createBuffer();
        console.log(this.pointColors);
        var colors = [...this.pointColors[0], ...this.pointColors[1], ...this.pointColors[2], ...this.pointColors[3]];
        console.log(colors);

        gl.bindBuffer(gl.ARRAY_BUFFER, shapeBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticles), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
        var color = gl.getAttribLocation(ctx.shaderProgram, "color");
        gl.vertexAttribPointer(color, 3, gl.FLOAT, false, 0, 0);

        return shapeBuffer;
    }

    draw() {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.render(gl));
        gl.vertexAttribPointer(ctx.aVertexPositionId, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(ctx.aVertexPositionId);
        gl.vertexAttribPointer(ctx.colorId, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(ctx.colorId);
        gl.uniform4f(ctx.uColorId, ...this.shapeColor);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    }
}