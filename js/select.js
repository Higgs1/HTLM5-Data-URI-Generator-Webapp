function selectNode(objId) {
  deselectNode();
  if (document.selection) {
    var range = document.body.createTextRange();
    range.moveToElementText(objId);
    range.select();
  }
  else if (window.getSelection) {
    var range = document.createRange();
    range.selectNode(objId);
    window.getSelection().addRange(range);
  }
}
function deselectNode() {
  if (document.selection)
    document.selection.empty(); 
  else if (window.getSelection)
    window.getSelection().removeAllRanges();
}
