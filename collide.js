Math.dist = function(x1,y1,x2,y2){
  return Math.sqrt(Math.normSquared(x1,y1,x2,y2))
}
Math.normSquared = function(x1,y1,x2,y2){
  return (x1-x2)*(x1-x2)+(y1-y2)*(y1-y2);
}
function constLine(x1,y1,x2,y2){
  return {x1:x1,y1:y1,x2:x2,y2:y2}
}
function constRect(x,y,w,h,r){
  return {x:x,y:y,w:w,h:h,r:r}
}
function constEllipse(x,y,a,b){
  return {x:x,y:y,a:a,b:b}
}
function collideRectPoint(rect,point){
  return point[0]>=rect.x&&point[0]<=rect.x+rect.w&&point[1]>=rect.y&&point[1]<=rect.y+rect.h;
}
function collideRectRect(rect1,rect2){
  let theta;
  let dist;
  rect1 = {x:rect1.x,y:rect1.y,w:rect1.w,h:rect1.h,r:rect1.r};
  rect2 = {x:rect2.x,y:rect2.y,w:rect2.w,h:rect2.h,r:rect2.r};
  if(Math.abs(rect1.r-rect2.r)>0){
    if(rect1.r!==0){
      theta = Math.atan2(rect1.y,rect1.x);
      dist = Math.sqrt(rect1.x*rect1.x+rect1.y*rect1.y);
      rect1.x = dist*Math.cos(theta-rect1.r);
      rect1.y = dist*Math.sin(theta-rect1.r);
      theta = Math.atan2(rect2.y,rect2.x);
      dist = Math.sqrt(rect2.x*rect2.x+rect2.y*rect2.y);
      rect2.x = dist*Math.cos(theta-rect1.r);
      rect2.y = dist*Math.sin(theta-rect1.r);
      rect2.r = rect2.r-rect1.r;
      rect1.r = 0
    }
    return _collideRotRectRect(rect1,rect2);
  }
  if(rect1.r!==0){
    theta = Math.atan2(rect1.y,rect1.x);
    dist = Math.sqrt(rect1.x*rect1.x+rect1.y*rect1.y);
    rect1.x = dist*Math.cos(theta-rect1.r);
    rect1.y = dist*Math.sin(theta-rect1.r);
    theta = Math.atan2(rect2.y,rect2.x);
    dist = Math.sqrt(rect2.x*rect2.x+rect2.y*rect2.y);
    rect2.x = dist*Math.cos(theta-rect1.r);
    rect2.y = dist*Math.sin(theta-rect1.r);
  }
  return (rect1.x+rect1.w/2>rect2.x && rect1.x-rect1.w/2<rect2.x+rect2.w && rect1.y+rect1.h/2>rect2.y && rect1.y-rect1.h/2<rect2.y+rect2.h);
}
function _collideRotRectRect(rect1,rect2){
  let temp;
  rect2.r = ((rect2.r+Math.PI)%(2*Math.PI))-Math.PI;
  if(rect2.r>Math.PI/4){
    rect2.r-=Math.PI/2;
    temp = rect2.w;
    rect2.w = rect2.h;
    rect2.h = temp;
    rect2.x = rect2.x-Math.cos(rect2.r)*rect2.w;
    rect2.y = rect2.y-Math.sin(rect2.r)*rect2.h;
  }else if(rect2.r<Math.PI/4){
    rect2.r+=Math.PI/2;
    temp = rect2.w;
    rect2.w = rect2.h;
    rect2.h = temp;
    rect2.x = rect2.x-Math.sin(rect2.r)*rect2.w;
    rect2.y = rect2.y-Math.cos(rect2.r)*rect2.h;
  }
  if(rect2.r===0) return collideRectRect(rect1,rect2);
  if(rect1.x+rect1.w/2<rect2.x-(rect2.r<0?0:rect2.h*Math.sin(rect2.r))) return false;
  if(rect1.x-rect1.w/2>rect2.x+rect2.w*Math.cos(rect2.r)-(rect2.r>0?0:rect2.h*Math.sin(rect2.r))) return false;
  if(rect1.y+rect1.h/2<rect2.y+(rect2.r>0?0:rect2.w*Math.sin(rect2.r))) return false;
  if(rect1.y-rect1.h/2>rect2.y+rect2.h*Math.cos(rect2.r)+(rect2.r<0?0:rect2.w*Math.sin(rect2.r))) return false;
  return (rect1.x+rect1.w/2>rect2.x-(rect1.y-rect2.y)/Math.cos(rect2.r)*Math.sin(rect2.r)-rect1.h/2*Math.sign(rect2.r)*Math.tan(rect2.r) && rect1.x-rect1.w/2<rect2.x+rect2.w*Math.cos(rect2.r)-(rect1.y-(rect2.y+rect2.w*Math.sin(rect2.r)))/Math.sin(rect2.r)*Math.cos(rect2.r)+rect1.h/2*Math.sign(rect2.r)*Math.tan(rect2.r) && rect1.y+rect1.h/2>rect2.y+(rect1.x-rect2.x)/Math.cos(rect2.r)*Math.sin(rect2.r)-rect1.w/2*Math.sign(rect2.r)*Math.tan(rect2.r) && rect1.y-rect1.h/2<rect2.y+rect2.h*Math.cos(rect2.r)+(rect1.x-(rect2.x-rect2.h*Math.sin(rect2.r)))/Math.cos(rect2.r)*Math.sin(rect2.r)+rect1.w/2*Math.sign(rect2.r)*Math.tan(rect2.r))
}
function collideLinePoint(line,point,buffer){
  if (buffer==undefined) buffer=0.
  let len = Math.dist(line.x1,line.y1,line.x2,line.y2);
  let d1 = Math.dist(point[0],point[1],line.x1,line.y1);
  let d2 = Math.dist(point[0],point[1],line.x2,line.y2);
  return Math.abs(d1+d2-len)<buffer
}
function collideLineRect(line,rect){
  return collideLineLine(line,{x1:rect.x,y1:rect.y,x2:rect.x+Math.cos(rect.r)*rect.w,y2:rect.y+Math.sin(rect.r)*rect.w})||collideLineLine(line,{x1:rect.x+Math.cos(rect.r)*rect.w,y1:rect.y+Math.sin(rect.r)*rect.w,x2:rect.x+Math.cos(rect.r)*rect.w-Math.sin(rect.r)*rect.h,y2:rect.y+Math.sin(rect.r)*rect.w+Math.cos(rect.r)*rect.h})||collideLineLine(line,{x1:rect.x+Math.cos(rect.r)*rect.w-Math.sin(rect.r)*rect.h,y1:rect.y+Math.sin(rect.r)*rect.w+Math.cos(rect.r)*rect.h,x2:rect.x-Math.sin(rect.r)*rect.h,y2:rect.y+Math.cos(rect.r)*rect.h})||collideLineLine(line,{x1:rect.x-Math.sin(rect.r)*rect.h,y1:rect.y+Math.cos(rect.r)*rect.h,x2:rect.x,y2:rect.y});
};
function collideLineLine(line1,line2,intersection){
  if(intersection==undefined) intersection = false;
  let a = ((line2.x2-line2.x1)*(line1.y1-line2.y1)-(line2.y2-line2.y1)*(line1.x1-line2.x1))/((line2.y2-line2.y1)*(line1.x2-line1.x1)-(line2.x2-line2.x1)*(line1.y2-line1.y1));
  let b = ((line1.x2-line1.x1)*(line1.y1-line2.y1)-(line1.y2-line1.y1)*(line1.x1-line2.x1))/((line2.y2-line2.y1)*(line1.x2-line1.x1)-(line2.x2-line2.x1)*(line1.y2-line1.y1));
  if(intersection&&a>=0&&a<=1&&b>=0&&b<=1){
    return [line1.x1+(line1.x2-line1.x1)*a,line1.y1+(line1.y2-line1.y1)*a];
  }
  return a>=0&&a<=1&&b>=0&&b<=1;
}
function collideEllipsePoint(ellipse,point){
  if(point[0]<ellipse.x-ellipse.a||point[0]>ellipse.x+ellipse.a||point[1]<ellipse.y-ellipse.b||point[1]>ellipse.y+ellipse.b) return false;
  let relX = point[0]-ellipse.x;
  let relY = point[1]-ellipse.y;
  let ellipseRel = Math.sqrt(Math.abs(ellipse.a*ellipse.a-relX-relX));
  return relY<=ellipseRel&&yy>=-ellipseRel
}
function collideEllipseRect(ellipse,rect){
  if(rect.r!==0) return _collideEllipseRotRect(ellipse,rect);
  let x = ellipse.x;
  let y = ellipse.y;
  if(ellipse.x<rect.x) x = rect.x;
  else if(ellipse.x>rect.x+rect.w) x = rect.x+rect.w;
  if(ellipse.y<rect.y) y = rect.y
  else if(ellipse.y>rect.y+rect.h) y = rect.y+rect.h;
  return (((x-ellipse.x)/ellipse.a)**2+((y-ellipse.y)/ellipse.b)**2)<=1;
}
function _collideEllipseRotRect(ellipse,rect){
  return collideEllipseLine(ellipse,{x1:rect.x,y1:rect.y,x2:rect.x+Math.cos(rect.r)*rect.w,y2:rect.y+Math.sin(rect.r)*rect.w})||collideEllipseLine(ellipse,{x1:rect.x+Math.cos(rect.r)*rect.w,y1:rect.y+Math.sin(rect.r)*rect.w,x2:rect.x+Math.cos(rect.r)*rect.w-Math.sin(rect.r)*rect.h,y2:rect.y+Math.sin(rect.r)*rect.w+Math.cos(rect.r)*rect.h})||collideEllipseLine(ellipse,{x1:rect.x+Math.cos(rect.r)*rect.w-Math.sin(rect.r)*rect.h,y1:rect.y+Math.sin(rect.r)*rect.w+Math.cos(rect.r)*rect.h,x2:rect.x-Math.sin(rect.r)*rect.h,y2:rect.y+Math.cos(rect.r)*rect.h})||collideEllipseLine(ellipse,{x1:rect.x-Math.sin(rect.r)*rect.h,y1:rect.y+Math.cos(rect.r)*rect.h,x2:rect.x,y2:rect.y});
}
function collideEllipseLine(ellipse,line){
  ellipse = {x:ellipse.x,y:ellipse.y,a:ellipse.a,b:ellipse.b};
  line = {x1:line.x1,y1:line.y1,x2:line.x2,y2:line.y2};
  ellipse.y = ellipse.y*ellipse.a/ellipse.b;
  line.y1 = line.y1*ellipse.a/ellipse.b;
  line.y2 = line.y2*ellipse.a/ellipse.b;
  let len = Math.dist(line.x1,line.y1,line.x2,line.y2);
  let dot = (ellipse.x-line.x1)*(line.x2-line.x1)+(ellipse.y-line.y1)*(line.y1-line.y1)/(len*len);
  let closest = {x:line.x1+dot*(line.x2-line.x1),y:line.y1+dot*(line.y2-line.y1)};
  return Math.dist(ellipse.x,ellipse.y,closest.x,closest.y)<=ellipse.a;
}
function collideCircleCircle(circle1,circle2){
  return Math.dist(circle1.x,circle1.y,circle2.x,circle2.y)>=(circle1.r+circle2.r);
}
function collidePolyPoint(verts,point){
  let collide = false;
  let j;
  let vert1;
  let vert2;
  for(let i=0;i<verts.length;i++){
    j = (i+1)%verts.length;
    vert1 = verts[i];
    vert2 = verts[j];
    if(((vert1[1]>=point[1]&&vert2[1]<point[1])||(vert1[1]<point[1]&&vert2[1]>=point[1]))&&(point[0]<(vert2[0]-vert1[0])*(point[1]-vert1[1])/(vert2[1]-vert1[1])+vert1[0])) collide = !collide;
  }
  return collide;
}
function collidePolyRect(verts,rect){
  let j;
  for(let i = 0;i<verts.length;i++){
    j = (i+1)%verts.length;
    if(collideLineRect({x1:verts[i][0],y1:verts[i][1],x2:verts[j][0],y2:verts[j][1]},rect)) return true;
  }
  return false;
}
function collidePolyLine(verts,line){
  let j;
  for(let i = 0;i<verts.length;i++){
    j = (i+1)%verts.length;
    if(collideLineLine({x1:verts[i][0],y1:verts[i][1],x2:verts[j][0],y2:verts[j][1]},line)) return true;
  }
  return false;
}
function collidePolyEllipse(verts,ellipse){
  let j;
  for(let i = 0;i<verts.length;i++){
    j = (i+1)%verts.length;
    if(collideEllipseLine(ellipse,{x1:verts[i][0],y1:verts[i][1],x2:verts[j][0],y2:verts[j][1]})) return true;
  }
  return false;
}
function collidePolyPoly(verts1,verts2){
  let j;
  for(let i = 0;i<verts1.length;i++){
    j = (i+1)%verts1.length;
    if(collidePolyLine(verts2,{x1:verts1[i][0],y1:verts1[i][1],x2:verts1[j][0],y2:verts1[j][1]})) return true;
  }
  return false;
}