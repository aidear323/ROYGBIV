var RMFHandler = function(){

}

RMFHandler.prototype.generate = function(positions, normals, uvs){
  var indexInfos = {};
  var indexInfosInverse = {};
  var curIndex = 0;

  var i2 = 0;
  var indices = [];
  for (var i = 0; i < positions.length; i += 3){
    var curPosX = positions[i];
    var curPosY = positions[i + 1];
    var curPosZ = positions[i + 2];
    var curNormalX = normals[i];
    var curNormalY = normals[i + 1];
    var curNormalZ = normals[i + 2];
    var curUVX = uvs[i2];
    var curUVY = uvs[i2 + 1];
    var key = curPosX + PIPE + curPosY + PIPE + curPosZ;
    key += PIPE + curNormalX + PIPE + curNormalY + PIPE + curNormalZ;
    key += PIPE + curUVX + PIPE + curUVY;
    if (indexInfos[key]){
      indices.push(indexInfos[key]);
    }else{
      indexInfos[key] = curIndex;
      indexInfosInverse[curIndex] = key;
      indices.push(curIndex);
      curIndex ++;
    }
    i2 += 2;
  }

  var info = [curIndex];

  for (var i = 0; i < curIndex; i ++){
    var key = indexInfosInverse[i];
    var splitted = key.split(PIPE);
    info.push(parseFloat(splitted[0]));
    info.push(parseFloat(splitted[1]));
    info.push(parseFloat(splitted[2]));
    info.push(parseFloat(splitted[3]));
    info.push(parseFloat(splitted[4]));
    info.push(parseFloat(splitted[5]));
    info.push(parseFloat(splitted[6]));
    info.push(parseFloat(splitted[7]));
  }

  for (var i = 0; i < indices.length; i ++){
    info.push(indices[i]);
  }

  return new Float32Array(info);
}

RMFHandler.prototype.load = function(folderName, onReady){
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "./models/" + folderName + "/model.rmf", true);
  xhr.responseType = "arraybuffer";

  xhr.onload = function (oEvent) {
    var arrayBuffer = xhr.response;
    var view = new Float32Array(arrayBuffer);

    var indicesLength = view[0];
    var positionsByIndex = {};
    var normalsByIndex = {};
    var uvsByIndex = {};

    var positions = [];
    var normals = [];
    var uvs = [];

    var totalRead = 0;
    var i = 1;
    while (totalRead != indicesLength){
      var curPosX = view[i ++];
      var curPosY = view[i ++];
      var curPosZ = view[i ++];
      var curNormalX = view[i ++];
      var curNormalY = view[i ++];
      var curNormalZ = view[i ++];
      var curUVX = view[i ++];
      var curUVY = view[i ++];

      positionsByIndex[totalRead] = {x: curPosX, y: curPosY, z: curPosZ};
      normalsByIndex[totalRead] = {x: curNormalX, y: curNormalY, z: curNormalZ};
      uvsByIndex[totalRead] = {x: curUVX, y: curUVY};

      totalRead ++;
    }

    for (var i = 1 + (indicesLength * 8); i < view.length; i ++){
      var curIndex = view[i];
      var pos = positionsByIndex[curIndex];
      var normal = normalsByIndex[curIndex];
      var uv = uvsByIndex[curIndex];
      positions.push(pos.x);
      positions.push(pos.y);
      positions.push(pos.z);
      normals.push(normal.x);
      normals.push(normal.y);
      normals.push(normal.z);
      uvs.push(uv.x);
      uvs.push(uv.y);
    }

    onReady(positions, normals, uvs);
  };

  xhr.send(null);
}
