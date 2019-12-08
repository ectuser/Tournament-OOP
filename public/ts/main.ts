// import { ifError } from "assert";
// import { parse } from "path";

// import { parse } from "querystring";

class Ui {
    private url : string;

    constructor(){
        this.url = window.location.href; 
        console.log(this.url);
        this.DefinePage();
    }

    private DefinePage(){
        if (this.url.indexOf("show-table") !== -1){

        }
        else if (this.url.indexOf("show-statistics") !== -1){

        }
        else if (this.url.indexOf("create-match") !== -1){
            let matchPage : CreateMatchUI = new CreateMatchUI();
        }
    }

}

class CreateMatchUI{
    private readonly firstCol : HTMLElement;
    private readonly secondCol : HTMLElement;
    private firstColTeams : NodeListOf<HTMLElement>;
    private secondColTeams : NodeListOf<HTMLElement>;
    private readonly submitButton : HTMLElement;
    private matchEvents : Array<MatchEvent> = [];

    constructor(){
        this.firstColTeams = document.querySelectorAll<HTMLElement>("body > main > div.content > div.select-teams > div.first-team > div.team");
        this.secondColTeams = document.querySelectorAll<HTMLElement>("body > main > div.content > div.select-teams > div.second-team > div.team");

        this.firstCol = document.querySelector("body > main > div.content > div.select-teams > div.first-team") as HTMLElement;
        this.secondCol = document.querySelector("body > main > div.content > div.select-teams > div.second-team") as HTMLElement;

        this.submitButton = document.querySelector("body > main > div.content > div.select-teams-button") as HTMLElement;

        this.AddClicksToTeams(this.firstColTeams, this.firstCol);
        this.AddClicksToTeams(this.secondColTeams, this.secondCol);
        this.SubmitButtonClick();

    }

    private AddClicksToTeams(arr : NodeListOf<HTMLElement>, col : HTMLElement){
        arr.forEach((el : HTMLElement) => {
            el.addEventListener("click", (event) =>{
                let ev = event.target as Element;
                console.log(ev);
                this.ClickFunction(col, ev);
            });
        })
    }
    private ClickFunction(col : HTMLElement, el : Element){
        this.DisableAllTeams(col);
        el.classList.add("active");
    }

    private DisableAllTeams(col : HTMLElement){
        let teams = col.querySelectorAll<HTMLElement>("div.team");
        teams.forEach((el : HTMLElement) => {
            if (el.className.indexOf("active")){
                el.classList.remove("active");
            }
        })
    }

    private SubmitButtonClick(){
        this.submitButton.addEventListener("click", () => {
            console.log("button click");
            this.TeamsCheck();
        })
    }

    private TeamsCheck(){
        let firstTeamId : string = "-1";
        let secondTeamId : string = "-1";


        let firstCondition : boolean = false;
        let firstCounter : number = 0;

        let secondCondition : boolean = false;
        let secondCounter : number = 0;


        this.firstColTeams.forEach((el : HTMLElement) => {
            if (el.className.indexOf("active") !== -1){
                firstTeamId = el.getAttribute("data-id") as string;
            }
            if (firstCounter === this.firstColTeams.length - 1){
                firstCondition = true;
            }
            firstCounter++;
        });
        this.secondColTeams.forEach((el : HTMLElement) => {
            if (el.className.indexOf("active")  !== -1){
                secondTeamId = el.getAttribute("data-id") as string;
            }
            if (secondCounter === this.secondColTeams.length - 1){
                secondCondition = true;
            }
            secondCounter++;
        })

        let inter = setInterval(() =>{
            if (firstCondition && secondCondition){

                clearInterval(inter);

                if (firstTeamId === "-1" || secondTeamId === "-1" || secondTeamId === firstTeamId || (document.querySelector("#match-date-time-input") as HTMLInputElement).value == ""){
                    console.log(firstTeamId, secondTeamId);
                    alert("Choose different teams from each column!");
                    // this.TeamsCheck();
                    return;
                }
                else {
                    alert("created");
                    let date : Date = new Date((document.querySelector("#match-date-time-input") as HTMLInputElement).value);
                    let dateString : string = (document.querySelector("#match-date-time-input") as HTMLInputElement).value;
                    console.log(date);
                    let firstTeamIdNumber : number = parseInt(firstTeamId);
                    let secondTeamIdNumber : number = parseInt(secondTeamId);
                    let teams : Array<number> = [firstTeamIdNumber, secondTeamIdNumber]
                    $.post("/create-match", { data : teams, date : date}, (message : Message) => {
                        let allPlayers : Array<Player> = [];
                        allPlayers.push(...message._firstTeamPlayers);
                        allPlayers.push(...message._secondTeamPlayers);
                        this.CreateEventsWindow(allPlayers, dateString, message._eventtype, date);
                        this.CreateMatchButtonClick();

                    })
                         
                }
            }
        })
    }

