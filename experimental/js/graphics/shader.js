"use strict";

// Rationale between a lot of the strange shit in this function:
// 1) It needed to be fast to come anywhere near native methods.
// 2) I never thought I'd have to conserve memory, but there seems to be
// some limit on the number of local variables before something goes woolooloo
// with the scope chain. 
// 3) OCD
// 4) Learning about scope.

var drawTri = function(triArray,imageData,endNum,fz) {

        // Define variables from most used to least used.
    var rc, gc, bc,                 // Working colors for one scanline
        grh, ggh, gbh,              // Working color gradients
        data   = imageData.data,    

        // Miscellaneous indeces. Also used as temp vars.
        i,j,k,l,m,

        // Properties from our canvas image data.
        width  = imageData.width,
        height = imageData.height,

        max   = Math.max,
        round = Math.round,
        floor = Math.floor, 
        // Gradients:
        xgl,xgr,                    // Position gradient.
        // Color gradients
        grl,ggl,gbl,                // Left border
        grr,ggr,gbr,                // Right border

        lineW,                      // Width of working line
        xl,xr,                      // Left and right points of scanline
        xs,xe,                      // Start and end of scanline, only differ from xl,xr if triangle is hanging off of the screen.
        ys,ye, 
        xm,                         // Mid-point x axis, the equiv value
                                    // For y is just y1.

        fm,                         // Fraction of triangle the 'mid-point' is

        // Colors, rgb
        rm,gm,bm,                   // Mid-point
        rl,gl,bl,                   // Left border
        rr,gr,br,                    // Right border

        // Cache for one triangle because triArray[j][i] is very slow.
        // Seems somewhat silly, but it save a lot of time shuffling
        // Variables around re. sorting for the completely flat case.
        tempArr,    

        // Even more cache for one triangle because tempArr[] is still slow.
        x0,y0,z0,
        x1,y1,z1,
        x2,y2,z2,
        r0,g0,b0,
        r1,g1,b1,
        r2,g2,b2;
    // Doesn't matter which end we start from.
    for ( i = endNum+1; i--; ) {
        tempArr = triArray[i];
        j = 0; 
        k = 1;
        l = 2;

        // Sort the indeces by size of the relevant y component.
        // Could do it with a temp variable, but there is a
        // threshold for number of local variables
        //  where the scope resolution becomes incredibly slow.
        if ( tempArr[1 + 3 * j] / tempArr[2 + 3*j] > tempArr[1 + 3 * k] /tempArr[2 + 3*k] ) {
            k = (j += k -= j) - k;
        }
        if ( tempArr[1 + 3 * k] /tempArr[2 + 3*k] > tempArr[1 + 3 * l] /tempArr[2 + 3*l] ) {
            l = (k += l -= k) - l;
        }       
        if ( tempArr[1 + 3 * j] / tempArr[2 + 3*j] > tempArr[1 + 3 * k] /tempArr[2 + 3*k] ) {
            k = (j += k -= j) - k;
        }       


        z0 = tempArr[ 2 + j * 3];
        x0 = tempArr[ 0 + j * 3]*fz/z0 + width / 2;
        y0 = tempArr[ 1 + j * 3]*fz/z0 + height / 2;

        z1 = tempArr[ 2 + k * 3];
        x1 = tempArr[ 0 + k * 3]*fz/z1 + width / 2;
        y1 = tempArr[ 1 + k * 3]*fz/z1 + height / 2;

        z2 = tempArr[ 2 + l * 3];
        x2 = tempArr[ 0 + l * 3]*fz/z2 + width / 2;
        y2 = tempArr[ 1 + l * 3]*fz/z2 + height / 2;

        r0 = tempArr[  9 + j * 3];
        g0 = tempArr[ 10 + j * 3];
        b0 = tempArr[ 11 + j * 3];


        r1 = tempArr[  9 + k * 3];
        g1 = tempArr[ 10 + k * 3];
        b1 = tempArr[ 11 + k * 3];

        r2 = tempArr[  9 + l * 3];
        g2 = tempArr[ 10 + l * 3];
        b2 = tempArr[ 11 + l * 3]; 

        // Start drawing top part of triangle.

        // We're safe from divide by zero here because
        // the y values are sorted, and if y1=y0 we won't
        // attempt to do anything before recalculating fm.

        // How far down is our 'mid-point'?
        fm = (y1 - y0) / (y2 - y0); 
        // Where is that along the x edge?
        xm = (fm * (x2 - x0) + x0);

        // Does the top-triangle exist and is some part of it on the screen?
        y0--;
        y1++;
        if( ( ( y0 <= height ) ||
              ( y1 >= 0 )   )&&
            ( ( x0 >= 0 || x0 <= width )  ||
              ( xm >= 0 || xm <= width )  ||
              ( x1 >= 0 || x1 <= width )    )&& 
            (y0 < y1))
        {
            // What color is our mid-point?
            rm = fm * (r2 - r0) + r0;
            gm = fm * (g2 - g0) + g0;
            bm = fm * (b2 - b0) + b0;



            // Is 1 the left point?
            if( x1 < xm ) {
                // If so, set up gradients along the left and right
                // lines accordingly

                xgl = (x1 - x0) / (y1 - y0); // dx/dy left line
                xgr = (xm - x0) / (y1 - y0); // dx/dy right line, Recall y1 is ym.

                grl = (r1 -  r0) / (y1 - y0); // Red gradient left line
                ggl = (g1 -  g0) / (y1 - y0); // Rreen gradient left line
                gbl = (b1 -  b0) / (y1 - y0); // etc.

                grr = (rm -  r0) / (y1 - y0);
                ggr = (gm -  g0) / (y1 - y0);
                gbr = (bm -  b0) / (y1 - y0);
            } else {
                // If not, swap them all.
                xgr = (x1 - x0) / (y1 - y0); // dx/dy left line
                xgl = (xm - x0) / (y1 - y0); // dx/dy right line, Recall y1 is ym.

                grr = (r1 -  r0) / (y1 - y0); // Red gradient left line
                ggr = (g1 -  g0) / (y1 - y0); // Rreen gradient left line
                gbr = (b1 -  b0) / (y1 - y0); // etc.

                grl = (rm -  r0) / (y1 - y0);
                ggl = (gm -  g0) / (y1 - y0);
                gbl = (bm -  b0) / (y1 - y0);
            }
            



            // Some special setup if we start above the top of the screen
            // as we don't want to try drawing pixels we don't care about
            if (y1 < 0 || y0 > height) {
                ye = ys = 0;
            } else {
                if (y0 >=0){
                    ys = y0;
                } else{
                    ys = 0;
                }
                if ( y1 < height ) {
                    ye = y1;
                } else { 
                    ye = height;
                }
            }
            k = ys - y0;
            xl = x0 +  xgl * k;
            xr = x0 + xgr * k;
            rl = r0 + grl * k;
            gl = g0 + ggl * k;
            bl = b0 + gbl * k;
            rc = rl;
            gc = gl;
            bc = bl;
            rr = r0 + grr * k;
            gr = g0 + ggr * k;
            br = b0 + gbr * k;
    
    
    
    
    drawHalfTriN(j,k,l,m,
       xr,xl,xs,xe,ys,ye,xgl,xgr,
       width,
       rc,rl,rr,
       bc,bl,br,
       gc,gl,gr,
       grh,gbh,ggh,
       grl,grr,ggl,
       ggr,gbl,gbr,
       data,lineW,round,floor);

        }

        y1--;
        y1--;
        y2++;
        if( ( ( y1 <= height ) ||
              ( y2 >= 0 )   )&&
            ( ( x1 >= 0 || x1 <= width )  ||
              ( xm >= 0 || xm <= width )  ||
              ( x2 >= 0 || x2 <= width )    )&& 
            (y1 < y2))
        {
            // What color is our mid-point?
            rm = fm * (r2 - r0) + r0;
            gm = fm * (g2 - g0) + g0;
            bm = fm * (b2 - b0) + b0;



            // Is 1 the left point?
            if( xm < x1 ) {
                // If so, set up gradients along the left and right
                // lines accordingly

                xl = xm;
                xr = x1;

                rl = rm;
                gl = gm;
                bl = bm;

                rr = r1;
                gr = g1;
                br = b1;

                xgl = (x2 - xl) / (y2 - y1); // dx/dy left line
                xgr = (x2 - xr) / (y2 - y1); // dx/dy right line, Recall y1 is ym.

                grl = (r2 -  rm) / (y2 - y1); // Red gradient left line
                ggl = (g2 -  gm) / (y2 - y1); // Rreen gradient left line
                gbl = (b2 -  bm) / (y2 - y1); // etc.

                grr = (r2 -  r1) / (y2 - y1);
                ggr = (g2 -  g1) / (y2 - y1);
                gbr = (b2 -  b1) / (y2 - y1);
            } else {
                // If not, swap them all.
                xl = x1;
                xr = xm;

                rr = rm;
                gr = gm;
                br = bm;

                rl = r1;
                gl = g1;
                bl = b1;

                xgl = (x2 - xl) / (y2 - y1); // dx/dy left line
                xgr = (x2 - xr) / (y2 - y1); // dx/dy right line, Recall y1 is ym.

                grr = (r2 -  rm) / (y2 - y1); // Red gradient left line
                ggr = (g2 -  gm) / (y2 - y1); // Rreen gradient left line
                gbr = (b2 -  bm) / (y2 - y1); // etc.

                grl = (r2 -  r1) / (y2 - y1);
                ggl = (g2 -  g1) / (y2 - y1);
                gbl = (b2 -  b1) / (y2 - y1);
            }
            



            // Some special setup if we start above the top of the screen
            // as we don't want to try drawing pixels we don't care about
            if (y2 < 0 || y1 > height) {
                ye = ys = 0;
            } else {
                if (y1 >=0){
                    ys = y1;
                } else{
                    ys = 0;
                }
                if ( y2 < height ) {
                    ye = y2;
                } else { 
                    ye = height;
                }
            }
            k = ys - y1;
            xl += xgl * k;
            xr += xgr * k;
            rl += grl * k;
            gl += ggl * k;
            bl += gbl * k;
            rc = rl;
            gc = gl;
            bc = bl;
            rr += grr * k;
            gr += ggr * k;
            br += gbr * k;
    
    
    drawHalfTriN(j,k,l,m,
       xr,xl,xs,xe,ys,ye,xgl,xgr,
       width,
       rc,rl,rr,
       bc,bl,br,
       gc,gl,gr,
       grh,gbh,ggh,
       grl,grr,ggl,
       ggr,gbl,gbr,
       data,lineW,round,floor);
    


        }
    // End full-tri loop
    }


};

