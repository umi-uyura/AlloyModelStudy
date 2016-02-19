'use strict';

var dialogs = require('alloy/dialogs');

var memos = Alloy.Collections.memo;

function doOpen() {
  memos.fetch();
}

function addText() {
  var txt = $.memoText.getValue();

  var m = Alloy.createModel('memo', {
    contents: txt,
    priority: ''
  });

  m.save();
  memos.add(m);
  memos.fetch();

  $.memoText.setValue('');
}

function clickItem(e) {
  var secIdx = e.sectionIndex;
  var itemIdx = e.itemIndex;
  var itemId = e.itemId;
  var text = $.memoList.sections[e.sectionIndex].items[e.itemIndex].properties.title;

  if (OS_ANDROID) {
    itemId = parseInt(itemId);
  }

  var opt = {
    title: 'Action for: ' + text,
    options: [
      'Favorite',
      'Delete',
      'Cancel'
    ],
    cancel: 2,
    destructive: 1
  };

  var optionDialog = Ti.UI.createOptionDialog(opt);
  optionDialog.addEventListener('click', function(e) {
    switch (e.index) {
    case 0:
      var m = memos.where({id: itemId});
      if (m.length) {
        var priority = '*' + m[0].get('priority');
        m[0].set({priority: priority});
        m[0].save();
      }
      break;
    case 1:
      dialogs.confirm({
        title: 'Do you want to delete ?',
        message: '"' + text + '"',
        callback: function() {
          var m = memos.where({id: itemId});
          if (m.length) {
            m[0].destroy();
          }
        }
      });
      break;
    case 2:
      // Cancel
      break;
    default:
      Ti.API.error('Unknown action = ' + e.index);
      break;
    }
  });
  optionDialog.show();
}

$.index.open();
