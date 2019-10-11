//
// Computer Graphics
//
// WebGL Exercises
//

// Register function to call after document has loaded

window.onload = function() {
  var canvas = document.getElementById("myCanvas");
  var gl = createGLContext(canvas);

  new Game().startup(gl);
};

class Game {
  constructor() {
    this.gl;
    this.shapes = [];
    this.ctx = {
      shaderProgram: -1,
      aVertexPositionId: -1,
      uColor: -1,
      vColor: -1,
      colorId: -1,
      uProjectionMatId: -1,
      uModelMatId: -1
    };
    this.rectangleObject = {
      bufferShape: []
    };

    this.player = undefined;
    this.pongAI = undefined;
    this.pingPong = undefined;
    this.keyHandling = new KeyHandling();
  }

  /**
   * Startup function to be called when the body is loaded
   */
  startup(gl) {
    "use strict";
    this.gl = gl;
    this.initGL();

    window.addEventListener("keydown", event => {
      switch (event.key) {
        case "ArrowUp":
          return this.player.moveUp();
        case "ArrowDown":
          return this.player.moveDown();
      }
    });

    var animate = () => {
      this.draw();
      window.requestAnimationFrame(animate);
    };

    window.requestAnimationFrame(animate);
  }

  /**
   * InitGL should contain the functionality that needs to be executed only once
   */
  initGL() {
    "use strict";
    this.ctx.shaderProgram = loadAndCompileShaders(
      this.gl,
      "VertexShader.glsl",
      "FragmentShader.glsl"
    );
    this.setUpAttributesAndUniforms();
    this.setUpShapes();

    // set the clear color here
    this.gl.clearColor(0.2, 0.2, 0.2, 1); //-> damit wird alles übermalen (erst wenn clear)

    // add more necessary commands here
  }

  /**
   * Setup all the attribute and uniform variables
   */
  setUpAttributesAndUniforms() {
    "use strict";
    // finds the index of the variable in the program || überschreibt ctx.aVertexPositionId
    this.ctx.aVertexPositionId = this.gl.getAttribLocation(
      this.ctx.shaderProgram,
      "aVertexPosition"
    );
    this.ctx.uColorId = this.gl.getUniformLocation(
      this.ctx.shaderProgram,
      "uColor"
    );
    this.ctx.colorId = this.gl.getAttribLocation(
      this.ctx.shaderProgram,
      "color"
    );
    this.ctx.uProjectionMatId = this.gl.getUniformLocation(
      this.ctx.shaderProgram,
      "projectionMat"
    );

    this.ctx.uModelMatId = this.gl.getUniformLocation(
      this.ctx.shaderProgram,
      "modelMat"
    );

    var projectionMat = mat3.create();
    mat3.fromScaling(projectionMat, [
      2.0 / this.gl.drawingBufferWidth,
      2.0 / this.gl.drawingBufferHeight
    ]);
    this.gl.uniformMatrix3fv(this.ctx.uProjectionMatId, false, projectionMat);
  }

  /**
   * Setup the buffers to use. If more objects are needed this should be split in a file per object.
   */
  setUpShapes() {
    "use strict";

    this.pingPong = new PingPong(this.gl, this.ctx, [20, 20], 0);

    this.player = new Player(this.gl, this.ctx, [10, 100], 0);

    this.pongAI = new PongAI(this.gl, this.ctx, [10, 100], 0);
    this.pongAI.setPingPong(this.pingPong);

    this.pingPong.setPlayer(this.player);
    this.pingPong.setPongAI(this.pongAI);

    this.shapes.push(this.player);
    this.shapes.push(this.pingPong);
    this.shapes.push(this.pongAI);
  }

  /**
   * Draw the scene.
   */
  draw() {
    "use strict";

    //console.log("Drawing");

    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    // add drawing routines here
    this.shapes.forEach(rectangle => {
      rectangle.draw(this.gl);
    });

    //console.log("done");
  }
}

class Rectangle {
  constructor(gl, ctx, scale, rotation) {
    this.position = [0, 0];
    this.scale = scale;
    this.rotation = (rotation % 360) * (Math.PI / 180);

    this.ctx = ctx;
    this.gl = gl;

    this.translationMatrix = mat3.create();
  }

  setShapeColor(color) {
    this.shapeColor = color;
  }

  setPointColor(color) {
    this.pointColors = color;
  }

  setPosition(position) {
    this.position = position;
  }

  render(gl) {
    var vertices = [-0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5];

    this.shapeBuffer = gl.createBuffer();

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
      var color = gl.getAttribLocation(this.ctx.shaderProgram, "color");
      gl.vertexAttribPointer(color, 3, gl.FLOAT, false, 0, 0);
    }

    return this.shapeBuffer;
  }

  draw(gl) {
    mat3.fromTranslation(this.translationMatrix, this.position);
    //mat3.fromRotation(this.translationMatrix, this.rotation);
    mat3.scale(this.translationMatrix, this.translationMatrix, this.scale);

    //console.log(this.translationMatrix);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.render(gl));
    gl.vertexAttribPointer(
      this.ctx.aVertexPositionId,
      2,
      gl.FLOAT,
      false,
      0,
      0
    );
    gl.enableVertexAttribArray(this.ctx.aVertexPositionId);
    gl.vertexAttribPointer(this.ctx.colorId, 2, gl.FLOAT, false, 0, 0);

    if (this.shapeColor) {
      gl.enableVertexAttribArray(this.ctx.colorId);
      gl.uniform4f(this.ctx.uColorId, ...this.shapeColor);
    }

    gl.uniformMatrix3fv(this.ctx.uModelMatId, false, this.translationMatrix);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
  }
}

