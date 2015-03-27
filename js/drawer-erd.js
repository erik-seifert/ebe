(function ($) {
  Drupal.behaviors.drawerErd = {
    attach: function (context, settings) {     
      var eles = settings.ebe_erd ;

      var graph = new joint.dia.Graph;
      var paper = new joint.dia.Paper({
          el: $('#drawer'),
          width: 1200,
          height: 5000,
          gridSize: 1,
          model: graph
      });
      
      var types = {
        entity : joint.shapes.uml.Abstract,
        bundle : joint.shapes.uml.Class
      };
      
      var count = 0 ;
      var elements = {};
      var relations = [];
      var rows = 0;
      var maxRows = 4 ;
      
      var lastType = eles[0].type ;
      
      jQuery.each(eles,function(index,ele){
//          if ( lastType != ele.type || ele.type == 'entity' ) {
//              rows++;
//              count = 0 ;
//          }
          elements[ele.id] = ebe_element(graph,types[ele.type],(300*count) + 100 ,220*rows,ele.label,ele);
          count++ ;
          if ( (count % maxRows) == 0 ) {
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

      _.each(relations, function(r) { graph.addCell(r); });
    }
  };
})(jQuery);


var ebe_element = function(graph,elm, x, y, label,ele) {
    try {
        if ( !ele.attributes ) ele.attributes = [];
        var cell = new elm({ position: { x: x, y: y }, name : label, size : { width: 260, height: 200}, methods : ele.attributes });
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
    var link = new c({source : {id : source}, 
                  target : {id:target},    
                  router: { name: 'metro' },
                  connector: { name: 'rounded' }, 
                  labels: [
                    { position: .5, attrs: { text: { text: label, fill: 'white', 'font-family': 'sans-serif' }, rect: { stroke: '#F39C12', 'stroke-width': 20, rx: 5, ry: 5 } } }
                  ],
                  attrs:{ 
                      '.marker-target': { fill: 'yellow', d: 'M 10 0 L 0 5 L 10 10 z' },
                      '.connection' : { stroke : color  }
                 }});
    return link ;
}