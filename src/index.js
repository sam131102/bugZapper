var VSHADER_SOURCE =
'attribute vec4 a_Position;\n' +
'attribute vec4 a_Color;\n' +
'varying vec4 v_Color;\n' +
'void main() {\n' +
' gl_Position = a_Position;\n' +
' gl_PointSize = 10.0;\n' +
' v_Color = a_Color;\n' +
'}\n';

// Fragment shader program
var FSHADER_SOURCE =
'precision mediump float;\n' +
'varying vec4 v_Color;\n' +
'void main() {\n' +
' gl_FragColor = v_Color;\n' +
'}\n';

function main() {
    var canvas = document.getElementById('black');
    // Get the rendering context for WebGL
    var gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }
    // Get the storage location of a_Position and a_Color
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    if (a_Position < 0 || a_Color < 0) {
        console.log('Failed to get the storage location of a_Position or a_Color');
        return;
    }

    // Setup circle and bacteria data
    var numPoints = 360;
    var radius = 0.8;
    var numBacteria = Math.min(Math.floor(Math.random() * 10) + 1, 10); // Limit bacteria to 10
    var initialRadius = 0.08; 
    var growthRate = 0.0005; 
    var score = 0;
    var sizeThreshold = 0.25;


    var animationId;

    // Generate initial positions and colors for bacteria
    var bacteriaData = [];
    for (var j = 0; j < numBacteria; j++) {
        var angle = (Math.PI * 2 * Math.random());
        var centerX = Math.cos(angle) * radius;
        var centerY = Math.sin(angle) * radius;
        var bacteria = {
            centerX: centerX,
            centerY: centerY,
            color: [Math.random(), Math.random(), Math.random(), 1.0]
        };
        bacteriaData.push(bacteria);
    }
    var mousePosition = {x: 0, y: 0};

    // Adjust for canvas position and scale
    function updateMousePosition(event) {
        var rect = canvas.getBoundingClientRect();
        mousePosition.x = ((event.clientX - rect.left) - canvas.width / 2) / (canvas.width / 2);
        mousePosition.y = (canvas.height / 2 - (event.clientY - rect.top)) / (canvas.height / 2);
    }

    canvas.addEventListener('mousemove', updateMousePosition);

    function checkBacteriaUnderMouse() {
        var i = bacteriaData.length;
        while (i--) {
            var bacteria = bacteriaData[i];
            var dx = mousePosition.x - bacteria.centerX;
            var dy = mousePosition.y - bacteria.centerY;
            var distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < initialRadius) {
                return i; // Index of bacteria under mouse
            }
        }
        return -1; // No bacteria under mouse
    }

    canvas.addEventListener('click', function() {
        var index = checkBacteriaUnderMouse();
        if (index >= 0) {
            bacteriaData.splice(index, 1); // Remove the bacteria
            numBacteria--; // Update bacteria count
            score += 10;
            updateScoreDisplay();
        }
    });

    function updateScoreDisplay() {
        var scoreElement = document.getElementById('scoreDisplay');
        if(scoreElement) {
            scoreElement.innerText = 'Score: ' + score;
        }
    }

    function checkGameConditions() {
        var thresholdReached = 0;
        for (var i = 0; i < bacteriaData.length; i++) {
            var bacteriaRadius = initialRadius;
            if (bacteriaRadius >= sizeThreshold) {
                thresholdReached++;
                if (thresholdReached >= 2) {
                    displayGameOver();
                    return false; 
                }
            }
        }
        // Check win condition: if all bacteria are removed
        if (bacteriaData.length === 0) {
            displayWin();
            return false; // Indicate game should not continue
        }
        return true; // Indicate game should continue
    }
    
    function animate() {
        var vertices = [];
        var colors = [];
        initialRadius += growthRate;

        // Generate vertex positions and colors for the white circle
        for (var i = 0; i < numPoints; i++) {
            var angle = (Math.PI * 2 * i) / numPoints;
            var x = Math.cos(angle) * radius;
            var y = Math.sin(angle) * radius;
            vertices.push(x, y, 0.0);
            colors.push(1.0, 1.0, 1.0, 1.0);
        }

        // Generate vertex positions and colors for the bacteria
        for (var j = 0; j < numBacteria; j++) {
            var centerX = bacteriaData[j].centerX;
            var centerY = bacteriaData[j].centerY;
            var color = bacteriaData[j].color;

            // Add center point for bacteria
            vertices.push(centerX, centerY, 0.0);
            colors.push(color[0], color[1], color[2], color[3]);

            // Generate points around the center for bacteria
            for (var k = 0; k < numPoints; k++) {
                var angleOffset = (Math.PI * 2 * k) / numPoints;
                var newX = centerX + Math.cos(angleOffset) * initialRadius; // Adjust radius for smaller circles
                var newY = centerY + Math.sin(angleOffset) * initialRadius; // Adjust radius for smaller circles
                vertices.push(newX, newY, 0.0);
                // Assign the same color for all points of each bacteria
                colors.push(color[0], color[1], color[2], color[3]);
            }
        }

        // Create buffers
        var vertexColorBuffer = gl.createBuffer();
        if (!vertexColorBuffer) {
            console.log('Failed to create color buffer object');
            return;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
        gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Color);

        var vertexBuffer = gl.createBuffer();
        if (!vertexBuffer) {
            console.log('Failed to create the buffer object');
            return;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);

        // Clear canvas
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Draw circle
        gl.drawArrays(gl.TRIANGLE_FAN, 0, numPoints);

        // Draw bacteria as circles around their centers
        for (var j = 0; j < numBacteria; j++) {
            var start = (numPoints + 1) * (j + 1);
            var count = numPoints;
            gl.drawArrays(gl.TRIANGLE_FAN, start, count);
        }

        // Check game conditions before continuing animation
        if (checkGameConditions()) {
            animationId = requestAnimationFrame(animate);
        } else {
            cancelAnimationFrame(animationId); // Stop the animation
        }
    }
    function displayWin() {
        alert("You Win! All bacteria were poisoned.");
        cancelAnimationFrame(animationId); // Stop the animation if not already stopped
    }
    
    function displayGameOver() {
        alert("Game Over! Two bacteria reached the threshold.");
        cancelAnimationFrame(animationId); // Ensure animation is stopped
    }

    animate();
}

main();