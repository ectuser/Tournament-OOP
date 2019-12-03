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
  con.query("SELECT * FROM team", function (err : Error, result : Array<Object>, fields : Array<Object>) {
    if (err) throw err;
    // console.log(result);
    var parsedTeams : Array<Team> = result as Array<Team>;

    console.log(parsedTeams); 

    res.render('table.ejs', { teams : parsedTeams });
  });
})

app.get("/team/:id", function(req, res){
  var urlStr : string = req.url;
  var idStr : Array<string> = urlStr.split("/"); 
  var id : number = parseInt(idStr[2], 10);
  console.log(id, urlStr, idStr);

  con.query(`SELECT * FROM team WHERE team.id=${id}; 
  SELECT * FROM playerinteam join player on player.id=playerinteam.playerid WHERE playerinteam.teamid=${id}`,
  [1, 2], 
  function (err : Error, results : Array<Array<Object>>){
    if (err) throw err;
    // console.log(result);
    var parsedTeams : Array<Array<Team>> = results as Array<Array<Team>>;

    console.log(parsedTeams);

    res.render('team-page.ejs', { teams : parsedTeams });
    // res.send({ teams : parsedTeams });
  })
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});


class Tournament{

}

class Team{
  public readonly id : number;
  public readonly name : string;
  public readonly points : number;
  public readonly coach : string;

  constructor(id:number, name: string, points : number, coachName : string){
    this.id = id;
    this.name = name;
    this.points = points;
    this.coach = coachName;
  }
}

class Player{
  private id : number;
  private name : string;


  constructor (id:number, name : string){
    this.id = id;
    this.name = name;
  }

  public GetTheName() : string{
    return this.name;
  }
}