// imports/ui/MonsterList.jsx
import React from 'react';
// import { Monsters } from '/imports/api/monsters';

const MonsterList = () => {
  const monsters = [
    {
        _id: "Test",
        _name:"Bruh"
    },
    {
        _id: "Test2",
        _name:"Bruh2"
    },
    {
        _id: "Test",
        _name:"Bruh"
    },
    {
        _id: "Test2",
        _name:"Bruh2"
    },
    {
        _id: "Test",
        _name:"Bruh"
    },
    {
        _id: "Test2",
        _name:"Bruh2"
    },
    {
        _id: "Test",
        _name:"Bruh"
    },
    {
        _id: "Test2",
        _name:"Bruh2"
    },
  ]

  return (
    <div style={{
      width: '100vw',        // full viewport width
      height: '300px',
      overflowY: 'scroll',
      border: '1px solid #ccc',
      padding: '10px',
      boxSizing: 'border-box' // ensures padding doesn't exceed 100vw
    }}>
      <h3>Monster List</h3>
      <ul>
        {monsters.map(monster => (
          <li key={monster._id}>{monster._name}</li>
        ))}
      </ul>
    </div>
  );
};

export default MonsterList;
