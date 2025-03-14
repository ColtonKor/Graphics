'use strict'

var gl;

var appInput = new Input();
var time = new Time();
var camera = new OrbitCamera(appInput);

var earthGeometry = null;
var cloudGeometry = null;
var sunGeometry = null;
var saturnGeometry = null;
var jupiterGeometry = null;
var marsGeometry = null;
var venusGeometry = null;
var mercuryGeometry = null;
var moonGeometry = null;
var neptuneGeometry = null;
var uranusGeometry = null;


var bottomGeometry = null;
var topGeometry = null;
var forwardGeometry = null;
var backwardGeometry = null;
var leftGeometry = null;
var rightGeometry = null;


var projectionMatrix = new Matrix4();
var lightPosition = new Vector4(0, 0, 0, 0);

var cameraSunPosition = camera.cameraWorldMatrix.clone();

// the shader that will be used by each piece of geometry (they could each use their own shader but in this case it will be the same)
var phongShaderProgram;
var lightShader;
var textureShaderProgram;

// auto start the app when the html page is ready
window.onload = window['initializeAndStartRendering'];

// we need to asynchronously fetch files from the "server" (your local hard drive)
var loadedAssets = {
    phongTextVS: null, phongTextFS: null,
    lightVS: null, lightFS: null,
    sphereJSON: null, sunImage: null,
    moonImage: null, earthImage: null,
    jupiterImage: null, marsImage: null,
    mercuryImage: null, neptuneImage: null,
    saturnImage: null, uranusImage: null,
    venusImage: null,
    bottomImage: null, topImage: null,
    leftImage: null, rigthImage: null,
    forwardImage: null, backwardImage: null,
    cloudImage: null, cloudVS: null, cloudFS: null
};

// -------------------------------------------------------------------------
function initializeAndStartRendering() {
    initGL();
    loadAssets(function() {
        createShaders(loadedAssets);
        createScene();

        updateAndRender();
    });
}

// -------------------------------------------------------------------------
function initGL(canvas) {
    var canvas = document.getElementById("webgl-canvas");

    try {
        gl = canvas.getContext("webgl");
        gl.canvasWidth = canvas.width;
        gl.canvasHeight = canvas.height;

        gl.enable(gl.DEPTH_TEST);
    } catch (e) {}

    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
}

// -------------------------------------------------------------------------
function loadAssets(onLoadedCB) {
    var filePromises = [
        fetch('./shaders/phong.vs.glsl').then((response) => { return response.text(); }),
        fetch('./shaders/phong.pointlit.fs.glsl').then((response) => { return response.text(); }),
        fetch('./shaders/flat.color.vs.glsl').then((response) => { return response.text(); }),
        fetch('./shaders/flat.color.fs.glsl').then((response) => { return response.text(); }),
        fetch('./data/Final/sphere.json').then((response) => { return response.json(); }),
        loadImage('./data/Final/jupiter.jpg'),
        loadImage('./data/Final/mars.jpg'),
        loadImage('./data/Final/neptune.jpg'),
        loadImage('./data/Final/saturn.jpg'),
        loadImage('./data/Final/uranus.jpg'),
        loadImage('./data/Final/venusAt.jpg'),
        loadImage('./data/Final/earth.jpg'),
        loadImage('./data/Final/moon.png'),
        loadImage('./data/Final/sun.jpg'),
        loadImage('./data/Final/mercury.jpg'),
        loadImage('./data/Final/Skybox Faces/GalaxyTex_NegativeX.png'),
        loadImage('./data/Final/Skybox Faces/GalaxyTex_NegativeY.png'),
        loadImage('./data/Final/Skybox Faces/GalaxyTex_NegativeZ.png'),
        loadImage('./data/Final/Skybox Faces/GalaxyTex_PositiveX.png'),
        loadImage('./data/Final/Skybox Faces/GalaxyTex_PositiveY.png'),
        loadImage('./data/Final/Skybox Faces/GalaxyTex_PositiveZ.png'),
        loadImage('./data/Final/2k_earth_clouds.jpg'),
        fetch('./shaders/unlit.textured.vs.glsl').then((response) => { return response.text(); }),
        fetch('./shaders/unlit.textured.fs.glsl').then((response) => { return response.text(); })
    ];

    Promise.all(filePromises).then(function(values) {
        // Assign loaded data to our named variables
        loadedAssets.phongTextVS = values[0];
        loadedAssets.phongTextFS = values[1];
        loadedAssets.lightVS = values[2];
        loadedAssets.lightFS = values[3];
        loadedAssets.sphereJSON = values[4];
        loadedAssets.jupiterImage = values[5];
        loadedAssets.marsImage = values[6];
        loadedAssets.neptuneImage = values[7];
        loadedAssets.saturnImage = values[8];
        loadedAssets.uranusImage = values[9];
        loadedAssets.venusImage = values[10];
        loadedAssets.earthImage = values[11];
        loadedAssets.moonImage = values[12];
        loadedAssets.sunImage = values[13];
        loadedAssets.mercuryImage = values[14];
        loadedAssets.leftImage = values[15];
        loadedAssets.bottomImage = values[16];
        loadedAssets.backwardImage = values[17];
        loadedAssets.rigthImage = values[18];
        loadedAssets.topImage = values[19];
        loadedAssets.forwardImage = values[20];
        loadedAssets.cloudImage = values[21];
        loadedAssets.cloudVS = values[22];
        loadedAssets.cloudFS = values[23];
    }).catch(function(error) {
        console.error(error.message);
    }).finally(function() {
        onLoadedCB();
    });
}

