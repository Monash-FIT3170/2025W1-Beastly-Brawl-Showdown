// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// The current database to use.
use('RoomLocation');

// Create a new document in the collection.
db.getCollection('game_server_registries').insertOne({
    "serverNumber": 7,
    "serverUrl": "http://localhost:8080"
  }
);

db.getCollection('game_server_registries').insertOne({
    "serverNumber": 5,
    "serverUrl": "http://localhost:9999"
  }
);
