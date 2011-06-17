$(function(){       

  //*****************************************************************
  //
  // Credentials
  //
  //*****************************************************************
  
  //
  // Credentials: Model
  //
  Credentials = Backbone.Model.extend({
    
    initialize: function(){
      _.bindAll(this, 'save', 'fetch', 'isBad');
      this.fetch();
    },
    
    defaults: {
      keyid: '',
      secret: ''
    },
    
    // Not using validate() as it is too pedantic for our purposes (called on both set() and save())
    isBad: function(){
      var attr = this.attributes;
      if (attr.keyid.length===0 || attr.secret.length===0) {
        return "Empty Key ID/Secret";
      }
    },
    
    // Override sync method to use Cookies
    fetch: function(){
      if ($.cookie('aws-credentials')) {
        var creds = JSON.parse($.cookie('aws-credentials'));
        this.set(creds);
      }
    },
    
    // Override sync method to use Cookies
    save: function(){
      if (!this.isBad()) {
        $.cookie('aws-credentials', JSON.stringify(this.toJSON()), {path:"/", expires:30}); // expires in 1 month
      }
    }
        
  });
  
  credentials = new Credentials();
  
  //
  // Credentials: View
  //
  CredentialsView = Backbone.View.extend({

    el: $('.credentials'),
    
    events: {
      "blur input": 'updateModel'
    },

    initialize: function(){
      _.bindAll(this, 'render', 'updateModel', 'showError');
      this.model.bind('change', this.render);
      this.render();
    },

    render: function(){
      this.$('input#keyid').val( this.model.get('keyid') );
      this.$('input#secret').val( this.model.get('secret') );
    },

    updateModel: function(){
      this.model.set({
        keyid: $.trim( this.$('input#keyid').val() ),
        secret: $.trim( this.$('input#secret').val() )
      }, {
        error: this.render // ensures view is in sync with model even if model doesn't validate
      });
    },
    
    showError: function(){
      alert('Error with credentials: ' + this.model.isBad());
    }
    
  });
  
  credentialsView = new CredentialsView({
    model: credentials
  });


  //*****************************************************************
  //
  // Domains  
  //
  //*****************************************************************

  //
  // Domain: Model
  //
  Domain = Backbone.Model.extend({
    defaults: {
      name: '',
      count: 0
    }
  });
  
  //
  // Domains: Collection
  //
  Domains = Backbone.Collection.extend({
    model: Domain,
    url: '/api/domains'
  });
  
  domains = new Domains();

  //
  // Domains: View
  //
  DomainsView = Backbone.View.extend({

    el: $('#domains'),

    events: {
      'click .contents .domain': 'handleClick'
    },
    
    initialize: function(){
      _.bindAll(this, 'render', 'showLoadingIcon', 'hideLoadingIcon', 'showError', 'handleClick');
      this.collection.bind('change', this.render);
      this.collection.bind('reset', this.render);
      this.render();
    },

    render: function(){
      var self = this;
      this.el.find('.contents').html('');
      this.collection.each(function(domain){
        var $obj = $('<div class="domain"> <div class="db-icon"><img src="img/db.png"></img></div> <div class="domain-name-wrapper"><span class="domain-name"></span> <span class="count"></span></div> </div>');
        $obj.find(".domain-name").html(domain.get('name'));
        $obj.find('.count').html('('+domain.get('count')+')');
        $obj.appendTo(self.el.find('.contents'));
      });
    },
    
    handleClick: function(event){
      var $obj = $(event.currentTarget);
      $obj.siblings('.selected').removeClass('selected');
      $obj.addClass('selected');
      
      // This will fire off a 'change' event, listened to by itemView
      currentQuery.set({
        queryStr: 'select * from `' + $obj.find('.domain-name').html() + '` limit 1000'
      });
    },
    
    showLoadingIcon: function(){
      this.$('.loading-icon').show();
    },

    hideLoadingIcon: function(){
      this.$('.loading-icon').hide();
    },
    
    showError: function(msg){
      alert('Error with domains: ' + msg);
    }

  });

  domainsView = new DomainsView({
    collection: domains
  });


  //****************************************************************
  //
  // CurrentQuery
  //
  // The actual SimpleDB query corresponding to the desired view.
  // It's declared as a Backbone model so that we can listen to
  // its changes and update the view accordingly.
  //
  //****************************************************************

  //
  // CurrentQuery: Model
  //
  CurrentQuery = Backbone.Model.extend({
    defaults: {
      queryStr: ''
    }
  });
  
  currentQuery = new CurrentQuery();


  //****************************************************************
  //
  // Items
  //
  // Table of database items. Listens for changes in currentQuery
  // and displays correspoding items.
  //
  //****************************************************************
  
  //
  // Item: Model
  //
  Item = Backbone.Model.extend();

  //
  // Items: Collection
  //
  Items = Backbone.Collection.extend({
    model: Item,
    query: {}, // object to be assigned at instantiation
    url: function(){
      return '/api/select?queryStr=' + encodeURIComponent(this.query.get('queryStr'));
    }
  });

  items = new Items();
  items.query = currentQuery;

  //
  // Items: View
  //
  ItemsView = Backbone.View.extend({
    
    el: $('#items'),
    
    events: {
      'dblclick table tr': 'handleItemClick'
    },
    
    initialize: function(){
      _.bindAll(this, 'render', 'fetchItems', 'showLoadingIcon', 'hideLoadingIcon', 'buildTable');
      this.collection.bind('reset', this.render);
      this.collection.query.bind('change', this.fetchItems); // listen for changes in current query
    },
    
    render: function(){
      if (this.collection.length === 0) {
        this.$('.contents').html('');
        return;
      }
      
      // Build table HTML object
      var $table = this.buildTable(this.collection.toJSON());
      this.$('.contents').html($table);

      // Sets dimensions of table object depending on size of parent. Details are specific to our table plugin ($.fixheadertable()).
      function fitTableInParent($tableObj, $parentObj) {
        var $tableBody = $tableObj.parents('.body');
        $tableBody.height( $parentObj.height() - $tableBody.siblings('.headtable').height() - 2); // see live DOM after $.fixheadertable()
      }      
      
      var numFields = $table.find('thead th').size();
      var colRatioVector = [];
      for (var i=0;i<numFields;i++){
        colRatioVector.push(200);
      }
      var $origTableParent = $table.parent(); // prior to the wrappers due to fixheadertable()
      $table.fixheadertable({
        zebra: true,
        zebraClass: 'table-zebra',
        height: 200,          
        wrapper: false,
        colratio: colRatioVector,
        resizeCol: true,
        sortable: true
      });
        
      fitTableInParent($table, $origTableParent);
      // Ensures table always takes up available screen space, even after browser resizing
      $(window).resize(function(){
        clearTimeout(window.resizeTimer);
        window.resizeTimer = setTimeout(function(){ // hack to ensure the event is only fired *after* resizing motion (otherwise we get too many events fired off)
          fitTableInParent($table, $origTableParent);                        
        }, 500);
      });
    },
    
    // Returns a consolidated table (jQuery object format) containing all the rows in the vector 'data'.
    // The columns are consolidated to account for heterogenous data, i.e. rows with different schema.
    buildTable: function(data){
      var self = this;

      // Build fieldNames from heterogeneous data
      var fieldNames = [];
      _(data).each(function(datum){ // loop over each row
        for (key in datum) {
          if (fieldNames.indexOf(key)<0)
            fieldNames.push(key);
        }
      });
      fieldNames.sort();
      
      // Build table head
      var $table = $('<table cellpadding="0" cellspacing="0" border="0" class="display" id="the-table"></table>');
      var $tHead = $('<thead></thead>').appendTo($table);
      var templateStr = '';
      fieldNames.forEach(function(field){
        $('<th></th>').html(field).appendTo($tHead);
        templateStr += '<td>${'+self.encodeHtml(field)+'}</td>';
      });
      
      // Build table body
      var $tBody = $('<tbody></tbody>').appendTo($table);
      templateStr = '<tr>'+templateStr+'</tr>';
      $.template('dataTemplate', templateStr);
      $.tmpl('dataTemplate', data).appendTo($tBody);
      
      return $table; 
    },
    
    fetchItems: function(){
      var self = this;
      this.collection.reset();
      this.showLoadingIcon();
      this.collection.fetch()
        .complete(function(){
          self.hideLoadingIcon();
        });
    },
    
    handleItemClick: function(event){
      var $obj = $(event.currentTarget);
      $obj.addClass('selected');      
      $obj.siblings('.selected').removeClass('selected');

      this.$('#edit-item-dialog').dialog('open');
    },
    
    showLoadingIcon: function(){
      this.$('.loading-icon').show();
    },

    hideLoadingIcon: function(){
      this.$('.loading-icon').hide();
    },
    
    // utility function to HTML-encode characters
    encodeHtml : function(str){
      return $('<div/>').text(str).html();
    }
    
  });

  itemsView = new ItemsView({
    collection: items
  });
  

  //****************************************************************
  //
  // App  
  //
  //****************************************************************
  
  //
  // App: View
  //
  App = Backbone.View.extend({
    
    el: $('body'),
    
    events: {
      'click button#view': 'showDomains',
      'click button#about': 'showAbout'
    },
    
    initialize: function(){
      _.bindAll(this, 'render');
      this.render();
    },  
    
    render: function(){
      // layout
      $(this.el).layout({ 
        applyDefaultStyles: true,
        spacing_open: 4,
        north__spacing_open: 0,
        north__size: 50,
        north__resizable: false,
        north__closable: false,
        west__minSize: 250
      });
  
      // buttons
      this.$('button').button();
  
      // about dialog
      this.$('#about-dialog').dialog({
        autoOpen: false,
        width: 400,
        title: 'About',
        modal: true,
        buttons: {
          Ok: function() {
            $(this).dialog('close');
          }
        }   
      }); // about dialog  
    }, // render
    
    showDomains: function(){
      if (credentials.isBad()) {
        credentialsView.showError();
        return;
      }

      credentials.save();
      domains.reset();
      // items.reset();
      domainsView.showLoadingIcon();
      domains.fetch()
        .complete(function(){ 
          domainsView.hideLoadingIcon(); 
        })
        .error(function(){ 
          domainsView.showError(res.responseText); 
        });
    }, // showDomains
    
    showAbout: function(){
      this.$('#about-dialog').dialog('open');      
    }
      
  });
  
  app = new App();

});
