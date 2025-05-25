import { Mongo } from "meteor/mongo";

export const GameStates = new Mongo.Collection("gameStates");
export const Players = new Mongo.Collection("players");
