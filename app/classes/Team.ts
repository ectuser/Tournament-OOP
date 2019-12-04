import {Manager} from "./Manager";
export class Team{
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