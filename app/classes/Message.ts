export class Message{
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