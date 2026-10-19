export const INK='#343b2e';
export function oval(c,x,y,rx,ry,fill,stroke=INK,width=2){c.beginPath();c.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),0,0,Math.PI*2);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
export function line(c,points,color=INK,width=2){c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.stroke();}
export function poly(c,points,color,stroke=INK,width=2){c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();c.fillStyle=color;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.lineJoin='round';c.stroke();}}
export function shape(c,path,fill,stroke=INK,width=2){const p=new Path2D(path);if(fill){c.fillStyle=fill;c.fill(p);}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.lineJoin='round';c.lineCap='round';c.stroke(p);}}
export function round(c,x,y,w,h,r,fill,stroke=INK,width=2){c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
export const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
export function star(c,x,y,r,color='#f8d780'){const p=[];for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,d=i%2?r*.45:r;p.push([x+Math.cos(a)*d,y+Math.sin(a)*d]);}poly(c,p,color,null);}