// -------------------------------------------------------------------------
function createShaders(loadedAssets) {
    phongShaderProgram = createCompiledAndLinkedShaderProgram(loadedAssets.phongTextVS, loadedAssets.phongTextFS);
    gl.useProgram(phongShaderProgram);

    phongShaderProgram.attributes = {
        vertexPositionAttribute: gl.getAttribLocation(phongShaderProgram, "aVertexPosition"),
        vertexNormalsAttribute: gl.getAttribLocation(phongShaderProgram, "aNormal"),
        vertexTexcoordsAttribute: gl.getAttribLocation(phongShaderProgram, "aTexcoords")
    };

    phongShaderProgram.uniforms = {
        worldMatrixUniform: gl.getUniformLocation(phongShaderProgram, "uWorldMatrix"),
        viewMatrixUniform: gl.getUniformLocation(phongShaderProgram, "uViewMatrix"),
        projectionMatrixUniform: gl.getUniformLocation(phongShaderProgram, "uProjectionMatrix"),
        lightPositionUniform: gl.getUniformLocation(phongShaderProgram, "uLightPosition"),
        cameraPositionUniform: gl.getUniformLocation(phongShaderProgram, "uCameraPosition"),
        textureUniform: gl.getUniformLocation(phongShaderProgram, "uTexture"),
        alphaUniform: gl.getUniformLocation(phongShaderProgram, "uAlpha"),
    };


    lightShader = createCompiledAndLinkedShaderProgram(loadedAssets.lightVS, loadedAssets.lightFS);
    gl.useProgram(lightShader);

    lightShader.attributes = {
        vertexPositionAttribute: gl.getAttribLocation(lightShader, "aVertexPosition"),
        vertexColorsAttribute: gl.getAttribLocation(lightShader, "aVertexColor"),
        vertexTexcoordsAttribute: gl.getAttribLocation(lightShader, "aTextureCoord")
    };


    lightShader.uniforms = {
        worldMatrixUniform: gl.getUniformLocation(lightShader, "uWorldMatrix"),
        viewMatrixUniform: gl.getUniformLocation(lightShader, "uViewMatrix"),
        projectionMatrixUniform: gl.getUniformLocation(lightShader, "uProjectionMatrix"),
        textureUniform: gl.getUniformLocation(lightShader, "uTexture"),
        colorUniform: gl.getUniformLocation(lightShader, "uColor")
    };
}

