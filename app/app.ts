// lib/app.ts
import express = require('express');
var mysql = require('mysql');
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
  constructor(){
    this.app = express();

    this.FirstInit();
    this.GetMainPage();
    this.GetTable();
    this.GetTeamById();
    this.GetCreateNewMatch();
    this.ListenPort();
    
  }

  private FirstInit(){
    this.app.set('view engine', 'ejs');
    this.app.use('/public', express.static('public'));
  }

  private GetMainPage(){
    this.app.get('/', function(req, res){

    });
  }

  private GetTable(){
    this.app.get('/show-table', (req, res) => {
      con.query("SELECT team.*, manager.name 'managername' FROM team join manager on manager.id=team.managerid", 
      (err : Error, result : Array<ITeam>) => {
        if (err) throw err;
        console.log(result);
        let arr : Array<Team> = this.ParseTeams(result);
        console.log(arr);
        res.render('table.ejs', { teams : arr });
      });
    })
  }

  private GetTeamById(){
    this.app.get("/team/:id", (req, res) => {
      var urlStr : string = req.url;
      var idStr : Array<string> = urlStr.split("/"); 
      var id : number = parseInt(idStr[2], 10);
    
      let sqlReq : string = `SELECT team.*, manager.name 'managername' FROM team join manager on manager.id=team.managerid WHERE team.id=${id}; 
      SELECT * FROM playerinteam join player on player.id=playerinteam.playerid WHERE playerinteam.teamid=${id};`;
    
      con.query(sqlReq, (err : Error, results : Array<Array<Object>>) => {
        if (err) throw err;
        let rowTeamsData : Array<ITeam> = results[0] as Array<ITeam>;
        let rowPlayersData : Array<IPlayer> = results[1] as Array<IPlayer>;
    
        let teams : Array<Team> = this.ParseTeams(rowTeamsData);
        let team = teams[0];
        let players : Array<Player> = this.ParsePlayers(rowPlayersData);
        
        res.render('team-page.ejs', { team : team, players : players });
      })
    })
  }

  private GetCreateNewMatch(){
    this.app.get("/create-match", (req, res) => {
      con.query(`SELECT * FROM team`, (err : Error, result : Array<ITeam>) => {
        if (err) throw err;
        let teams : Array<Team> = this.ParseTeams(result);
        res.render('create-match.ejs', { teams : teams });
      })
    })
  }

  private ListenPort(){
    this.app.listen(3000, () => {
      console.log('Example app listening on port 3000!');
    });
  }

  private ParseTeams(arr : Array<ITeam>) : Array<Team>{
    let newArr : Array<Team> = [];
    for (let i of arr){
      let manager = new Manager(i.managerid, i.managername);
      let team = new Team(i.id, i.name, i.points, manager);
      newArr.push(team);
    }
    return newArr;
  }
  
  private ParsePlayers(arr : Array<IPlayer>) : Array<Player>{
    let newArr : Array<Player> = [];
    for (let i of arr){
      let player = new Player(i.id, i.name, i.goals, i.assists, i.redcards, i.yellowcards);
      
      newArr.push(player);
    }
    return newArr;
  }
}

let server = new Server();


