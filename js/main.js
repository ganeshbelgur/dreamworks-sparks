// Set up three.js global variables
var scene, camera, renderer, container, loadingManager;
// Set up avatar global variables
var initX = 1.6, initY = 1.23, initZ = 0;
var runOnce = true;

// Transfer global variables
var i_share = 0, n_share = 1, i_delta = 0.0;

//emitters
var primaryEmitter = [], particleCountPrimaryEmitter = 1000;
var secondaryEmitter = [], particleCountSecondaryEmitter = 250;
var tertiaryEmitter = [], particleCountTertiaryEmitter = 3000;
var sParticleEmitterSystem = [], numOfsParticleEmitter = 9000;

//boundingVolumes
var boundingBox = [];

init();
animate();

// Sets up the scene.
function init()
{
    // Create the scene and set the scene size.
    scene = new THREE.Scene();
    
    // keep a loading manager
    loadingManager = new THREE.LoadingManager();

    // Get container information
    container = document.createElement( 'div' );
    document.body.appendChild( container ); 
        
    var WIDTH = window.innerWidth, HEIGHT = window.innerHeight; //in case rendering in body
    
    // Create a renderer and add it to the DOM.
    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(WIDTH, HEIGHT);
    // Set the background color of the scene.
    renderer.setClearColor(0x333333, 1);
    //document.body.appendChild(renderer.domElement); //in case rendering in body
    container.appendChild( renderer.domElement );

    // Create a camera, zoom it out from the model a bit, and add it to the scene.
    camera = new THREE.PerspectiveCamera(45.0, WIDTH / HEIGHT, 0.01, 100);
    camera.position.set(-2, 2, -5);
    //camera.lookAt(new THREE.Vector3(5,0,0));
    scene.add(camera);
  
    // Create an event listener that resizes the renderer with the browser window.
    window.addEventListener('resize',
        function ()
        {
            var WIDTH = window.innerWidth, HEIGHT = window.innerHeight;
            renderer.setSize(WIDTH, HEIGHT);
            camera.aspect = WIDTH / HEIGHT;
            camera.updateProjectionMatrix();
        }
    );
 
    // Create a light, set its position, and add it to the scene.
    var alight = new THREE.AmbientLight(0xFFFFFF);
    alight.position.set(-100.0, 200.0, 100.0);
    scene.add(alight);

    var directionalLight = new THREE.DirectionalLight( 0xffeedd );
              directionalLight.position.set( 0, 5, 0 );
               directionalLight.castShadow = true;
               scene.add( directionalLight );

    // Load in the mesh and add it to the scene.
    var sawBlade_texPath = 'assets/sawblade.jpg';
    var sawBlade_objPath = 'assets/sawblade.obj';
    OBJMesh(sawBlade_objPath, sawBlade_texPath, "sawblade", 2, 0, 0);

    var ground_texPath = 'assets/ground_tile.jpg';
    var ground_objPath = 'assets/ground.obj';
    OBJMesh(ground_objPath, ground_texPath, "ground", 0, 0, 0);

    var slab_texPath = 'assets/slab.jpg';
    var slab_objPath = 'assets/slab.obj';
    OBJMesh(slab_objPath, slab_texPath, "slab", 2, 0, 0);
    

    var bunny_texPath = 'assets/rocky.jpg';
    var bunny_objPath = 'assets/stanford_bunny.obj';
    OBJMesh(bunny_objPath, bunny_texPath, "bunny", 3, 0, 0);
    
    
    var sphere_texPath = 'assets/rocky.jpg';
    var sphere_objPath = 'assets/sphere.obj';
    OBJMesh(sphere_objPath, sphere_texPath, "sphere", 0, 0, 0);


    var cube_texPath = 'assets/rocky.jpg';
    var cube_objPath = 'assets/cube.obj';
    OBJMesh(cube_objPath, cube_texPath, "cube", 1, 0, -1);
    
    var cone_texPath = 'assets/rocky.jpg';
    var cone_objPath = 'assets/cone.obj';
    OBJMesh(cone_objPath, cone_texPath, "cone", 1, 0, 1);

    // Add OrbitControls so that we can pan around with the mouse.
    controls = new THREE.OrbitControls(camera, renderer.domElement);

    controls.enableDamping = true;
    controls.dampingFactor = 0.4;
    controls.userPanSpeed = 0.01;
    controls.userZoomSpeed = 0.01;
    controls.userRotateSpeed = 0.01;
    controls.minPolarAngle = -Math.PI/2;
    controls.maxPolarAngle = Math.PI/2;
    controls.minDistance = 0.01;
    controls.maxDistance = 30;
    controls.autoRotate = true;


    clock = new THREE.Clock();
    var delta = clock.getDelta();
}

