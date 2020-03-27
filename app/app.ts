// lib/app.ts

import express = require('express');
let mysql = require('mysql');
let bodyParser = require('body-parser');
let con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "tournament",
  multipleStatements: true
});

// import other classes
import {Manager} from "./classes/Manager";
import {Repository} from "./classes/Repository"
import {Team} from "./classes/Team";
import {Player} from "./classes/Player";
import {ITeam} from "./interfaces/ITeam";
import {IPlayer} from "./interfaces/IPlayer";
import { ITeamsPlayers } from './interfaces/ITeamsPlayers';
import {Match} from "./classes/Match"
import {Message} from "./classes/Message"
import {Parse} from "./classes/Parse"
import {MatchEvent} from "./classes/MatchEvent"
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
    this.GetStats();
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

  private GetStats(){
    this.app.get("/stats", (req, res) => {
      if (req.query.type == undefined){

        this.repository.GetPlayersStats("goals", "desc", (players : Array<Player>) => {

          this.repository.GetPlayerParams((evTypes : Array<IEventType>) => {
            res.render('stats.ejs', {players : players, types : evTypes});
          })
        })

      }
      else {

        this.repository.GetPlayersStats(req.query.type + "s", req.query.status, (players : Array<Player>) => {

          this.repository.GetPlayerParams((evTypes : Array<IEventType>) => {
            res.render('stats.ejs', {players : players, types : evTypes});
          })
        })

      }
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
          this.repository.GetMatchesAmount((id : number) =>{
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


let server = new Server();


