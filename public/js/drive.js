$('#btn-new-game').click(function(){
   window.location.href = 'newgame.html'
});

$('#btn-join-game').click(function(){
   window.location.href = 'joingame.html'
});

$( "form" ).submit(function( event ) {
    console.log($( "input:first" ).val().length);
  if (!$( "input:first" ).val().length === 0) {
    return;
  }
  return true;
});