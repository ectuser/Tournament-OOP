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
    this.GetPlayerById();
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
      this.repository.GetTeamAndPlayers(firstTeamId, (firstTeam : Team) => {
        this.repository.GetTeamAndPlayers(secondTeamId, (secondTeam : Team) => {;

          let match : Match = new Match(firstTeam, secondTeam, date, 0, 0, []);
          this.repository.GetTeamsAmount((id : number) =>{
            match.id = id;
            
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
      this.parse.ParseEventPlayers(match, (newMatch : Match) => {
        this.repository.InsertMatch(match);
      })

    })
  }

  private GetMatchById(){
    this.app.get("/match/:id", (req, res) => {
      this.repository.GetMatchById(req.params.id, (match : Match) => {
        res.render('match.ejs', { data : match });
      });
    })
  }
  private GetPlayerById(){
    this.app.get("/player/:id", (req, res) => {
      this.repository.GetPlayerById(req.params.id, (player : Player) => {
        res.render('player.ejs', { data : player });
      });
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
          teams.sort((obj1 : Team, obj2 : Team) => {
            if (obj1.points < obj2.points)
                return 1;
            if (obj1.points > obj2.points)
                return -1;
            return 0;
        });
        callback(teams);
        }
        counter++;
      }

    })
  }

  public GetPlayerById(id : number, callback : Function){
    con.query(`select * from player where player.id = ${id}`, (err : Error, result : Array<IPlayer>) => {
      let player = new Player(result[0].id, result[0].name, result[0].goals, result[0].assists, result[0].redcards, result[0].yellowcards);
      callback(player);
    })
  }

  public GetMatchById(id : number, callback : Function){
    let sql = `select \`match\`.date, \`match\`.firstteamscore, \`match\`.secondteamscore, 
    t1.name 'FirstTeamName', t2.name 'SecondTeamName', t1.id 'firstTeamId', t2.id 'secondTeamId'
    from \`match\` 
    join team t1 on firstteamid = t1.id 
    join team t2 on t2.id=secondteamid 
    where \`match\`.id=${id};`

    con.query(sql, (err : Error, result : Array<IMatch>) => {
      if (err) throw err;
      let firstTeamId : number = result[0].firstTeamId;
      let secondTeamId : number = result[0].secondTeamId;
      let firstTeamScore : number = result[0].firstteamscore;
      let secondTeamScore : number = result[0].secondteamscore;
      let date : string = result[0].date;

      let firstTeam : Team;
      let secondTeam : Team;

      this.GetPlayers((teams : Array<Team>) => {
        let counter = 0;
        teams.forEach((team : Team) => {
          if (team.id === firstTeamId){
            firstTeam = team;
          }
          if (team.id === secondTeamId){
            secondTeam = team;
          }
          if (counter === teams.length - 1){
            con.query(`SELECT * FROM event join eventtype on event.typeid=eventtype.typeid where event.matchid = ${id}`, (err : Error, result : Array<IEvent>) => {
              if (err) throw err;

              this.GetPlayersForEvents(result, (events : Array<MatchEvent>) => {
                let match : Match = new Match(firstTeam, secondTeam, new Date(Date.parse(date)), firstTeamScore, secondTeamScore, events);
                callback(match);
              });
            })

          }
          counter++;
        })
      })
    })
  }
  private GetPlayersForEvents(res : Array<IEvent>, callback : Function){
    let events : Array<MatchEvent> = [];
    let counter = 0;
    res.forEach((el : IEvent) => {
      con.query(`SELECT * FROM player where player.id=${el.playerid}`, (err : Error, result : Array<IPlayer>) => {
        if (err) throw err;
        let player : Player = new Player(result[0].id, result[0].name, result[0].goals, result[0].assists, result[0].redcards, result[0].yellowcards);
        let dateTime : Date = new Date(el.time);
        let ev : MatchEvent = new MatchEvent(el.id, el.name, player, dateTime);
        events.push(ev);
        if (counter === res.length - 1){
          callback(events);
        }
        counter++;
      })

    })
  }
  public GetEvents(match : Match){
    // con.query(`select * from event where event.matchid = match.id`, (err : Error, result : Array<>) => {

    // })
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

        callback(team);
      })
  }
  public GetMatchesAmount(callback : Function){
    con.query("SELECT * FROM match", (err : Error, result : Array<Object>) => {
      if (err) throw err;
      let amount = result.length;
      callback(amount);
    })
  }
  public InsertMatch(match : Match){
    this.InitMatchEvents(match.events, match);
  }
  private InitMatchEvents(events : Array<MatchEvent>, match : Match){
    let counter = 0
    events.forEach((ev : MatchEvent) => {
      let player : Player = ev.player;
      this.UpdatePlayerStats(player, ev.type);

      this.InsertEvent(ev, match);

      this.GetTeamIdByPlayer(player, (teamId : number) => {
        if (ev.type == "goal"){
          if (match.firstTeam.id === teamId){
            match.firstTeamScore += 1;
            
          }
          else if (match.secondTeam.id === teamId){
            match.secondTeamScore += 1;
          }
        }
        if (counter === events.length - 1){
          this.AddMatch(match)
        }
        counter++;
      })
    })
  }
  private InsertEvent(ev : MatchEvent, match : Match){
      let date : string = new Date(ev.time).toISOString().slice(0, 19).replace('T', ' ');
      con.query(`select typeid from eventtype where eventtype.name = \'${ev.type}\'`, (err : Error, result : Array<IEventType>) => {
        if (err) throw err;
        // console.log(result[0].typeid, match.id, ev.player.id, date)
        con.query(`INSERT INTO event(typeid, matchid, playerid, time) VALUES(${result[0].typeid}, ${match.id}, ${ev.player.id}, \'${date}\')`);
      })

  }
  private UpdatePlayerStats(player : Player, type : string){
    con.query(`UPDATE player SET ${type}s = ${type}s + 1 WHERE id = ${player.id}`);
  }
  private GetTeamIdByPlayer(player : Player, callback : Function){
    con.query(`SELECT * FROM playerinteam WHERE playerid = ${player.id}`, (err : Error, result : Array<IPlayerInTeam>) => {
      if (err) throw err;

      callback(result[0].teamid);
    })
  }
  private AddMatch(match: Match){
    let firstTeamId : number = match.firstTeam.id;
    let secondTeamId : number = match.secondTeam.id;
    let date : string = new Date(match.date).toISOString().slice(0, 19).replace('T', ' ');
    let firstTeamScore = match.firstTeamScore;
    let secondTeamScore = match.secondTeamScore;

    con.query(`INSERT INTO \`match\`(firstteamid, secondteamid, date, firstteamscore, secondteamscore) VALUES(${firstTeamId}, ${secondTeamId}, \'${date}\', ${firstTeamScore}, ${secondTeamScore})`);
    if (match.firstTeamScore > match.secondTeamScore){
      con.query(`UPDATE team SET points = points + 3 WHERE team.id = ${match.firstTeam.id}`);
      console.log("first won");
    }
    else if (match.firstTeamScore < match.secondTeamScore){
      console.log("second won")
      con.query(`UPDATE team SET points = points + 3 WHERE team.id = ${match.secondTeam.id}`);
    }
    else{
      console.log("draw");
      con.query(`UPDATE team SET points = points + 1 WHERE team.id = ${match.firstTeam.id}`);
      con.query(`UPDATE team SET points = points + 1 WHERE team.id = ${match.secondTeam.id}`);
    }

  }


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
  get id(){
    return this._id;
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
interface IMatch{
  date : string;
  firstteamscore : number;
  secondteamscore : number;
  firstTeamName : string;
  secondTeamName : string;
  firstTeamId : number;
  secondTeamId : number;
}
interface IEvent{
  id : number;
  typeid : number;
  matchid : number;
  playerid : number;
  time : string;
  name : string;
}


let server = new Server();