var drawHalfTriN = function(j,k,l,m,
       xr,xl,xs,xe,ys,ye,xgl,xgr,
       width,
       rc,rl,rr,
       bc,bl,br,
       gc,gl,gr,
       grh,gbh,ggh,
       grl,grr,ggl,
       ggr,gbl,gbr,
       data,lineW,round,floor){
            xl--;
            xr++; 
    
            l = 4*width*floor(ys);
            j = floor(ye - ys);
            while (j--){
                // How wide is the current line?
                lineW = xr - xl;
                // Set current color.
    
                // Calculate new scanline gradient.
                // Only thing that's not linear.
                grh = (rr - rl) / lineW;
                gbh = (br - bl) / lineW;
                ggh = (gr - gl) / lineW;
                if (xr < 0 || xl > width) {
                    xe = xs = 0;
                } else {
                    if (xl >=0){
                        xs = xl;
                    } else{
                        xs = 0;
                    }
                    if ( xr < width ) {
                        xe = xr;
                    } else { 
                        xe = width;
                    }
                }
                rc = rl + grh * (xs - xl);
                gc = gl + ggh * (xs - xl);
                bc = bl + gbh * (xs - xl);
    
                m = (l + 4*round(xs)); // Index relating position and data[].
                // Duff's device
    
                k = floor(xe - xs);
                while(k--){
                    // DRAW A PIXEL
                    // Compound statements are faster. I'm assuming it only does the scope resolution once. 
                    (data[m++] = rc, data[m++] = gc, data[m++] = bc, data[m++] = 255,rc += grh,gc += ggh,bc += gbh);
                }
    

    
                l += 4 * width; // Move to next line.
                xl += xgl; // Increment left and right edges.
                xr += xgr;
    
                // Increment end colors.
                rl += grl;
                gl += ggl;
                bl += gbl;
                rr += grr;
                gr += ggr;
                br += gbr;
    
            // End half-tri loop.
            }
       }

