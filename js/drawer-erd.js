(function ($) {
  Drupal.behaviors.drawerErd = {
    attach: function (context, settings) {     
      var eles = settings.ebe_erd.items ;
      var config = settings.ebe_erd.config ;
      
      var graph = new joint.dia.Graph;
      var paper = new joint.dia.Paper({
          el: $('#drawer'),
          width: config.paper.width,
          height: config.paper.height,
          gridSize: 1,
          model: graph,
          perpendicularLinks : true,
      });
      
      var types = {
        entity : joint.shapes.uml.Abstract,
        bundle : joint.shapes.uml.Class
      };
      
      var count = 0 ;
      var elements = {};
      var relations = [];
      var rows = 0;
      var columns = config.paper.columns ;
      
      var lastType = eles[0].type ;
      
      jQuery.each(eles,function(index,ele){
          elements[ele.id] = ebe_element(graph,types[ele.type],(300*count) + 100 ,(220*rows)+50,ele.label,ele);
          count++ ;
          if ( (count % columns) == 0 ) {
              rows++ ;
              count = 0 ;
          }
          lastType = ele.type ;
      })
      
      jQuery.each(eles,function(index,ele){
          if ( ele.links_to ) {
              jQuery.each(ele.links_to,function(i,v){
                  if ( !v.options ) v.options = {} ;
                  if ( elements[v.link] && elements[ele.id].id ) {
                      relations.push( ebe_relation(joint.dia.Link,elements[ele.id].id,elements[v.link].id,v.label,v.options) )
                  }
              });
          }
      })
      var scale = 1.0 ;
      var scaleStep = 0.1 ;
      _.each(relations, function(r) { graph.addCell(r); });
      jQuery('#drawer').before('<div class="controls btn-group"><button id="scale-down">-</button><button id="scale-up">+</button></div>');
      paper.on('cell:pointerup',function(cellView,evt){
    	  //console.log(cellView) ;
    	  cell = cellView.model || cellView;
    	  
    	  if ( !cell.isLink() ) {
	    	  var c = graph.getElements();
	    	  //console.log(c) ;
	    	  _.each(c,function(t){
	    		  //console.log(t); 
	    		  t.findView(paper).unhighlight()
	    	  })
	    	  
	    	  var c = graph.getLinks();
	    	  //console.log(c) ;
	    	  _.each(c,function(t){
	    		  //console.log(t); 
	    		  t.findView(paper).unhighlight()
	    	  })
    	  }
    	  
    	  cellView.highlight();

    	    if (cell instanceof joint.dia.Element) {
    	    	var links = graph.getConnectedLinks(cell);
    	    	_.each(links,function(link){
    	    		link.findView(paper).highlight();
    	    		var cCell = graph.getCell(link.get('source').id);
    	    		cCell.findView(paper).highlight();
    	    		//console.log(cCell.attributes.name) ;
    	    		
    	    		var cCell = graph.getCell(link.get('target').id);
    	    		cCell.findView(paper).highlight();
    	    		//console.log(cCell.attributes.name) ;
    	    	})
    	    }
      })
      
      paper.on('cell:mouseout',function(cell,evt){
    	  //console.log(cellView) ;
    	  cell = cell.model || cell;

    	    if (cell instanceof joint.dia.Element) {
    	    	var links = graph.getConnectedLinks(cell);
    	    	_.each(links,function(link){
//    	    		
//    	    		var cCell = graph.getCell(link.get('target').id);
//    	    		console.log(cCell.attributes.name) ;
//    	    		
//    	    		var cCell = graph.getCell(link.get('source').id);
//    	    		console.log(cCell.attributes.name) ;
    	    	})
    	    }
      })
      jQuery('#scale-down').on('click',function(){
    	  scale -= scaleStep; 
    	  paper.scale(scale);
      })
      jQuery('#scale-up').on('click',function(){
    	  scale += scaleStep;
    	  paper.scale(scale);
      })
      var myAdjustVertices = _.partial(adjustVertices, graph);
   
      // also when an user stops interacting with an element.
      paper.on('cell:pointerup', myAdjustVertices);
//      jQuery('#content-fit').on('click',function(){
//    	  console.log(paper.scaleContentToFit({1,1}));
//      })
//      jQuery('#save').on('click',function(){
//        saveSvgAsPng(paper.svg, "diagram.png");
//      })
    }
  };
})(jQuery);


