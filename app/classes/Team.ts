import {Manager} from "./Manager";
import {Player} from "./Player"
export class Team{
    private readonly _id : number;
    private readonly _name : string;
    private _points : number;
    private _manager : Manager;
    private _players : Array<Player>;
  
    constructor(id:number, name: string, points : number, manager : Manager, players : Array<Player>){
      this._id = id;
      this._name = name;
      this._points = points;
      this._manager = manager;
      this._players = players;
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
    get players(){
      return this._players;
    }
  }