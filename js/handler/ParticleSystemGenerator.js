var ParticleSystemGenerator = function(){

}

ParticleSystemGenerator.prototype.generatePlasma = function(configurations){
  var name = configurations.name;
  var position = configurations.position;
  var expireTime = configurations.expireTime;
  var velocity = configurations.velocity;
  var acceleration = configurations.acceleration;
  var radius = configurations.radius;
  var avgParticleSpeed = configurations.avgParticleSpeed;
  var particleCount = configurations.particleCount;
  var particleSize = configurations.particleSize;
  var alpha = (!(typeof configurations.alpha == UNDEFINED))? configurations.alpha: 1;
  var colorName = configurations.colorName;
  var textureName = configurations.textureName;
  var rgbFilter = configurations.rgbFilter;
  var alphaVariation = configurations.alphaVariation;
  var particleMaterialConfigurations = new Object();
  particleMaterialConfigurations.color = colorName;
  particleMaterialConfigurations.size = particleSize;
  particleMaterialConfigurations.alpha = alpha;
  if (!(typeof textureName == UNDEFINED)){
    particleMaterialConfigurations.textureName = textureName;
  }
  if (rgbFilter){
    particleMaterialConfigurations.rgbFilter = rgbFilter;
  }
  var particleMaterial = this.generateParticleMaterial(particleMaterialConfigurations);
  var particles = [];
  var particleConfigurations = new Object();
  if (!(typeof alphaVariation == UNDEFINED)){
    particleConfigurations.alphaVariationMode = ALPHA_VARIATION_MODE_SIN;
    particleConfigurations.alphaVariation = alphaVariation;
  }
  particleConfigurations.motionMode = MOTION_MODE_CIRCULAR;
  particleConfigurations.angularMotionRadius = radius;
  var tmpVec = new THREE.Vector3(0, 1, 0);
  for (var i = 0; i < particleCount; i++){
    particleConfigurations.angularVelocity = avgParticleSpeed * (Math.random() - 0.5);
    particleConfigurations.initialAngle = 360 * Math.random();
    particleConfigurations.angularQuaternion = ROYGBIV.computeQuaternionFromVectors(tmpVec, new THREE.Vector3(radius * (Math.random() - 0.5), radius * (Math.random() - 0.5) , radius * (Math.random() - 0.5)));
    particleConfigurations.material = particleMaterial;
    particleConfigurations.lifetime = 0;
    particleConfigurations.respawn = false;
    particles.push(this.generateParticle(particleConfigurations));
  }
  var particleSystemConfigurations = new Object();
  particleSystemConfigurations.name = name;
  particleSystemConfigurations.particles = particles;
  particleSystemConfigurations.position = position;
  particleSystemConfigurations.velocity = velocity;
  particleSystemConfigurations.acceleration = acceleration;
  particleSystemConfigurations.lifetime = expireTime;
  return this.generateParticleSystem(particleSystemConfigurations);
}

ParticleSystemGenerator.prototype.generateParticleMaterial = function(configurations){
  var color = configurations.color;
  var size = configurations.size;
  var alpha = configurations.alpha;
  var textureName = configurations.textureName;
  var rgbFilter = configurations.rgbFilter;
  var targetColor = configurations.targetColor;
  var colorStep = (!(typeof configurations.colorStep == UNDEFINED))? configurations.colorStep: 0;
  return new ParticleMaterial(configurations);
}