function rand(min, max){
    return Math.random() * (max - min) + min;
}

function sparkParticleMesh(launchVector) {
    this.material = new THREE.LineBasicMaterial({
    color: 0xffcc00, opacity: 1
    });

    this.material.linewidth = rand(2, 4);
    this.material.transparent = true;
    this.geometry = new THREE.Geometry();
    this.geometry.vertices.push(
    new THREE.Vector3( 0, rand(0.03, 0.07), 0),
    new THREE.Vector3( 0, rand(-0.03, -0.07), 0)
    );

    this.particleMesh = new THREE.Line( this.geometry, this.material );
    this.particleMesh.material.opacity = 1;

    this.particleMesh.position.x = initX;
    this.particleMesh.position.y = initY;
    this.particleMesh.position.z = initZ;
    this.initialVector = launchVector;

    this.axis = new THREE.Vector3(0,1,0);
    this.velocityVector = this.initialVector;

    scene.add(this.particleMesh);

    this.isInvisible = function() {
    	return this.particleMesh.material.opacity <= 0;
    };

    this.setOpacityToZero = function() {
    	this.particleMesh.material.opacity = 0;
    }

    this.updateParticleMotion = function(decrX, decrY, decrLife, spreadXMin, spreadXMax, spreadYMin, spreadYMax, spreadZMin, spreadZMax){
        //Updating projectile motion vectors:
        this.velocityVector.x += -rand(decrX - 0.3, decrX + 0.3);
        this.velocityVector.y += -(0.5 * 0.1) * (0.25 * 0.25) * rand(decrY, decrY + 4); 
        this.particleMesh.material.opacity -= rand(decrLife - 0.1, decrLife + 0.1);

        this.particleMesh.position.x += this.velocityVector.x;
        this.particleMesh.position.y += this.velocityVector.y;
        this.particleMesh.position.z += this.velocityVector.z;
        
        this.particleMesh.quaternion.setFromUnitVectors(this.axis, this.velocityVector.clone().normalize());

        if(this.particleMesh.material.opacity <= 0){
            this.particleMesh.position.x = initX;
            this.particleMesh.position.y = initY;
            this.particleMesh.position.z = initZ;
            this.velocityVector = new THREE.Vector3(rand(spreadXMin, spreadXMax), rand(spreadYMin, spreadYMax), rand(spreadZMin,spreadZMax));
            this.particleMesh.material.opacity = 1;
        }
    };

    this.updateSecondaryParticleMotion = function(decrX, decrY, decrLife) {
    	//Updating projectile motion vectors:        
        this.velocityVector.x += -rand(decrX - 0.3, decrX + 0.3);
        this.velocityVector.y += -(0.5 * 0.1) * (0.25 * 0.25) * rand(decrY, decrY + 4); 
        this.particleMesh.material.opacity -= rand(decrLife - 0.1, decrLife + 0.1);

        this.particleMesh.position.x += this.velocityVector.x;
        this.particleMesh.position.y += this.velocityVector.y;
        this.particleMesh.position.z += this.velocityVector.z;
        
        this.particleMesh.quaternion.setFromUnitVectors(this.axis, this.velocityVector.clone().normalize());
    };

    this.resetSecondaryParticle = function(xX, yY, zZ, spreadXMin, spreadXMax, spreadYMin, spreadYMax, spreadZMin, spreadZMax) {
    	this.particleMesh.position.x = xX;
        this.particleMesh.position.y = yY;
        this.particleMesh.position.z = zZ;
        this.velocityVector = new THREE.Vector3(rand(spreadXMin, spreadXMax), rand(spreadYMin, spreadYMax), rand(spreadZMin,spreadZMax));
        this.particleMesh.material.opacity = 1;
        this.particleMesh.material.color.setHex(0xff8000);
        this.particleMesh.material.linewidth = 4;
    }

    this.collision = function(spreadXMin, spreadXMax, spreadYMin, spreadYMax, spreadZMin, spreadZMax){
        for(var i = 0; i < boundingBox.length; i++){
            if(boundingBox[i].containsPoint(new THREE.Vector3(this.particleMesh.position.x, this.particleMesh.position.y, this.particleMesh.position.z)) || this.particleMesh.position.y <= 0.05){
	                maintainSecondarySystem(this.particleMesh.position.x, this.particleMesh.position.y, this.particleMesh.position.z);
	                this.particleMesh.position.x = initX;
	                this.particleMesh.position.y = initY;
	                this.particleMesh.position.z = initZ;
	                this.velocityVector = new THREE.Vector3(rand(spreadXMin, spreadXMax), rand(spreadYMin, spreadYMax), rand(spreadZMin,spreadZMax));
	                this.particleMesh.material.opacity = 1;
	                break;
            }
        }
    };

    this.secondaryCollision = function() {
    	for(var i = 0; i < boundingBox.length; i++){
    		if(boundingBox[i].containsPoint(new THREE.Vector3(this.particleMesh.position.x, this.particleMesh.position.y, this.particleMesh.position.z)) || this.particleMesh.position.y <= 0.05){
    			this.particleMesh.material.opacity = 0;
    			break;
    		}
    	}
    };
}

