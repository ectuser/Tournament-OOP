export class Player{
    public readonly id : number;
    public readonly name : string;
    public readonly goals : number;
    public readonly assists : number;
    public readonly redcards : number;
    public readonly yellowcards : number;
    constructor (id:number, name : string, goals : number, assists : number, redcards : number, yellowcards : number){
        this.id = id;
        this.name = name;
        this.goals = goals;
        this.assists = assists;
        this.redcards = redcards;
        this.yellowcards = yellowcards;
    }
}