// -------------------------------------------------------------------------
function createScene() {
    sunGeometry = new WebGLGeometryJSON(gl, lightShader);
    sunGeometry.create(loadedAssets.sphereJSON, loadedAssets.sunImage);
    var scale = new Matrix4().makeScale(0.1, 0.1, 0.1);
    sunGeometry.worldMatrix.makeIdentity().multiply(scale);

    mercuryGeometry = new WebGLGeometryJSON(gl, phongShaderProgram);
    mercuryGeometry.create(loadedAssets.sphereJSON, loadedAssets.mercuryImage);
    var scale = new Matrix4().makeScale(0.02, 0.02, 0.02);
    mercuryGeometry.worldMatrix.makeIdentity().multiply(scale);


    venusGeometry = new WebGLGeometryJSON(gl, phongShaderProgram);
    venusGeometry.create(loadedAssets.sphereJSON, loadedAssets.venusImage);
    var scale = new Matrix4().makeScale(0.02, 0.02, 0.02);
    venusGeometry.worldMatrix.makeIdentity().multiply(scale);


    earthGeometry = new WebGLGeometryJSON(gl, phongShaderProgram);
    earthGeometry.create(loadedAssets.sphereJSON, loadedAssets.earthImage);
    var scale = new Matrix4().makeScale(0.03, 0.03, 0.03);
    earthGeometry.worldMatrix.makeIdentity().multiply(scale);


    cloudGeometry = new WebGLGeometryJSON(gl, phongShaderProgram);
    cloudGeometry.create(loadedAssets.sphereJSON, loadedAssets.cloudImage);
    var scale = new Matrix4().makeScale(0.031, 0.0301, 0.0301);
    cloudGeometry.worldMatrix.makeIdentity().multiply(scale);
    cloudGeometry.alpha = 0.5;


    moonGeometry = new WebGLGeometryJSON(gl, phongShaderProgram);
    moonGeometry.create(loadedAssets.sphereJSON, loadedAssets.moonImage);
    var scale = new Matrix4().makeScale(0.01, 0.01, 0.01);
    moonGeometry.worldMatrix.makeIdentity();
    moonGeometry.worldMatrix.makeIdentity().multiply(scale);


    marsGeometry = new WebGLGeometryJSON(gl, phongShaderProgram);
    marsGeometry.create(loadedAssets.sphereJSON, loadedAssets.marsImage);
    var scale = new Matrix4().makeScale(0.025, 0.025, 0.025);
    marsGeometry.worldMatrix.makeIdentity().multiply(scale);


    jupiterGeometry = new WebGLGeometryJSON(gl, phongShaderProgram);
    jupiterGeometry.create(loadedAssets.sphereJSON, loadedAssets.jupiterImage);
    var scale = new Matrix4().makeScale(0.07, 0.07, 0.07);
    jupiterGeometry.worldMatrix.makeIdentity().multiply(scale);


    saturnGeometry = new WebGLGeometryJSON(gl, phongShaderProgram);
    saturnGeometry.create(loadedAssets.sphereJSON, loadedAssets.saturnImage);
    var scale = new Matrix4().makeScale(0.06, 0.06, 0.06);
    saturnGeometry.worldMatrix.makeIdentity().multiply(scale);


    uranusGeometry = new WebGLGeometryJSON(gl, phongShaderProgram);
    uranusGeometry.create(loadedAssets.sphereJSON, loadedAssets.uranusImage);
    var scale = new Matrix4().makeScale(0.055, 0.055, 0.055);
    uranusGeometry.worldMatrix.makeIdentity().multiply(scale);


    neptuneGeometry = new WebGLGeometryJSON(gl, phongShaderProgram);
    neptuneGeometry.create(loadedAssets.sphereJSON, loadedAssets.neptuneImage);
    var scale = new Matrix4().makeScale(0.055, 0.055, 0.055);
    neptuneGeometry.worldMatrix.makeIdentity().multiply(scale);


    bottomGeometry = new WebGLGeometryQuad(gl, lightShader);
    bottomGeometry.create(loadedAssets.bottomImage);
    var scale = new Matrix4().makeScale(500.0, 500.0, 500.0);
    var translation = new Matrix4().makeTranslation(0, 0, -200);
    var rotation = new Matrix4().makeRotationX(-90);
    bottomGeometry.worldMatrix.makeIdentity();
    bottomGeometry.worldMatrix.multiply(rotation).multiply(translation).multiply(scale);


    topGeometry = new WebGLGeometryQuad(gl, lightShader);
    topGeometry.create(loadedAssets.topImage);
    var scale = new Matrix4().makeScale(500.0, 500.0, 500.0);
    var translation = new Matrix4().makeTranslation(0, 0, 200);
    var rotation = new Matrix4().makeRotationX(-90);
    topGeometry.worldMatrix.makeIdentity();
    topGeometry.worldMatrix.multiply(rotation).multiply(translation).multiply(scale);


    backwardGeometry = new WebGLGeometryQuad(gl, lightShader);
    backwardGeometry.create(loadedAssets.backwardImage);
    var scale = new Matrix4().makeScale(500.0, 500.0, 500.0);
    var translation = new Matrix4().makeTranslation(0, 0, 200);
    backwardGeometry.worldMatrix.makeIdentity();
    backwardGeometry.worldMatrix.multiply(translation).multiply(scale);


    forwardGeometry = new WebGLGeometryQuad(gl, lightShader);
    forwardGeometry.create(loadedAssets.forwardImage);
    var scale = new Matrix4().makeScale(500.0, 500.0, 500.0);
    var translation = new Matrix4().makeTranslation(0, 0, -200);
    forwardGeometry.worldMatrix.makeIdentity();
    forwardGeometry.worldMatrix.multiply(translation).multiply(scale);


    leftGeometry = new WebGLGeometryQuad(gl, lightShader);
    leftGeometry.create(loadedAssets.leftImage);
    var scale = new Matrix4().makeScale(500.0, 500.0, 500.0);
    var translation = new Matrix4().makeTranslation(0, 0, 200);
    var rotation = new Matrix4().makeRotationY(-90);
    leftGeometry.worldMatrix.makeIdentity();
    leftGeometry.worldMatrix.multiply(rotation).multiply(translation).multiply(scale);


    rightGeometry = new WebGLGeometryQuad(gl, lightShader);
    rightGeometry.create(loadedAssets.rigthImage);
    var scale = new Matrix4().makeScale(500.0, 500.0, 500.0);
    var translation = new Matrix4().makeTranslation(0, 0, -200);
    var rotation = new Matrix4().makeRotationY(-90);
    rightGeometry.worldMatrix.makeIdentity();
    rightGeometry.worldMatrix.multiply(rotation).multiply(translation).multiply(scale);
}

