// import { ifError } from "assert";
// import { parse } from "path";
// import { parse } from "querystring";
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
        this.matchEvents = [];
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
                if (firstTeamId === "-1" || secondTeamId === "-1" || secondTeamId === firstTeamId || document.querySelector("#match-date-time-input").value == "") {
                    console.log(firstTeamId, secondTeamId);
                    alert("Choose different teams from each column!");
                    // this.TeamsCheck();
                    return;
                }
                else {
                    alert("created");
                    var date = new Date(document.querySelector("#match-date-time-input").value);
                    var dateString_1 = document.querySelector("#match-date-time-input").value;
                    console.log(date);
                    var firstTeamIdNumber = parseInt(firstTeamId);
                    var secondTeamIdNumber = parseInt(secondTeamId);
                    var teams = [firstTeamIdNumber, secondTeamIdNumber];
                    $.post("/create-match", { data: teams, date: date }, function (message) {
                        var allPlayers = [];
                        allPlayers.push.apply(allPlayers, message._firstTeamPlayers);
                        allPlayers.push.apply(allPlayers, message._secondTeamPlayers);
                        _this.CreateEventsWindow(allPlayers, dateString_1, message._eventtype);
                    });
                }
            }
        });
    };
    CreateMatchUI.prototype.CreateEventsWindow = function (players, date, eventtype) {
        var playersSelect = document.querySelector("#players-select");
        var eventsSelect = document.querySelector("#events-select");
        var dateTimeInput = document.querySelector("#event-time-input");
        dateTimeInput.value = date;
        console.log(eventtype);
        players.forEach(function (player) {
            var option = document.createElement("option");
            option.value = player.id.toString();
            option.innerText = player.name;
            playersSelect.appendChild(option);
        });
        eventtype.forEach(function (event) {
            var option = document.createElement("option");
            option.value = event.typeid.toString();
            option.innerText = event.name;
            eventsSelect.appendChild(option);
        });
        this.CreateEventButtonClick(playersSelect, eventsSelect, players, dateTimeInput);
    };
    CreateMatchUI.prototype.CreateEventButtonClick = function (playersSelect, eventsSelect, players, dateTimeInput) {
        var _this = this;
        var button = document.querySelector("#add-event");
        button.addEventListener("click", function (event) {
            var ev = event.target;
            console.log(ev);
            var player = playersSelect.options[playersSelect.selectedIndex];
            var oneEvent = eventsSelect.options[eventsSelect.selectedIndex];
            var playerId = parseInt(player.value);
            var oneEventId = parseInt(oneEvent.value);
            _this.FindPlayer(playerId, players, function (playerToAdd) {
                console.log(dateTimeInput);
                var matchEvent = new MatchEvent(4, oneEvent.textContent, playerToAdd, new Date(dateTimeInput.value), oneEventId);
                console.log(matchEvent);
                _this.AddNewEvent(matchEvent);
            });
        });
    };
    CreateMatchUI.prototype.FindPlayer = function (playerId, players, callback) {
        players.forEach(function (player) {
            if (player.id === playerId) {
                callback(player);
            }
        });
    };
    CreateMatchUI.prototype.AddNewEvent = function (newEvent) {
        this.matchEvents.push(newEvent);
        var matchEventsElement = document.querySelector("body > main > div.content > div.match-events");
        var newEventElement = document.createElement('div');
        newEventElement.textContent = newEvent._player.name + " | " + newEvent._type + " | " + newEvent._time.toString();
        matchEventsElement.appendChild(newEventElement);
    };
    return CreateMatchUI;
}());
var Message = /** @class */ (function () {
    function Message(message, firstTeamPlayers, secondTeamPlayers, eventtype) {
        this._message = message;
        this._firstTeamPlayers = firstTeamPlayers;
        this._secondTeamPlayers = secondTeamPlayers;
        this._eventtype = eventtype;
    }
    return Message;
}());
var Player = /** @class */ (function () {
    function Player(id, name, goals, assists, redcards, yellowcards) {
        this.id = id;
        this.name = name;
        this.goals = goals;
        this.assists = assists;
        this.redcards = redcards;
        this.yellowcards = yellowcards;
    }
    return Player;
}());
var MatchEvent = /** @class */ (function () {
    function MatchEvent(id, type, player, time, typeEventId) {
        this._id = id;
        this._type = type;
        this._player = player;
        this._time = time;
        this._typeEventId = typeEventId;
    }
    return MatchEvent;
}());
var IEvent = /** @class */ (function () {
    function IEvent(evId, plId) {
        this.eventId = evId;
        this.playerId = plId;
    }
    return IEvent;
}());
var firstScreen = new Ui();
