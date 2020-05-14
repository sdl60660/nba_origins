function multiplex(streams) {
  const n = streams.length;
  return {
    point(x, y) { for (const s of streams) s.point(x, y); },
    sphere() { for (const s of streams) s.sphere(); },
    lineStart() { for (const s of streams) s.lineStart(); },
    lineEnd() { for (const s of streams) s.lineEnd(); },
    polygonStart() { for (const s of streams) s.polygonStart(); },
    polygonEnd() { for (const s of streams) s.polygonEnd(); }
  };
}

function geoCompositeProjection(...projections) {
  var cache,
      cacheStream,
      points = Array(projections.length).fill(null),
      point,
      pointStream = { point: function(x, y) { point = [x, y] } };
  
  // store the original translate(), clipExtent(), scale(), etc of each child, because
  // we're going to update them later if the composite needs to be translated or scaled.
  var translations = [],
      clipExtents = [],
      precisions = [],
      scales = [];
  
  for (var i = 0; i < projections.length; ++i) {
    translations.push(projections[i].translate());
    clipExtents.push(projections[i].clipExtent ? projections[i].clipExtent() : null);
    precisions.push(projections[i].precision());
    scales.push(projections[i].scale());
  }
  
  function projection(coordinates) {
    var x = coordinates[0], y = coordinates[1];
    point = null;
    
    for (let p of points) {
      p(x, y);
      if (point) return point;
    }
    
    return point;
  }
  
  projection.stream = function(stream) {
    if (cache && cacheStream === stream) {
      return cache;
    } else {
      var streams = [];
      for (var i = 0; i < projections.length; ++i) {
        streams.push(projections[i].stream(stream));
      }
      cache = multiplex(streams);
      cacheStream = stream;
      
      return cache;
    }
  }
  
  projection.precision = function(_) {
    if (!arguments.length) return projections[0].precision();
    
    var factor = _ / precisions[0];

    for (var i = 0; i < projections.length; ++i) {
      projections[i].precision(factor * precisions[i]);
    }
    
    return reset();
  };

  projection.scale = function(_) {
    if (!arguments.length) return projections[0].scale();
    
    var factor = _ / scales[0];
    
    for (var i = 0; i < projections.length; ++i) {
      projections[i].scale(factor * scales[i]);
    }
    
    return projection.translate(projections[0].translate());
  };
  
  projection.translate = function(_) {
    if (!arguments.length) return projections[0].translate();
    var x = +_[0],
        y = +_[1],
        k = projections[0].scale() / scales[0];
    
    for (var i = 0; i < projections.length; ++i) {
      function skew(point) {
        // convert a point from the original coordinate system to the current screen-space coordinate system
        
        // point: point in original coordinates needing to be transformed
        // [x, y]: new root point
        // translations[0]: old root point
        // point - translations[0]: vector that needs scaling
        // (point - translations[0]) * k: scaled vector
        // scaled vector + [x, y] -> new screen-space coordinate
        
        const dx = point[0] - translations[0][0],
              dy = point[1] - translations[0][1];
        
        return [x + dx * k, y + dy * k]
      }
      
      projections[i].translate(skew(translations[i]));
           
      if (projections[i].clipExtent !== undefined && clipExtents[i] !== null) {
        projections[i].clipExtent([skew(clipExtents[i][0]), skew(clipExtents[i][1])])
      }
      
      points[i] = projections[i].stream(pointStream);
    }

    return reset();
  };
  
  projection.clipExtent = function(_) {
    if (!arguments.length) {
      // compute the effective clip extent of the whole composite -- equivalent to the smallest bounding
      // box that contains all the childrens' clip extents, or null if one or more children doesn't have
      // a clip extent.
      let bounded = true;
      let x0 = +Infinity, y0 = +Infinity, x1 = -Infinity, y1 = -Infinity;

      for (var i = 0; i < projections.length; ++i) {
        const extent = projections[i].clipExtent ? projections[i].clipExtent() : null;

        if (extent) {
          x0 = Math.min(x0, extent[0][0]);
          y0 = Math.min(y0, extent[0][1]);
          x1 = Math.max(x1, extent[1][0]);
          y1 = Math.max(y1, extent[1][1]);
        } else {
          bounded = false;
        }
      }

      return bounded ? [[x0, y0], [x1, y1]] : null;
    }
    
    for (var i = 0; i < projections.length; ++i) {
      // shrink each child's clip extent so that it lies within the input clip extent (_)
      if (projections[i].clipExtent === undefined) continue;
      
      let extent = projections[i].clipExtent();
      if (extent === null) continue;
      
      projections[i].clipExtent(
        [[ Math.max(extent[0][0], _[0][0]), Math.max(extent[0][1], _[0][1]) ],
         [ Math.min(extent[1][0], _[1][0]), Math.min(extent[1][1], _[1][1]) ]])
    }
    
    return reset();
  }
  
  function reset() {
    console.log("RESET");
    cache = cacheStream = null;
    return projection;
  }

  return projection;
}


function geoAlbersUsa() {
  return geoCompositeProjection(
    // LOWER 48
    d3.geoAlbers()
      .scale(1000)
      .translate([480, 250])
      .clipExtent([[0, 0], [900, 500]]),
    
    // ALASKA
    d3.geoConicEqualArea()
      .rotate([154, 0])
      .center([-2, 58.5])
      .parallels([55, 65])
      .scale(350)
      .translate([173, 451])
      .clipExtent([[55, 370], [266, 484]]),
    
    // HAWAII
    d3.geoConicEqualArea()
      .rotate([157, 0])
      .center([-3, 19.9])
      .parallels([8, 18])
      .scale(1000)
      .translate([275, 462])
      .clipExtent([[266, 416], [365, 484]]),
  )
}

function geoAlbersUsaPR() {
    return geoCompositeProjection(
        // LOWER 48, ALASKA, HAWAII
        geoAlbersUsa(),

        // PUERTO RICO
        d3.geoConicEqualArea()
          .rotate([66, 0])
          .center([0, 18])
          .parallels([8, 18])
          .scale(1000)
          .translate([830, 474])
          .clipExtent([[800, 454], [860, 484]]),
    )
}