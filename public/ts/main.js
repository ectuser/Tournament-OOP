var Ui = /** @class */ (function () {
    function Ui() {
        this.url = window.location.href;
        console.log(this.url);
        this.DefinePage();
    }
    Ui.prototype.DefinePage = function () {
        if (this.url.indexOf("show-table") !== -1) {
        }
        else if (this.url.indexOf("show-statistics") !== -1) {
        }
        else if (this.url.indexOf("create-match") !== -1) {
            var matchPage = new CreateMatchUI();
        }
    };
    return Ui;
}());
var CreateMatchUI = /** @class */ (function () {
    function CreateMatchUI() {
        this.firstColTeams = document.querySelectorAll("body > main > div.content > div.select-teams > div.first-team > div.team");
        this.secondColTeams = document.querySelectorAll("body > main > div.content > div.select-teams > div.second-team > div.team");
        this.firstCol = document.querySelector("body > main > div.content > div.select-teams > div.first-team");
        this.secondCol = document.querySelector("body > main > div.content > div.select-teams > div.second-team");
        this.submitButton = document.querySelector("body > main > div.content > div.select-teams-button");
        this.AddClicksToTeams(this.firstColTeams, this.firstCol);
        this.AddClicksToTeams(this.secondColTeams, this.secondCol);
        this.SubmitButtonClick();
    }
    CreateMatchUI.prototype.AddClicksToTeams = function (arr, col) {
        var _this = this;
        arr.forEach(function (el) {
            el.addEventListener("click", function (event) {
                var ev = event.target;
                console.log(ev);
                _this.ClickFunction(col, ev);
            });
        });
    };
    CreateMatchUI.prototype.ClickFunction = function (col, el) {
        this.DisableAllTeams(col);
        el.classList.add("active");
    };
    CreateMatchUI.prototype.DisableAllTeams = function (col) {
        var teams = col.querySelectorAll("div.team");
        teams.forEach(function (el) {
            if (el.className.indexOf("active")) {
                el.classList.remove("active");
            }
        });
    };
    CreateMatchUI.prototype.SubmitButtonClick = function () {
        var _this = this;
        this.submitButton.addEventListener("click", function () {
            console.log("button click");
            _this.TeamsCheck();
        });
    };
    CreateMatchUI.prototype.TeamsCheck = function () {
        var _this = this;
        var firstTeamId = "-1";
        var secondTeamId = "-1";
        var firstCondition = false;
        var firstCounter = 0;
        var secondCondition = false;
        var secondCounter = 0;
        this.firstColTeams.forEach(function (el) {
            if (el.className.indexOf("active") !== -1) {
                firstTeamId = el.getAttribute("data-id");
            }
            if (firstCounter === _this.firstColTeams.length - 1) {
                firstCondition = true;
            }
            firstCounter++;
        });
        this.secondColTeams.forEach(function (el) {
            if (el.className.indexOf("active") !== -1) {
                secondTeamId = el.getAttribute("data-id");
            }
            if (secondCounter === _this.secondColTeams.length - 1) {
                secondCondition = true;
            }
            secondCounter++;
        });
        var inter = setInterval(function () {
            if (firstCondition && secondCondition) {
                clearInterval(inter);
                if (firstTeamId === "-1" || secondTeamId === "-1" || secondTeamId === firstTeamId) {
                    console.log(firstTeamId, secondTeamId);
                    alert("Choose different teams from each column!");
                    // this.TeamsCheck();
                    return;
                }
                else {
                    alert("created");
                }
            }
        });
    };
    return CreateMatchUI;
}());
var firstScreen = new Ui();