    private CreateEventsWindow(players : Array<Player>, date : string, eventtype : Array<IEventType>, matchStarts : Date){
        let playersSelect : HTMLSelectElement = document.querySelector("#players-select") as HTMLSelectElement;
        let eventsSelect : HTMLSelectElement = document.querySelector("#events-select") as HTMLSelectElement;
        let dateTimeInput : HTMLInputElement = document.querySelector("#event-time-input") as HTMLInputElement;
        dateTimeInput.value = date;
        console.log(eventtype);

        players.forEach((player : Player) => {
            let option = document.createElement("option");
            option.value = player.id.toString();
            option.innerText = player.name;
            playersSelect.appendChild(option);
        })
        eventtype.forEach((event : IEventType) => {
            let option = document.createElement("option");
            option.value = event.typeid.toString();
            option.innerText = event.name;
            eventsSelect.appendChild(option);
        })
        this.CreateEventButtonClick(playersSelect, eventsSelect, players, dateTimeInput, matchStarts);        
    }


    private CreateEventButtonClick(playersSelect : HTMLSelectElement, eventsSelect : HTMLSelectElement, players : Array<Player>, dateTimeInput : HTMLInputElement, matchStarts : Date){
        let button : HTMLElement = document.querySelector("#add-event") as HTMLElement;    

        button.addEventListener("click", (event) =>{
            let ev = event.target as Element;
            console.log(ev);

            let player = playersSelect.options[playersSelect.selectedIndex];
            let oneEvent = eventsSelect.options[eventsSelect.selectedIndex];

            let playerId : number = parseInt(player.value);
            let oneEventId : number = parseInt(oneEvent.value);

            this.FindPlayer(playerId, players, (playerToAdd : Player) => {
                console.log(dateTimeInput);
                if (this.CheckEventType(matchStarts, new Date(dateTimeInput.value))){
                    let matchEvent : MatchEvent = new MatchEvent(this.matchEvents.length, oneEvent.textContent as string, playerToAdd, new Date(dateTimeInput.value), oneEventId);
                    console.log(matchEvent);
                    this.AddNewEvent(matchEvent, matchStarts);
                }
                else{
                    alert("Incorrect time");
                }
            })
        })
    }
    private FindPlayer(playerId : number, players : Array<Player>, callback : Function){
        players.forEach((player : Player) => {
            if (player.id === playerId){
                callback(player);
            }
        })
    }
    private AddNewEvent(newEvent : MatchEvent, matchStarts : Date){
        this.matchEvents.push(newEvent);
        let matchEventsElement : HTMLElement = document.querySelector("body > main > div.content > div.match-events") as HTMLElement;

        let newEventElement : HTMLElement = this.CreateNewElement("div", "new-event", "");
        let playerElement : HTMLElement = this.CreateNewElement("div", "ev player", newEvent.player.name);
        let eventElement : HTMLElement = this.CreateNewElement("div", "ev event", newEvent.type);
        let eventTime : HTMLElement = this.CreateNewElement("div", "ev time", this.CountMinutesDifference(matchStarts, newEvent.time).toString() + "'");
        let removeButton : HTMLElement = this.CreateNewElement("div", "btn remove", "X");
        removeButton.setAttribute("data-event-id", newEvent.id.toString());

        newEventElement.appendChild(playerElement);
        newEventElement.appendChild(eventElement);
        newEventElement.appendChild(eventTime);
        newEventElement.appendChild(removeButton);

        this.RemoveEventButtonClick(removeButton, newEventElement);

        matchEventsElement.appendChild(newEventElement);
    }

