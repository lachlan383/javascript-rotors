var prams = {
  fullscreen: true,
  autostart: true
};
var elem = document.body;
var two = new Two(prams).appendTo(elem);

var keyPressed = "";

// 3-dimensional vector
class Vector3 {
	
	constructor(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
	}
	
	add(vec) {
		this.x += vec.x;
		this.y += vec.y;
		this.z += vec.z;
	}
	
 	equals(vec){
		return ( (this.x == vec.x) && (this.y == vec.y) && (this.z == vec.z) );
	} 
	
	// dot product
	dot(vec) {
		return (this.x * vec.x + this.y * vec.y + this.z * vec.z);
	}
}

// 3-dimensional bivector
class Bivector3 {
	constructor(xy, yz, zx) {
		this.xy = xy;
		this.yz = yz;
		this.zx = zx;
	}
}

// Wedge operator of two 3D vectors:
function wedge3(u, v) {
	return new Bivector3(	u.x * v.y - v.x * u.y,
							u.y * v.z - v.y * u.z,
							u.z * v.x - v.z * u.x	);
}

// 3-dimensional rotor
class Rotor3 {
	constructor(vecFrom, vecTo) {
		this.a = 1 + vecTo.dot(vecFrom);
		var negBivec = wedge3(vecTo, vecFrom); // negative because (ba)v(ab) conjugates
		this.xy = negBivec.xy;
		this.yz = negBivec.yz;
		this.zx = negBivec.zx;
		this.normalize();
	}
		
	normalize() {
        var n = Math.sqrt(this.a**2 + this.xy**2 + this.yz**2 + this.zx**2);
        this.a /= n;
        this.xy /= n;
        this.yz /= n;
        this.zx /= n;
	}
	
	rotate(vec) {
		var u = this;
		var v = vec;
		var q = new Vector3(	u.a * v.x + v.y * u.xy - v.z * u.zx,
								u.a * v.y + v.z * u.yz - v.x * u.xy,
								u.a * v.z + v.x * u.zx - v.y * u.yz	);
		// Trivector:
		var qxyz = - v.x * u.yz - v.y * u.zx - v.z * u.xy;
		return new Vector3(		u.a * q.x + q.y * u.xy - q.z * u.zx - qxyz * u.yz,
								u.a * q.y + q.z * u.yz - q.x * u.xy - qxyz * u.zx,
								u.a * q.z + q.x * u.zx - q.y * u.yz - qxyz * u.xy	);
	}
	
	slerp(v, t) {
		var r  = new Rotor3(v, v);
		var d = this.a * r.a + this.xy * r.xy + this.yz * r.yz + this.zx * r.zx;
		var a0 = Math.acos(d);
		var sa0 = Math.sin(a0);
		var at = a0 * t;
		var sat = Math.sin(at);
		
		var s0 = Math.cos(at) - d * sat / sa0;
		var s1 = sat / sa0;
		
		r.a = s0 * r.a + s1 * this.a;
		r.xy = s0 * r.xy + s1 * this.xy;
		r.yz = s0 * r.yz + s1 * this.yz;
		r.zx = s0 * r.zx + s1 * this.zx;
		
		return r;
	}		
	
	
}

// Screen-local axes:
var up = new Vector3(0, -1, 0);
var right = new Vector3(1, 0, 0);
var fwd = new Vector3(0, 0, 1);
				
// list of objects: coords as vector, and drawing details: colour, shape, line, etc.
var objects = [
		{ color: 'forestgreen', line: true, pos: new Vector3(0,-1,0), handle: {} },
		{ color: 'orangered', line: true, pos: new Vector3(1,0,0), handle: {} },
		{ color: 'dodgerblue', line: true, pos: new Vector3(0,0,-1), handle: {} },
		{ color: 'grey', line: false, pos: new Vector3(2,2,2), handle: {} },
		{ color: 'grey', line: false, pos: new Vector3(2,2,-2), handle: {} },
		{ color: 'grey', line: false, pos: new Vector3(2,-2,2), handle: {} },
		{ color: 'grey', line: false, pos: new Vector3(2,-2,-2), handle: {} },
		{ color: 'grey', line: false, pos: new Vector3(-2,2,2), handle: {} },
		{ color: 'grey', line: false, pos: new Vector3(-2,2,-2), handle: {} },
		{ color: 'grey', line: false, pos: new Vector3(-2,-2,2), handle: {} },
		{ color: 'grey', line: false, pos: new Vector3(-2,-2,-2), handle: {} }
];

var x = two.width * 0.5;
var y = two.height * 0.5;

var len = 0.1 * Math.min(two.width, two.height);

two.bind('update', update);
function update(frameCount) {
	
	two.clear();
	
	var vecFrom = new Vector3(0,0,0);
	var vecTo = new Vector3(0,0,0);
	
	if (keyPressed == "KeyA"){
		vecFrom.add(right);
		vecTo.add(fwd);
	}
	if (keyPressed == "KeyD"){
		vecFrom.add(fwd);
		vecTo.add(right);
	}
	if (keyPressed == "KeyW"){
		vecFrom.add(fwd);
		vecTo.add(up);
	}
	if (keyPressed == "KeyS"){
		vecFrom.add(up);
		vecTo.add(fwd);
	}
	if (keyPressed == "KeyQ"){
		vecFrom.add(right);
		vecTo.add(up);
	}
	if (keyPressed == "KeyE"){
		vecFrom.add(up);
		vecTo.add(right);
	}	
	if (!vecFrom.equals(vecTo)){
		var a = new Rotor3(vecFrom, vecTo).slerp(vecFrom, 0.05);
		for (let i = 0; i < objects.length; i++){
			objects[i].pos = a.rotate(objects[i].pos);
		}
	}
	
	// Sort by z-depth (draw closer objects over the top of further ones):
	objects.sort(function(a, b){return a.pos.z - b.pos.z;});
	
	for (let i = 0; i < objects.length; i++){
		if (objects[i].line){
			objects[i].handle = two.makeLine(x, y, x + objects[i].pos.x * len, y + objects[i].pos.y * len);
			objects[i].handle.stroke = objects[i].color;
			objects[i].handle.linewidth = 2;
		}
		objects[i].handle = two.makeCircle(x + objects[i].pos.x*len, y + objects[i].pos.y*len, len*(1+0.2*objects[i].pos.z)/5);
		objects[i].handle.noStroke();
		objects[i].handle.fill = objects[i].color;
		objects[i].handle.stroke = '#333';
	}
}

document.addEventListener("keypress", keyDown);
function keyDown(e){
	keyPressed = e.code;
};

document.addEventListener("keyup", keyUp);
function keyUp(e){
	if (keyPressed == e.code){
		keyPressed = "";
	}
};