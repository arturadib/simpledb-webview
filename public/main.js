$(function(){       
  $('button').button();
  
  // about
  $('#about-dialog').dialog({
    autoOpen: false,
    width: 400,
    title: 'About',
    modal: true,
    buttons: {
      Ok: function() {
        $(this).dialog('close');
      }
    }         
  });
  
  // Layout
  $('body').layout({ 
    applyDefaultStyles: true,
    spacing_open: 4,
    north__spacing_open: 0,
    north__size: 50,
    north__resizable: false,
    north__closable: false,
    west__minSize: 250
  });
          
  // Cookie management
  function getCredentialsInput(){
    return {keyid:$.trim($('input#keyid').val()), secret:$.trim($('input#secret').val())};
  }
  if ($.cookie('aws-credentials')) {
    var creds = JSON.parse($.cookie('aws-credentials'));
    $('input#keyid').val(creds.keyid);
    $('input#secret').val(creds.secret);
  }
  
  // getDomains()
  function getDomains(callback) {          
    $('.ui-layout-west .loading-icon').show();
    $.get('/get.domains', getCredentialsInput(), function(data){
      $(data).each(function(index, domain){
        var $obj = $('<div class="domain"> <div class="db-icon"><img src="img/db.png"></img></div> <div class="domain-name-wrapper"><span class="domain-name"></span> <span class="count"></span></div> </div>');
        $obj.find(".domain-name").html(domain.name);
        $obj.appendTo('.ui-layout-west .contents');
        $obj.find('.count').html('('+domain.count+')');
      });
    }, 'json')
    .error(function(){
      alert('Error getting data from server');
    })
    .complete(function(){
      $('.ui-layout-west .loading-icon').hide();            
    });
  }
  
  // encodeHtml()
  function encodeHtml(str){
    return $('<div/>').text(str).html();
  }
        
  // displayTable()
  function displayTable($theTable){
    var numFields = $theTable.find('thead th').size();
    var colRatioVector = [];
    for (var i=0;i<numFields;i++){
      colRatioVector.push(200);
    }
    var $origTableParent = $theTable.parent(); // prior to the wrappers due to fixheadertable()
    $theTable.fixheadertable({
      zebra: true,
      zebraClass: 'table-zebra',
      height: 200,          
      wrapper: false,
      colratio: colRatioVector,
      resizeCol: true,
      sortable: true
    });
  
    fitTable($theTable, $origTableParent);
    $(window).resize(function(){
      clearTimeout(window.resizeTimer);
      window.resizeTimer = setTimeout(function(){ // hack to ensure the event is only fired *after* resizing motion            
        fitTable($theTable, $origTableParent);                        
      }, 500);
    });
    
    function fitTable($tableObj, $parentObj) {
      var $tableBody = $tableObj.parents('.body');
      $tableBody.height( $parentObj.height() - $tableBody.siblings('.headtable').height() - 2); // see DOM after $.fixheadertable()
    }
  }

  // displayData()
  function displayData(data){          
    // build fieldNames from heterogeneous data
    var fieldNames = [];
    data.forEach(function(datum){ // loop over each row
      for (key in datum) {
        if (fieldNames.indexOf(key)<0)
          fieldNames.push(key);
      }
    });
    fieldNames.sort();

    // build table head
    var $table = $('<table cellpadding="0" cellspacing="0" border="0" class="display" id="the-table"></table>');
    var $tHead = $('<thead></thead>').appendTo($table);
    var templateStr = '';
    fieldNames.forEach(function(field){
      $('<th></th>').html(field).appendTo($tHead);
      templateStr += '<td>${'+encodeHtml(field)+'}</td>';
    });

    // build table body
    var $tBody = $('<tbody></tbody>').appendTo($table);
    templateStr = '<tr>'+templateStr+'</tr>';
    $.template('dataTemplate', templateStr);
    $.tmpl('dataTemplate', data).appendTo($tBody);
    
    $table.appendTo('.ui-layout-center .contents');
    displayTable($table);
  }

  // getItems()
  function getItems(url, queryData){
    $('.ui-layout-center .contents').html('');
    $('.ui-layout-center .loading-icon').show();
    var theData = getCredentialsInput();
    $.extend(theData, queryData);
    $.get(url, theData, function(data){
      $('.ui-layout-center .loading-icon').hide();
      displayData(data);
    }, 'json');
  }

  // click: view domains button
  $('button#view').click(function(){          
    if (getCredentialsInput().keyid.length>0 && getCredentialsInput().secret.length>0) {
      $.cookie('aws-credentials', JSON.stringify(getCredentialsInput()), {path:"/", expires:30}); // expires in 1 month
      $('.ui-layout-west .contents').html('');
      $('.ui-layout-center .contents').html('');
      getDomains();
    }
    else {
      alert('Please enter your AWS key ID and secret.');
    }
  });
  
  // click: domain pane
  $('.domain').live('click', function(e){
    $('.domain.selected').removeClass('selected');
    $(this).addClass('selected');          
    
    getItems('/get.items', {domain: $(this).find('.domain-name').html()});
  });

  // click: execute query
  $('form.execute_query').submit(function(e) {
    e.preventDefault();
    var query = $(this).find('[name=query]').val();
    getItems('/get.query', {query: query});
  });
  
  // click: about button
  $('button#about').click(function(){
    $('#about-dialog').dialog('open');
  });

  // click: domain contents
  $('table tr').live('click', function(e){
    $(this).siblings('.selected').removeClass('selected');
    $(this).addClass('selected');
  });

});
