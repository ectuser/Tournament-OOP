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

                if (firstTeamId === "-1" || secondTeamId === "-1" || secondTeamId === firstTeamId){
                    console.log(firstTeamId, secondTeamId);
                    alert("Choose different teams from each column!");
                    // this.TeamsCheck();
                    return;
                }
                else {
                    alert("created");
                    let date : Date = new Date((document.querySelector("#start") as HTMLInputElement).value);
                    console.log(date);
                    let firstTeamIdNumber : number = parseInt(firstTeamId);
                    let secondTeamIdNumber : number = parseInt(secondTeamId);
                    let teams : Array<number> = [firstTeamIdNumber, secondTeamIdNumber]
                    $.post("/create-match", { data : teams, date : date}, (message : Message) => {
                        console.log(message);
                        if (message.message === "create-events"){
                            window.open(`http://localhost:3000/match/${message.data}`);
                        }
                    })
                         
                }
            }
        })
    }
}

class Message{
    public message : string;
    public data : number;
    constructor(message : string, data : number){
      this.data = data;
      this.message = message;
    }
  }

var firstScreen = new Ui();