ParticleSystemGenerator.prototype.generateParticle = function(configurations){
  var position = configurations.position;
  var material = configurations.material;
  var lifetime = configurations.lifetime;
  var respawn = configurations.respawn;
  var alphaVariation = configurations.alphaVariation;
  var alphaVariationMode = configurations.alphaVariationMode;
  var startDelay = (!(typeof configurations.startDelay == UNDEFINED))? configurations.startDelay: 0;
  var trailMode = (!(typeof configurations.trailMode == UNDEFINED))? configurations.trailMode: false;
  var useWorldPosition = (!(typeof configurations.useWorldPosition == UNDEFINED))? configurations.useWorldPosition: false;
  var velocity = (!(typeof configurations.velocity == UNDEFINED))? configurations.velocity: new THREE.Vector3(0, 0, 0);
  var acceleration = (!(typeof configurations.acceleration == UNDEFINED))? configurations.acceleration: new THREE.Vector3(0, 0, 0);
  var initialAngle = configurations.initialAngle;
  var angularVelocity = (!(typeof configurations.angularVelocity == UNDEFINED))? configurations.angularVelocity: 0;
  var angularAcceleration = (!(typeof configurations.angularAcceleration == UNDEFINED))? configurations.angularAcceleration: 0;
  var angularMotionRadius = (!(typeof configurations.angularMotionRadius == UNDEFINED))? configurations.angularMotionRadius: 0;
  var angularQuaternion = (!(typeof configurations.angularQuaternion == UNDEFINED))? configurations.angularQuaternion: REUSABLE_QUATERNION.set(0, 0, 0, 1);
  var motionMode = (!(typeof configurations.motionMode == UNDEFINED))? configurations.motionMode: MOTION_MODE_NORMAL;
  if (motionMode == MOTION_MODE_NORMAL){
    initialAngle = 0;
  }
  if (motionMode == MOTION_MODE_CIRCULAR){
    position = new THREE.Vector3(0, 0, 0);
  }
  var particle = new Particle(position.x, position.y, position.z, material, lifetime);
  if (respawn){
    particle.respawnSet = true;
  }
  if (!(typeof alphaVariation == UNDEFINED)){
    particle.alphaDelta = alphaVariation;
  }else{
    particle.alphaDelta = 0;
  }
  if (!(typeof alphaVariationMode == UNDEFINED)){
    particle.alphaVariationMode = alphaVariationMode;
  }else{
    particle.alphaVariationMode = ALPHA_VARIATION_MODE_NORMAL;
  }
  particle.startDelay = startDelay;
  particle.originalStartDelay = startDelay;
  particle.trailFlag = trailMode;
  particle.useWorldPositionFlag = useWorldPosition;
  particle.gpuVelocity = velocity;
  particle.gpuAcceleration = acceleration;
  particle.initialAngle = initialAngle;
  particle.angularVelocity = angularVelocity;
  particle.angularAcceleration = angularAcceleration;
  particle.angularMotionRadius = angularMotionRadius;
  particle.angularQuaternion = angularQuaternion;
  particle.motionMode = motionMode;
  particle.angularQuaternionX = angularQuaternion.x;
  particle.angularQuaternionY = angularQuaternion.y;
  particle.angularQuaternionZ = angularQuaternion.z;
  particle.angularQuaternionW = angularQuaternion.w;
  return particle;
}

ParticleSystemGenerator.prototype.generateParticleSystem = function(configurations){
  var name = configurations.name;
  var particles = configurations.particles;
  var position = configurations.position;
  var lifetime = configurations.lifetime;
  var updateFunction = configurations.updateFunction;
  var velocity = configurations.velocity;
  var acceleration = configurations.acceleration;
  var angularVelocity = (!(typeof configurations.angularVelocity == UNDEFINED))? configurations.angularVelocity: 0;
  var angularAcceleration = (!(typeof configurations.angularAcceleration == UNDEFINED))? configurations.angularAcceleration: 0;
  var angularMotionRadius = (!(typeof configurations.angularMotionRadius == UNDEFINED))? configurations.angularMotionRadius: 0;
  var angularQuaternion = (!(typeof configurations.angularQuaternion == UNDEFINED))? configurations.angularQuaternion: REUSABLE_QUATERNION.set(0, 0, 0, 1);
  var initialAngle = (!(typeof configurations.initialAngle == UNDEFINED))? configurations.initialAngle: 0;
  var motionMode = (!(typeof configurations.motionMode == UNDEFINED))? configurations.motionMode: MOTION_MODE_NORMAL;
  var vx = 0, vy = 0, vz = 0, ax = 0, ay = 0, az = 0;
  if (velocity){
    vx = velocity.x;
    vy = velocity.y;
    vz = velocity.z;
  }
  if (acceleration){
    ax = acceleration.x;
    ay = acceleration.y;
    az = acceleration.z;
  }
  if (!updateFunction){
    updateFunction = null;
  }
  var particleSystem = new ParticleSystem(null, name, particles, position.x, position.y, position.z, vx, vy, vz, ax, ay, az, motionMode, updateFunction);
  particleSystem.lifetime = lifetime;
  particleSystem.angularVelocity = angularVelocity;
  particleSystem.angularAcceleration = angularAcceleration;
  particleSystem.angularMotionRadius = angularMotionRadius;
  particleSystem.angularQuaternionX = angularQuaternion.x;
  particleSystem.angularQuaternionY = angularQuaternion.y;
  particleSystem.angularQuaternionZ = angularQuaternion.z;
  particleSystem.angularQuaternionW = angularQuaternion.w;
  particleSystem.initialAngle = initialAngle;
  TOTAL_PARTICLE_SYSTEM_COUNT ++;
  return particleSystem;
}
