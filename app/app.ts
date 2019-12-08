// lib/app.ts

import express = require('express');
let mysql = require('mysql');
let bodyParser = require('body-parser');
let con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1AmNotGay",
  database: "tournament",
  multipleStatements: true
});

// import other classes
import {Manager} from "./classes/Manager";
import {Team} from "./classes/Team";
import {Player} from "./classes/Player";
import {ITeam} from "./interfaces/ITeam";
import {IPlayer} from "./interfaces/IPlayer";
import { ITeamsPlayers } from './interfaces/ITeamsPlayers';
import { runInNewContext } from 'vm';
import { parse } from 'path';


class Server{
  private app : express.Application;
  private parse : Parse = new Parse();
  private repository : Repository = new Repository();
  constructor(){
    this.app = express();

    this.FirstInit();
    this.GetMainPage();
    this.GetTable();
    this.GetTeamById();
    this.GetCreateNewMatch();
    this.PostCreateNewMatch();
    this.GetMatchById();
    this.ListenPort();
    
  }

  private FirstInit(){
    this.app.set('view engine', 'ejs');
    this.app.use('/public', express.static('public'));
    this.app.use(express.urlencoded());
    this.app.use(express.json());      // if needed
  }

  private GetMainPage(){
    this.app.get('/', (req, res) => {
      this.repository.GetTeams(console.log);
      
    });
  }

  private GetTable(){
    this.app.get('/show-table', (req, res) => {
      let teams : Array<Team>;
      // this.repository.GetTeamsWithManagers((result : Array<Team>) => {
        // res.render('table.ejs', { teams : teams });
      // })
      this.repository.GetPlayers((teams : Array<Team>) => {
        res.render('table.ejs', { teams : teams });
      });
    })
  }

  private GetTeamById(){
    this.app.get("/team/:id", (req, res) => {
      let idStr : string = req.params.id;
      let id = parseInt(idStr);
    
      let team : Team;
      let players : Array<Player>
      this.repository.GetTeamAndPlayers(id, (newTeam : Team) => {
        team = newTeam;
        players = newTeam.players;
        res.render('team-page.ejs', { team : team, players : players });
      });  
    })
  }

  private GetCreateNewMatch(){
    this.app.get("/create-match", (req, res) => {
      this.repository.GetPlayers((teams : Array<Team>) => {
        res.render('create-match.ejs', { teams : teams });
      })
    })
  }

	private PostCreateNewMatch(){
		this.app.post("/create-match", (req, res) => {
      let firstTeamId : number = req.body.data[0];
      let secondTeamId : number = req.body.data[1];
      let date : Date = req.body.date;
      console.log(date);
      this.repository.GetTeamAndPlayers(firstTeamId, (firstTeam : Team) => {
        this.repository.GetTeamAndPlayers(secondTeamId, (secondTeam : Team) => {;

          let match : Match = new Match(firstTeam, secondTeam, date, 0, 0, []);
          console.log(match);
          this.repository.GetTeamsAmount((id : number) =>{
            match.id = id;
            console.log(match.id);
            
            con.query("select * from eventtype", (err : Error, result : Array<IEventType>) => {
              let msg : Message = new Message("create-events", firstTeam.players, secondTeam.players, result);
              res.send(msg);

              this.PostCreateMatchEvents(match);
            });
          });

        })
      });
    })
  }
  private PostCreateMatchEvents(match : Match){
    this.app.post("/create-match-events", (req, res) => {
      match.events = req.body.matchEvents;
      console.log("hello");
      this.parse.ParseEventPlayers(match, (newMatch : Match) => {
        // console.log("CHECK MY NEW MATCH", newMatch.events);
        this.repository.InsertMatch(match);
      })
      // console.log("CHECK MY EVENTS", match);

    })
  }

  private GetMatchById(){
    this.app.get("/match/:id", (req, res) => {
      console.log("Hello, match ", req.params.id);
    })
  }

  private ListenPort(){
    this.app.listen(3000, () => {
      console.log('Example app listening on port 3000!');
    });
  }
}

class Message{
  private _message : string;
  private _firstTeamPlayers : Array<Player>;
  private _secondTeamPlayers : Array<Player>;
  private _eventtype : Array<IEventType>
  constructor(message : string, firstTeamPlayers : Array<Player>, secondTeamPlayers : Array<Player>, eventtype : Array<IEventType>){
    this._message = message;
    this._firstTeamPlayers = firstTeamPlayers;
    this._secondTeamPlayers = secondTeamPlayers;
    this._eventtype = eventtype;
  }
  get message(){
    return this._message;
  }
  get firstTeamPlayers(){
    return this._firstTeamPlayers;
  }
  get secondTeamPlayers(){
    return this._secondTeamPlayers;
  }
}

class Parse{
  public ParseEventPlayers(match : Match, callback : Function){
    let counter = 0;
    match.events.forEach((ev: MatchEvent) => {
      let player : Player = new Player(ev.player.id, ev.player.name, ev.player.goals, ev.player.assists, ev.player.redcards, ev.player.yellowcards);
      ev.player = player;
      if (counter === match.events.length - 1){
        callback(match);
      }
      counter++;
    })

  }

  public ParseTeams(arr : Array<ITeam>) : Array<Team>{
    let newArr : Array<Team> = [];
    for (let i of arr){
      let manager = new Manager(i.managerid, i.managername);
      let players = this.ParsePlayers(i.players);
      let team = new Team(i.id, i.name, i.points, manager, players);
      newArr.push(team);
    }
    return newArr;
  }

