"use strict";

/**
 * Take a complete shape, consisting of a set of points, and pad the lines
 * between points with additional points. Helps realism with aberration.
 *
 * Resolution is the distance between points on the connecting lines.
 */
function linesPadder(shape, resolution) {
    var tDisplace = quat4.create();
    var newShape = [];
    var distance;
    var numSteps;
    for(var i = 0; i < shape.length - 1; i++) {
        quat4.subtract(shape[i + 1], shape[i], tDisplace);
        distance = Math.sqrt(Math.abs(quat4.spaceDot(tDisplace, tDisplace)));
        numSteps = (Math.ceil(distance / resolution));
        if (numSteps == 0) {
            tDisplace = [0,0,0,0];
        } else {
            quat4.scale(tDisplace, (1 / (numSteps)) );
        }
        for(var j = 0; j <= numSteps; j++ ) {
            newShape.push(quat4.create(quat4.add(quat4.scale(tDisplace, j,
                                                             tempQuat4),
                                                 shape[i], tempQuat4)));
        }
    }
    return newShape;
}

/**
 * Draw a sphere of radius r consisting of numPts points interconnected by lines
 */
function shape_sphere(params) {
    var r = params[0];
    var numPts = params[1];
    
    var Sphere = [];
    var numAngles = Math.ceil(Math.sqrt(numPts));
    for (var i = 0; i < (numAngles); i++) {
	    for (var j = 0; j < numAngles; j++) {
            Sphere.push(quat4.create([
		        Math.cos(6.283 * j / numAngles) * Math.sin(3.1416 * (i+j / numAngles) / numAngles) * r,
		        Math.sin(6.283 * j / numAngles) * Math.sin(3.1416 * (i+j / numAngles) / numAngles) * r,
		        Math.cos(3.1416 * (i+j / numAngles) /  numAngles) * r,
		        0]));
	    }
    }
    return Sphere;
}

/**
 * Draw a circle of radius r consisting of numPts points interconnected by lines
 */
function shape_circle(params) {
    var r = params[0];
    var numPts = params[1];
    
    var Circle = [];
    for (var i = 0; i <= numPts; i++) {
        Circle.push(quat4.create([Math.cos(6.283 * i / numPts + twopi*3/4) * r, 
                                  Math.sin(6.283 * i / numPts + twopi*3/4) * r, 
                                  0, 0]));
    }
    return Circle;
}


/**
 * Draw a stick figure with head radius size/2 and width 2*size,
 * with resolution proportional to detail.
 */
function shape_man(params) {
    var size = params[0];
    var detail = params[1];
    
    var headPts = shape_circle([size/2, detail]);
    var bodyPts = linesPadder([[0, -1.2*size, 0, 0], [-size, -0.2*size, 0, 0], 
                               [0, -1.2*size, 0, 0], [ size, -0.2*size, 0, 0],
                               [0, -1.2*size, 0, 0], [0, -2*size, 0, 0],
                               [-size, -3*size, 0, 0], [0, -2*size, 0, 0],
                               [size, -3*size, 0, 0]], 9*size / detail);
    return headPts.concat(bodyPts);
}

/**
 * Draw a potted plant with height roughly 2*size and resolution proportional
 * to detail.
 */
function shape_potPlant(params) {
    var size = params[0];
    var detail = params[1];
    
    var flower = shape_circle(size / 5, detail / 5);
    for (var i = 0; i <= detail; i++) {
        flower.push(quat4.create([Math.cos(6.283 * i / detail + twopi*3/4) * (size / 5 + size / 3 * Math.abs(Math.sin(2.5*6.283 * i / detail))),
                                  Math.sin(6.283 * i / detail + twopi*3/4) * (size / 5 + size / 3 * Math.abs(Math.sin(2.5*6.283 * i / detail))), 
                                  0, 0]));
    }
    var stemPot = linesPadder([[0,        -size / 5,  0, 0], [0,         -size,    0, 0],
                               [-0.5*size, -size,     0, 0], [-0.4*size, -1.8*size,0, 0], 
                               [0.4*size,  -1.8*size, 0, 0], [0.5*size,  -size,    0, 0],
                               [0,         -size,     0, 0]], 8 * size / detail);
    return flower.concat(stemPot);
}

function shape_rAsteroid(params) {
    var size = params[0];
    var detail = params[1];
    
    var rAsteroid = [];
    var randRadius = size / 2 * (Math.abs(Math.random()) + 0.2);
    var prevPt, nextPt;
    nextPt =[Math.cos(6.283 * i / 10) * randRadius,
             Math.sin(6.283 * i / 10) * randRadius,
             0,
             0];
    for (var i = 0; i < 10; i++) {
        randRadius = size / 2 * (Math.abs(Math.random()) + 0.2);
        prevPt = nextPt;
        nextPt = ([Math.cos(6.283 * i / 10) * randRadius,
                   Math.sin(6.283 * i / 10) * randRadius,
                   0,
                   0]);
        rAsteroid = rAsteroid.concat(linesPadder([prevPt,nextPt], 
                                                 size / detail / 0.2));
    }
    rAsteroid.push(rAsteroid[0]);
    return rAsteroid;
}


function shape_triSphere(params) {
    var r = params.r;
    var detail = params.detail;
    var UVpts = params.UVpts;
    var UVlen = UVpts[2] - UVpts[0];
    var UVht  = UVpts[3] - UVpts[1];


    var triangles = [];
    var vertices = [];
    var UV = [];
    var normals = [];
    var cos = Math.cos;
    var sin = Math.sin;

    var psteps = detail;
    var tsteps = detail;
    var ct1, st1, ct2, st2, cp1, sp1, cp2, sp2;
    var t,p;

    for ( p = 0; p <= psteps; p++ ) {
        cp1 = cos(p / (psteps) *  Math.PI);
        sp1 = sin(p / (psteps) *  Math.PI);

        for ( t = 0; t <= tsteps; t++ ) {
            ct1 = cos(t / (tsteps) * 2 * Math.PI);
            st1 = sin(t / (tsteps) * 2 * Math.PI);
            vertices[tsteps * p + t]           = [r * ct1 * sp1, -r * st1 * sp1, r * cp1,0];
            vertices[tsteps * p + t]           = [r * ct1 * sp1, -r * cp1, r * st1 * sp1,0];
            UV[tsteps * p + t]           = [(t) / tsteps * UVlen + UVpts[0], (p) / psteps * UVht + UVpts[1]];
            normals[tsteps * p + t]           = [ct1 * sp1, -st1 * sp1, cp1];
            normals[tsteps * p + t]           = [ct1 * sp1, -cp1,  st1 * sp1];
            if ( p < psteps && t < tsteps) {
            triangles[2*(tsteps * p + t)] = [tsteps * p + t,
                                             tsteps * p + t + 1,
                                             tsteps * (p + 1) + t];
            triangles[2*(tsteps * p + t) + 1] = [tsteps * p + t + 1,
                                             tsteps * (p + 1) + t + 1,
                                             tsteps * (p + 1) + t];
            }
        }
    }
    return {vertices: vertices, 
            triangles: triangles,
            UV: UV,
            slight : { temp : 3000, wavelength : 530e-9, lum : 0.1 },
            normals: normals,
            v: [0,0.566 * 3e8,0,3e8]
    };

}
