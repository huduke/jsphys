/* World line: Set of persistent events, should record correctly
 * If its velocity is changed, or if it is translated in a time-like
 * manner.
 * Some assumptions about t being monotonic mean that things may break down
 * if it is moved in a space-like manner (by changing X0 directly.)
 * However: Space-like changes of frame are fine.
 * Should degenerate into an inertialObject as savePrecision gets very large
 * Over-writing evolve should allow arbitrary motion. 
*/
function worldLine(X, P, m, maxDistance, savePrecision, maxTimeStep)
{
    this.init()
    {
        this.X0 = X;
        // Make sure this is actually acting like a real particle.
        // It would be simpler just to take a momentum and work out mass from
        // That, but this is a bit more robust.
        genEnergy(P, c, m);
        this.V  = quat4.scale(P, 1/m);
	    this.XView = quat4.create();
        this.tau = 0;

        this.displace = quat4.create();

        this.events = new Array();
        this.velocities = new Array();
        this.properTimes = new Array();

        this.properTimes.push(0);
        this.events.push(quat4.create(this.X)); //Not sure if the create is needed here.
        this.velocities.push(quat4.vreate(this.V));

        this.timeSinceShift = 0;
    }


    /* evolve. Evolves X0 and V in the current frame by one step.
     * Should also work in reverse if needed.
    */
    this.evolve = function(stepLength)
    {
        // Scale by gamma to get a displacement.
        quat4.scale(this.V, stepLength / this.V[0], this.displace);

        // Increase proper time.
        this.tau += stepLength / this.V[0];
        this.timeSinceShift += stepLength;
        // Bring forward in time.
        quat4.add(this.X0, this.displace);
    }

    // Return interpolation of event between two events, marked by their index.
    // Currently a first order extrapolation both forward and backward, then
    // averaged.
    // TODO: Weight by how close to each event we are.
    this.interpolateToX = function(index1, index2)
    {
        var pos1 = quat4.create();
        var pos2 = quat4.create();
        pos1 = quat4.scale(this.velocities[index1], 
                                    this.events[index1][0] / this.velocities[index1][0], pos1);
        pos2 = quat4.scale(this.velocities[index2], 
                                    this.events[index2][0] / this.velocities[index2][0], pos2);        
        return quat4.scale(quat4.add(pos1, pos2), 1/2);
    }

    // Return interpolation of velocity between two events, marked by index.
    // TODO: Weight this average by this.events[index1][0] and same for index2.
    this.interpolateToV = function(index1, index2)
    {
        // Remember V is a four-veclocity. Should scale fairly well linearly.
        return quat4.scale(quat4.add(this.velocities[index1], 
                                     this.velocities[index2], tempVec3), 1/2, tempVec3);
    }

    // Shift all our times to synch with current frame.
    // Doing this separately avoids excessive looping.
    this.shiftToPresent = function()
    {
        this.X0[0] -= timeSinceShift;
        // Update all our times.
        for (i = 0; i < this.events.length; i++)
        {
            this.events[i][0] -= timeSinceShift;
        }
        this.timeSinceShift = 0;
        // this.discardOldValues();
    }
    
    this.discardOldValues = function()
    {
        // If c*t is further than maxDistance, there is no reason we could
        // Need the event. Get rid of it.
        while ( (this.events[0][0] * c) < -maxDistance )
        {
            this.events.shift();
            // Cut values off of the front of events and velocities. 
            // Need to think about memory allocation issues here 
            // Set length array and roll around it?
        }
        while ( (this.events[this.events.length][0] * c) > maxDistance )
        {
            this.events.pop(); // Same deal as above.
        }
    }

    /* getPresent and getView. Returns the position and momentum of the object
     * represented by this worldLine in the current frame.
     * Generates and saves events as it goes, if it runs out of saved ones.
    */
    this.getPresent = function()
    {
        // While we don't have a recent enough event.
        while ( (this.events[this.events.length - 1] - timeSinceLastPush) > 0 )
        {
            // Evolve the worldLine, saving as we go.
            this.evolve(maxTimeStep);
            // TODO: Something fancy where we take the first order term into account
            // Before saving, rather than just time
            if ( timeSinceLastPush > savePrecision )
            {
                this.events.push( quat4.create(this.X0) );
                this.velocities.push( quat4.create(this.V) );
                this.properTimes.push(this.tau);
                this.shiftToPresent();
            }
        }
        // If there's at least one event in the future (the last event), then
        // Work backwards until we find one in the past or present.
        i =  this.events.length - 1;
        while ( this.events[i][0] > 0 )
        {
            i--;
            if ( i < 0 ) // object does not exist yet, do something about that
            {
                this.X0 = null;
                this.V  = null;
                return null;
            }
        }
        // Interpolate between the last event we found in the future, and the one
        // We just found in the present/past.
        this.X0 = this.interpolateX(i, i + 1);
        this.V  = this.interpolateV(i, i + 1);
    }


    // If we need to receive a signal, or look at it we'll need the intersection
    // with the light cone.
    this.getView = function()
    {
    }


    // If we need to send this a signal, it'll be being changed in the future.
    this.setFuture = function(signalOrigin)

    // shiftFrame, translates every event in worldLine.
    this.shiftFrame = function(translation)
    {
        quat4.add(this.X0,translation);
        for (i=0; i < events.length; i++)
        {
            quat4.add(this.events[i],translation);
        }
    }
    // rotateFrame, matrix transform on entire worldLine.
    this.rotateFrame = function(rotation)
    {
        mat4.multiplyVec4(rotation, this.X0);
        mat4.multiplyVec4(rotation, this.V);
        for (i=0; i < events.length; i++)
        {
            mat4.multiplyVec4(rotation, this.events[i]);
            mat4.multiplyVec4(rotation, this.velocities[i]);
        }
    }

    this.measureDisplacementInFrame = function(event1, event2)
    {
    }
}
 

