function Navigator() {
    this.container = null;
    this.button = null;
}

Navigator.prototype.initialize = function() {
    this.container = document.getElementById("screen-container");
    this.initializeButton();
}

Navigator.prototype.initializeButton = function() {
    var button = document.createElement("div");
    button.id = "backToIndex";
    // this.container.appendChild(button); // index_autolaunch.html does not exist
    this.button = button;
    this.button.onmouseup = function(_event) { location.href = "index_autolaunch.html" };
    this.button.ontouchend = function(_event) { location.href = "index_autolaunch.html" };
}