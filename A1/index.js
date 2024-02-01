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

function main(){
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
    var numPoints = 360;
    var vertices = [];
    var radius = 0.8;
    var numBacteria = Math.floor(Math.random() * 10)+1;
    var colors = [];
    var usedColors = [];
    var startAngle = Math.random() * 360;

    // Generate vertex positions in a circle
    for (var i = 0; i < numPoints; i++) {
        var angle = (Math.PI * 2 * i) / numPoints; 
        var x = Math.cos(angle)*radius;
        var y = Math.sin(angle)*radius;
        vertices.push(x, y, 0.0);
        colors.push(1.0, 1.0, 1.0, 1.0);
    }
     //Generate vertices for bacteria cricles
     for (var j = 0; j < numBacteria; j++) {
        var angle = ((startAngle + (360 / numBacteria) * j) % 360) * Math.PI / 180; 
        var x = Math.cos(angle) * radius;
        var y = Math.sin(angle) * radius;
        vertices.push(x, y, 0.0);

        angle += bacteriaSpeed * Math.PI / 180;

        setTimeout(drawBacteria, 10);

        var color;
        do {
            color = [Math.random(), Math.random(), Math.random(), 1.0];
        } while (isColorUsed(color));
        usedColors.push(color);
        colors.push(...color);
    }

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

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    // Draw
    gl.drawArrays(gl.TRIANGLE_FAN, 0, numPoints);
    gl.drawArrays(gl.POINTS, numPoints, numBacteria);

    function isColorUsed(color) {
        for (var i = 0; i < usedColors.length; i++) {
            if (areColorsEqual(color, usedColors[i])) {
                return true;
            }
        }
        return false;
    }

    function areColorsEqual(color1, color2) {
        for (var i = 0; i < color1.length; i++) {
            if (color1[i] !== color2[i]) {
                return false;
            }
        }
        return true;
    }
}
