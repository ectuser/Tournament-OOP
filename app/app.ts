// lib/app.ts
import express = require('express');

// Create a new express application instance
const app: express.Application = express();
app.set('view engine', 'ejs');
app.use('/public', express.static('public'));

app.get('/', function (req, res) {
  res.render('index', {teams : ["MC", "Liverpool", "MU", "Chelsea"]});
});
app.get('/show-table', function(req, res){
  res.send({ hello : "world" });
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});


class Tournament{

}

class Team{
  public readonly name : string;
  public readonly points : number = 0;
  public readonly coach : string;
  public readonly listOfPlayers : Array<number> = [];

  constructor(name: string, coachName : string){
    this.name = name;
    this.coach = coachName;
  }
}

class Player{
  private name : string;


  constructor (name : string){
    this.name = name;
  }

  public GetTheName() : string{
    return this.name;
  }
}