(function ($) {
  Drupal.behaviors.drawerErd = {
    attach: function (context, settings) {     
      var eles = settings.ebe_erd.items ;
      var config = settings.ebe_erd.config ;
      
      var graph = new Springy.Graph();
      var elements = [];

      jQuery.each(eles,function(index,ele){
    	  elements[ele.id] = graph.newNode({label: ele.label});  
      });
      jQuery.each(eles,function(index,ele){
          if ( ele.links_to ) {
              jQuery.each(ele.links_to,function(i,v){
                  if ( !v.options ) v.options = {} ;
                  if ( elements[v.link] && elements[ele.id].id ) {
                	  if ( v.label ) {
                		  label = v.type + ':' + v.label ;
                	  } else {
                		  label = v.type ;
                	  }
                	  if ( v.options && v.options.required ) {
                		  color = 'red' ;
                	  } else {
                		  color = '#00A0B0';
                	  }
                	  graph.newEdge(elements[ele.id], elements[v.link], {color: color, label :  label });
                  }
              });
          }
      })
    
     elements = [] ;
	 var springy = window.springy = jQuery('#drawer').springy({
	    graph: graph
	 });
   }
  }
})(jQuery);
