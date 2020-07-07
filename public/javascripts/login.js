window.addEventListener("load", function(){
  function sendData(accesskey,secretkey){
    const XHR = new XMLHttpRequest();
    XHR.addEventListener( "load", function(event) {
      document.cookie = "jweToken=" + encodeURI(JSON.parse(event.target.responseText)["jweToken"]);
      //window.location.replace("http://localhost:8000");
      location.reload ();
    } );
    XHR.addEventListener( "error", function( event ) {
      alert( 'Oops! Something went wrong.' );
    } );
    XHR.open( "POST", "http://localhost:8000/login" );
    XHR.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    const token = get_bearer_token(accesskey,secretkey);
    XHR.send(JSON.stringify({"token": token}));
  }
  const button = document.getElementById( "button" );
  button.addEventListener( "click", function ( event ) {
    sendData(document.getElementById('accesskey').value,document.getElementById('secretkey').value);
  } );
});