var ebe_element = function(graph,elm, x, y, label,ele) {
    try {
    	var width = 260 ;
    	var height = 200 ;
    	
        if ( !ele.attributes ) ele.attributes = [];
        if ( ele.attributes.length > 12 ) {
        	height += ( ele.attributes.length - 12 ) * 10 ;
        }
        var cell = new elm({ position: { x: x, y: y }, name : label, size : { width: width, height: height}, methods : ele.attributes });
        graph.addCell(cell);
        return cell;
    } catch ( e ) {
        
    }
    
};

var ebe_relation = function(c,source,target,label,opts) {
    if ( opts.required ) {
        color =  'red';
    } else {
        color = '#333' ;
    }
    if ( opts.cardinality ) {
      if ( opts.cardinality == -1 ) {
        card = " 1..n";
      } else {
        card = " 1.." + opts.cardinality;
      }
    }
    var link = new c({source : {id : source}, 
                  target : {id:target},    
                  router: { name: 'metro' },
                  connector: { name: 'rounded' }, 
                  labels: [
                    { position: 25, attrs: { text: { text: card, fill: 'white', 'font-family': 'sans-serif'  }, rect: { stroke: '#F39C12', 'stroke-width': 20, rx: 5, ry: 5 } } },
                    { position: .5, attrs: { text: { text: label, fill: 'white', 'font-family': 'sans-serif' }, rect: { stroke: '#F39C12', 'stroke-width': 20, rx: 5, ry: 5 } } }
                  ],
                  attrs:{ 
                      '.marker-target': { fill: 'yellow', d: 'M 10 0 L 0 5 L 10 10 z' },
                      '.connection' : { stroke : color  }
                 }});
    return link ;
}

function adjustVertices(graph, cell) {

    // If the cell is a view, find its model.
    cell = cell.model || cell;

    if (cell instanceof joint.dia.Element) {

        _.chain(graph.getConnectedLinks(cell)).groupBy(function(link) {
            // the key of the group is the model id of the link's source or target, but not our cell id.
            return _.omit([link.get('source').id, link.get('target').id], cell.id)[0];
        }).each(function(group, key) {
            // If the member of the group has both source and target model adjust vertices.
            if (key !== 'undefined') adjustVertices(graph, _.first(group));
        });

        return;
    }

    // The cell is a link. Let's find its source and target models.
    var srcId = cell.get('source').id || cell.previous('source').id;
    var trgId = cell.get('target').id || cell.previous('target').id;

    // If one of the ends is not a model, the link has no siblings.
    if (!srcId || !trgId) return;

    var siblings = _.filter(graph.getLinks(), function(sibling) {

        var _srcId = sibling.get('source').id;
        var _trgId = sibling.get('target').id;

        return (_srcId === srcId && _trgId === trgId) || (_srcId === trgId && _trgId === srcId);
    });

    switch (siblings.length) {

    case 0:
        // The link was removed and had no siblings.
        break;

    case 1:
        // There is only one link between the source and target. No vertices needed.
        cell.unset('vertices');
        break;

    default:

        // There is more than one siblings. We need to create vertices.

        // First of all we'll find the middle point of the link.
        var srcCenter = graph.getCell(srcId).getBBox().center();
        var trgCenter = graph.getCell(trgId).getBBox().center();
        var midPoint = g.line(srcCenter, trgCenter).midpoint();

        // Then find the angle it forms.
        var theta = srcCenter.theta(trgCenter);

        // This is the maximum distance between links
        var gap = 50;

        _.each(siblings, function(sibling, index) {

            // We want the offset values to be calculated as follows 0, 20, 20, 40, 40, 60, 60 ..
            var offset = gap * Math.ceil(index / 2);

            // Now we need the vertices to be placed at points which are 'offset' pixels distant
            // from the first link and forms a perpendicular angle to it. And as index goes up
            // alternate left and right.
            //
            //  ^  odd indexes 
            //  |
            //  |---->  index 0 line (straight line between a source center and a target center.
            //  |
            //  v  even indexes
            var sign = index % 2 ? 1 : -1;
            var angle = g.toRad(theta + sign * 90);

            // We found the vertex.
            var vertex = g.point.fromPolar(offset, angle, midPoint);

            sibling.set('vertices', [{ x: vertex.x, y: vertex.y }]);
        });
    }
};

