// lib/app.ts
import express = require('express');
var mysql = require('mysql');

// Create a new express application instance
const app: express.Application = express();
app.set('view engine', 'ejs');
app.use('/public', express.static('public'));
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1AmNotGay",
  database: "tournament",
  multipleStatements: true
});

app.get('/', function (req, res) {
  // res.render('index');
});
app.get('/show-table', function(req, res){
  con.query("SELECT team.*, manager.name 'managername' FROM team join manager on manager.id=team.managerid", 
  function (err : Error, result : Array<ITeam>, fields : Array<Object>) {
    if (err) throw err;
    console.log(result);
    let arr : Array<Team> = ParseTeams(result);
    console.log(arr);
    res.render('table.ejs', { teams : arr });
  });
})

app.get("/team/:id", function(req, res){
  var urlStr : string = req.url;
  var idStr : Array<string> = urlStr.split("/"); 
  var id : number = parseInt(idStr[2], 10);
  // console.log(id, urlStr, idStr);

  let sqlReq = `SELECT team.*, manager.name 'managername' FROM team join manager on manager.id=team.managerid WHERE team.id=${id}; 
  SELECT * FROM playerinteam join player on player.id=playerinteam.playerid WHERE playerinteam.teamid=${id};`;

  con.query(sqlReq, function (err : Error, results : Array<Array<Object>>){
    if (err) throw err;
    let rowTeamsData : Array<ITeam> = results[0] as Array<ITeam>;
    let rowPlayersData : Array<IPlayer> = results[1] as Array<IPlayer>;

    let teams : Array<Team> = ParseTeams(rowTeamsData);
    let team = teams[0];
    let players : Array<Player> = ParsePlayers(rowPlayersData);
    
    res.render('team-page.ejs', { team : team, players : players });
  })
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

function ParseTeams(arr : Array<ITeam>) : Array<Team>{
  let newArr : Array<Team> = [];
  for (let i of arr){
    let manager = new Manager(i.managerid, i.managername);
    let team = new Team(i.id, i.name, i.points, manager);
    newArr.push(team);
  }
  return newArr;
}

function ParsePlayers(arr : Array<IPlayer>) : Array<Player>{
  let newArr : Array<Player> = [];
  for (let i of arr){
    let player = new Player(i.id, i.name, i.goals, i.assists, i.redcards, i.yellowcards);
    
    newArr.push(player);
  }
  return newArr;
}


class Tournament{

}

interface ITeam{
  id : number;
  name : string;
  points : number;
  managerid : number;
  managername : string;
}

interface IPlayer{
  id : number;
  name : string;
  goals : number;
  assists : number;
  redcards : number;
  yellowcards : number;
}

class Manager{
  private readonly _id : number;
  private _name : string;

  constructor(id: number, name: string){
    this._id = id;
    this._name = name;
  }

  get id(){
    return this._id;
  }
  get name(){
    return this._name;
  }
}

class Team{
  private readonly _id : number;
  private readonly _name : string;
  private _points : number;
  private _manager : Manager;

  constructor(id:number, name: string, points : number, manager : Manager){
    this._id = id;
    this._name = name;
    this._points = points;
    this._manager = manager;
  }

  get id(){
    return this._id;
  }
  get name(){
    return this._name;
  }
  get points(){
    return this._points;
  }
  get manager(){
    return this._manager;
  }
}

class Player{
  public readonly id : number;
  public readonly name : string;
  public readonly goals : number;
  public readonly assists : number;
  public readonly redcards : number;
  public readonly yellowcards : number;
  constructor (id:number, name : string, goals : number, assists : number, redcards : number, yellowcards : number){
    this.id = id;
    this.name = name;
    this.goals = goals;
    this.assists = assists;
    this.redcards = redcards;
    this.yellowcards = yellowcards;
  }
}