  public ParseOneTeam(iTeam : ITeam) : Team{
    let manager = new Manager(iTeam.managerid, iTeam.managername);
    let team : Team = new Team(iTeam.id, iTeam.name, iTeam.points, manager, iTeam.players);
    console.log(team)
    return team;
  }
  
  public ParsePlayers(arr : Array<IPlayer>) : Array<Player>{
    let newArr : Array<Player> = [];
    for (let i of arr){
      let player = new Player(i.id, i.name, i.goals, i.assists, i.redcards, i.yellowcards);
      
      newArr.push(player);
    }
    return newArr;
  }
}

class Repository{
  private parse : Parse = new Parse();

  public GetTeams(callback : Function){
    con.query(`SELECT * FROM team`, (err : Error, result : Array<ITeam>) => {
      if (err) throw err;

      
      
      let teams : Array<Team> = this.parse.ParseTeams(result);
      callback(teams);
    })
  }

  public GetPlayers(callback : Function){
    let sql = `select team.*, 
    manager.name 'managername', 
    player.id 'playerid', player.name 'playername', player.goals 'playergoals', player.assists 'assists', player.redcards 'redcards', player.yellowcards 'yellowcards' 
    from team 
    join manager on team.managerid = manager.id 
    join playerinteam on playerinteam.teamid=team.id 
    join player on player.id=playerinteam.playerid;`

    let obj : { [id : string] : Team } = {};

    con.query(sql, (err : Error, result : Array<ITeamsPlayers>) => {

      let counter : number = 0;
      let cond : boolean = false;
      for (let i of result){
        let manager : Manager = new Manager(i.managerid, i.managername);
        let player : Player = new Player(i.playerid, i.playername, i.playergoals, i.assists, i.redcards, i.yellowcards);
        let team = new Team(i.id, i.name, i.points, manager, [player]);
        if (obj[i.id] == undefined){
          obj[i.id] = team;
        }
        else{
          obj[i.id].players.push(player);
        }

        if (counter === result.length - 1){
          cond = true;
          let teams : Array<Team> = [];

          for (let i in obj){
            teams.push(obj[i]);
          }
          callback(teams);
        }
        counter++;
      }

    })
  }
  public GetTeamAndPlayers(id : number, callback : Function){
    let sqlReq : string = `SELECT team.*, manager.name 'managername' FROM team join manager on manager.id=team.managerid WHERE team.id=${id}; 
      SELECT * FROM playerinteam join player on player.id=playerinteam.playerid WHERE playerinteam.teamid=${id};`;
    
      con.query(sqlReq, (err : Error, results : Array<Array<Object>>) => {
        if (err) throw err;
        let rowTeamsData : Array<ITeam> = results[0] as Array<ITeam>;
        let rowPlayersData : Array<IPlayer> = results[1] as Array<IPlayer>;

        rowTeamsData[0].players = rowPlayersData;
    
        let teams : Array<Team> = this.parse.ParseTeams(rowTeamsData);
        let team = teams[0];
        console.log(team);

        callback(team);
      })
  }
  public GetTeamsAmount(callback : Function){
    con.query("SELECT * FROM team", (err : Error, result : Array<Object>) => {
      if (err) throw err;
      let amount = result.length;
      callback(amount);
    })
  }
  public InsertMatch(match : Match){
    let firstTeamId : number = match.firstTeam.id;
    let secondTeamId : number = match.secondTeam.id;
    // let date : string = match.date.toJSON().slice(0, 19).replace('T', ' ');
    let firstTeamScore = match.firstTeamScore;
    let secondTeamScore = match.secondTeamScore;
    // let events : Array<MatchEvent> = match.events;
    this.InitMatchEvents(match.events, match);
    // console.log("CHECK MY EVENTS", match.events);
  }
  private InitMatchEvents(events : Array<MatchEvent>, match : Match){
    events.forEach((ev : MatchEvent) => {
      let player : Player = ev.player;
      console.log("CHECK PLAYER",ev, ev.player);
      this.UpdatePlayerStats(player, ev.type);
      

      this.GetTeamIdByPlayer(player, (teamId : number) => {
        if (ev.type == "goal"){
          console.log("==========================================================");
          if (match.firstTeam.id === teamId){
            match.firstTeamScore += 1;
            console.log(match);
          }
          else if (match.secondTeam.id === teamId){
            match.secondTeamScore += 1;
            console.log(match);
          }
        }
      })      
    })
  }
  private UpdatePlayerStats(player : Player, type : string){
    console.log(player.id);
    con.query(`UPDATE player SET ${type}s = ${type}s + 1 WHERE id = ${player.id}`);
  }
  private GetTeamIdByPlayer(player : Player, callback : Function){
    con.query(`SELECT * FROM playerinteam WHERE playerid = ${player.id}`, (err : Error, result : Array<IPlayerInTeam>) => {
      if (err) throw err;

      callback(result[0].teamid);
    })
  }
  
  // public Get

}

class Match{
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

class MatchEvent{
  private _id : number;
  private _type : string;
  private _player : Player;
  private _time : Date;

  constructor(id : number, type : string, player : Player, time : Date){
    this._id = id;
    this._type = type;
    this._player = player;
    this._time = time;
  }
  get player(){
    return this._player;
  }
  get type(){
    return this._type;
  }
  get time(){
    return this._time;
  }
  set player(player : Player){
    this._player = player;
  }
}

interface IEventType{
  typeid : number;
  name : string;
}

interface IPlayerInTeam{
  playerid : number;
  teamid : number;
}


let server = new Server();


