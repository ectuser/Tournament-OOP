import {Team} from "./Team"
export class Match{
    private _firstTeam : Team;
    private _secondTeam : Team;
    private _id : number = -1;
    private _date : Date;
    private _firstTeamScore : number;
    private _secondTeamScore : number;
    private _events : Array<MatchEvent>;
  
    constructor(firstTeam : Team, secondTeam : Team, date : Date, firstTeamScore : number, secondTeamScore : number, events : Array<MatchEvent>){
      this._firstTeam = firstTeam;
      this._secondTeam = secondTeam;
      this._date = date;
      this._firstTeamScore = firstTeamScore;
      this._secondTeamScore = secondTeamScore;
      this._events = events;
    }
    
    get id(){
      return this._id;
    }
    
    set id(id : number){
      this._id = id;
    }
    set events(events : Array<MatchEvent>){
      this._events = events;
    }
    get events(){
      return this._events;
    }
    get firstTeam(){
      return this._firstTeam;
    }
    get secondTeam(){
      return this._secondTeam;
    }
    get date(){
      return this._date;
    }
    get firstTeamScore(){
      return this._firstTeamScore;
    }
    get secondTeamScore(){
      return this._secondTeamScore;
    }
    set firstTeamScore(firstTeamScore : number){
      this._firstTeamScore = firstTeamScore;
    }
    set secondTeamScore(secondTeamScore : number){
      this._secondTeamScore = secondTeamScore;
    }
  }