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
  colorId: -1,
  uProjectionMatId: -1,
  uModelMatId: -1
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
  window.addEventListener("keyup", onKeyup, false);
  window.addEventListener("keydown", onKeydown, false);
  draw();
}

/**
 * InitGL should contain the functionality that needs to be executed only once
 */
function initGL() {
  "use strict";
  ctx.shaderProgram = loadAndCompileShaders(
    gl,
    "VertexShader.glsl",
    "FragmentShader.glsl"
  );
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
  ctx.aVertexPositionId = gl.getAttribLocation(
    ctx.shaderProgram,
    "aVertexPosition"
  );
  ctx.uColorId = gl.getUniformLocation(ctx.shaderProgram, "uColor");
  ctx.colorId = gl.getAttribLocation(ctx.shaderProgram, "color");
  ctx.uProjectionMatId = gl.getUniformLocation(
    ctx.shaderProgram,
    "projectionMat"
  );

  ctx.uModelMatId = gl.getUniformLocation(ctx.shaderProgram, "modelMat");

  var projectionMat = mat3.create();
  mat3.fromScaling(projectionMat, [
    2.0 / gl.drawingBufferWidth,
    2.0 / gl.drawingBufferHeight
  ]);
  gl.uniformMatrix3fv(ctx.uProjectionMatId, false, projectionMat);
}

/**
 * Setup the buffers to use. If more objects are needed this should be split in a file per object.
 */
function setUpShapes() {
  "use strict";

  var rectangle = new Rectangle([-390, 0], [10, 100], 0);
  //rectangle.setShapeColor([1, 0, 1, 1]);
  //rectangle.setPointColor([[1, 0, 0], [0, 1, 0], [1, 0, 0], [0, 0, 1]]);
  rectangles.push(rectangle);

  rectangles.push(new Rectangle([390, 0], [10, 100], 0));

  rectangles.push(new Rectangle([-40, -20], [20, 20], 0));

  rectangles.push(new Rectangle([0, 0], [3, 600], 0));
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
  constructor(position, scale, rotation) {
    this.position = position;
    this.scale = scale;
    this.rotation = (rotation % 360) * (Math.PI / 180);

    this.translationMatrix = mat3.create();
    this.shapeBuffer = gl.createBuffer();
  }

  setShapeColor(color) {
    this.shapeColor = color;
  }

  setPointColor(color) {
    this.pointColors = color;
  }

  render(gl) {
    var vertices = [-0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5];

    gl.bindBuffer(gl.ARRAY_BUFFER, this.shapeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    if (this.pointColors) {
      const colorBuffer = gl.createBuffer();
      var colors = [
        ...this.pointColors[0],
        ...this.pointColors[1],
        ...this.pointColors[2],
        ...this.pointColors[3]
      ];

      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
      var color = gl.getAttribLocation(ctx.shaderProgram, "color");
      gl.vertexAttribPointer(color, 3, gl.FLOAT, false, 0, 0);
    }

    return this.shapeBuffer;
  }

  draw() {
    mat3.translate(
      this.translationMatrix,
      this.translationMatrix,
      this.position
    );
    mat3.rotate(this.translationMatrix, this.translationMatrix, this.rotation);
    mat3.scale(this.translationMatrix, this.translationMatrix, this.scale);

    console.log(this.translationMatrix);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.render(gl));
    gl.vertexAttribPointer(ctx.aVertexPositionId, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(ctx.aVertexPositionId);
    gl.vertexAttribPointer(ctx.colorId, 2, gl.FLOAT, false, 0, 0);

    if (this.shapeColor) {
      gl.enableVertexAttribArray(ctx.colorId);
      gl.uniform4f(ctx.uColorId, ...this.shapeColor);
    }

    gl.uniformMatrix3fv(ctx.uModelMatId, false, this.translationMatrix);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
  }
}

// Key Handling
var key = {
  _pressed: {},

  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40
};

function isDown(keyCode) {
  return key._pressed[keyCode];
}

function onKeydown(event) {
  key._pressed[event.keyCode] = true;
}

function onKeyup(event) {
  delete key._pressed[event.keyCode];
}
