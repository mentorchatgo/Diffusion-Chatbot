let data = JSON.parse(localStorage.getItem('data')||'[]');
let model = null;
const MAX = 64;
const alpha = " abcdefghijklmnopqrstuvwxyz";

function pad(a){
let r=a.slice(0,MAX);
while(r.length<MAX) r.push(0);
return r;
}

function enc(t){
return pad([...t.toLowerCase()].map(c=>alpha.indexOf(c))).map(x=>x<0?0:x);
}

function dec(v){
let s="";
for(let i=0;i<v.length;i++){
let x=Math.round(v[i]);
if(x>=0 && x<alpha.length) s+=alpha[x];
}
return s;
}

function addData(){
let q=document.getElementById('q').value;
let a=document.getElementById('a').value;
if(!q||!a) return;
data.push({q,a});
localStorage.setItem('data',JSON.stringify(data));
document.getElementById('status').innerText="Saved pairs: "+data.length;
}

function build(){
let xs=[],ys=[];
for(let d of data){
xs.push(pad(enc(d.q)));
ys.push(pad(enc(d.a)));
}
return {xs,ys};
}

function createModel(){
const m=tf.sequential();
m.add(tf.layers.dense({inputShape:[MAX],units:128,activation:'relu'}));
m.add(tf.layers.dense({units:128,activation:'relu'}));
m.add(tf.layers.dense({units:MAX}));
m.compile({optimizer:'adam',loss:'mse'});
return m;
}

async function train(){
let d=build();
model=createModel();
let xs=tf.tensor2d(d.xs);
let ys=tf.tensor2d(d.ys);
await model.fit(xs,ys,{epochs:50});
document.getElementById('status').innerText='Trained';
}

function predict(input){
let x=tf.tensor2d([pad(enc(input))]);
let y=model.predict(x);
return Array.from(y.dataSync());
}

function sendMessage(){
let m=document.getElementById('msg').value;
let chat=document.getElementById('chat');
chat.innerHTML+='<div><b>You:</b> '+m+'</div>';

let out;
if(model){
out=dec(predict(m));
}else{
out="Train me first";
}

chat.innerHTML+='<div><b>AI:</b> '+out+'</div>';
}