class Player extends Rectangle {
  constructor(gl, ctx, scale, rotation) {
    super(gl, ctx, scale, rotation);

    this.position = [-390, 0];
    this.speed = 25;
  }

  moveUp() {
    this.position = [this.position[0], this.position[1] + this.speed];
    if (!this.checkIsValidMove()) {
      this.position = [this.position[0], this.position[1] - this.speed];
    }
  }

  moveDown() {
    this.position = [this.position[0], this.position[1] - this.speed];
    if (!this.checkIsValidMove()) {
      this.position = [this.position[0], this.position[1] + this.speed];
    }
  }

  checkIsValidMove() {
    return (
      this.position[1] + this.scale[1] / 2 <= this.gl.drawingBufferHeight / 2 &&
      this.position[1] - this.scale[1] / 2 >= -this.gl.drawingBufferHeight / 2
    );
  }
}

class PongAI extends Player {
  constructor(gl, ctx, scale, rotation) {
    super(gl, ctx, scale, rotation);

    this.position = [+390, 0];
    this.pingPong = undefined;
  }
  setPingPong(pingPong) {
    this.pingPong = pingPong;
  }

  render(gl) {
    let shapeBuffer = super.render(gl);
    this.position[1] = this.pingPong.position[1];
    return this.shapeBuffer;
  }
}

class PingPong extends Rectangle {
  constructor(ctx, scale, rotation) {
    super(ctx, scale, rotation);

    this.xDirectionPositive = false;
    this.yDirectionPositive = false;

    this.position = [0, 0];
    this.speed = [5, 5];

    this.player = undefined;
    this.pongAI = undefined;
  }

  setPlayer(player) {
    this.player = player;
  }

  setPongAI(pongAI) {
    this.pongAI = pongAI;
  }

  render(gl, ctx) {
    this.updatePosition();
    return super.render(gl, ctx);
  }

  updatePosition() {
    this.setVerticalDirection();
    this.setHorizontalDirection();

    this.position = [
      this.position[0] + this.speed[0],
      this.position[1] + this.speed[1]
    ];

    let nextPlayer = this.xDirectionPositive ? this.pongAI : this.player;

    if (!this.xDirectionPositive) {
      if (this.position[0] + this.scale[0] < nextPlayer.position[0]) {
        this.position = [0, 0];
        console.log("AI won");
      }
    } else {
      if (this.position[0] - this.scale[0] > nextPlayer.position[0]) {
        this.position = [0, 0];
        console.log("Player won");
      }
    }
  }

  setVerticalDirection() {
    if (this.bouncesOffPlayer) {
      console.log(!this.xDirectionPositive ? "player hit" : "AI hit");
      this.xDirectionPositive = !this.xDirectionPositive;
    }

    this.speed[0] = !this.xDirectionPositive
      ? Math.abs(this.speed[0]) * -1
      : Math.abs(this.speed[0]);
  }

  setHorizontalDirection() {
    if (this.bouncesOffWall) {
      this.yDirectionPositive = !this.yDirectionPositive;
      console.log("wall hit");
    }

    this.speed[1] = this.yDirectionPositive
      ? Math.abs(this.speed[1])
      : Math.abs(this.speed[1]) * -1;
  }

  get bouncesOffPlayer() {
    let nextPlayer = this.xDirectionPositive ? this.pongAI : this.player;

    const pingPongPosition =
      this.position[0] +
      (this.scale[0] / 2) * (!this.xDirectionPositive ? -1 : 1);

    const playerPosition =
      nextPlayer.position[0] +
      (nextPlayer.scale[0] / 2) * (!this.xDirectionPositive ? -1 : 1);

    const overBottom =
      this.position[1] + this.scale[1] / 2 >
      nextPlayer.position[1] - nextPlayer.scale[1] / 2;

    const belowTop =
      this.position[1] - this.scale[1] / 2 <
      nextPlayer.position[1] + nextPlayer.scale[1] / 2;

    const playerHit = overBottom && belowTop;

    const borderHit = !this.xDirectionPositive
      ? pingPongPosition <= playerPosition
      : pingPongPosition >= playerPosition;

    return borderHit && playerHit;
  }

  get bouncesOffWall() {
    const height =
      (this.gl.drawingBufferHeight / 2) * (this.yDirectionPositive ? 1 : -1);

    const ballPosition =
      this.position[1] +
      (this.scale[1] / 2) * (this.yDirectionPositive ? 1 : -1);

    return this.yDirectionPositive
      ? ballPosition >= height
      : ballPosition <= height;
  }
}

class KeyHandling {
  constructor() {
    this.key = {
      pressed: {},

      LEFT: 37,
      UP: 38,
      RIGHT: 39,
      DOWN: 40
    };
  }

  isDown(keyCode) {
    return this.key.pressed[keyCode];
  }

  onKeydown(event) {
    this.key.pressed[event.keyCode] = true;
  }

  onKeyup(event) {
    delete this.key.pressed[event.keyCode];
  }
}