    private CountMinutesDifference(first : Date, second : Date) : number{
        let diffTime : number = Math.abs(first.getTime() - second.getTime());
        let diffMinutes : number = Math.ceil(diffTime / (1000 * 60));
        return diffMinutes;
    }
    private CheckEventType(matchStarts : Date, eventTime : Date) : boolean{
        let diffTime : number = eventTime.getTime() - matchStarts.getTime();
        let diffMinutes : number = Math.ceil(diffTime / (1000 * 60));
        if (diffTime < 0 || diffMinutes > 95){
            return false;
        }
        return true;
    }
    private CreateNewElement(tag : string, className : string, textContent : string) : HTMLElement{
        let newElement : HTMLElement = document.createElement(tag);
        newElement.className = className;
        newElement.textContent = textContent;
        return newElement;
    }
    private RemoveEventButtonClick(button : HTMLElement, eventElement : HTMLElement){
        button.addEventListener("click", (event) =>{
            let id : number = parseInt(button.getAttribute("data-event-id") as string);
            this.FindEventById(id, (ev: MatchEvent) => {
                var index = this.matchEvents.indexOf(ev);
                if (index > -1) {
                    this.matchEvents.splice(index, 1);
                    eventElement.remove();
                }
            })
        })
    }
    private FindEventById(id : number, callback : Function){
        this.matchEvents.forEach((ev : MatchEvent) => {
            if (ev.id === id){
                callback(ev);
            }
        })
    }
    private CreateMatchButtonClick(){
        let createMatchButton : HTMLElement = document.querySelector("#create-match-with-events") as HTMLElement;
        createMatchButton.addEventListener("click", () => {
            console.log(this.matchEvents);
            $.post("/create-match-events", { matchEvents : this.matchEvents } );
        })
    }
}

class Message{
    public _message : string;
    public _firstTeamPlayers : Array<Player>;
    public _secondTeamPlayers : Array<Player>;
    public _eventtype : Array<IEventType>
    constructor(message : string, firstTeamPlayers : Array<Player>, secondTeamPlayers : Array<Player>, eventtype : Array<IEventType>){
        this._message = message;
        this._firstTeamPlayers = firstTeamPlayers;
        this._secondTeamPlayers = secondTeamPlayers;
        this._eventtype = eventtype;
    }
}

class Player{
    public id : number;
    public name : string;
    public goals : number;
    public assists : number;
    public redcards : number;
    public yellowcards : number;
    constructor (id:number, name : string, goals : number, assists : number, redcards : number, yellowcards : number){
        this.id = id;
        this.name = name;
        this.goals = goals;
        this.assists = assists;
        this.redcards = redcards;
        this.yellowcards = yellowcards;
    }
}

class MatchEvent{
    public id : number;
    public type : string;
    public typeEventId : number
    public player : Player;
    public time : Date;
  
    constructor(id : number, type : string, player : Player, time : Date, typeEventId : number){
        this.id = id;
        this.type = type;
        this.player = player;
        this.time = time;
        this.typeEventId = typeEventId;
    }
}
interface IEventType{
    typeid : number;
    name : string;
}
class IEvent{
    public eventId : number;
    public playerId : number;
    constructor (evId : number, plId : number){
        this.eventId = evId;
        this.playerId = plId;
    }
}

var firstScreen = new Ui();