//Replaces collision point with secondary particle emitter:
function maintainSecondarySystem(xX, yY, zZ){
	var count = 0;

	for(var i = 0; i < numOfsParticleEmitter; i++){
		if(sParticleEmitterSystem[i].isInvisible()){
			sParticleEmitterSystem[i].resetSecondaryParticle(xX, yY, zZ, -0.1, -0.15, 0.1, 0.4, -0.2, 0.2);
			count++;
		}

		if(count == 3)
			break;
	}
}

//Render loop:
function animate()
{
    renderer.render(scene, camera);
    requestAnimationFrame(animate);

//Setting up boundingVolumes and secondaryParticleSystem:
    if(runOnce){
        var obstacle = scene.getObjectByName("cube");
        var bboxCube = new THREE.Box3().setFromObject(obstacle);
        obstacle = scene.getObjectByName("cone");
        var bboxCone = new THREE.Box3().setFromObject(obstacle);
        obstacle = scene.getObjectByName("sphere");
        var bboxSphere = new THREE.Sphere(new THREE.Vector3(-3.25, 0.75, 0) ,0.75);
        obstacle = scene.getObjectByName("bunny");
        var bboxBunny = new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(0, 0.75, 0), new THREE.Vector3(0.75, 1.2, 0.7));

        boundingBox.push(bboxCube);
        boundingBox.push(bboxCone);
        boundingBox.push(bboxSphere);
        boundingBox.push(bboxBunny);

        for(var i = 0; i < numOfsParticleEmitter; i++){
        	var tempSecondaryParticle = new sparkParticleMesh(new THREE.Vector3(rand(-0.3, -0.2), rand(0.05, 0.7), rand(-0.15,0.15)));
        	tempSecondaryParticle.setOpacityToZero();
        	sParticleEmitterSystem.push(tempSecondaryParticle);
        }

        runOnce = false;
    }
//////////////////////////////////////////////////////////////////////////////////////////////////// Primary Emitter
    if(primaryEmitter.length <= particleCountPrimaryEmitter) {
        var priSparkParticle = new sparkParticleMesh(new THREE.Vector3(rand(-0.3, -0.2), rand(0.05, 0.7), rand(-0.15,0.15)));
        primaryEmitter.push(priSparkParticle);
    }

    for(var i = 0; i < primaryEmitter.length; i++){
        primaryEmitter[i].updateParticleMotion(0.01, 5, 0.1, -0.3, -0.2, 0.05, 0.7, -0.15, 0.15);
        primaryEmitter[i].collision(-0.1, -0.15, 0.1, 0.4, -0.2, 0.2);
    }

