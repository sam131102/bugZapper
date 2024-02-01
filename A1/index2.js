var main = function() {
    // Game's main variables
    var spawnedBac = 0;
    var bacArr = [];
    var totBac = 10;

    // Set radius and size for game-circle
    var r = 0.8;

    // Creating a WebGL Context Canvas
    var canvas = document.getElementById('black');
    var gl = canvas.getContext('webgl');

    // Set the view port
    gl.viewport(0,0,canvas.width,canvas.height);

    // Bind appropriate array buffer to it
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

    // Enable the depth test
    gl.enable(gl.DEPTH_TEST);

    // Create vertex and fragment shader objects
    var vertShader = gl.createShader(gl.VERTEX_SHADER);
    var fragShader = gl.createShader(gl.FRAGMENT_SHADER);

    // Shaders
    // Attach vertex shader source code and compile
    gl.shaderSource(vertShader, vertCode);
    gl.compileShader(vertShader);

    // Attach fragment shader source code and compile
    gl.shaderSource(fragShader, fragCode);
    gl.compileShader(fragShader);

    // Create shader program
    var shaderProgram = gl.createProgram();

    // Attach the vertex and fragment shader
    gl.attachShader(shaderProgram, vertShader);
    gl.attachShader(shaderProgram, fragShader);

    // Link and use
    gl.linkProgram(shaderProgram);
    gl.useProgram(shaderProgram);

    // Get the attribute and uniform location
    var coord = gl.getAttribLocation(shaderProgram, "coordinates");
    var fColor = gl.getUniformLocation(shaderProgram, "fColor");

    // Point an attribute to the currently bound VBO and enable the attribute
    gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(coord);

    function draw_circle(x, y, r, color) {
        // For storing the produced vertices
        var vertices = [];

        // Prepare vertices
        for (let i = 1; i <= 360; i++) {
            var y1 = r * Math.sin(i) + y;
            var x1 = r * Math.cos(i) + x;

            var y2 = r * Math.sin(i + 1) + y;
            var x2 = r * Math.cos(i + 1) + x;

            vertices.push(x);
            vertices.push(y);
            vertices.push(0);

            vertices.push(x1);
            vertices.push(y1);
            vertices.push(0);

            vertices.push(x2);
            vertices.push(y2);
            vertices.push(0);
        }

        // Pass the vertex data to the buffer
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        // Pass color data to uniform fColor
        gl.uniform4f(fColor, color[0], color[1], color[2], color[3]);

        // Drawing triangles
        gl.clearColor(0, 1, 0, 0.9);
        // Draw the triangle 360*3, 3 layers of vertices (disk)
        gl.drawArrays(gl.TRIANGLES, 0, 360 * 3);
    }

    // Class for storing data about each Bacteria
    class Bacteria {
        constructor() {
            this.r = 0.06;
            this.color = [Math.random() * (0.65), Math.random() * (0.65), Math.random() * (0.65), 0.75];
            this.x = 0;
            this.y = 0;
        }
    }

    // Create and push new Bacteria objects into bacArr
    for (var i = 0; i < totBac; i++) {
        bacArr.push(new Bacteria());
    }

    // Game Loop
    function gameLoop() {
        // Draw the game surface circle
        draw_circle(0, 0, r, [0.05, 0.1, 0.05, 0.5]);
        requestAnimationFrame(gameLoop);
    }
    requestAnimationFrame(gameLoop);
}