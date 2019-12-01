var Ui = /** @class */ (function () {
    function Ui() {
        this.navigateLis = document.querySelectorAll("body > main > div.nav-bar > ul > li");
        console.log(this.navigateLis);
        this.InitLiClicks();
    }
    Ui.prototype.InitLiClicks = function () {
        var _this = this;
        for (var i = 0; i < this.navigateLis.length; i++) {
            this.navigateLis[i].addEventListener("click", function (event) {
                _this.DisableActiveClass();
                _this.AddActiveClass(event.target);
            });
        }
    };
    Ui.prototype.DisableActiveClass = function () {
        this.navigateLis.forEach(function (el) {
            el.classList.forEach(function (oneClass) {
                if (oneClass == "active") {
                    el.classList.remove("active");
                }
            });
        });
    };
    Ui.prototype.AddActiveClass = function (node) {
        console.log(node);
        node.classList.add("active");
    };
    return Ui;
}());
var firstScreen = new Ui();
