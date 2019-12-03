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
        var table = document.querySelector("body > main > div.content > table");
        var statistics = document.querySelector("body > main > div.content > div.tournament-statistics");
        var settings = document.querySelector("body > main > div.content > div.tournament-settings");
        if (node.getAttribute("data-type") === table.getAttribute("data-type")) {
            this.ShowClicked(table, statistics, settings);
            $.ajax("/show-table")
                .done(function (data) {
                console.log(data);
            })
                .fail(function () {
                console.log("failed");
            });
        }
        else if (node.getAttribute("data-type") === statistics.getAttribute("data-type")) {
            this.ShowClicked(statistics, table, settings);
        }
        else if (node.getAttribute("data-type") === settings.getAttribute("data-type")) {
            this.ShowClicked(settings, table, statistics);
        }
    };
    Ui.prototype.ShowClicked = function (activeNode, displayNoneFirst, displayNoneSecond) {
        if (activeNode.style.display === "none") {
            activeNode.style.display = "";
        }
        if (displayNoneFirst.style.display === "") {
            displayNoneFirst.style.display = "none";
        }
        if (displayNoneSecond.style.display === "") {
            displayNoneSecond.style.display = "none";
        }
    };
    return Ui;
}());
var firstScreen = new Ui();
