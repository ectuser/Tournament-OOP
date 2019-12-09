import {Parse} from "./Parse"
import {Player} from "./Player"
import {ITeam} from "../interfaces/ITeam"
import {Team} from "./Team"
import {IEventType} from "../interfaces/IEventType"
import {Manager} from "./Manager"
import {ITeamsPlayers} from "../interfaces/ITeamsPlayers"
import {IPlayer} from "../interfaces/IPlayer"
import {IMatch} from "../interfaces/IMatch"
import {Match} from "./Match";
import {IPlayerInTeam} from "../interfaces/IPlayerInTeam"
import {IEvent} from "../interfaces/IEvent"
import {MatchEvent} from "../classes/MatchEvent"
let mysql = require('mysql');
let bodyParser = require('body-parser');
let con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1AmNotGay",
  database: "tournament",
  multipleStatements: true
});
export class Repository{
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
    public GetPlayersStats(type : string, status : string, callback : Function){
      console.log(`select * from player order by ${type} ${status};`);
      con.query(`select * from player order by ${type} ${status};`, (err : Error, res : Array<IPlayer>) => {
        let players : Array<Player> = this.parse.ParsePlayers(res);
        callback(players);
      })
    }
    public GetPlayerParams(callback : Function){
      con.query("select * from eventtype", (err : Error, res : Array<IEventType>) => {
        callback(res);
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
  
          callback(team);
        })
    }
    public GetMatchesAmount(callback : Function){
      con.query("SELECT * FROM `match`", (err : Error, result : Array<Object>) => {
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
          // console.log(match.id)
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
      match.events.forEach((ev : MatchEvent) => {
        this.InsertEvent(ev, match);
      })
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