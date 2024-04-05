// Vertex shader program
var VSHADER_SOURCE =
    'attribute vec3 position;' +
    'attribute vec3 color;' +
    'uniform mat4 Pmatrix;' +
    'uniform mat4 Vmatrix;' +
    'uniform mat4 Mmatrix;' +
    'varying vec3 vColor;' +
    'uniform float u_PointSize;' +
    'void main(void) {' +
    '   gl_Position = Pmatrix * Vmatrix * Mmatrix * vec4(position, 1.0);' +
    '   vColor = color;' +
    '   gl_PointSize = u_PointSize;' +
    '}';

// Fragment shader program
var FSHADER_SOURCE =
    'precision mediump float;' +
    'varying vec3 vColor;' +
    'void main(void) {' +
    '   gl_FragColor = vec4(vColor, 1.0);' +
    '}';

var isDragging = false;
var lastMouseX = 0;
var lastMouseY = 0;

function initShaders(gl, vertexShaderSource, fragmentShaderSource) {
        function compileShader(type, source) {
            var shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
    
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }
    
            return shader;
        }
    
        var vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
        var fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
    
        if (!vertexShader || !fragmentShader) {
            return null;
        }
    
        var shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);
    
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            console.error('Shader program linking error:', gl.getProgramInfoLog(shaderProgram));
            return null;
        }
    
        gl.useProgram(shaderProgram);
        return shaderProgram;
    }
    

function createSphere(radius, latitudeBands, longitudeBands) {
    var vertices = [];
    var colors = [];
    var indices = [];

    for (var latNumber = 0; latNumber <= latitudeBands; latNumber++) {
        var theta = (latNumber * Math.PI) / latitudeBands;
        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta);

        for (var longNumber = 0; longNumber <= longitudeBands; longNumber++) {
            var phi = (longNumber * 2 * Math.PI) / longitudeBands;
            var sinPhi = Math.sin(phi);
            var cosPhi = Math.cos(phi);

            var x = cosPhi * sinTheta;
            var y = cosTheta;
            var z = sinPhi * sinTheta;

            vertices.push(radius * x);
            vertices.push(radius * y);
            vertices.push(radius * z);

            if (latNumber % 5 === 0 && longNumber % 5 === 0) {
                colors.push(1.0); 
                colors.push(1.0);
                colors.push(1.0);
            } else {
                colors.push(0.5);
                colors.push(0.5);
                colors.push(0.5);
            }
        }
    }

    for (var latNumber = 0; latNumber < latitudeBands; latNumber++) {
        for (var longNumber = 0; longNumber < longitudeBands; longNumber++) {
            var first = latNumber * (longitudeBands + 1) + longNumber;
            var second = first + longitudeBands + 1;

            indices.push(first);
            indices.push(second);
            indices.push(first + 1);

            indices.push(second);
            indices.push(second + 1);
            indices.push(first + 1);
        }
    }

    return { vertices: vertices, colors: colors, indices: indices };
}

function generateBacteriaData(numBacteria, sphereRadius) {
    var positions = [];
    var colors = [];
    var scales = [];
    for (var i = 0; i < numBacteria; i++) {
        var theta = Math.random() * 2 * Math.PI;
        var phi = Math.acos(2 * Math.random() - 1);
        var x = sphereRadius * Math.sin(phi) * Math.cos(theta);
        var y = sphereRadius * Math.sin(phi) * Math.sin(theta);
        var z = sphereRadius * Math.cos(phi);

        positions.push(x, y, z);
        scales.push(1.0);
        colors.push(Math.random(), Math.random(), Math.random());
    }
    return { positions: positions, colors: colors, scales: scales};
}

var canvas = document.getElementById('black');
var gl = canvas.getContext('webgl');

if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
}

gl.clearColor(0.1, 0.1, 0.1, 1.0);

var program = initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);
gl.useProgram(program);

var sphere = createSphere(2, 40, 40);

var vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphere.vertices), gl.STATIC_DRAW);

var colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphere.colors), gl.STATIC_DRAW);

var indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(sphere.indices), gl.STATIC_DRAW);

var numBacteria = Math.floor(Math.random() * 10) + 1;
var bacteria = generateBacteriaData(numBacteria, 2);

var bacteriaPositionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, bacteriaPositionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bacteria.positions), gl.STATIC_DRAW);

var bacteriaColorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, bacteriaColorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bacteria.colors), gl.STATIC_DRAW);

var positionAttrib = gl.getAttribLocation(program, 'position');
var colorAttrib = gl.getAttribLocation(program, 'color');

var Pmatrix = gl.getUniformLocation(program, 'Pmatrix');
var Vmatrix = gl.getUniformLocation(program, 'Vmatrix');
var Mmatrix = gl.getUniformLocation(program, 'Mmatrix');
var uPointSize = gl.getUniformLocation(program, 'u_PointSize');

var proj_matrix = mat4.create();
mat4.perspective(proj_matrix, Math.PI / 4, canvas.width / canvas.height, 1, 100);

var mo_matrix = mat4.create();
var view_matrix = mat4.create();
mat4.translate(view_matrix, view_matrix, [0, 0, -6]);

gl.uniformMatrix4fv(Pmatrix, false, proj_matrix);
gl.uniformMatrix4fv(Vmatrix, false, view_matrix);
gl.uniformMatrix4fv(Mmatrix, false, mo_matrix);

canvas.addEventListener('mousedown', function (e) {
    isDragging = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
});

canvas.addEventListener('mouseup', function () {
    isDragging = false;
});

canvas.addEventListener('mousemove', function(e) {
    if (!isDragging) return;

    var deltaX = e.clientX - lastMouseX;
    var deltaY = e.clientY - lastMouseY;
    rotateSphere(deltaX, deltaY);
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
});

function rotateSphere(deltaX, deltaY) {
    var rotationSpeed = 0.5; 
    mat4.rotate(mo_matrix, mo_matrix, glMatrix.toRadian(deltaX * rotationSpeed), [0, 1, 0]);
    mat4.rotate(mo_matrix, mo_matrix, glMatrix.toRadian(deltaY * rotationSpeed), [1, 0, 0]);
    gl.uniformMatrix4fv(Mmatrix, false, mo_matrix);
}


function updateModelMatrix() {
    if (isDragging) return;
    mat4.rotate(mo_matrix, mo_matrix, glMatrix.toRadian(1), [0, 1, 0]);
    gl.uniformMatrix4fv(Mmatrix, false, mo_matrix); 
}
function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(positionAttrib, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionAttrib);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(colorAttrib, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorAttrib);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.drawElements(gl.TRIANGLES, sphere.indices.length, gl.UNSIGNED_SHORT, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, bacteriaPositionBuffer);
    gl.vertexAttribPointer(positionAttrib, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionAttrib);

    gl.bindBuffer(gl.ARRAY_BUFFER, bacteriaColorBuffer);
    gl.vertexAttribPointer(colorAttrib, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorAttrib);

    for (var i = 0; i < bacteria.positions.length / 3; i++) { 
        gl.uniform1f(uPointSize, bacteria.scales[i] * 10.0);
        gl.drawArrays(gl.POINTS, i, 1);
    }

    animateGrowth(); 
    requestAnimationFrame(render);
}
var growthRate = 0.05;
function animateGrowth() {
    for (var i = 0; i < bacteria.scales.length; i++) {
        bacteria.scales[i] += growthRate;
    }
}


render();