var drawTriTex = function(triArray,imageData,endNum,fz,texture) {

        // Define variables from most used to least used.
    var rc, gc, bc,                 // Working colors for one scanline
        grh, ggh, gbh,              // Working color gradients
        data   = imageData.data,    
        tdata  = texture.data,
        twidth = texture.width,
//        theight= texture.height,
        // Miscellaneous indeces. Also used as temp vars.
        i,j,k,l,m,

        // Properties from our canvas image data.
        width  = imageData.width,
        height = imageData.height,

        max   = Math.max,
        round = Math.round,
        floor = Math.floor, 
        // Gradients:
        xgl,xgr,                    // Position gradient.
        // Color gradients
        grl,ggl,gbl,                // Left border
        grr,ggr,gbr,                // Right border

        lineW,                      // Width of working line
        xl,xr,                      // Left and right points of scanline
        xs,xe,                      // Start and end of scanline, only differ from xl,xr if triangle is hanging off of the screen.
        ys,ye, 
        xm,                         // Mid-point x axis, the equiv value
                                    // For y is just y1.

        fm,                         // Fraction of triangle the 'mid-point' is

        // Colors, rgb
        rm,gm,bm,                   // Mid-point
        rl,gl,bl,                   // Left border
        rr,gr,br,                    // Right border

        uc,vc,
        ul,ur,                      // Texture coordinates.
        vl,vr,
        gul,gur,                    // Texture coordinate gradients.
        gvl,gvr,
        guh,gvh,
        vm,um,

        zc,zl,zr,gzl,gzr,gzh,zm,
        // Cache for one triangle because triArray[j][i] is very slow.
        // Seems somewhat silly, but it save a lot of time shuffling
        // Variables around re. sorting for the completely flat case.
        tempArr,    

        // Even more cache for one triangle because tempArr[] is still slow.
        x0,y0,z0,
        x1,y1,z1,
        x2,y2,z2,
        r0,g0,b0,
        r1,g1,b1,
        r2,g2,b2,
        u0,v0,
        u1,v1,
        u2,v2;
    // Doesn't matter which end we start from.
    for ( i = endNum+1; i--; ) {
        tempArr = triArray[i];
        j = 0; 
        k = 1;
        l = 2;

        // Sort the indeces by size of the relevant y component.
        // Could do it with a temp variable, but there is a
        // threshold for number of local variables
        //  where the scope resolution becomes incredibly slow.
        if ( tempArr[1 + 3 * j]/tempArr[2 + 3*j] > tempArr[1 + 3 * k]/tempArr[2 + 3*k] ) {
            k = (j += k -= j) - k;
        }
        if ( tempArr[1 + 3 * k]/tempArr[2 + 3*k] > tempArr[1 + 3 * l]/tempArr[2 + 3*l] ) {
            l = (k += l -= k) - l;
        }       
        if ( tempArr[1 + 3 * j]/tempArr[2 + 3*j] > tempArr[1 + 3 * k]/tempArr[2 + 3*k] ) {
            k = (j += k -= j) - k;
        }

        z0 = tempArr[ 2 + j * 3];
        x0 = tempArr[ 0 + j * 3]*fz/z0 + width / 2;
        y0 = tempArr[ 1 + j * 3]*fz/z0 + height / 2;

        z1 = tempArr[ 2 + k * 3];
        x1 = tempArr[ 0 + k * 3]*fz/z1 + width / 2;
        y1 = tempArr[ 1 + k * 3]*fz/z1 + height / 2;

        z2 = tempArr[ 2 + l * 3];
        x2 = tempArr[ 0 + l * 3]*fz/z2 + width / 2;
        y2 = tempArr[ 1 + l * 3]*fz/z2 + height / 2;

        r0 = tempArr[ 9  + j * 3];
        g0 = tempArr[ 10 + j * 3];
        b0 = tempArr[ 11 + j * 3];
        z0 = 1/z0;
        z1 = 1/z1;
        z2 = 1/z2;

        r1 = tempArr[ 9  + k * 3];
        g1 = tempArr[ 10 + k * 3];
        b1 = tempArr[ 11 + k * 3];

        r2 = tempArr[ 9  + l * 3];
        g2 = tempArr[ 10 + l * 3];
        b2 = tempArr[ 11 + l * 3]; 

        u0 = tempArr[ 18 + j * 2]*z0;
        v0 = tempArr[ 19 + j * 2]*z0;
        u1 = tempArr[ 18 + k * 2]*z1;
        v1 = tempArr[ 19 + k * 2]*z1;
        u2 = tempArr[ 18 + l * 2]*z2;
        v2 = tempArr[ 19 + l * 2]*z2;
        // Start drawing top part of triangle.

        // We're safe from divide by zero here because
        // the y values are sorted, and if y1=y0 we won't
        // attempt to do anything before recalculating fm.

        // How far down is our 'mid-point'?
        fm = (y1 - y0) / (y2 - y0);

        // Where is that along the x edge?
        xm = (fm * (x2 - x0) + x0);
        // What color is our mid-point?
        rm = fm * (r2 - r0) + r0;
        gm = fm * (g2 - g0) + g0;
        bm = fm * (b2 - b0) + b0;

        um = fm * (u2 - u0) + u0;
        vm = fm * (v2 - v0) + v0;

        zm = fm * (z2 - z0) + z0;

        // Does the top-triangle exist and is some part of it on the screen?
        y0--;
        y1++;
        if( ( ( y0 <= height ) ||
              ( y1 >= 0 )   )&&
            ( ( x0 >= 0 || x0 <= width )  ||
              ( xm >= 0 || xm <= width )  ||
              ( x1 >= 0 || x1 <= width )    )&& 
            (y0 !== y1))
        {

            // Is 1 the left point?
            if( x1 < xm ) {
                // If so, set up gradients along the left and right
                // lines accordingly

                xgl = (x1 - x0) / (y1 - y0); // dx/dy left line
                xgr = (xm - x0) / (y1 - y0); // dx/dy right line, Recall y1 is ym.

                grl = (r1 -  r0) / (y1 - y0); // Red gradient left line
                ggl = (g1 -  g0) / (y1 - y0); // Rreen gradient left line
                gbl = (b1 -  b0) / (y1 - y0); // etc.

                grr = (rm -  r0) / (y1 - y0);
                ggr = (gm -  g0) / (y1 - y0);
                gbr = (bm -  b0) / (y1 - y0);

                gul = (u1 - u0) / (y1 - y0);
                gvl = (v1 - v0) / (y1 - y0);

                gur = (um - u0) / (y1 - y0);
                gvr = (vm - v0) / (y1 - y0);

                gzl = (z1 - z0) / (y1 - y0);
                gzr = (zm - z0) / (y1 - y0);

            } else {
                // If not, swap them all.
                xgr = (x1 - x0) / (y1 - y0); // dx/dy left line
                xgl = (xm - x0) / (y1 - y0); // dx/dy right line, Recall y1 is ym.

                grr = (r1 -  r0) / (y1 - y0); // Red gradient left line
                ggr = (g1 -  g0) / (y1 - y0); // Rreen gradient left line
                gbr = (b1 -  b0) / (y1 - y0); // etc.

                grl = (rm -  r0) / (y1 - y0);
                ggl = (gm -  g0) / (y1 - y0);
                gbl = (bm -  b0) / (y1 - y0);

                gur = (u1 - u0) / (y1 - y0);
                gvr = (v1 - v0) / (y1 - y0);

                gul = (um - u0) / (y1 - y0);
                gvl = (vm - v0) / (y1 - y0);

                gzr = (z1 - z0) / (y1 - y0);
                gzl = (zm - z0) / (y1 - y0);
            }
            



            // Some special setup if we start above the top of the screen
            // as we don't want to try drawing pixels we don't care about
            if (y1 < 0 || y0 > height) {
                ye = ys = 0;
            } else {
                if (y0 >=0){
                    ys = y0;
                } else{
                    ys = 0;
                }
                if ( y1 < height ) {
                    ye = y1;
                } else { 
                    ye = height;
                }
            }
            k = ys - y0;
            xl = x0 + xgl * k;
            xr = x0 + xgr * k;
            rl = r0 + grl * k;
            gl = g0 + ggl * k;
            bl = b0 + gbl * k;
            ul = u0 + gul * k;
            vl = v0 + gvl * k;
            zl = z0 + gzl * k;
            rc = rl;
            gc = gl;
            bc = bl;
            uc = ul;
            vc = vl;
            zc = zl;
            rr = r0 + grr * k;
            gr = g0 + ggr * k;
            br = b0 + gbr * k;
            ur = u0 + gur * k;
            vr = v0 + gvr * k;   
            zr = z0 + gzr * k;
    
    
    
            drawHalfTri(j,k,l,m,xr,xl,xs,xe,ys,ye,xgl,xgr,zc,zl,zr,gzl,gzr,width,rc,rl,rr,bc,bl,br,gc,gl,gr,grh,gbh,ggh,grl,grr,ggl,ggr,gbl,gbr,uc,vc,ul,vl,ur,vr,gul,gvl,gur,gvr,data,lineW,round,floor,tdata,twidth);
            y2++;
            y1--;
            y1--;   
    

        }


        if( ( ( y1 <= height ) ||
              ( y2 >= 0 )   )&&
            ( ( x1 >= 0 || x1 <= width )  ||
              ( xm >= 0 || xm <= width )  ||
              ( x2 >= 0 || x2 <= width )    )&& 
            (y1 !== y2))
        {

            // Is 1 the left point?
            if( xm < x1 ) {
                // If so, set up gradients along the left and right
                // lines accordingly

                xl = xm;
                xr = x1;

                zl = zm;
                zr = z1;

                rl = rm;
                gl = gm;
                bl = bm;

                rr = r1;
                gr = g1;
                br = b1;

                ul = um;
                vl = vm;

                ur = u1;
                vr = v1;

                xgl = (x2 - xl) / (y2 - y1); // dx/dy left line
                xgr = (x2 - xr) / (y2 - y1); // dx/dy right line, Recall y1 is ym.

                gzl = (z2 - zl) / (y2 - y1);
                gzr = (z2 - zr) / (y2 - y1);

                grl = (r2 -  rm) / (y2 - y1); // Red gradient left line
                ggl = (g2 -  gm) / (y2 - y1); // Rreen gradient left line
                gbl = (b2 -  bm) / (y2 - y1); // etc.

                grr = (r2 -  r1) / (y2 - y1);
                ggr = (g2 -  g1) / (y2 - y1);
                gbr = (b2 -  b1) / (y2 - y1);

                gul = (u2 - um) / (y2 - y1);
                gvl = (v2 - vm) / (y2 - y1);

                gur = (u2 - u1) / (y2 - y1);
                gvr = (v2 - v1) / (y2 - y1);


            } else {
                // If not, swap them all.
                xl = x1;
                xr = xm;

                zl = z1;
                zr = zm;

                rr = rm;
                gr = gm;
                br = bm;

                rl = r1;
                gl = g1;
                bl = b1;

                ur = um;
                vr = vm;

                ul = u1;
                vl = v1;

                xgl = (x2 - xl) / (y2 - y1); // dx/dy left line
                xgr = (x2 - xr) / (y2 - y1); // dx/dy right line, Recall y1 is ym.

                gzl = (z2 - zl) / (y2 - y1);
                gzr = (z2 - zr) / (y2 - y1);

                grr = (r2 -  rm) / (y2 - y1); // Red gradient left line
                ggr = (g2 -  gm) / (y2 - y1); // Rreen gradient left line
                gbr = (b2 -  bm) / (y2 - y1); // etc.

                grl = (r2 -  r1) / (y2 - y1);
                ggl = (g2 -  g1) / (y2 - y1);
                gbl = (b2 -  b1) / (y2 - y1);

                gur = (u2 - um) / (y2 - y1);
                gvr = (v2 - vm) / (y2 - y1);

                gul = (u2 - u1) / (y2 - y1);
                gvl = (v2 - v1) / (y2 - y1);
            }
            



            // Some special setup if we start above the top of the screen
            // as we don't want to try drawing pixels we don't care about
            if (y2 < 0 || y1 > height) {
                ye = ys = 0;
            } else {
                if (y1 > 0){
                    ys = y1;
                } else{
                    ys = 0;
                }
                if ( y2 < height ) {
                    ye = y2;
                } else { 
                    ye = height;
                }
            }
            k = ys - y1;
            xl += xgl * k;
            xr += xgr * k;
            rl += grl * k;
            gl += ggl * k;
            bl += gbl * k;
            zl += gzl * k;

            ul += gul * k;
            vl += gvl * k;

            uc = ul;
            vc = vl;

            zc = zl;

            rc = rl;
            gc = gl;
            bc = bl;
            
            zr += gzr * k;

            ur += gur * k;
            vr += gvr * k;

            rr += grr * k;
            gr += ggr * k;
            br += gbr * k;
    
            drawHalfTri(j,k,l,m,xr,xl,xs,xe,ys,ye,xgl,xgr,zc,zl,zr,gzl,gzr,width,rc,rl,rr,bc,bl,br,gc,gl,gr,grh,gbh,ggh,grl,grr,ggl,ggr,gbl,gbr,uc,vc,ul,vl,ur,vr,gul,gvl,gur,gvr,data,lineW,round,floor,tdata,twidth);
   
        }
    // End full-tri loop
    }


};