// -------------------------------------------------------------------------
function updateAndRender() {
    requestAnimationFrame(updateAndRender);

    var aspectRatio = gl.canvasWidth / gl.canvasHeight;

    var rotationMatrix = new Matrix4().makeRotationY(time.secondsElapsedSinceStart * 70);
    var SelfRotation = new Matrix4().makeRotationY(time.secondsElapsedSinceStart * 45);
    var CloudRotation = new Matrix4().makeRotationY(time.secondsElapsedSinceStart * -25);

    var mercuryRotation = new Matrix4().makeRotationY(time.secondsElapsedSinceStart * 45);
    var mercuryTranslation = new Matrix4().makeTranslation(18, 0, 0);
    var mercuryScale = new Matrix4().makeScale(0.02, 0.02, 0.02);
    var mercuryMatrix = mercuryRotation.clone().multiply(mercuryTranslation).multiply(SelfRotation).multiply(mercuryScale);
    mercuryGeometry.worldMatrix.copy(mercuryMatrix);


    var venusRotation = new Matrix4().makeRotationY(time.secondsElapsedSinceStart * 38);
    var venusTranslation = new Matrix4().makeTranslation(25, 0, 0);
    var venusScale = new Matrix4().makeScale(0.02, 0.02, 0.02);
    var venusMatrix = venusRotation.clone().multiply(venusTranslation).multiply(SelfRotation).multiply(venusScale);
    venusGeometry.worldMatrix.copy(venusMatrix);
    
    
    var earthRotation = new Matrix4().makeRotationY(time.secondsElapsedSinceStart * 34);
    var earthTranslation = new Matrix4().makeTranslation(33, 0, 0);
    var earthScale = new Matrix4().makeScale(0.03, 0.03, 0.03);
    var earthMatrix = earthRotation.clone().multiply(earthTranslation).multiply(SelfRotation).multiply(earthScale);
    earthGeometry.worldMatrix.copy(earthMatrix);


    var cloudRotation = new Matrix4().makeRotationY(time.secondsElapsedSinceStart * 34);
    var cloudTranslation = new Matrix4().makeTranslation(33, 0, 0);
    var cloudScale = new Matrix4().makeScale(0.031, 0.031, 0.031);
    var cloudMatrix = cloudRotation.clone().multiply(cloudTranslation).multiply(CloudRotation).multiply(cloudScale);
    cloudGeometry.worldMatrix.copy(cloudMatrix);


    var moonRotation = new Matrix4().makeRotationY(time.secondsElapsedSinceStart * 45);
    var moonTranslation = new Matrix4().makeTranslation(2,0,2);
    var moonScale = new Matrix4().makeScale(0.01, 0.01, 0.01);
    var moonMatrix = earthRotation.multiply(earthTranslation).multiply(moonRotation).multiply(moonTranslation).multiply(SelfRotation).multiply(moonScale);
    moonGeometry.worldMatrix.copy(moonMatrix);


    var marsRotation = new Matrix4().makeRotationY(time.secondsElapsedSinceStart * 32);
    var marsTranslation = new Matrix4().makeTranslation(41, 0, 0);
    var marsScale = new Matrix4().makeScale(0.025, 0.025, 0.025);
    var marsMatrix = marsRotation.clone().multiply(marsTranslation).multiply(SelfRotation).multiply(marsScale);
    marsGeometry.worldMatrix.copy(marsMatrix);


    var jupiterRotation = new Matrix4().makeRotationY(time.secondsElapsedSinceStart * 30);
    var jupiterTranslation = new Matrix4().makeTranslation(50, 0, 0);
    var jupiterScale = new Matrix4().makeScale(0.07, 0.07, 0.07);
    var jupiterMatrix = jupiterRotation.clone().multiply(jupiterTranslation).multiply(SelfRotation).multiply(jupiterScale);
    jupiterGeometry.worldMatrix.copy(jupiterMatrix);


    var saturnRotation = new Matrix4().makeRotationY(time.secondsElapsedSinceStart * 29);
    var saturnTranslation = new Matrix4().makeTranslation(60, 0, 0);
    var saturnScale = new Matrix4().makeScale(0.06, 0.06, 0.06);
    var saturnMatrix = saturnRotation.clone().multiply(saturnTranslation).multiply(SelfRotation).multiply(saturnScale);
    saturnGeometry.worldMatrix.copy(saturnMatrix);


    var uranusRotation = new Matrix4().makeRotationY(time.secondsElapsedSinceStart * 27);
    var uranusTranslation = new Matrix4().makeTranslation(70, 0, 0);
    var uranusScale = new Matrix4().makeScale(0.055, 0.055, 0.055);
    var uranusMatrix = uranusRotation.clone().multiply(uranusTranslation).multiply(SelfRotation).multiply(uranusScale);
    uranusGeometry.worldMatrix.copy(uranusMatrix);


    var neptuneRotation = new Matrix4().makeRotationY(time.secondsElapsedSinceStart * 25);
    var neptuneTranslation = new Matrix4().makeTranslation(80, 0, 0);
    var neptuneScale = new Matrix4().makeScale(0.055, 0.055, 0.055);
    var neptuneMatrix = neptuneRotation.clone().multiply(neptuneTranslation).multiply(SelfRotation).multiply(neptuneScale);
    neptuneGeometry.worldMatrix.copy(neptuneMatrix);

    var sunScale = new Matrix4().makeScale(0.1, 0.1, 0.1);
    var sunMatrix = rotationMatrix.clone().multiply(sunScale);
    sunGeometry.worldMatrix.copy(sunMatrix);

    if (appInput.a) {
        var cameraMatrix = earthGeometry.worldMatrix.clone();
        cameraMatrix.multiply(new Matrix4().makeTranslation(100,100,100));
        camera.cameraWorldMatrix.copy(cameraMatrix);
        camera.lookAt(camera.getPosition, new Vector3(earthGeometry.worldMatrix.elements[3],earthGeometry.worldMatrix.elements[7],earthGeometry.worldMatrix.elements[11]));
    }
    if (appInput.d) {
        camera.cameraWorldMatrix = cameraSunPosition;
        camera.cameraTarget = new Vector4(0,0,0,1);
    }


    time.update();
    camera.update(time.deltaTime);
    gl.viewport(0, 0, gl.canvasWidth, gl.canvasHeight);
    gl.clearColor(0.707, 0.707, 1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    gl.useProgram(phongShaderProgram);
    var uniforms = phongShaderProgram.uniforms;
    var cameraPosition = camera.getPosition();
    gl.uniform3f(uniforms.lightPositionUniform, lightPosition.x, lightPosition.y, lightPosition.z);
    gl.uniform3f(uniforms.cameraPositionUniform, cameraPosition.x, cameraPosition.y, cameraPosition.z);
    

    projectionMatrix.makePerspective(45, aspectRatio, 0.1, 1000);
    earthGeometry.render(camera, projectionMatrix, phongShaderProgram);
    // cloudGeometry.render(camera, projectionMatrix, phongShaderProgram);
    moonGeometry.render(camera, projectionMatrix, phongShaderProgram);
    venusGeometry.render(camera, projectionMatrix, phongShaderProgram);
    marsGeometry.render(camera, projectionMatrix, phongShaderProgram);
    jupiterGeometry.render(camera, projectionMatrix, phongShaderProgram);
    saturnGeometry.render(camera, projectionMatrix, phongShaderProgram);
    uranusGeometry.render(camera, projectionMatrix, phongShaderProgram);
    neptuneGeometry.render(camera, projectionMatrix, phongShaderProgram);
    mercuryGeometry.render(camera, projectionMatrix, phongShaderProgram);


    gl.useProgram(lightShader);
    sunGeometry.render(camera, projectionMatrix, lightShader);
    bottomGeometry.render(camera, projectionMatrix, lightShader);
    topGeometry.render(camera, projectionMatrix, lightShader);
    backwardGeometry.render(camera, projectionMatrix, lightShader);
    forwardGeometry.render(camera, projectionMatrix, lightShader);
    leftGeometry.render(camera, projectionMatrix, lightShader);
    rightGeometry.render(camera, projectionMatrix, lightShader);    

    gl.disable(gl.BLEND);
}
