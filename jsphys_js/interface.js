/**
 * User interface event handling -- mouse and keyboard input
 */



function inputInit()
{
    boostRight  = cBoostMat(vec3.create([0, 0.05, 0]), c);
    boostLeft   = cBoostMat(vec3.create([0, -0.05, 0]), c);
    boostUp     = cBoostMat(vec3.create([0, 0, -0.05]), c);
    boostDown   = cBoostMat(vec3.create([0, 0, 0.05]), c);
    
    rotLeft  = mat3.create([1, 0, 0,
                            0, Math.cos(0.1), Math.sin(0.1),
                            0, Math.sin(-0.1), Math.cos(0.1)]);
    rotRight = mat3.create([1, 0, 0,
                            0, Math.cos(0.1), Math.sin(-0.1),
                            0, Math.sin(0.1), Math.cos(0.1)]);
}

// Get Key Input
function onKeyDown(evt) 
{
    if (!keySinceLastFrame)
    {
    	if (evt.keyCode == 81) rotLeftDown = true;
    	else if (evt.keyCode == 69) rotRightDown = true;
        else if (evt.keyCode == 68) rightDown = true;
    	else if (evt.keyCode == 65) leftDown = true;
    	else if (evt.keyCode == 87) upDown = true;
    	else if (evt.keyCode == 83) downDown = true;
        else if (evt.keyCode == 90)
        {
            showDoppler = !showDoppler;
        }
        else if (evt.keyCode == 88)
        {
            showFramePos = !showFramePos;
        }
        else if (evt.keyCode == 67)
        {
            showVisualPos = !showVisualPos;
        }
    	else if (evt.keyCode == 61) 
    	{
    	    zoom = zoom / 2;
            if (zoom < 0.06 ) zoom = 0.6;
            boostRight  = cBoostMat(vec3.create([0, 0.02 / zoom, 0]), c);
            boostLeft   = cBoostMat(vec3.create([0, -0.02 / zoom, 0]), c);
            boostUp     = cBoostMat(vec3.create([0, 0, -0.02 / zoom]), c);
            boostDown   = cBoostMat(vec3.create([0, 0, 0.02 / zoom]), c);
    	}
    	else if (evt.keyCode == 109) 
    	{
    	    zoom = zoom * 2;
            if (zoom > 40) zoom = 40;
            boostRight  = cBoostMat(vec3.create([0, 0.02 * zoom,0]), c);
            boostLeft   = cBoostMat(vec3.create([0, -0.02 * zoom,0]), c);
            boostUp     = cBoostMat(vec3.create([0, 0, -0.02 * zoom]), c);
            boostDown   = cBoostMat(vec3.create([0, 0, 0.02 * zoom]), c);
    	}
    	
    	if (rightDown == true)
    	{
    		for (i = 0; i < carray.length; i++)
    		{
    			carray[i].COM.changeFrame(vec3.create([0,0,0]), boostRight);
    		}
    	}
    	if (leftDown == true)
    	{
    		for (i = 0; i < carray.length; i++)
    		{
    			carray[i].COM.changeFrame(vec3.create([0,0,0]), boostLeft);
    		}
    	}
    	if (upDown == true)
    	{
    		for (i = 0; i < carray.length; i++)
    		{
    			carray[i].COM.changeFrame(vec3.create([0,0,0]), boostUp);
    		}
    	}
    	if (downDown == true)
    	{
    		for (i = 0; i < carray.length; i++)
    		{
    			carray[i].COM.changeFrame(vec3.create([0,0,0]), boostDown);
    		}
    	}
        if (rotLeftDown == true)
        {
            for (i = 0; i < carray.length; i++)
            {
                carray[i].COM.changeFrame(vec3.create([0,0,0]), rotRight);
            }
            rotRightDown = false;
    	}
        if (rotRightDown == true)
        {
            for (i = 0; i < carray.length; i++)
            {
                carray[i].COM.changeFrame(vec3.create([0,0,0]), rotLeft);
            }
            rotRightDown = false;
    	}
    
    }
    keySinceLastFrame=true;
}

function onKeyUp(evt) 
{
	if (evt.keyCode == 68) rightDown = false;
	else if (evt.keyCode == 65) leftDown = false;
	else if(evt.keyCode == 87) upDown = false;
	else if(evt.keyCode == 83) downDown = false;
	else if (evt.keyCode == 69) rotRightDown = false;
	else if (evt.keyCode == 81) rotLeftDown = false;  
}

function clickHandler(e)
{
    var offset = $('#canvas').offset();
    var x = e.pageX - offset.left;
    var y = e.pageY - offset.top;
    
    var i = 0;
    var minDist = WIDTH;
    var minElement = -1;

    for (i = 0; i < carray.length; i++)
    {
        var dist = getDistance([x,y], [carray[i].COM.XView[1] / zoom + HWIDTH, 
                                       carray[i].COM.XView[2] / zoom + HHEIGHT]);
        if (dist < minDist)
        {
            minDist = dist;
            minElement = i;
        }
    }
    
    if (minDist < 30)
    {
        //Should probably take this out of here.
        newFrameBoost=cBoostMat(vec3.scale(carray[minElement].COM.V,
                                           1 / carray[minElement].COM.V[0],tempVec3),c);
        carray[minElement].COM.changeFrame([0,0,0], newFrameBoost);
        XShift=carray[minElement].COM.X0;
        carray[minElement].COM.X0=vec3.create([0,0,0]);
        for (i = 0; i < carray.length; i++)
        {
            if (!(i==minElement))
            {
                carray[i].COM.changeFrame(XShift, newFrameBoost);
                carray[i].draw();
            }
        }

        // shiftToFrameOfObject(carray[minElement])
    }
}

// Take two points [x,y] and return the distance between them.
function getDistance(pt1, pt2)
{
    return Math.sqrt(Math.pow(pt1[0] - pt2[0], 2) + Math.pow(pt1[1] - pt2[1], 2));
}