// uses affine texture mapping to draw a textured triangle
// at screen coordinates [x0, y0], [x1, y1], [x2, y2] from
// img *pixel* coordinates [u0, v0], [u1, v1], [u2, v2]
function drawTexturedTriangle(ctx,img, triArr, end,
                                   u0, v0, u1, v1, u2, v2) {
  var det, x0,x1,x2,y0,y1,y2,a,b,c,d,e,f;
//  ctx.globalCompositeOperation = 'copy';
//  ctx.globalCompositionOperation = 'xor'; 
   for ( var i = end; i--;){ 

   det = 1 / (u1*v2 - u2*v1),
   x0 = triArr[i][0],
   y0 = triArr[i][1],
   x1 = triArr[i][2],
   y1 = triArr[i][3],
   x2 = triArr[i][4],
   y2 = triArr[i][5];


  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.closePath();



  x1 -= x0;
  y1 -= y0;
  x2 -= x0;
  y2 -= y0;
 
  u1 -= u0;
  v1 -= v0;
  u2 -= u0;
  v2 -= v0;
 
 
      // linear transformation
      a = (v2*x1 - v1*x2) * det,
      b = (v2*y1 - v1*y2) * det,
      c = (u1*x2 - u2*x1) * det,
      d = (u1*y2 - u2*y1) * det,
 
      // translation
      e = x0 - a*u0 - c*v0,
      f = y0 - b*u0 - d*v0;
  ctx.save();
  ctx.transform(a, b, c, d, e, f);
  ctx.clip();
  ctx.drawImage(img, 0, 0);
    }

}

