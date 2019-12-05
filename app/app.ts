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

          let match : Match = new Match(firstTeam, secondTeam, date, 0, 0);
          console.log(match);
          this.repository.GetTeamsAmount((id : number) =>{
            match.id = id;
            console.log(match.id);
            
            let msg : Message = new Message("create-events", match.id);

            res.send(msg);
          });

        })
      });
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
  private message : string;
  private data : number;
  constructor(message : string, data : number){
    this.data = data;
    this.message = message;
  }
}

class Parse{
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
        }
        counter++;
      }

      let inter = setInterval(() => {
        if (cond){
          clearInterval(inter);

          let teams : Array<Team> = [];

          for (let i in obj){
            teams.push(obj[i]);
          }

          callback(teams);
        }
      }, 200)

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
  // public Get

}

class Match{
  private _firstTeam : Team;
  private _secondTeam : Team;
  private _id : number = -1;
  private _date : Date;
  private _firstTeamScore : number;
  private _secondTeamScore : number;

  get id(){
    return this._id;
  }
  
  set id(id : number){
    this._id = id;
  }

  constructor(firstTeam : Team, secondTeam : Team, date : Date, firstTeamScore : number, secondTeamScore : number){
    this._firstTeam = firstTeam;
    this._secondTeam = secondTeam;
    this._date = date;
    this._firstTeamScore = firstTeamScore;
    this._secondTeamScore = secondTeamScore;
    
  }



}



let server = new Server();


