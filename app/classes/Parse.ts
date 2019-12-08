import {Match} from "./Match";
import {Team} from "./Team";
import {Manager} from "./Manager";
import {ITeam} from "../interfaces/ITeam";
import {IPlayer} from "../interfaces/IPlayer";
import {Player} from "./Player"
export class Parse{
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