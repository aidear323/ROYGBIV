importScripts("../worker/StateLoaderLightweight.js");
importScripts("../third_party/cannon.min.js");
importScripts("../handler/PhysicsBodyGenerator.js");
importScripts("../engine_objects/AddedObject.js");
importScripts("../engine_objects/ObjectGroup.js");
importScripts("../worker/WorkerMessageHandler.js");

var IS_WORKER_CONTEXT = true;

// CLASS DEFINITION
var PhysicsWorker = function(){
  this.idsByObjectName = new Object();
  this.objectsByID = new Object();
  this.workerMessageHandler = new WorkerMessageHandler();
  this.updateBufferSize = 10;
}
PhysicsWorker.prototype.refresh = function(state){
  this.idsByObjectName = new Object();
  this.objectsByID = new Object();
  var stateLoader = new StateLoaderLightweight(state);
  stateLoader.resetPhysics();
  stateLoader.loadPhysicsData();
  this.initPhysics();
  stateLoader.loadPhysics();
  this.dynamicObjectUpdateBuffer = [];
  this.dynamicObjectUpdateBufferAvailibilities = [];
  var idCtr = 0;
  var idResponse = {isIDResponse: true, ids: []}
  var dynamicObjCount = 0;
  for (var objName in addedObjects){
    idResponse.ids.push({
      name: objName, id: idCtr
    });
    this.idsByObjectName[objName] = idCtr;
    this.objectsByID[idCtr] = addedObjects[objName];
    if (addedObjects[objName].physicsBody.mass > 0){
      dynamicObjCount ++;
      dynamicAddedObjects.set(objName, addedObjects[objName]);
    }
    idCtr ++;
  }
  for (var objName in objectGroups){
    idResponse.ids.push({
      name: objName, id: idCtr
    });
    this.idsByObjectName[objName] = idCtr;
    this.objectsByID[idCtr] = objectGroups[objName];
    if (objectGroups[objName].physicsBody.mass > 0){
      dynamicObjCount ++;
      dynamicObjectGroups.set(objName, objectGroups[objName]);
    }
    idCtr ++;
  }
  for (var i = 0; i <dynamicObjCount * worker.updateBufferSize; i++){
    worker.dynamicObjectUpdateBuffer.push(new Float32Array(10));
    worker.dynamicObjectUpdateBufferAvailibilities.push(true);
  }
  postMessage(idResponse);
}
PhysicsWorker.prototype.initPhysics = function(){
  physicsWorld.quatNormalizeSkip = quatNormalizeSkip;
  physicsWorld.quatNormalizeFast = quatNormalizeFast;
  physicsWorld.defaultContactMaterial.contactEquationStiffness = contactEquationStiffness;
  physicsWorld.defaultContactMaterial.contactEquationRelaxation = contactEquationRelaxation;
  physicsWorld.defaultContactMaterial.friction = friction;
  physicsSolver.iterations = physicsIterations;
  physicsSolver.tolerance = physicsTolerance;
  physicsWorld.solver = physicsSolver;
  physicsWorld.gravity.set(0, gravityY, 0);
  physicsWorld.broadphase = new CANNON.SAPBroadphase(physicsWorld);
}
PhysicsWorker.prototype.debug = function(){
  var response = {isDebug: true, bodies: []};
  for (var i = 0; i<physicsWorld.bodies.length; i++){
    response.bodies.push({
      name: physicsWorld.bodies[i].roygbivName,
      position: {x: physicsWorld.bodies[i].position.x, y: physicsWorld.bodies[i].position.y, z: physicsWorld.bodies[i].position.z},
      quaternion: {x: physicsWorld.bodies[i].quaternion.x, y: physicsWorld.bodies[i].quaternion.y, z: physicsWorld.bodies[i].quaternion.z, w: physicsWorld.bodies[i].quaternion.w}
    });
  }
  postMessage(response);
}
PhysicsWorker.prototype.updateObject = function(ary){
  var obj = this.objectsByID[ary[2]];
  obj.physicsBody.position.set(ary[3], ary[4], ary[5]);
  obj.physicsBody.quaternion.set(ary[6], ary[7], ary[8], ary[9]);
}
PhysicsWorker.prototype.updateDynamicObjectBuffer = function(obj){
  for (var i = 0; i<worker.dynamicObjectUpdateBuffer.length; i++){
    if (worker.dynamicObjectUpdateBufferAvailibilities[i]){
      var buf = worker.dynamicObjectUpdateBuffer[i];
      buf[0] = 2;
      buf[1] = i;
      buf[2] = worker.idsByObjectName[obj.name];
      buf[3] = obj.physicsBody.position.x; buf[4] = obj.physicsBody.position.y; buf[5] = obj.physicsBody.position.z;
      buf[6] = obj.physicsBody.quaternion.x; buf[7] = obj.physicsBody.quaternion.y; buf[8] = obj.physicsBody.quaternion.z; buf[9] = obj.physicsBody.quaternion.w;
      worker.workerMessageHandler.push(buf.buffer);
      worker.dynamicObjectUpdateBufferAvailibilities[i] = false;
      return;
    }
  }
  console.error("[!] PhysicsWorker.updateDynamicObjectBuffer buffer overflow.");
}
PhysicsWorker.prototype.step = function(ary){
  physicsWorld.step(ary[2]);
  dynamicAddedObjects.forEach(this.updateDynamicObjectBuffer);
  dynamicObjectGroups.forEach(this.updateDynamicObjectBuffer)
}
// START
var PIPE = "|";
var UNDEFINED = "undefined";
var physicsShapeCache = new Object();
var dynamicAddedObjects = new Map();
var dynamicObjectGroups = new Map();
var addedObjects = new Object();
var objectGroups = new Object();
var physicsBodyGenerator = new PhysicsBodyGenerator();
var physicsWorld;
var quatNormalizeSkip, quatNormalizeFast, contactEquationStiffness, contactEquationRelaxation, friction;
var physicsIterations, physicsTolerance, physicsSolver, gravityY;
var worker = new PhysicsWorker();
self.onmessage = function(msg){
  if (msg.data.isLightweightState){
    worker.refresh(msg.data);
  }else if (msg.data.isDebug){
    worker.debug();
  }else{
    for (var i = 0; i<msg.data.length; i++){
      var ary = new Float32Array(msg.data[i]);
      if (ary[0] == 0){
        worker.updateObject(ary);
      }else if (ary[0] == 1){
        worker.step(ary);
      }else if (ary[0] == 2){
        var bufID = ary[1];
        worker.dynamicObjectUpdateBuffer[bufID] = ary;
        worker.dynamicObjectUpdateBufferAvailibilities[bufID] = true;
      }
      if (ary[0] != 2){
        worker.workerMessageHandler.push(ary.buffer);
      }
    }
    worker.workerMessageHandler.flush();
  }
}