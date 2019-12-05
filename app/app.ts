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
      this.repository.GetTeamsWithManagers((result : Array<Team>) => {
        teams = result;
        res.render('table.ejs', { teams : teams });
      });
    })
  }

  private GetTeamById(){
    this.app.get("/team/:id", (req, res) => {
      var urlStr : string = req.url;
      var idStr : Array<string> = urlStr.split("/"); 
      var id : number = parseInt(idStr[2], 10);
    
      let team : Team;
      let players : Array<Player>
      this.repository.GetTeamsAndPlayers(id, (newTeam : Team, newPlayers : Array<Player>) => {
        team = newTeam;
        players = newPlayers;
        res.render('team-page.ejs', { team : team, players : players });
      });  
    })
  }

  private GetCreateNewMatch(){
    this.app.get("/create-match", (req, res) => {
      con.query(`SELECT * FROM team`, (err : Error, result : Array<ITeam>) => {
        if (err) throw err;
        let teams : Array<Team> = this.parse.ParseTeams(result);
        res.render('create-match.ejs', { teams : teams });
      })
    })
  }

  private PostCreateNewMatch(){
    this.app.post("/create-match", (req, res) => {
      let firstTeamId : number = req.body.data[0];
      let secondTeamId : number = req.body.data[1];
      let sqlReq = `SELECT * FROM playerinteam join player on player.id=playerinteam.playerid WHERE playerinteam.teamid=${firstTeamId};
                  SELECT * FROM playerinteam join player on player.id=playerinteam.playerid WHERE playerinteam.teamid=${secondTeamId};`;
      con.query(sqlReq, (err : Error, results : Array<Array<Object>>) => {
        if (err) throw err;

        let rowFirstTeamPlayersData : Array<IPlayer> = results[0] as Array<IPlayer>;
        let rowSecondTeamPlayersData : Array<IPlayer> = results[1] as Array<IPlayer>;

        let firstTeamPlayers : Array<Player> = this.parse.ParsePlayers(rowFirstTeamPlayersData);
        let secondTeamPlayers : Array<Player> = this.parse.ParsePlayers(rowSecondTeamPlayersData);

        console.log(firstTeamPlayers, secondTeamPlayers);
      })
    })
  }

  private ListenPort(){
    this.app.listen(3000, () => {
      console.log('Example app listening on port 3000!');
    });
  }
}

class Parse{
  public ParseTeams(arr : Array<ITeam>) : Array<Team>{
    let newArr : Array<Team> = [];
    for (let i of arr){
      let manager = new Manager(i.managerid, i.managername);
      let team = new Team(i.id, i.name, i.points, manager);
      newArr.push(team);
    }
    return newArr;
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
  public GetTeamsWithManagers(callback : Function){
    con.query("SELECT team.*, manager.name 'managername' FROM team join manager on manager.id=team.managerid", 
      (err : Error, result : Array<ITeam>) => {
        if (err) throw err;
        let arr : Array<Team> = this.parse.ParseTeams(result);
        console.log(arr);
        callback(arr);
      });
  }
  public GetTeamsAndPlayers(id : number, callback : Function){
    let sqlReq : string = `SELECT team.*, manager.name 'managername' FROM team join manager on manager.id=team.managerid WHERE team.id=${id}; 
      SELECT * FROM playerinteam join player on player.id=playerinteam.playerid WHERE playerinteam.teamid=${id};`;
    
      con.query(sqlReq, (err : Error, results : Array<Array<Object>>) => {
        if (err) throw err;
        let rowTeamsData : Array<ITeam> = results[0] as Array<ITeam>;
        let rowPlayersData : Array<IPlayer> = results[1] as Array<IPlayer>;
    
        let teams : Array<Team> = this.parse.ParseTeams(rowTeamsData);
        let team = teams[0];
        let players : Array<Player> = this.parse.ParsePlayers(rowPlayersData);

        callback(team, players);
      })
  }

}



let server = new Server();


