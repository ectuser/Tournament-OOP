import {Player} from "../classes/Player"
import { IPlayer } from "./IPlayer";

export interface ITeam{
    id : number;
    name : string;
    points : number;
    managerid : number;
    managername : string;
    players : Array<IPlayer>;
}