let canvas = document.getElementById("chell");
let ctx = canvas.getContext("2d");
let chellSP = new Image();
let cubeSP = new Image();
let imgs = {};
let keys = {};
let scrollX = canvas.width/2;
let scrollY = canvas.height/2;
let SCROLLX = 0;
document.addEventListener("keydown",function(e){
  if(document.activeElement==canvas) keys[e.key] = true;
});
document.addEventListener("keyup",function(e){
  if(document.activeElement==canvas) keys[e.key] = false;
});
chellSP.onload = function(){
  Promise.all([
    createImageBitmap(chellSP,0,0,189,223),
    createImageBitmap(chellSP,189,0,189,223)
  ]).then(function(imgbuff){
    let x = {
      "Stand-Right":imgbuff[0],
      "Stand-Left":imgbuff[1]
    };
    Object.assign(imgs,x);
  })
  loading++;
}
cubeSP.onload = function(){
  Promise.all([
    createImageBitmap(cubeSP,0,0,101,101),
    createImageBitmap(cubeSP,101,0,101,101)
  ]).then(function(imgbuff){
    let x = {
      "Company":imgbuff[0],
      "Company-Active":imgbuff[1]
    };
    Object.assign(imgs,x);
  })
  loading++;
}
let loading = 0;
CanvasRenderingContext2D.prototype.rotateAround = function(x,y,r){
  /*
    Rotates all future commands by r radians around the point (x,y)
  */
  this.translate(x,y)
  this.rotate(r)
  this.translate(-x,-y)
}
class Rectangle{
  constructor(x,y,w,h,r=0){
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.r = r*Math.PI/180
  }
  render(){
    ctx.rotateAround(this.x,this.y,this.r)
    ctx.fillRect(this.x,this.y,this.w,this.h);
    ctx.rotateAround(this.x,this.y,-this.r)
  }
}
class Ellipse{
  constructor(x,y,a,b){
    this.x = x;
    this.y = y;
    this.a = a;
    this.b = b;
  }
  render(){
    ctx.beginPath();
    ctx.ellipse(this.x,this.y,this.a,this.b,0,0,Math.PI*2);
    ctx.closePath();
    ctx.fill();
  }
}
class Polygon{
  constructor(vert1,vert2,vert3,...verts){
    this.verts = [vert1,vert2,vert3,...verts];
  }
  render(){
    ctx.beginPath();
    ctx.moveTo(this.verts[0][0],this.verts[0][1]);
    let verts = this.verts.slice(1);
    for(let vert of verts){
      ctx.lineTo(vert[0],vert[1]);
    }
    ctx.closePath();
    ctx.fill();
  }
}
class Box{
  constructor(x,y,cmpy=false){
    this.x = x;
    this.y = y;
    this.w = 48;
    this.h = 48;
    this.r = 0;
    this.cmpy = cmpy
  }
  render(){
    ctx.rotateAround(this.x,this.y,this.r)
    renderImg("Company",this.x,this.y);
    ctx.rotateAround(this.x,this.y,-this.r)
  }
}
let level = {
  width: 1000,
  height: 600,
  collideables: [
    new Rectangle(0,540,1000,60),
    new Polygon([100,400],[100+25*Math.sqrt(3),375],[100+50*Math.sqrt(3),400],[100+50*Math.sqrt(3),450],[100+25*Math.sqrt(3),475],[100,450]),
  ],
  entities: [
    new Box(100,100,true)
  ]
};
chellSP.src = "img/chell1.png"
cubeSP.src = "img/cube.png"
let entities = [...level.entities];
function renderImg(imgIdx,x,y,s=1){
  let img = imgs[imgIdx];
  if(img===undefined){return;}
  s = s/2;
  w = img.width*s;
  h = img.height*s;
  ctx.drawImage(img,x,y,w,h);
}
const PLAYER_SCALE = 0.77
const GRAVITY = 1.1;
class Player{
  constructor(x,y) {
    this.x = x;
    this.y = y;
    this.boundW = 46*PLAYER_SCALE;
    this.boundH = 92*PLAYER_SCALE;
    this.dir = 1;
    this.xVel = 0;
    this.yVel = 0;
    this.jump = 0;
    this.fall = 0;
    this.boundLeft = 19*PLAYER_SCALE;
    this.boundUp = 11*PLAYER_SCALE;
  }
  render(){
    if (this.dir==1) {
      renderImg("Stand-Right",this.x-this.boundLeft-this.boundW/2,this.y-this.boundUp-this.boundH/2,PLAYER_SCALE);
    }else{
      renderImg("Stand-Left",this.x-(94.5*PLAYER_SCALE-this.boundW-this.boundLeft)-this.boundW/2,this.y-this.boundUp-this.boundH/2,PLAYER_SCALE);
    }
  }
  get getHitbox(){
    return [
      [this.x-this.boundW/2,this.y-this.boundH/2],
      [this.x+this.boundW/2,this.y-this.boundH/2],
      [this.x+4,this.y+this.boundH/2-4],
      [this.x,this.y+this.boundH/2],
      [this.x-4,this.y+this.boundH/2-4]
    ];
  }
  update(){
    let KX = Number(Boolean(keys["d"])||Boolean(keys["ArrowRight"]))-Number(Boolean(keys["a"])||Boolean(keys["ArrowLeft"]))
    let KY = Number(Boolean(keys["s"])||Boolean(keys["ArrowDown"]))-Number(Boolean(keys["w"])||Boolean(keys["ArrowUp"])||Boolean(keys[" "]))
    if(Math.abs(this.xVel)<16) this.xVel += KX*(this.fall<3?1.44:0.22);
    this.xVel *= this.fall<3?0.85:1;
    if(Math.abs(this.xVel)>16&&this.fall<3) this.xVel = 16*Math.sign(this.xVel);
    this.yVel+=GRAVITY;
    this.fall++
    if (KX!=0) this.dir = KX;
    if (this.fall==1) this.yVel = GRAVITY
    if(KY<0&&(this.fall<3||this.jump>0)){
      this.jump++
      if(this.jump<3){
        this.yVel = -6-1.3*this.jump;
      }
      if(this.jump<8){
        this.yVel = -8;  
      }
    }else{
      this.jump = 0;
    }
    this.xStep(Math.ceil(Math.abs(this.xVel)));
    this.yStep(Math.ceil(Math.abs(this.yVel)),KY);
    SCROLLX += (this.x-SCROLLX)/5;
    scrollY += (this.y-scrollY)/5;
    scrollX = this.x-(SCROLLX-this.x);
    scrollX = Math.max(Math.min(level.width-canvas.width/2,scrollX),canvas.width/2)
    scrollY = Math.max(Math.min(level.height-canvas.height/2,scrollY),canvas.height/2)
  }
  xStep(step){
    for(let _ = 0;_<step;_++){
      this.x+=this.xVel/step
      if(this.collide()){
        this.y--;
        if(this.collide()){
          this.y--
          if(this.collide()){
            this.y += 2;
            this.x-=this.xVel/step;
            this.xVel = 0;
            return;
          }
          this.xVel *= 0.9
        }
        this.xVel *= 0.95
        this.slip();
      }
    }
  }
  yStep(step,KY){
    for(let _ = 0;_<step;_++){
      this.y+=this.yVel/step
      if(this.collide()) {
        this.y-=this.yVel/step;
        if(this.yVel>0) this.fall = 0;
        if(KY>0) this.jump = 0;
        this.yVel *= 0.8;
        this.slip();
        return;
      }
    }
  }
  slip(){
    this.y += 2;
    this.x++;
    if(!this.collide()){
      this.y -= 2;
      this.x--;
      this.fall = 9;
      this.xVel++;
      return;
    }
    this.x -= 2;
    if(!this.collide()){
      this.y -= 2;
      this.x++;
      this.fall = 9;
      this.xVel--;
      return;
    }
    this.y -= 2;
    this.x++;
  }
  collide(){
    for(let obj of level.collideables){
      switch(Object.getPrototypeOf(obj).constructor.name){
        case "Rectangle":
          if(this.collideRect(obj)) {return true;}
          break;
        case "Ellipse":
          if(this.collideEllipse(obj)) {return true;}
          break;
        case "Polygon":
          if(this.collidePoly(obj)) {return true;}
          break;
      }
    }
    return false;
  }
  collideRect(obj){
    return collidePolyRect(this.getHitbox,obj);
  }
  collideEllipse(obj){
    return collidePolyEllipse(this.getHitbox,obj);
  }
  collidePoly(obj){
    return collidePolyPoly(this.getHitbox,obj.verts);
  }
}
let player = new Player(100,100);
setInterval(function(){
  ctx.resetTransform();
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0,0,canvas.width,canvas.height);
  if(loading<2){
    ctx.fillStyle = "black"
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = "white"
    ctx.font = "30px Noto Sans";
    ctx.textAlign = "center";
    ctx.fillText("Loading, please wait...",canvas.width/2,canvas.height/2)
    return;
  }
  player.update();
  ctx.translate(canvas.width/2-scrollX,canvas.height/2-scrollY);
  ctx.fillStyle = "black";
  for(let obj of level.collideables){
    obj.render();
  }
  for(let ent of entities){
    ent.render();
  }
  player.render();
},1000/60)
