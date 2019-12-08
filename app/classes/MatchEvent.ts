
export class MatchEvent{
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