// Draws half a triangle with colored lighting and alpha from a texture.
var drawHalfTri = function(j,k,l,m,
       xr,xl,xs,xe,ys,ye,xgl,xgr,
       zc,zl,zr,gzl,gzr,
       width,
       rc,rl,rr,
       bc,bl,br,
       gc,gl,gr,
       grh,gbh,ggh,
       grl,grr,ggl,
       ggr,gbl,gbr,
       uc,vc,ul,vl,ur,vr,gul,gvl,gur,gvr,
       data,lineW,round,floor,tdata,twidth){
    var guh,gvh,gzh,ti;
    xl--;
    xr++;
    l = 4*width*round(ys);
    j = round(ye - ys);
    while (j--){
        // How wide is the current line?
        lineW = xr - xl;
        // Set current color.

        // Calculate new scanline gradient.
        // Only thing that's not linear.
        grh = (rr - rl) / lineW;
        gbh = (br - bl) / lineW;
        ggh = (gr - gl) / lineW;
        guh = (ur - ul) / lineW;
        gvh = (vr - vl) / lineW;
        gzh = (zr - zl) / lineW;

        if (xr < 0 || xl > width) {
            xe = xs = 0;
        } else {
            if (xl >=0){
                xs = xl;
            } else{
                xs = 0;
            }
            if ( xr < width ) {
                xe = xr;
            } else { 
                xe = width;
            }
        }
        rc = rl + grh * (xs - xl);
        gc = gl + ggh * (xs - xl);
        bc = bl + gbh * (xs - xl);
        uc = ul + guh * (xs - xl);
        vc = vl + gvh * (xs - xl);

        zc = zl + gzh * (xs - xl);

        m = (l + 4*floor(xs)); // Index relating position and data[].
        // Duff's device

        k = round(xe - xs);
        while(k--){
            // DRAW A PIXEL
            // Compound statements are faster. I'm assuming it only does the scope resolution once.
            ti =  4*((uc/zc|0)+width*(vc/zc|0)),
            (data[m++] = rc, data[m++] = gc, data[m++] = bc, data[m++] = tdata[ti],rc += grh,gc += ggh,bc += gbh, uc += guh, vc += gvh, zc += gzh);
        }



        l += 4 * width; // Move to next line.
        xl += xgl; // Increment left and right edges.
        xr += xgr;

        zl += gzl;
        zr += gzr;
        // Increment end colors.
        rl += grl;
        gl += ggl;
        bl += gbl;
        ul += gul;
        vl += gvl;

        rr += grr;
        gr += ggr;
        br += gbr;
        ur += gur;
        vr += gvr;

    // End half-tri loop.
    }

}
window['drawTriTex'] = drawTriTex;