/////////////////////////////////////////////////////////////////////////////////////////////////// Secondary Emitter
    if(secondaryEmitter.length <= particleCountSecondaryEmitter) {
        var secSparkParticle = new sparkParticleMesh(new THREE.Vector3(rand(0.05, 0.15), rand(-0.05, -0.5), rand(-0.15,0.15)));
        secondaryEmitter.push(secSparkParticle);
    }

    for(var i = 0; i < secondaryEmitter.length; i++){
        secondaryEmitter[i].updateParticleMotion(0.01, 0.01, 0.1, 0.05, 0.1, -0.05, -0.5, -0.15, 0.15);
        secondaryEmitter[i].collision(0.05, 0.1, -0.05, -0.5, -0.15, 0.15);
    }
/////////////////////////////////////////////////////////////////////////////////////////////////// Teritary Emitter

    if( tertiaryEmitter.length <= particleCountTertiaryEmitter) {
        var terSparkParticle = new sparkParticleMesh(new THREE.Vector3(rand(-0.1,-0.15), rand(0.1,0.4), rand(-0.2,0.2)));
        tertiaryEmitter.push(terSparkParticle);
    }

    for(var i = 0; i < tertiaryEmitter.length; i++){
        tertiaryEmitter[i].updateParticleMotion(0.01, 10, 0.01, -0.1, -0.15, 0.1, 0.4, -0.2, 0.2);
        tertiaryEmitter[i].collision(-0.1, -0.15, 0.1, 0.4, -0.2, 0.2);
    }
//////////////////////////////////////////////////////////////////////////////////////////////////// Secondary Particles:
	for(var i = 0; i < sParticleEmitterSystem.length; i++){
		sParticleEmitterSystem[i].updateSecondaryParticleMotion(0.01, 0.1, 0.1);
		sParticleEmitterSystem[i].secondaryCollision();
	}

    controls.update();
    postProcess();
}

function rotate(object, axis, radians)
{
    var rotObjectMatrix = new THREE.Matrix4();
    rotObjectMatrix.makeRotationAxis(axis.normalize(), radians);
    object.applyMatrix(rotObjectMatrix);
}

function translate(object, x, y, z)
{
    var transObjectMatrix = new THREE.Matrix4();
    transObjectMatrix.makeTranslation(x, y, z);
    object.applyMatrix(transObjectMatrix);
}

function postProcess()
{
    var delta = clock.getDelta();
    var asset = scene.getObjectByName( "sawblade" );

    translate(asset, -2,-1.5,0);
    rotate(asset, new THREE.Vector3(0,0,1), 9* 10); //rotate sawblade
    translate(asset, 2,1.5,0);
}

function OBJMesh(objpath, texpath, objName, x, y, z)
{
    var texture = new THREE.TextureLoader( loadingManager ).load(texpath, onLoad, onProgress, onError);
    texture.minFilter = THREE.LinearFilter;
    var loader  = new THREE.OBJLoader( loadingManager ).load(objpath,  
        function ( object )
        {
            object.traverse(
                function ( child )
                {
                    if(child instanceof THREE.Mesh)
                    {
                        child.material.map = texture;
                        child.material.needsUpdate = true;
                    }
    
                }
            );

            object.name = objName;
            translate(object, x, y, z);
            scene.add( object );
            onLoad( object );
        },
    onProgress, onError);
}

function onLoad( object )
{
    putText(0, "", 0, 0);
    i_share ++;
    if(i_share >= n_share)
        i_share = 0;
}

function onProgress( xhr )
{ 
    if ( xhr.lengthComputable )
    {
        var percentComplete = 100 * ((xhr.loaded / xhr.total) + i_share) / n_share;
        putText(0, Math.round(percentComplete, 2) + '%', 10, 10);
    }
}

function onError( xhr )
{
    putText(0, "Error", 10, 10);
}


function putText( divid, textStr, x, y )
{
    var text = document.getElementById("avatar_ftxt" + divid);
    text.innerHTML = textStr;
    text.style.left = x + 'px';
    text.style.top  = y + 'px';
}

function putTextExt(dividstr, textStr) //does not need init
{
    var text = document.getElementById(dividstr);
    text.innerHTML = textStr;
}